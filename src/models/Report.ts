import mongoose, { Schema, Document, Model } from "mongoose";

export type ReportCategory =
  | "Scam"
  | "Fraud Bank Call"
  | "Fake Police/Digital Arrest"
  | "KYC Scam"
  | "Telemarketing"
  | "OTP Phishing"
  | "Other";

export interface IReport {
  numberId: mongoose.Types.ObjectId | string;
  reportedBy: mongoose.Types.ObjectId | string;
  category: ReportCategory;
  description: string;
  language?: string;
  evidenceUrl?: string;
  audioUrl?: string;
  location?: string;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt?: Date;
}

export interface IReportDocument extends Document {
  numberId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  category: ReportCategory;
  description: string;
  language?: string;
  evidenceUrl?: string;
  audioUrl?: string;
  location?: string;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    numberId: { type: Schema.Types.ObjectId, ref: "Number", required: true, index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: [
        "Scam",
        "Fraud Bank Call",
        "Fake Police/Digital Arrest",
        "KYC Scam",
        "Telemarketing",
        "OTP Phishing",
        "Other",
      ],
      required: true,
    },
    description: { type: String, required: true },
    language: { type: String, default: "en" },
    evidenceUrl: { type: String },
    audioUrl: { type: String },
    location: { type: String },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true }
);

export const Report: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>("Report", ReportSchema);

export default Report;
