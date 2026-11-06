import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/localconnect";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@localconnect.pk";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

// Schemas
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: String,
    profileImage: String,
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProviderProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    professionalTitle: String,
    bio: String,
    skills: [String],
    experienceYears: Number,
    serviceCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    serviceAreas: [String],
    city: String,
    area: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    verificationStatus: { type: String, default: "pending" },
    verificationDocuments: [String],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    slug: { type: String, unique: true },
    description: String,
    icon: String,
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: String,
    slug: String,
    description: String,
    price: Number,
    priceType: String,
    images: [String],
    serviceAreas: [String],
    city: String,
    area: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    isActive: { type: Boolean, default: true },
    viewsCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingReference: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    requestedDate: String,
    requestedTime: String,
    description: String,
    serviceAddress: String,
    contactPhone: String,
    price: Number,
    status: String,
    cancellationReason: String,
    completedAt: Date,
    hasReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);

const ComplaintSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relatedProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    category: String,
    description: String,
    attachments: [String],
    status: String,
    adminResponse: String,
  },
  { timestamps: true }
);

const LocationSchema = new mongoose.Schema(
  {
    name: String,
    city: String,
    region: String,
    coordinates: [Number],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const ProviderProfile = mongoose.models.ProviderProfile || mongoose.model("ProviderProfile", ProviderProfileSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", ComplaintSchema);
const Location = mongoose.models.Location || mongoose.model("Location", LocationSchema);

async function seed() {
  console.log("Connecting to MongoDB for seeding...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Cleaning existing seed collections...");
  await Promise.all([
    User.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Category.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Complaint.deleteMany({}),
    Location.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash("User@12345", salt);
  const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  console.log("Seeding Locations in Gilgit-Baltistan...");
  const locationsData = [
    { name: "Gilgit City Center", city: "Gilgit", region: "Gilgit-Baltistan", coordinates: [74.3142, 35.9208] },
    { name: "Jutial", city: "Gilgit", region: "Gilgit-Baltistan", coordinates: [74.3415, 35.8942] },
    { name: "Danyor", city: "Gilgit", region: "Gilgit-Baltistan", coordinates: [74.3792, 35.9325] },
    { name: "Konodas", city: "Gilgit", region: "Gilgit-Baltistan", coordinates: [74.3218, 35.9287] },
    { name: "Skardu Town", city: "Skardu", region: "Gilgit-Baltistan", coordinates: [75.6333, 35.2971] },
    { name: "Aliabad", city: "Hunza", region: "Gilgit-Baltistan", coordinates: [74.6158, 36.3072] },
    { name: "Karimabad", city: "Hunza", region: "Gilgit-Baltistan", coordinates: [74.6628, 36.3262] },
    { name: "Gupis", city: "Ghizer", region: "Gilgit-Baltistan", coordinates: [73.4447, 36.2167] },
    { name: "Chilas", city: "Diamer", region: "Gilgit-Baltistan", coordinates: [74.0961, 35.4214] },
    { name: "Eidgah", city: "Astore", region: "Gilgit-Baltistan", coordinates: [74.9039, 35.3678] },
  ];
  await Location.insertMany(locationsData);

  console.log("Seeding Service Categories...");
  const categoriesData = [
    {
      name: "Electrical Services",
      slug: "electrical-services",
      description: "Wiring, solar inverter setups, generator repair, appliance troubleshooting, and emergency electrical trades.",
      icon: "Zap",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Plumbing Services",
      slug: "plumbing-services",
      description: "Pipe leak fixes, water geyser maintenance, bathroom fixtures, drainage cleaning, and tank installations.",
      icon: "Wrench",
      image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Home Repair & Carpentry",
      slug: "carpentry-home-repair",
      description: "Custom wooden cabinetry, door adjustments, furniture restoration, and general masonry repairs.",
      icon: "Hammer",
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Computer & IT Technician",
      slug: "computer-it-technician",
      description: "Laptop hardware repair, operating system installations, networking setup, WiFi configuration, and data backup.",
      icon: "Laptop",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Web Development & Freelance",
      slug: "web-development-freelance",
      description: "Custom business websites, Next.js apps, WordPress customization, e-commerce stores, and digital support.",
      icon: "Code",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Education & Tutoring",
      slug: "education-tutoring",
      description: "Math, Physics, English, Computer Science, and university FYP mentoring by experienced local teachers.",
      icon: "BookOpen",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Photography & Videography",
      slug: "photography-services",
      description: "Event coverage, mountain landscape shoots, cultural documentaries, portrait, and commercial photography.",
      icon: "Camera",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Painting & Renovation",
      slug: "painting-renovation",
      description: "Interior wall emulsion, weather-sheet exterior painting, wood polish, and decorative plastering.",
      icon: "Paintbrush",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
    },
  ];
  const createdCategories = await Category.insertMany(categoriesData);

  console.log("Seeding Platform Admin...");
  const adminUser = await User.create({
    name: "System Administrator",
    email: ADMIN_EMAIL,
    password: adminHashedPassword,
    phone: "+92 312 9988776",
    role: "admin",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    isActive: true,
  });

  console.log("Seeding Customer Accounts...");
  const customer1 = await User.create({
    name: "Ali Raza Khan",
    email: "customer@localconnect.pk",
    password: commonPassword,
    phone: "+92 344 5566778",
    role: "customer",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isActive: true,
  });

  const customer2 = await User.create({
    name: "Zainab Bibi",
    email: "zainab@example.com",
    password: commonPassword,
    phone: "+92 355 6677889",
    role: "customer",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isActive: true,
  });

  console.log("Seeding Service Providers...");
  const providersData = [
    {
      name: "Muhammad Ibrahim",
      email: "provider@localconnect.pk",
      phone: "+92 345 1122334",
      title: "Master Electrician & Solar Setup Specialist",
      bio: "12 years of hands-on experience in domestic wiring, solar hybrid inverter systems, and commercial building electrical work across Gilgit and Jutial.",
      skills: ["Home Wiring", "Solar Inverters", "Circuit Breakers", "Generator Repair", "Safety Inspection"],
      experienceYears: 12,
      city: "Gilgit",
      area: "Jutial",
      coordinates: [74.3415, 35.8942],
      categorySlug: "electrical-services",
      verificationStatus: "verified",
      services: [
        {
          title: "Complete Home Electrical Wiring & Solar Setup",
          description: "Certified inspection and complete electrical installation for newly constructed homes or renovations in Gilgit and Jutial. Includes solar inverter configuration and surge protection.",
          price: 3500,
          priceType: "quote",
          images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Gilgit City", "Jutial", "Konodas", "Danyor"],
        },
        {
          title: "Emergency Inverter & Circuit Repair",
          description: "Rapid on-site diagnosis and repair of tripped breakers, burned sockets, inverter failures, and backup power wiring.",
          price: 1200,
          priceType: "fixed",
          images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Gilgit City", "Jutial"],
        },
      ],
    },
    {
      name: "Khadim Hussain",
      email: "khadim.plumber@localconnect.pk",
      phone: "+92 346 2233445",
      title: "Certified Master Plumber",
      bio: "Specializing in freeze-resistant PVC and PPRC water piping, geyser installations, bathroom renovation, and underground leakage detection.",
      skills: ["PPRC Piping", "Water Geyser Repair", "Bathroom Sanitary", "Leakage Fixing", "Motor Pump Setup"],
      experienceYears: 8,
      city: "Gilgit",
      area: "Danyor",
      coordinates: [74.3792, 35.9325],
      categorySlug: "plumbing-services",
      verificationStatus: "verified",
      services: [
        {
          title: "Winterized Plumbing & Geyser Servicing",
          description: "Protect your water supply from freezing during harsh northern winters. Complete geyser de-scaling, thermostat replacement, and PPRC pipe insulation.",
          price: 1800,
          priceType: "fixed",
          images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Danyor", "Gilgit City", "Jutial"],
        },
      ],
    },
    {
      name: "Tariq Aziz",
      email: "tariq.carpenter@localconnect.pk",
      phone: "+92 347 3344556",
      title: "Fine Woodwork & Cabinet Artisan",
      bio: "Crafting durable walnut and pine furniture, customized kitchen cabinets, decorative ceilings, and wooden window fittings built for mountain weather.",
      skills: ["Walnut Woodwork", "Kitchen Cabinets", "Door Fitting", "Polishing", "Ceiling Panels"],
      experienceYears: 15,
      city: "Hunza",
      area: "Aliabad",
      coordinates: [74.6158, 36.3072],
      categorySlug: "carpentry-home-repair",
      verificationStatus: "verified",
      services: [
        {
          title: "Custom Kitchen Cabinetry & Wood Restoration",
          description: "High-grade local walnut and pine cabinetry, precision fitting, premium varnish, and custom woodwork for residential homes and guest houses.",
          price: 15000,
          priceType: "quote",
          images: ["https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Aliabad", "Karimabad", "Ganesh", "Gilgit"],
        },
      ],
    },
    {
      name: "Sajid Karim",
      email: "sajid.tech@localconnect.pk",
      phone: "+92 348 4455667",
      title: "Senior Full-Stack & Next.js Developer",
      bio: "BS Computer Science graduate with extensive experience in Next.js, Node.js, MongoDB, REST APIs, and e-commerce solutions for local businesses.",
      skills: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
      experienceYears: 5,
      city: "Gilgit",
      area: "Konodas",
      coordinates: [74.3218, 35.9287],
      categorySlug: "web-development-freelance",
      verificationStatus: "verified",
      services: [
        {
          title: "Modern Business Website & Web App Development",
          description: "Production-ready website built with Next.js, TypeScript, and responsive modern design. Perfect for local tourism companies, hotels, clinics, and businesses.",
          price: 25000,
          priceType: "fixed",
          images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Gilgit", "Skardu", "Hunza", "Remote across Pakistan"],
        },
      ],
    },
    {
      name: "Haider Ali",
      email: "haider.photo@localconnect.pk",
      phone: "+92 349 5566778",
      title: "Documentary & Mountain Event Photographer",
      bio: "Passionate photographer capturing weddings, festivals, scenic landscapes, and professional brand shoots across Gilgit-Baltistan.",
      skills: ["Portrait Photography", "Drone Videography", "Lightroom Editing", "Event Coverage"],
      experienceYears: 6,
      city: "Skardu",
      area: "Skardu Town",
      coordinates: [75.6333, 35.2971],
      categorySlug: "photography-services",
      verificationStatus: "pending", // Pending provider demo
      services: [
        {
          title: "Wedding & Event Cinematic Photography Package",
          description: "Full day coverage with high resolution DSLR cameras and 4K aerial drone footage. Includes 100+ edited prints and teaser video.",
          price: 30000,
          priceType: "fixed",
          images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
          serviceAreas: ["Skardu Town", "Shigar", "Khaplu"],
        },
      ],
    },
  ];

  const createdServices = [];

  for (const prov of providersData) {
    const user = await User.create({
      name: prov.name,
      email: prov.email,
      password: commonPassword,
      phone: prov.phone,
      role: "provider",
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prov.name)}`,
      isActive: true,
    });

    const category = createdCategories.find((c) => c.slug === prov.categorySlug);

    await ProviderProfile.create({
      user: user._id,
      professionalTitle: prov.title,
      bio: prov.bio,
      skills: prov.skills,
      experienceYears: prov.experienceYears,
      serviceCategories: category ? [category._id] : [],
      serviceAreas: prov.services[0].serviceAreas,
      city: prov.city,
      area: prov.area,
      location: {
        type: "Point",
        coordinates: prov.coordinates,
      },
      verificationStatus: prov.verificationStatus,
      verificationDocuments: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      averageRating: prov.verificationStatus === "verified" ? 4.9 : 0,
      totalReviews: prov.verificationStatus === "verified" ? 14 : 0,
      isAvailable: true,
    });

    for (const s of prov.services) {
      const createdService = await Service.create({
        provider: user._id,
        category: category._id,
        title: s.title,
        slug: `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
        description: s.description,
        price: s.price,
        priceType: s.priceType,
        images: s.images,
        serviceAreas: s.serviceAreas,
        city: prov.city,
        area: prov.area,
        location: {
          type: "Point",
          coordinates: prov.coordinates,
        },
        isActive: prov.verificationStatus === "verified",
        viewsCount: 42,
        bookingsCount: 8,
      });
      createdServices.push({ service: createdService, providerUser: user });
    }
  }

  console.log("Seeding Sample Bookings...");
  const primaryService = createdServices[0];
  const secondaryService = createdServices[1];

  const booking1 = await Booking.create({
    bookingReference: "LC-2026-ELEC-01",
    customer: customer1._id,
    provider: primaryService.providerUser._id,
    service: primaryService.service._id,
    requestedDate: "2026-11-15",
    requestedTime: "10:00 AM - 12:00 PM",
    description: "Install 3 new circuit breakers and connect solar inverter backup cable in Jutial.",
    serviceAddress: "House 42, Street 3, Jutial, Gilgit",
    contactPhone: "+92 344 5566778",
    price: 3500,
    status: "completed",
    completedAt: new Date(),
    hasReview: true,
  });

  const booking2 = await Booking.create({
    bookingReference: "LC-2026-PLUM-02",
    customer: customer1._id,
    provider: secondaryService.providerUser._id,
    service: secondaryService.service._id,
    requestedDate: "2026-11-20",
    requestedTime: "02:00 PM - 04:00 PM",
    description: "Water geyser pilot light keeps turning off in cold mornings. Need thorough servicing.",
    serviceAddress: "Sector A, Danyor Road, Gilgit",
    contactPhone: "+92 344 5566778",
    price: 1800,
    status: "accepted",
  });

  const booking3 = await Booking.create({
    bookingReference: "LC-2026-PEND-03",
    customer: customer2._id,
    provider: primaryService.providerUser._id,
    service: primaryService.service._id,
    requestedDate: "2026-11-25",
    requestedTime: "11:00 AM - 01:00 PM",
    description: "Kitchen exhaust fan installation and ceiling spot lights wiring.",
    serviceAddress: "Konodas Near Degree College, Gilgit",
    contactPhone: "+92 355 6677889",
    price: 1200,
    status: "pending",
  });

  console.log("Seeding Reviews...");
  await Review.create({
    customer: customer1._id,
    provider: primaryService.providerUser._id,
    booking: booking1._id,
    rating: 5,
    comment: "Muhammad Ibrahim arrived promptly on time in Jutial and fixed the solar inverter with high professionalism. Safe, neat wiring. Highly recommended!",
  });

  console.log("Seeding Complaints & Admin Oversight...");
  await Complaint.create({
    submittedBy: customer2._id,
    relatedProvider: primaryService.providerUser._id,
    relatedBooking: booking3._id,
    category: "booking_problem",
    description: "Wanted to know if travel charges apply to Konodas before provider accepts.",
    status: "resolved",
    adminResponse: "LocalConnect standard policy: Travel within city radius is included in quoted price. Confirmed with provider.",
  });

  console.log("\n=================================================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================================");
  console.log("DEMO ACCOUNTS READY FOR EVALUATION:");
  console.log(`1. Administrator:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`2. Service Provider (Verified - Gilgit):`);
  console.log(`   Email:    provider@localconnect.pk`);
  console.log(`   Password: User@12345`);
  console.log(`3. Service Provider (Pending Verification - Skardu):`);
  console.log(`   Email:    haider.photo@localconnect.pk`);
  console.log(`   Password: User@12345`);
  console.log(`4. Customer:`);
  console.log(`   Email:    customer@localconnect.pk`);
  console.log(`   Password: User@12345`);
  console.log("=================================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding Error:", err);
  process.exit(1);
});

