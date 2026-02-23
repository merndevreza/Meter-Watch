"use server";
import { auth } from '@/auth';
import { Customer } from '@/database/models/customer-model';
import { MonthlyConsumptionModel } from '@/database/models/monthly-consumption-model';
import { RechargeHistory } from '@/database/models/recharge-history-model';
import connectMongo from '@/database/services/connectMongo';
import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/replaceMongoID';
import { NescoMeterDataType, MonthlyConsumptionType, RechargeHistoryType } from '@/types';

type GetMeterResponse = {
   success: boolean;
   error?: string;
   data?: {
      customer: NescoMeterDataType | null;
      monthlyConsumption: MonthlyConsumptionType[];
      rechargeHistory: RechargeHistoryType[];
   } | null;
};

// get all meters of Logged in user
export async function getNescoMeterByID(consumerNumber: string): Promise<GetMeterResponse> {
   try {
      const session = await auth();
      if (!session?.user?.id || !session?.user?.emailVerified) {
         return { success: false, error: "Unauthorized", data: null };
      }
      if (!consumerNumber) {
         return { success: false, error: "Consumer number is required", data: null };
      }

      await connectMongo();
      const customer = await Customer.findOne({ userId: session.user.id, consumerNumber: consumerNumber })
         .sort({ createdAt: -1 })
         .lean();

      const serializedCustomer = JSON.parse(JSON.stringify(customer));

      const monthlyData = await MonthlyConsumptionModel.find({ userId: session.user.id, consumerNumber: consumerNumber })
         .lean();

      const serializedMonthlyData = JSON.parse(JSON.stringify(monthlyData));

      const rechargeHistory = await RechargeHistory.find({ userId: session.user.id, consumerNumber: consumerNumber })
         .sort({ rechargeDate: -1 })
         .lean();
      const serializedRechargeHistory = JSON.parse(JSON.stringify(rechargeHistory));

      return {
         success: true,
         data: {
            customer: replaceMongoIdInObject(serializedCustomer) as NescoMeterDataType,
            monthlyConsumption: replaceMongoIdInArray(serializedMonthlyData) as MonthlyConsumptionType[],
            rechargeHistory: replaceMongoIdInArray(serializedRechargeHistory) as RechargeHistoryType[],
         },
      };

   } catch (error) {
      console.error("Error fetching meters:", error);

      return {
         success: false,
         error: "Internal Server Error. Please try again later.",
         data: null
      };
   }
}