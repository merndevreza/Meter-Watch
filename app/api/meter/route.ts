import { auth } from "@/auth";
import { Meters } from "@/database/models/meter-model";
import connectMongo from "@/database/services/connectMongo";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
   const session = await auth();
   console.log("session", session);
   
   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   }
   const reqBody = await request.json();
   console.log("reqBody", reqBody);
   
   const { meterName, meterNumber, sanctionLoad, sanctionTariff, meterType, meterInstallationDate, minimumRechargeThreshold } = reqBody;
   try {
      await connectMongo();
      const alreadyExists = await Meters.findOne({ meterNumber });
      console.log("alreadyExists", alreadyExists);
      
      if (alreadyExists) {
         return NextResponse.json({ success: false, message: "Meter already exists", status: 409 });
      }
      const newMeter = {
         meterName,
         meterNumber,
         sanctionLoad,
         sanctionTariff,
         meterType,
         meterInstallationDate,
         minimumRechargeThreshold,
         currentBalance: 0,
         meterStatus: "active",
         createdAt: new Date(),
         createdBy: session.user.email,
         meterOwner: session.user.id,
      }
      console.log("newMeter", newMeter);

      await Meters.create(newMeter);
      return NextResponse.json({ success: true, message: "Meter added successfully", status: 201 });
   } catch (error) {
      console.log(error);
      
      return NextResponse.json({ success: false, message: "Failed to add meter", status: 500 });
   }
}