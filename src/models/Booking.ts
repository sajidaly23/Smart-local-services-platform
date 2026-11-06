import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  bookingReference: string;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  requestedDate: string;
  requestedTime: string;
  description: string;
  serviceAddress: string;
  contactPhone: string;
  price: number;
  status: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled";
  cancellationReason?: string;
  completedAt?: Date;
  hasReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      default: () => `LC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    requestedDate: { type: String, required: true },
    requestedTime: { type: String, required: true },
    description: { type: String, required: true },
    serviceAddress: { type: String, required: true },
    contactPhone: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: { type: String, default: "" },
    completedAt: { type: Date },
    hasReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.index({ customer: 1 });
BookingSchema.index({ provider: 1 });
BookingSchema.index({ service: 1 });
BookingSchema.index({ status: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;

