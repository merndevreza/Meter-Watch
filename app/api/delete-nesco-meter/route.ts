import { auth } from "@/auth";
import { Customer } from "@/database/models/customer-model"; 
import { MonthlyConsumptionModel } from "@/database/models/monthly-consumption-model";
import { RechargeHistory } from "@/database/models/recharge-history-model";
import connectMongo from "@/database/services/connectMongo";
import { NextResponse } from "next/server";

export const DELETE = async (request: Request) => {
   const session = await auth();
   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   } 
    const body = await request.json();
    const { consumerNumber } = body; 

   try {
      await connectMongo();
      const deletionCustomer = await Customer.deleteOne({ consumerNumber: consumerNumber, userId: session.user.id }); 
      
      await RechargeHistory.deleteMany({ consumerNumber: consumerNumber, userId: session.user.id }); 
      
      await MonthlyConsumptionModel.deleteMany({ consumerNumber: consumerNumber, userId: session.user.id }); 

      if (deletionCustomer.deletedCount === 0 ) {
         return NextResponse.json({ success: false, message: "Meter not found or you do not have permission to delete it.", status: 404 });
      }
      return NextResponse.json({ success: true, message: "Meter deleted successfully", status: 200 });
   } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, message: "Failed to delete meter", status: 500 });
   }
}