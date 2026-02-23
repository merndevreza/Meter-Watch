import { NextResponse } from "next/server"; 
import { Customer } from "@/database/models/customer-model";
import connectMongo from "@/database/services/connectMongo";

import { Resend } from 'resend';
const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function GET(request: Request) {
   const authHeader = request.headers.get('authorization');
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
         status: 401,
      });
   }

   try {
      await connectMongo();

      const lowBalanceMeters = await Customer.find({
         isActive: true,
         $expr: { $lt: ["$remainingBalance", "$minimumRechargeAmount"] }
      }).populate("meterOwner", "email name");

      if (lowBalanceMeters.length === 0) {
         return NextResponse.json({ message: "No low balances found." });
      }


      // return NextResponse.json({
      //    processed: lowBalanceMeters.length,
      //    success: true
      // });

   } catch (error) {
      console.error("Cron Error:", error);
      return NextResponse.json({ error: "unexpected error occurred. check server logs" }, { status: 500 });
   }
}