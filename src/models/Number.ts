import mongoose, { Schema, Document, Model } from "mongoose";

export interface INumber {
  phoneNumber: string;
  fraudScore: number;
  totalReports: number;
  topCategory?: string;
  isSpoofedFlag?: boolean;
  lastReportedAt?: Date;
  createdAt?: Date;
}

export interface INumberDocument extends Document {
  phoneNumber: string;
  fraudScore: number;
  totalReports: number;
  topCategory?: string;
  isSpoofedFlag?: boolean;
  lastReportedAt?: Date;
  createdAt: Date;
}

const NumberSchema = new Schema<INumberDocument>(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    fraudScore: { type: Number, default: 0 },
    totalReports: { type: Number, default: 0 },
    topCategory: { type: String },
    isSpoofedFlag: { type: Boolean, default: false },
    lastReportedAt: { type: Date },
  },
  { timestamps: true }
);

export const NumberModel: Model<INumberDocument> =
  mongoose.models.Number || mongoose.model<INumberDocument>("Number", NumberSchema);

export default NumberModel;
