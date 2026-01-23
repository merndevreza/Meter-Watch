import mongoose, { Schema } from "mongoose";
 
const meterSchema = new Schema({
   meterNumber:{
      type: Number,
      required: true,
      unique: true,
   },
   sanctionLoad:{
      type: Number,
      required: true,
   },
   sanctionTariff:{
      type: String,
      required: true,
   },
   meterType:{
      type: String,
      required: true,
   },
   meterInstallationDate:{
      type: Date,
      required: true,
      default: Date.now,
   },
   createdAt:{
      type: Date,
      default: Date.now,
   },
   createdBy:{
      type: String,
      ref: "Users",
      required: true,
   },
   meterOwner:{
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
   },
})
export const Meters =
  mongoose.models.Meters ?? mongoose.model("Meters", meterSchema);