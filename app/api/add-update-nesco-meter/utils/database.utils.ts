import { ScrapedData, CustomerData, RechargeRecord, MonthlyConsumption } from '@/types/scrape-type';
import { Customer } from '@/database/models/customer-model';
import { RechargeHistory } from '@/database/models/recharge-history-model';
import { MonthlyConsumptionModel } from '@/database/models/monthly-consumption-model';
import connectMongo from '@/database/services/connectMongo';
import { logger } from '@/lib/logger';
import { AppError, ErrorCode } from '@/lib/errors';

export interface SavedDataSummary {
  customer: boolean;
  newRecharges: number;
  duplicateRecharges: number;
  newConsumption: number;
  updatedConsumption: number;
  errors?: string[];
}

/**
 * Save customer data to database
 * Updates existing record or creates new one
 */
async function saveCustomerData(
  customerData: CustomerData,
  userId: string,
  meterName: string,
  notice: { hasNotice: boolean; noticeMessage: string | null },
  existingCustomer: boolean
): Promise<void> {
  try {
    const customerRecord = {
      ...customerData,
      userId,
      meterName,
      hasNotice: notice.hasNotice || false,
      noticeMessage: notice.noticeMessage || null,
      noticeLastChecked: new Date(),
      lastScraped: new Date(),
    };

    if (existingCustomer) {
      // Update existing customer - don't overwrite minimumRechargeAmount
      const { minimumRechargeAmount, ...updateData } = customerRecord;
      
      await Customer.findOneAndUpdate(
        { consumerNumber: customerData.consumerNumber, userId },
        { $set: updateData },
        { new: true }
      );
    } else {
      // Create new customer or full update
      await Customer.findOneAndUpdate(
        { consumerNumber: customerData.consumerNumber, userId },
        { $set: customerRecord },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    logger.info('Customer data saved', {
      consumerNumber: customerData.consumerNumber,
      userId,
    });
  } catch (error) {
    logger.error('Error saving customer data', {
      error: error instanceof Error ? error.message : 'Unknown',
      consumerNumber: customerData.consumerNumber,
    });
    throw error;
  }
}

/**
 * Save recharge history to database using bulk operations
 * Only saves new records (prevents duplicates)
 */
async function saveRechargeHistory(
  rechargeHistory: RechargeRecord[],
  consumerNumber: string,
  userId: string
): Promise<{ saved: number; skipped: number; errors?: string[] }> {
  if (rechargeHistory.length === 0) {
    return { saved: 0, skipped: 0 };
  }

  try {
    // Get all existing tokens in one query (bulk operation)
    const tokens = rechargeHistory.map(r => r.token);
    const existingRecords = await RechargeHistory.find(
      {
        consumerNumber,
        token: { $in: tokens },
      },
      { token: 1 }
    ).lean();

    const existingTokens = new Set(existingRecords.map(r => r.token));

    // Filter new records
    const newRecords = rechargeHistory
      .filter(r => !existingTokens.has(r.token))
      .map(r => ({
        ...r,
        consumerNumber,
        userId,
        scrapedAt: new Date(),
      }));

    // Bulk insert new records
    let saved = 0;
    if (newRecords.length > 0) {
      const result = await RechargeHistory.insertMany(newRecords, {
        ordered: false, // Continue on error
      });
      saved = result.length;
    }

    const skipped = rechargeHistory.length - saved;

    logger.info('Recharge history saved', {
      consumerNumber,
      saved,
      skipped,
    });

    return { saved, skipped };
  } catch (error) {
    // Handle bulk insert errors
    if (error && typeof error === 'object' && 'writeErrors' in error) {
      const writeErrors = (error as any).writeErrors || [];
      const saved = rechargeHistory.length - writeErrors.length;
      const skipped = writeErrors.length;
      
      logger.warn('Some recharge records failed to save', {
        consumerNumber,
        saved,
        failed: skipped,
      });

      return {
        saved,
        skipped,
        errors: writeErrors.map((e: any) => {
          const token = e.err.op?.token || 'unknown';
          const errmsg = e.err.errmsg || 'Unknown error';
          return `Token ${token}: ${errmsg}`;
        }),
      };
    }

    logger.error('Error saving recharge history', {
      error: error instanceof Error ? error.message : 'Unknown',
      consumerNumber,
    });
    throw error;
  }
}

/**
 * Save monthly consumption to database using bulk operations
 * Updates existing records or creates new ones
 */
async function saveMonthlyConsumption(
  consumptionData: MonthlyConsumption[],
  consumerNumber: string,
  userId: string
): Promise<{ saved: number; skipped: number; errors?: string[] }> {
  if (consumptionData.length === 0) {
    return { saved: 0, skipped: 0 };
  }

  try {
    // Get all existing records in one query
    const yearMonthPairs = consumptionData.map(r => ({
      year: r.year,
      month: r.month,
    }));

    const existingRecords = await MonthlyConsumptionModel.find({
      consumerNumber,
      $or: yearMonthPairs.map(({ year, month }) => ({ year, month })),
    }).lean();

    const existingKeys = new Set(
      existingRecords.map(r => `${r.year}-${r.month}`)
    );

    // Separate new and existing records
    const newRecords: any[] = [];
    const updateOps: any[] = [];

    for (const record of consumptionData) {
      const key = `${record.year}-${record.month}`;
      const data = {
        ...record,
        consumerNumber,
        userId,
        scrapedAt: new Date(),
      };

      if (existingKeys.has(key)) {
        // Update operation
        updateOps.push({
          updateOne: {
            filter: {
              consumerNumber,
              year: record.year,
              month: record.month,
            },
            update: { $set: data },
          },
        });
      } else {
        // New record
        newRecords.push(data);
      }
    }

    // Bulk insert new records
    let saved = 0;
    if (newRecords.length > 0) {
      const result = await MonthlyConsumptionModel.insertMany(newRecords, {
        ordered: false,
      });
      saved = result.length;
    }

    // Bulk update existing records
    let skipped = 0;
    if (updateOps.length > 0) {
      const result = await MonthlyConsumptionModel.bulkWrite(updateOps);
      skipped = result.modifiedCount || 0;
    }

    logger.info('Monthly consumption saved', {
      consumerNumber,
      saved,
      updated: skipped,
    });

    return { saved, skipped };
  } catch (error) {
    // Handle bulk operation errors
    if (error && typeof error === 'object' && 'writeErrors' in error) {
      const writeErrors = (error as any).writeErrors || [];
      const saved = consumptionData.length - writeErrors.length;
      
      logger.warn('Some consumption records failed to save', {
        consumerNumber,
        saved,
        failed: writeErrors.length,
      });

      return {
        saved,
        skipped: writeErrors.length,
        errors: writeErrors.map((e: any) => {
          const year = e.err.op?.year || 'unknown';
          const month = e.err.op?.month || 'unknown';
          const errmsg = e.err.errmsg || 'Unknown error';
          return `${year}-${month}: ${errmsg}`;
        }),
      };
    }

    logger.error('Error saving monthly consumption', {
      error: error instanceof Error ? error.message : 'Unknown',
      consumerNumber,
    });
    throw error;
  }
}

/**
 * Save all scraped data to database
 * Orchestrates saving of customer, recharge history, and monthly consumption data
 */
export async function saveScrapedData(
  scrapedData: ScrapedData,
  userId: string,
  meterName: string,
  existingCustomer: boolean
): Promise<{ summary: SavedDataSummary }> {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Save customer data
    await saveCustomerData(
      scrapedData.customer,
      userId,
      meterName,
      scrapedData.notice,
      existingCustomer
    );

    // Save recharge history
    const rechargeResult = await saveRechargeHistory(
      scrapedData.rechargeHistory,
      scrapedData.customer.consumerNumber,
      userId
    );

    // Save monthly consumption
    const consumptionResult = await saveMonthlyConsumption(
      scrapedData.monthlyConsumption,
      scrapedData.customer.consumerNumber,
      userId
    );

    // Collect any errors
    const errors: string[] = [];
    if (rechargeResult.errors) errors.push(...rechargeResult.errors);
    if (consumptionResult.errors) errors.push(...consumptionResult.errors);

    return {
      summary: {
        customer: true,
        newRecharges: rechargeResult.saved,
        duplicateRecharges: rechargeResult.skipped,
        newConsumption: consumptionResult.saved,
        updatedConsumption: consumptionResult.skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    logger.error('Failed to save scraped data', {
      error: error instanceof Error ? error.message : 'Unknown',
      userId,
      consumerNumber: scrapedData.customer.consumerNumber,
    });

    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Failed to save data to database',
      500
    );
  }
}