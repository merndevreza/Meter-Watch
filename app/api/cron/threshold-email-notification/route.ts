import { NextResponse } from "next/server";
import { Resend } from 'resend';
import connectMongo from "@/database/services/connectMongo";
import { Customer } from "@/database/models/customer-model";
import { Users } from "@/database/models/user-model";
import { logger } from "@/lib/logger";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function GET(request: Request) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectMongo();

    // Force Users model registration before populate runs.
    // Next.js tree-shaking drops unused imports, so we must reference it explicitly.
    void Users;

    // 2. Find customers where minimumRechargeAmount >= remainingBalance
    const lowBalanceCustomers = await Customer.find({
      $expr: { $gte: ["$minimumRechargeAmount", "$remainingBalance"] }
    })
    .populate("userId", "name email")
    .lean();

    if (!lowBalanceCustomers || lowBalanceCustomers.length === 0) {
      return NextResponse.json({ message: "No low balance alerts needed today." });
    }

    const emailPromises = lowBalanceCustomers.map(async (customer: any) => {
      const user = customer.userId;
      
      // Safety check if user doesn't exist or doesn't have an email
      if (!user || !user.email) return null;

      try {
        return await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "meterwatch@webdevreza.xyz",
          to: user.email,
          subject: `Low Balance Alert: Meter ${customer.meterName}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
              <div style="text-align: center; margin-bottom: 30px;">
                 <h1 style="font-size: 24px; font-weight: 700; color: #d32f2f;">Low Balance Warning</h1>
              </div>
              
              <p style="font-size: 16px; line-height: 24px; color: #444;">
                Hi ${user.name || 'Valued Customer'},<br><br>
                This is an automated alert to inform you that your meter <strong>${customer.meterName}</strong> (${customer.consumerNumber}) has reached its low balance threshold.
              </p>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 5px 0;"><strong>Current Balance:</strong> ৳${customer.remainingBalance}</p>
                <p style="margin: 5px 0;"><strong>Your Alert Threshold:</strong> ৳${customer.minimumRechargeAmount}</p>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 40px 0 20px;" />
              <p style="font-size: 12px; color: #888; text-align: center;">
                MeterWatch Monitoring Service
              </p>
            </div>
          `
        });
      } catch (err) {
        logger.error(`Failed to send email to ${user.email}`, err);
        return null;
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successfulEmails = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      processed: lowBalanceCustomers.length,
      emailsSent: successfulEmails
    });

  } catch (error: any) {
    logger.error('Low balance cron job failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}