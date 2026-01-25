import { NextResponse } from "next/server";
import { Meters } from "@/database/models/meter-model";
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

      const lowBalanceMeters = await Meters.find({
         isActive: true,
         $expr: { $lt: ["$currentBalance", "$minimumRechargeThreshold"] }
      }).populate("meterOwner", "email name");

      if (lowBalanceMeters.length === 0) {
         return NextResponse.json({ message: "No low balances found." });
      }

      await Promise.allSettled(
         lowBalanceMeters.map(async (meter) => {
            const owner = meter.meterOwner;
            if (!owner?.email) return;

            console.log(`Sending email to ${owner.email} for Meter ${meter.meterNumber}`);

            await resend.emails.send({
               from: 'onboarding@resend.dev',
               to: owner.email,
               subject: `⚠️ Low Balance Alert: Meter ${meter.meterNumber}`,
               html: `
                  <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                     <h2 style="color: #d32f2f;">Low Balance Warning</h2>
                     <p>Hello <strong>${owner.name || 'User'}</strong>,</p>
                     <p>Your electricity meter balance has reached the minimum threshold.</p>
                     
                     <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                     <p style="margin: 5px 0;"><strong>Meter Name:</strong> ${meter.meterName}</p>
                     <p style="margin: 5px 0;"><strong>Meter Number:</strong> ${meter.meterNumber}</p>
                     <p style="margin: 5px 0; font-size: 18px;"><strong>Current Balance:</strong> <span style="color: #d32f2f;">${meter.currentBalance} BDT</span></p>
                     </div>

                     <p>Please recharge your account at your earliest convenience to maintain uninterrupted service.</p> 

                     <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
                     <p style="font-size: 12px; color: #888;">This is an automated message from your Meter Management System.</p>
                  </div>
               `
            });
         })
      );

      return NextResponse.json({
         processed: lowBalanceMeters.length,
         success: true
      });

   } catch (error) {
      console.error("Cron Error:", error);
      return NextResponse.json({ error: "unexpected error occurred. check server logs" }, { status: 500 });
   }
}