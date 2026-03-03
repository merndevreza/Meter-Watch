import mongoose, { Schema, Document, Model } from 'mongoose';
import { Customer as CustomerType } from '@/types';

/**
 * ICustomer - Mongoose Document interface
 * Extends the base Customer type for Mongoose document methods
 * Omit _id from CustomerType to avoid conflict with Document's _id
 */
export interface ICustomer extends Document, Omit<CustomerType, '_id'> {}

/**
 * Customer Schema with validation
 */
const CustomerSchema: Schema = new Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name too long'],
    },
    fatherHusbandName: {
      type: String,
      required: [true, 'Father/Husband name is required'],
      trim: true,
      maxlength: [200, 'Father/Husband name too long'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address too long'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Validate Bangladeshi mobile number format
          return /^(\+?880|0)?1[3-9]\d{8}$/.test(v.replace(/\s/g, ''));
        },
        message: 'Invalid mobile number format',
      },
    },
    electricityOffice: {
      type: String,
      required: [true, 'Electricity office is required'],
      trim: true,
    },
    feederName: {
      type: String,
      required: [true, 'Feeder name is required'],
      trim: true,
    },
    consumerNumber: {
      type: String,
      required: [true, 'Consumer number is required'],
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v: string) {
          // Validate consumer number format (adjust regex as needed)
          return /^\d{6,15}$/.test(v);
        },
        message: 'Invalid consumer number format',
      },
    },
    meterName: {
      type: String,
      required: [true, 'Meter name is required'],
      trim: true,
      maxlength: [100, 'Meter name too long'],
    },
    meterNumber: {
      type: String,
      required: [true, 'Meter number is required'],
      trim: true,
      index: true,
    },
    sanctionedLoadKw: {
      type: String,
      required: [true, 'Sanctioned load is required'],
      trim: true,
    },
    tariff: {
      type: String,
      required: [true, 'Tariff is required'],
      trim: true,
    },
    meterType: {
      type: String,
      default: '',
      trim: true,
    },
    meterStatus: {
      type: String,
      default: '',
      trim: true,
    },
    meterInstallationDate: {
      type: String,
      default: '',
      trim: true,
    },
    minimumRechargeAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum recharge amount cannot be negative'],
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    hasNotice: {
      type: Boolean,
      default: false,
      index: true,
    },
    noticeMessage: {
      type: String,
      default: null,
    },
    noticeLastChecked: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'Users',
      index: true,
    },
    lastScraped: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    // Add virtual fields if needed
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
CustomerSchema.index({ userId: 1, consumerNumber: 1 });
CustomerSchema.index({ userId: 1, lastScraped: -1 });
CustomerSchema.index({ userId: 1, hasNotice: 1 });

// Virtual for days since last scrape
CustomerSchema.virtual('daysSinceLastScrape').get(function(this: ICustomer) {
  const now = new Date();
  const diff = now.getTime() - this.lastScraped.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

 

/**
 * Customer Model
 */
export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);