import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplaint extends Document {
  submittedBy: mongoose.Types.ObjectId;
  relatedProvider?: mongoose.Types.ObjectId;
  relatedBooking?: mongoose.Types.ObjectId;
  category: "provider_behavior" | "poor_service_quality" | "booking_problem" | "misleading_information" | "payment_issue" | "other";
  description: string;
  attachments: string[];
  status: "open" | "under_review" | "resolved" | "rejected";
  adminResponse: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedProvider: { type: Schema.Types.ObjectId, ref: "User" },
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    category: {
      type: String,
      enum: [
        "provider_behavior",
        "poor_service_quality",
        "booking_problem",
        "misleading_information",
        "payment_issue",
        "other",
      ],
      default: "other",
    },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "rejected"],
      default: "open",
    },
    adminResponse: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

ComplaintSchema.index({ submittedBy: 1 });
ComplaintSchema.index({ relatedProvider: 1 });
ComplaintSchema.index({ status: 1 });

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;

