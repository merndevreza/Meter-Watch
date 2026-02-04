import { CustomerData, RechargeRecord, MonthlyConsumption } from '@/types/scrape-type'; 
import { RechargeHistory } from '@/database/models/recharge-history-model';
import { Customer } from '@/database/models/customer-model';
import { MonthlyConsumptionModel } from '@/database/models/monthly-consumption-model';

/**
 * Saves customer data to MongoDB
 * Updates existing record or creates new one
 */
export async function saveCustomerData(
  customerData: CustomerData, 
  userId: string,
  meterName:string
) {
  const customerRecord = {
    ...customerData, 
    userId,
    meterName,
    lastScraped: new Date(),
  };

  // Update if exists, create if not (upsert)
  const result = await Customer.findOneAndUpdate(
    { consumerNumber: customerData.consumerNumber, userId },
    customerRecord,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return result;
}

/**
 * Saves recharge history to MongoDB
 * Only saves new records (prevents duplicates)
 */
export async function saveRechargeHistory(
  rechargeHistory: RechargeRecord[],
  consumerNumber: string,
  userId: string
) {
  if (rechargeHistory.length === 0) {
    return { saved: 0, skipped: 0 };
  }

  let saved = 0;
  let skipped = 0;

  // Process each recharge record
  for (const record of rechargeHistory) {
    try {
      // Check if this token already exists for this consumer
      const exists = await RechargeHistory.findOne({
        consumerNumber,
        token: record.token,
      });

      if (!exists) {
        // Create new recharge record
        await RechargeHistory.create({
          ...record,
          consumerNumber,
          userId,
          scrapedAt: new Date(),
        });
        saved++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`Error saving recharge record ${record.token}:`, error);
      // Continue processing other records
    }
  }

  return { saved, skipped };
}

/**
 * Saves monthly consumption data to MongoDB
 * Uses year+month as unique identifier
 */
export async function saveMonthlyConsumption(
  consumptionData: MonthlyConsumption[],
  consumerNumber: string,
  userId: string
) {
  if (consumptionData.length === 0) {
    return { saved: 0, skipped: 0 };
  }

  let saved = 0;
  let skipped = 0;

  // Process each monthly consumption record
  for (const record of consumptionData) {
    try {
      // Check if this month's data already exists
      const exists = await MonthlyConsumptionModel.findOne({
        consumerNumber,
        year: record.year,
        month: record.month,
      });

      if (!exists) {
        // Create new consumption record
        await MonthlyConsumptionModel.create({
          ...record,
          consumerNumber,
          userId,
          scrapedAt: new Date(),
        });
        saved++;
      } else {
        // Update existing record with latest data
        await MonthlyConsumptionModel.findOneAndUpdate(
          {
            consumerNumber,
            year: record.year,
            month: record.month,
          },
          {
            ...record,
            scrapedAt: new Date(),
          }
        );
        skipped++;
      }
    } catch (error) {
      console.error(`Error saving consumption record ${record.year}-${record.month}:`, error);
    }
  }

  return { saved, skipped };
}
