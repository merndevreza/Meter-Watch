import { auth } from "@/auth";
import { Meters } from "@/database/models/meter-model";
import connectMongo from "@/database/services/connectMongo";
import { NextResponse } from "next/server";

// Add New Meter
export const POST = async (request: Request) => {
   const session = await auth();

   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   }
   const reqBody = await request.json();

   const { meterName, meterNumber, sanctionLoad, sanctionTariff, meterType, meterInstallationDate, minimumRechargeThreshold } = reqBody;
   try {
      await connectMongo();
      const alreadyExists = await Meters.findOne({ meterNumber });

      if (alreadyExists) {
         return NextResponse.json({ success: false, message: "Meter already exists", status: 409 });
      }
      console.log("session.user.id", session.user.id);
      
      const newMeter = {
         meterName,
         meterNumber,
         sanctionLoad,
         sanctionTariff,
         meterType,
         meterInstallationDate,
         minimumRechargeThreshold,
         currentBalance: 0,
         isActive: true,
         createdAt: new Date(),
         createdBy: session.user.id,
         meterOwner: session.user.id,
      }
      await Meters.create(newMeter);
      return NextResponse.json({ success: true, message: "Meter added successfully", status: 201 });
   } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, message: "Failed to add meter", status: 500 });
   }
}

// Delete Meter
export const DELETE = async (request: Request) => {
   const session = await auth();
   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   }
   const reqBody = await request.json();
   const { mongoId } = reqBody;

   try {
      await connectMongo();
      const deletionResult = await Meters.deleteOne({ _id: mongoId, meterOwner: session.user.id });

      if (deletionResult.deletedCount === 0) {
         return NextResponse.json({ success: false, message: "Meter not found or you do not have permission to delete it.", status: 404 });
      }
      return NextResponse.json({ success: true, message: "Meter deleted successfully", status: 200 });
   } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, message: "Failed to delete meter", status: 500 });
   }
}

// Edit Meter
export const PUT = async (request: Request) => {
   const session = await auth();
   if (!session?.user?.emailVerified) {
      return NextResponse.json({ success: false, message: "Unauthorized", status: 401 });
   }
   const reqBody = await request.json(); 
   
   const { mongoId, meterName, sanctionLoad, sanctionTariff, meterType, meterInstallationDate, minimumRechargeThreshold, isActive } = reqBody;
   try {
      await connectMongo();
      const updateResult = await Meters.updateOne(
         { _id: mongoId, meterOwner: session.user.id },
         {
            $set: {
               isActive,
               meterName,
               sanctionLoad,
               sanctionTariff,
               meterType,
               meterInstallationDate,
               minimumRechargeThreshold,
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