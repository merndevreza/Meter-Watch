import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import connectMongo from '@/database/services/connectMongo';
import { Customer } from '@/database/models/customer-model';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Request validation schema
 */
const UpdateThresholdSchema = z.object({
  consumerNumber: z.string()
    .min(1, 'Consumer number is required')
    .regex(/^\d{6,15}$/, 'Invalid consumer number format'),
  newThreshold: z.number()
    .min(0, 'Threshold must be a positive number')
    .max(100000, 'Threshold amount is too high'),
});

/**
 * Update Customer Minimum Recharge Threshold API
 * 
 * This endpoint updates the minimum recharge amount threshold for a customer's meter.
 * Only the authenticated user who owns the meter can update it.
 */
export async function PUT(request: Request) {
  const startTime = Date.now();

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

    const userId = session.user.id;

    // 2. Validate request body
    const body = await request.json();
    const validatedData = UpdateThresholdSchema.parse(body);

    logger.info('Updating threshold', {
      userId,
      consumerNumber: validatedData.consumerNumber,
      newThreshold: validatedData.newThreshold,
    });

    // 3. Connect to MongoDB
    await connectMongo();

    // 4. Update customer threshold
    const result = await Customer.updateOne(
      {
        consumerNumber: validatedData.consumerNumber,
        userId,
      },
      {
        $set: {
          minimumRechargeAmount: validatedData.newThreshold,
        },
      }
    );

    // 5. Check if customer exists and was updated
    if (result.matchedCount === 0) {
      throw new AppError(
        ErrorCode.CONSUMER_NOT_FOUND,
        'Meter not found or you do not have permission to update it',
        404
      );
    }

    // 6. Track metrics
    const duration = Date.now() - startTime;
    metrics.increment('threshold.update.success', { userId });
    metrics.timing('threshold.update.duration', duration);

    logger.info('Threshold updated successfully', {
      userId,
      consumerNumber: validatedData.consumerNumber,
      duration,
    });

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: 'Threshold updated successfully',
      data: {
        consumerNumber: validatedData.consumerNumber,
        newThreshold: validatedData.newThreshold,
        updated: result.modifiedCount > 0,
      },
    }, { status: 200 });

  } catch (error) {
    // Track failure metrics
    const duration = Date.now() - startTime;
    metrics.increment('threshold.update.failure', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    metrics.timing('threshold.update.duration', duration);

    // Log error
    logger.error('Threshold update failed', {
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
        message: 'Failed to update threshold',
      },
    }, { status: 500 });
  }
}