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
   isActive: {
      type: Boolean,
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
      type: String,
      ref: "Users",
      required: true,
   },
}, { timestamps: true });


export const Meters =
   mongoose.models.Meters ?? mongoose.model("Meters", meterSchema);