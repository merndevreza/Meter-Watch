import { Users } from "@/database/models/user-model";
import connectMongo from "@/database/services/connectMongo";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Resend } from 'resend';
import crypto from "crypto";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const POST = async (request: Request) => {
   const { name, email, password } = await request.json();
   try {
      await connectMongo();

      const existingUser = await Users.findOne({ email: email.toLowerCase() });

      if (existingUser) {
         if (existingUser.emailVerified) {
            return NextResponse.json({
               success: false,
               message: "This email is already verified. Please go to the login page."
            }, { status: 400 });
         }

         // User exists but was created via Google/GitHub
         if (!existingUser.password) {
            return NextResponse.json({
               success: false,
               message: "This email is linked to a Google/GitHub account. Please login with your social provider."
            }, { status: 400 });
         }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString("hex");

      // Create or Update the pending user
      await Users.findOneAndUpdate(
         { email: email.toLowerCase() },
         {
            name,
            password: hashedPassword,
            verificationToken: token,
            emailVerified: null
         },
         { upsert: true, new: true }
      );

      // Send the Verification Email
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}&email=${email}`;

      await resend.emails.send({
         from: 'onboarding@resend.dev',
         to: email,
         subject: 'Verify your account',
         html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 30px;">
         <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0;">Confirm your email address</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 24px; color: #444;">
        Hi ${name},<br><br>
        Thanks for signing up! To get started with your meter management dashboard, please verify your email address by clicking the button below:
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationLink}" 
           style="background-color: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
           Verify Email
        </a>
      </div> 
      
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 40px 0 20px;" />
      
      <p style="font-size: 12px; color: #888; text-align: center;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `
      });

      return NextResponse.json({
         success: true,
         message: "Verification email sent! Please check your inbox.",
      }, { status: 201 });

   } catch (error) {
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
   }
}