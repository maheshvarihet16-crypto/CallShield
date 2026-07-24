import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILinkScan {
  url: string;
  scannedBy?: mongoose.Types.ObjectId | string;
  result: "safe" | "suspicious" | "malicious";
  rawApiResponse?: Record<string, unknown>;
  createdAt?: Date;
}

export interface ILinkScanDocument extends Document {
  url: string;
  scannedBy?: mongoose.Types.ObjectId;
  result: "safe" | "suspicious" | "malicious";
  rawApiResponse?: Record<string, unknown>;
  createdAt: Date;
}

const LinkScanSchema = new Schema<ILinkScanDocument>(
  {
    url: { type: String, required: true, index: true },
    scannedBy: { type: Schema.Types.ObjectId, ref: "User" },
    result: {
      type: String,
      enum: ["safe", "suspicious", "malicious"],
      required: true,
    },
    rawApiResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const LinkScan: Model<ILinkScanDocument> =
  mongoose.models.LinkScan || mongoose.model<ILinkScanDocument>("LinkScan", LinkScanSchema);

export default LinkScan;
