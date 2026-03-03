import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import { auth } from '@/auth';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { rateLimiter } from '@/lib/rate-limiter';
import { AppError, ErrorCode } from '@/lib/errors';
import { ScrapedData } from '@/types';
import { createScraperService } from '../utils/scraper.service';
import { saveScrapedData } from '../utils/database.utils';
import { Customer } from '@/database/models/customer-model';

/**
 * Request validation schema
 */
const ScrapeRequestSchema = z.object({
  consumerNumber: z.string()
    .min(1, 'Consumer number is required')
    .max(10, 'Consumer number too long')
    .regex(/^\d+$/, 'Consumer number must contain only digits'),
  meterName: z.string()
    .min(1, 'Meter name is required')
    .max(20, 'Meter name too long'),
  existingCustomer: z.boolean().optional().default(false),
});

/**
 * NESCO Data Scraper API
 *
 * This endpoint scrapes customer information from the NESCO prepaid portal
 * and stores it in MongoDB.
 *
 * Rate limited to prevent abuse.
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  let scraperService: Awaited<ReturnType<typeof createScraperService>> | null = null;

  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.emailVerified) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Please login to continue',
        401
      );
    }

    const userId = new Types.ObjectId(session.user.id);

    // 2. Rate limiting
    const rateLimitResult = await rateLimiter.check(session.user.id, 'scrape');
    if (!rateLimitResult.success) {
      throw new AppError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds`,
        429
      );
    }

    // 3. Validate request body
    const body = await request.json();
    const validatedData = ScrapeRequestSchema.parse(body);

    logger.info('Scraping started', {
      userId: userId.toString(),
      consumerNumber: validatedData.consumerNumber,
    });

    // Check if the user has already added this consumer number
    const existingCustomer = await Customer.findOne({
      userId,
      consumerNumber: validatedData.consumerNumber,
    });

    if (existingCustomer && !validatedData.existingCustomer) {
      throw new AppError(
        ErrorCode.DUPLICATE_CUSTOMER,
        'This consumer number is already added',
        409
      );
    }

    // 4. Initialize scraper service
    scraperService = await createScraperService();

    // 5. Scrape data with timeout
    const SCRAPING_TIMEOUT = 90000; // 90 seconds
    const scrapePromise = scraperService.scrapeCustomerData(
      validatedData.consumerNumber
    );

    const timeoutPromise = new Promise<ScrapedData>((_, reject) =>
      setTimeout(
        () => reject(new AppError(
          ErrorCode.TIMEOUT,
          'Request timeout. Please try again',
          504
        )),
        SCRAPING_TIMEOUT
      )
    );

    const scrapedData = await Promise.race([scrapePromise, timeoutPromise]);

    // 6. Save data to database
    const savedDataResult = await saveScrapedData(
      scrapedData,
      userId,
      validatedData.meterName,
      validatedData.existingCustomer
    );

    // 7. Track metrics
    const duration = Date.now() - startTime;
    metrics.increment('scraping.success', { userId: userId.toString() });
    metrics.timing('scraping.duration', duration);

    logger.info('Scraping completed', {
      userId: userId.toString(),
      consumerNumber: validatedData.consumerNumber,
      duration,
      saved: savedDataResult.summary,
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: 'Data scraped and saved successfully',
      data: {
        customer: scrapedData.customer,
        rechargeHistory: scrapedData.rechargeHistory,
        monthlyConsumption: scrapedData.monthlyConsumption,
        notice: scrapedData.notice,
      },
      saved: savedDataResult.summary,
    }, { status: 200 });

  } catch (error) {
    // Track failure metrics
    const duration = Date.now() - startTime;
    metrics.increment('scraping.failure', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    metrics.timing('scraping.duration', duration);

    // Log error with context
    logger.error('Scraping failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    // Handle different error types
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid request data',
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      }, { status: 400 });
    }

    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      }, { status: error.statusCode });
    }

    // Generic error
    return NextResponse.json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again',
      },
    }, { status: 500 });

  } finally {
    // Cleanup scraper resources
    if (scraperService) {
      try {
        await scraperService.cleanup();
      } catch (cleanupError) {
        logger.error('Error during scraper cleanup', {
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown',
        });
      }
    }
  }
}