import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Customer Interface - matches the scraped data structure
 */
export interface ICustomer extends Document {
  // Basic Information
  customerName: string;
  fatherHusbandName: string;
  address: string;
  mobile: string;

  // Electricity Office Details
  electricityOffice: string;
  feederName: string;
  consumerNumber: string;

  // Meter Information
  meterNumber: string;
  sanctionedLoadKw: string;
  tariff: string;
  meterType: string;
  meterStatus: string;
  meterInstallationDate: string;

  // Balance Information
  minimumRechargeAmount: number;
  remainingBalance: number;

  // User Association
  userId: string; // The user who added this customer

  // Timestamps
  lastScraped: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer Schema
 */
const CustomerSchema: Schema = new Schema(
  {
    // Basic Information
    customerName: {
      type: String,
      required: true,
    },
    fatherHusbandName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    // Electricity Office Details
    electricityOffice: {
      type: String,
      required: true,
    },
    feederName: {
      type: String,
      required: true,
    },
    consumerNumber: {
      type: String,
      required: true,
      unique: true, // Consumer number should be unique
      index: true,
    },
    hasNotice: { type: Boolean, default: false },
    noticeMessage: { type: String, default: null },
    noticeLastChecked: { type: Date },
    // Meter Information
    meterName: {
      type: String,
      required: true,
    },
    meterNumber: {
      type: String,
      required: true,
      index: true,
    },
    sanctionedLoadKw: {
      type: String,
      required: true,
    },
    tariff: {
      type: String,
      required: true,
    },
    meterType: {
      type: String,
      default: '',
    },
    meterStatus: {
      type: String,
      default: '',
    },
    meterInstallationDate: {
      type: String,
      default: '',
    },

    // Balance Information
    minimumRechargeAmount: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    // User Association
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Timestamps
    lastScraped: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create compound index for user-specific queries
CustomerSchema.index({ userId: 1, consumerNumber: 1 });

/**
 * Customer Model
 */
export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);