import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { Customer } from "@/database/models/customer-model";
import connectMongo from "@/database/services/connectMongo";
import { createScraperService } from "@/app/api/utils/scraper.service";
import { saveScrapedData } from "@/app/api/utils/database.utils";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";

interface UpdateResult {
  success: boolean;
  consumerNumber: string;
  meterName: string;
  error?: string;
}

interface CronJobSummary {
  totalCustomers: number;
  successfulUpdates: number;
  failedUpdates: number;
  skippedUpdates: number;
  results: UpdateResult[];
  duration: number;
  startTime: string;
  endTime: string;
}

/**
 * Cron Job: Update all meters data daily
 *
 * This endpoint scrapes data for ALL customer meters and updates them in the database.
 * Runs daily as configured in vercel.json
 *
 * Rate limiting: Only processes 1 meter at a time to avoid overwhelming the NESCO portal
 * Controlled by Vercel cron scheduling - only called once per day
 */
export async function GET(request: Request) {
  const startTime = new Date();
  const chromeStartTime = Date.now();
  let scraperService: Awaited<ReturnType<typeof createScraperService>> | null = null;
  const results: UpdateResult[] = [];

  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron request attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    logger.info('Cron job started: Update all meters');

    // 2. Connect to database
    try {
      await connectMongo();
      logger.info('Connected to MongoDB');
    } catch (mongoError) {
      const errorMsg =
        mongoError instanceof Error ? mongoError.message : 'Unknown error';
      logger.error('Failed to connect to MongoDB', { error: errorMsg });
      throw mongoError;
    }

    // 3. Fetch all customers
    const customers = await Customer.find({})
      .select('consumerNumber meterName userId')
      .lean();

    if (!customers || customers.length === 0) {
      logger.info('No customers found to update');
      return NextResponse.json(
        {
          success: true,
          message: 'No customers to update',
          summary: {
            totalCustomers: 0,
            successfulUpdates: 0,
            failedUpdates: 0,
            skippedUpdates: 0,
            results: [],
            duration: Date.now() - chromeStartTime,
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    logger.info(`Found ${customers.length} customers to update`);

    // 4. Initialize scraper service once
    try {
      scraperService = await createScraperService();
      logger.info('Scraper service initialized');
    } catch (scraperError) {
      const errorMsg =
        scraperError instanceof Error
          ? scraperError.message
          : 'Unknown error';
      logger.error('Failed to initialize scraper service', { error: errorMsg });
      throw scraperError;
    }

    // 5. Process each customer
    let successCount = 0;
    let failureCount = 0;
    const skipCount = 0;

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const progress = `[${i + 1}/${customers.length}]`;

      try {
        logger.info(`${progress} Processing meter: ${customer.consumerNumber}`, {
          meterName: customer.meterName,
        });

        // 5a. Scrape data for this meter
        const scrapedData = await scraperService.scrapeCustomerData(
          customer.consumerNumber as string
        );

        // 5b. Save to database — userId is now a Types.ObjectId
        await saveScrapedData(
          scrapedData,
          customer.userId as Types.ObjectId,
          customer.meterName as string,
          true // existingCustomer = true (we're updating)
        );

        successCount++;
        results.push({
          success: true,
          consumerNumber: customer.consumerNumber as string,
          meterName: customer.meterName as string,
        });

        logger.info(
          `${progress} Successfully updated meter: ${customer.consumerNumber}`
        );

        // Small delay between requests to avoid overwhelming the portal
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (customerError) {
        failureCount++;
        const errorMsg =
          customerError instanceof Error
            ? customerError.message
            : 'Unknown error';

        results.push({
          success: false,
          consumerNumber: customer.consumerNumber as string,
          meterName: customer.meterName as string,
          error: errorMsg,
        });

        logger.error(
          `${progress} Failed to update meter: ${customer.consumerNumber}`,
          { error: errorMsg }
        );

        // Continue with next customer instead of stopping
        continue;
      }
    }

    // 6. Track metrics
    const duration = Date.now() - chromeStartTime;
    metrics.increment('cron.update_meters.success', { count: successCount });
    metrics.increment('cron.update_meters.failure', { count: failureCount });
    metrics.timing('cron.update_meters.duration', duration);

    const summary: CronJobSummary = {
      totalCustomers: customers.length,
      successfulUpdates: successCount,
      failedUpdates: failureCount,
      skippedUpdates: skipCount,
      results,
      duration,
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
    };

    logger.info('Cron job completed', {
      summary: {
        total: summary.totalCustomers,
        successful: summary.successfulUpdates,
        failed: summary.failedUpdates,
        duration: summary.duration,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${successCount} meters. Failed: ${failureCount}`,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - chromeStartTime;
    const errorMsg =
      error instanceof Error ? error.message : 'Unknown error';

    logger.error('Cron job failed', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    metrics.increment('cron.update_meters.critical_failure');

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        summary: {
          totalCustomers: 0,
          successfulUpdates: 0,
          failedUpdates: 0,
          skippedUpdates: 0,
          results,
          duration,
          startTime: startTime.toISOString(),
          endTime: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  } finally {
    // 7. Cleanup scraper resources
    if (scraperService) {
      try {
        await scraperService.cleanup();
        logger.info('Scraper service cleaned up');
      } catch (cleanupError) {
        logger.error('Error during scraper cleanup', {
          error:
            cleanupError instanceof Error
              ? cleanupError.message
              : 'Unknown error',
        });
      }
    }
  }
}