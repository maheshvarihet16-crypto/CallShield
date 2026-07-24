import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: "user" | "admin";
  createdAt?: Date;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: "user" | "admin";
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
