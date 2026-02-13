import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import connectMongo from '@/database/services/connectMongo';
import { Customer } from '@/database/models/customer-model';
import { RechargeHistory } from '@/database/models/recharge-history-model';
import { MonthlyConsumptionModel } from '@/database/models/monthly-consumption-model';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Request validation schema
 */
const DeleteMeterSchema = z.object({
  consumerNumber: z.string()
    .min(1, 'Consumer number is required')
    .regex(/^\d{6,15}$/, 'Invalid consumer number format'),
});

/**
 * Delete Customer Meter API
 * 
 * This endpoint deletes a customer meter and all associated data:
 * - Customer record
 * - All recharge history
 * - All monthly consumption records
 * 
 * Only the authenticated user who owns the meter can delete it.
 * This is a destructive operation and cannot be undone.
 */
export async function DELETE(request: Request) {
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
    const validatedData = DeleteMeterSchema.parse(body);

    logger.info('Deleting meter', {
      userId,
      consumerNumber: validatedData.consumerNumber,
    });

    // 3. Connect to MongoDB
    await connectMongo();

    // 4. Check if customer exists before deletion
    const customerExists = await Customer.findOne({
      consumerNumber: validatedData.consumerNumber,
      userId,
    });

    if (!customerExists) {
      throw new AppError(
        ErrorCode.CONSUMER_NOT_FOUND,
        'Meter not found or you do not have permission to delete it',
        404
      );
    }

    // 5. Delete all related data in parallel for better performance
    const [customerResult, rechargeResult, consumptionResult] = await Promise.all([
      Customer.deleteOne({
        consumerNumber: validatedData.consumerNumber,
        userId,
      }),
      RechargeHistory.deleteMany({
        consumerNumber: validatedData.consumerNumber,
        userId,
      }),
      MonthlyConsumptionModel.deleteMany({
        consumerNumber: validatedData.consumerNumber,
        userId,
      }),
    ]);

    // 6. Track metrics
    const duration = Date.now() - startTime;
    metrics.increment('meter.delete.success', { userId });
    metrics.timing('meter.delete.duration', duration);

    logger.info('Meter deleted successfully', {
      userId,
      consumerNumber: validatedData.consumerNumber,
      deletedRecords: {
        customer: customerResult.deletedCount,
        rechargeHistory: rechargeResult.deletedCount,
        monthlyConsumption: consumptionResult.deletedCount,
      },
      duration,
    });

    // 7. Return success response with deletion details
    return NextResponse.json({
      success: true,
      message: 'Meter deleted successfully',
      data: {
        consumerNumber: validatedData.consumerNumber,
        deletedRecords: {
          customer: customerResult.deletedCount,
          rechargeHistory: rechargeResult.deletedCount,
          monthlyConsumption: consumptionResult.deletedCount,
        },
      },
    }, { status: 200 });

  } catch (error) {
    // Track failure metrics
    const duration = Date.now() - startTime;
    metrics.increment('meter.delete.failure', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    metrics.timing('meter.delete.duration', duration);

    // Log error
    logger.error('Meter deletion failed', {
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
        message: 'Failed to delete meter',
      },
    }, { status: 500 });
  }
}