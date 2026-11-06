import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(60),
  email: z.string().email("Please provide a valid email address").toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20),
  role: z.enum(["customer", "provider"], {
    errorMap: () => ({ message: "Role must be either customer or provider" }),
  }),
});

export const LoginSchema = z.object({
  email: z.string().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required").toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ServiceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  priceType: z.enum(["fixed", "hourly", "quote"]),
  serviceAreas: z.array(z.string()).min(1, "At least one service area is required"),
  images: z.array(z.string()).optional(),
  location: z
    .object({
      city: z.string().default("Gilgit"),
      area: z.string().default("Gilgit City"),
      coordinates: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
    })
    .optional(),
  isActive: z.boolean().default(true),
});

export const BookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  requestedTime: z.string().min(1, "Requested time slot is required"),
  description: z.string().min(5, "Please provide description of requested work"),
  serviceAddress: z.string().min(5, "Service address is required"),
  contactPhone: z.string().min(10, "Valid contact phone is required"),
});

export const ReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
});

export const ComplaintSchema = z.object({
  bookingId: z.string().optional(),
  providerId: z.string().optional(),
  category: z.enum([
    "provider_behavior",
    "poor_service_quality",
    "booking_problem",
    "misleading_information",
    "payment_issue",
    "other",
  ]),
  description: z.string().min(10, "Complaint description must be at least 10 characters"),
  attachments: z.array(z.string()).optional(),
});

export const ProviderProfileSchema = z.object({
  professionalTitle: z.string().min(2, "Professional title is required").max(100),
  bio: z.string().min(10, "Bio should be at least 10 characters").max(1000),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experienceYears: z.coerce.number().min(0).max(60),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  serviceAreas: z.array(z.string()).min(1, "Select at least one area"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const VerificationSubmissionSchema = z.object({
  documentType: z.enum(["cnic", "license", "certificate", "utility_bill"]),
  documentUrls: z.array(z.string()).min(1, "At least one document image is required"),
  notes: z.string().optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().min(5, "Description is required"),
  icon: z.string().default("Wrench"),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

