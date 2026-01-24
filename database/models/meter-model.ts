import mongoose, { Schema } from "mongoose";

const meterSchema = new Schema({
   meterName: {
      type: String,
      required: true, 
   },
   meterNumber: {
      type: Number,
      required: true,
      unique: true,
   },
   sanctionLoad: {
      type: Number,
      required: true,
   },
   sanctionTariff: {
      type: String,
      required: true,
   },
   meterType: {
      type: String,
      required: true,
   },
   meterStatus: {
      type: String,
      required: true,
   },
   minimumRechargeThreshold: {
      type: Number,
      required: true,
   },
   currentBalance: {
      type: Number,
      default: 0, 
   },
   meterInstallationDate: {
      type: Date,
      required: true,
      default: Date.now,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   createdBy: {
      type: String,
      ref: "Users",
      required: true,
   },
   meterOwner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
   },
}, { timestamps: true });


export const Meters =
   mongoose.models.Meters ?? mongoose.model("Meters", meterSchema);