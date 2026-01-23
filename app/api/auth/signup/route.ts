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
            <h1>Welcome ${name}!</h1>
            <p>Click the button below to verify your email and activate your account:</p>
            <a href="${verificationLink}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
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