import { auth } from "@/auth";
import { Meters } from "@/database/models/meter-model";
import connectMongo from "@/database/services/connectMongo";
import { NextResponse } from "next/server";


export const PUT = async (request: Request) => {
   const session = await auth();
   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   }
   const reqBody = await request.json(); 

   const { mongoId, newBalance } = reqBody;
   try {
      await connectMongo();
      const updateResult = await Meters.updateOne(
         { _id: mongoId, meterOwner: session.user.id },
         {
            $set: {
               currentBalance: newBalance,
               updatedAt: new Date(),
            },
         }
      ); 
      
      if (updateResult.matchedCount === 0) {
         return NextResponse.json({ success: false, message: "Meter not found or you do not have permission to edit it.", status: 404 });
      }
      return NextResponse.json({ success: true, message: "Meter updated successfully", status: 200 });
   } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, message: "Failed to update meter", status: 500 });
   }
}