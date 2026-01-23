import { Users } from "@/database/models/user-model";
import connectMongo from "@/database/services/connectMongo";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
   const { searchParams } = new URL(request.url);
   const token = searchParams.get("token");
   const email = searchParams.get("email");

   try {
      await connectMongo();
      const user = await Users.findOne({ email, verificationToken: token });

      if (!user) {
         return NextResponse.json({ message: "Invalid token or email" }, { status: 400 });
      }

      // Mark as verified and remove the token
      user.emailVerified = new Date();
      user.verificationToken = undefined; 
      await user.save();

      // Redirect to login page with a success message
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?verified=true`);

   } catch (error) {
      return NextResponse.json({ message: "Verification failed" }, { status: 500 });
   }
}