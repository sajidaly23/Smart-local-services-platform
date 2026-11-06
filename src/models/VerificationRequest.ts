import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationRequest extends Document {
  provider: mongoose.Types.ObjectId;
  documentType: "cnic" | "license" | "certificate" | "utility_bill";
  documentUrls: string[];
  status: "pending" | "approved" | "rejected";
  adminNotes: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRequestSchema = new Schema<IVerificationRequest>(
  {
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: {
      type: String,
      enum: ["cnic", "license", "certificate", "utility_bill"],
      required: true,
    },
    documentUrls: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

VerificationRequestSchema.index({ provider: 1, createdAt: -1 });
VerificationRequestSchema.index({ status: 1 });

const VerificationRequest: Model<IVerificationRequest> =
  mongoose.models.VerificationRequest ||
  mongoose.model<IVerificationRequest>("VerificationRequest", VerificationRequestSchema);

export default VerificationRequest;

