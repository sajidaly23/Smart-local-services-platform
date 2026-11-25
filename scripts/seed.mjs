import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/localconnect";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "raeessajidali10@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "raees@111";

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
    location: { type: { type: String, default: "Point" }, coordinates: [Number] },
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
    location: { type: { type: String, default: "Point" }, coordinates: [Number] },
    isActive: { type: Boolean, default: true },
    status: { type: String, default: "approved" },
    rejectionReason: String,
    approvedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

const VerificationRequestSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    documentType: String,
    documentUrls: [String],
    status: { type: String, default: "pending" },
    adminNotes: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
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
const VerificationRequest = mongoose.models.VerificationRequest || mongoose.model("VerificationRequest", VerificationRequestSchema);

async function seed() {
  console.log("Connecting to MongoDB for seeding...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Cleaning existing collections...");
  await Promise.all([
    User.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Category.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Complaint.deleteMany({}),
    Location.deleteMany({}),
    VerificationRequest.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash("User@12345", salt);
  const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  console.log("Seeding Locations...");
  await Location.insertMany([
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
    { name: "Shigar Valley", city: "Skardu", region: "Gilgit-Baltistan", coordinates: [75.7200, 35.5300] },
    { name: "Nagar Valley", city: "Nagar", region: "Gilgit-Baltistan", coordinates: [74.5500, 36.2500] },
  ]);

  console.log("Seeding Categories...");
  const categoriesData = [
    { name: "Electrical Services", slug: "electrical-services", description: "Wiring, solar inverter setups, generator repair, appliance troubleshooting, and emergency electrical trades.", icon: "Zap", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80" },
    { name: "Plumbing Services", slug: "plumbing-services", description: "Pipe leak fixes, water geyser maintenance, bathroom fixtures, drainage cleaning, and tank installations.", icon: "Wrench", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80" },
    { name: "Home Repair & Carpentry", slug: "carpentry-home-repair", description: "Custom wooden cabinetry, door adjustments, furniture restoration, and general masonry repairs.", icon: "Hammer", image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80" },
    { name: "Computer & IT Technician", slug: "computer-it-technician", description: "Laptop hardware repair, operating system installations, networking setup, WiFi configuration, and data backup.", icon: "Laptop", image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80" },
    { name: "Web Development & Freelance", slug: "web-development-freelance", description: "Custom business websites, Next.js apps, WordPress customization, e-commerce stores, and digital support.", icon: "Code", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80" },
    { name: "Education & Tutoring", slug: "education-tutoring", description: "Math, Physics, English, Computer Science, and university FYP mentoring by experienced local teachers.", icon: "BookOpen", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80" },
    { name: "Photography & Videography", slug: "photography-services", description: "Event coverage, mountain landscape shoots, cultural documentaries, portrait, and commercial photography.", icon: "Camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80" },
    { name: "Painting & Renovation", slug: "painting-renovation", description: "Interior wall emulsion, weather-sheet exterior painting, wood polish, and decorative plastering.", icon: "Paintbrush", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80" },
    { name: "Tailoring & Stitching", slug: "tailoring-stitching", description: "Custom dress stitching, shalwar kameez, traditional GB attire, alterations, and embroidery work.", icon: "Scissors", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80" },
    { name: "Medical & Health Consultancy", slug: "medical-health", description: "General physician consultations, health checkups, medicine advice, and home visits by qualified doctors.", icon: "HeartPulse", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80" },
  ];
  const createdCategories = await Category.insertMany(categoriesData);
  const catMap = {};
  createdCategories.forEach(c => { catMap[c.slug] = c; });

  console.log("Seeding Admin...");
  const adminUser = await User.create({
    name: "System Administrator",
    email: ADMIN_EMAIL,
    password: adminHashedPassword,
    phone: "+92 312 9988776",
    role: "admin",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    isActive: true,
  });

  console.log("Seeding Customers...");
  const customer1 = await User.create({ name: "Ali Raza Khan", email: "customer@localconnect.pk", password: commonPassword, phone: "+92 344 5566778", role: "customer", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", isActive: true });
  const customer2 = await User.create({ name: "Zainab Bibi", email: "zainab@example.com", password: commonPassword, phone: "+92 355 6677889", role: "customer", profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", isActive: true });
  const customer3 = await User.create({ name: "Fatima Noor", email: "fatima.noor@example.com", password: commonPassword, phone: "+92 333 1122334", role: "customer", profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80", isActive: true });
  const customer4 = await User.create({ name: "Hamza Baig", email: "hamza.baig@example.com", password: commonPassword, phone: "+92 321 9988776", role: "customer", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", isActive: true });
  const customer5 = await User.create({ name: "Nasreen Sultana", email: "nasreen.sultana@example.com", password: commonPassword, phone: "+92 312 4455667", role: "customer", profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", isActive: true });
  const customers = [customer1, customer2, customer3, customer4, customer5];

  console.log("Seeding Providers...");
  const providersData = [
    // 1. Original verified provider
    {
      name: "Muhammad Ibrahim", email: "provider@localconnect.pk", phone: "+92 345 1122334",
      title: "Master Electrician & Solar Setup Specialist", bio: "12 years experience in domestic wiring, solar hybrid inverter systems, and commercial electrical work across Gilgit.",
      skills: ["Home Wiring", "Solar Inverters", "Circuit Breakers", "Generator Repair", "Safety Inspection"],
      experienceYears: 12, city: "Gilgit", area: "Jutial", coordinates: [74.3415, 35.8942],
      categorySlug: "electrical-services", verificationStatus: "verified", avgRating: 4.9, totalReviews: 24,
      services: [
        { title: "Complete Home Electrical Wiring & Solar Setup", description: "Certified full electrical installation for new homes in Gilgit. Includes solar inverter configuration, surge protection, and earthing.", price: 3500, priceType: "quote", images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit City", "Jutial", "Konodas", "Danyor"], views: 142, bookings: 18 },
        { title: "Emergency Inverter & Circuit Repair", description: "Rapid on-site diagnosis and repair of tripped breakers, burned sockets, inverter failures, and backup power wiring.", price: 1200, priceType: "fixed", images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit City", "Jutial"], views: 98, bookings: 12 },
        { title: "Solar Panel Installation & Maintenance", description: "Complete solar panel mounting, wiring, battery bank setup, and annual maintenance for homes and small offices in GB.", price: 8000, priceType: "quote", images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Hunza", "Nagar"], views: 76, bookings: 9 },
      ],
    },
    // 2. Plumber
    {
      name: "Khadim Hussain", email: "khadim.plumber@localconnect.pk", phone: "+92 346 2233445",
      title: "Certified Master Plumber", bio: "Specializing in freeze-resistant PPRC piping, geyser installations, bathroom renovation, and underground leakage detection in GB.",
      skills: ["PPRC Piping", "Water Geyser Repair", "Bathroom Sanitary", "Leakage Fixing", "Motor Pump Setup"],
      experienceYears: 8, city: "Gilgit", area: "Danyor", coordinates: [74.3792, 35.9325],
      categorySlug: "plumbing-services", verificationStatus: "verified", avgRating: 4.7, totalReviews: 18,
      services: [
        { title: "Winterized Plumbing & Geyser Servicing", description: "Complete geyser de-scaling, thermostat replacement, and PPRC pipe insulation for GB winters.", price: 1800, priceType: "fixed", images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Danyor", "Gilgit City", "Jutial"], views: 87, bookings: 11 },
        { title: "Full Bathroom Renovation & Tiling", description: "Complete bathroom makeover including wall tiling, sanitary ware fitting, shower installation, and waterproofing.", price: 25000, priceType: "quote", images: ["https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Danyor", "Konodas"], views: 65, bookings: 7 },
        { title: "Water Tank Installation & Plumbing", description: "Rooftop and underground water tank installation, pipeline connection, and valve fittings for homes and commercial buildings.", price: 5000, priceType: "quote", images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Danyor", "Jutial", "Aliabad"], views: 54, bookings: 6 },
      ],
    },
    // 3. Carpenter
    {
      name: "Tariq Aziz", email: "tariq.carpenter@localconnect.pk", phone: "+92 347 3344556",
      title: "Fine Woodwork & Cabinet Artisan", bio: "Crafting durable walnut and pine furniture, customized kitchen cabinets, decorative ceilings, and wooden window fittings for mountain weather.",
      skills: ["Walnut Woodwork", "Kitchen Cabinets", "Door Fitting", "Polishing", "Ceiling Panels"],
      experienceYears: 15, city: "Hunza", area: "Aliabad", coordinates: [74.6158, 36.3072],
      categorySlug: "carpentry-home-repair", verificationStatus: "verified", avgRating: 4.8, totalReviews: 21,
      services: [
        { title: "Custom Kitchen Cabinetry & Wood Restoration", description: "High-grade local walnut and pine cabinetry, precision fitting, premium varnish for residential homes and guesthouses.", price: 15000, priceType: "quote", images: ["https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Aliabad", "Karimabad", "Gilgit"], views: 112, bookings: 14 },
        { title: "Walnut Furniture & Bed Set Crafting", description: "Custom-designed bedroom sets, dining tables, chairs, and storage units crafted from premium GB walnut wood.", price: 45000, priceType: "quote", images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Hunza", "Gilgit", "Nagar"], views: 89, bookings: 8 },
        { title: "Door & Window Frame Installation", description: "Wooden door frames, window panels, shutters, and balcony railing installation for homes in Hunza and Gilgit.", price: 8000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Hunza", "Nagar", "Gilgit"], views: 67, bookings: 9 },
      ],
    },
    // 4. Web Developer
    {
      name: "Sajid Karim", email: "sajid.tech@localconnect.pk", phone: "+92 348 4455667",
      title: "Senior Full-Stack & Next.js Developer", bio: "BS Computer Science graduate with expertise in Next.js, Node.js, MongoDB, and e-commerce solutions for local GB businesses.",
      skills: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
      experienceYears: 5, city: "Gilgit", area: "Konodas", coordinates: [74.3218, 35.9287],
      categorySlug: "web-development-freelance", verificationStatus: "verified", avgRating: 4.9, totalReviews: 16,
      services: [
        { title: "Modern Business Website & Web App Development", description: "Production-ready website built with Next.js and TypeScript. Perfect for local tourism companies, hotels, clinics, and businesses.", price: 25000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Skardu", "Hunza", "Remote"], views: 134, bookings: 10 },
        { title: "WordPress Website & Online Store Setup", description: "Complete WordPress or WooCommerce store setup with payment gateway, product listings, and local shipping configuration.", price: 12000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["All GB", "Remote Pakistan"], views: 78, bookings: 7 },
        { title: "Mobile App UI/UX Design & Prototype", description: "Figma-based mobile app design, clickable prototypes, and developer handoff files for Android and iOS applications.", price: 15000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Remote across Pakistan"], views: 56, bookings: 4 },
      ],
    },
    // 5. Photographer (Pending - Demo)
    {
      name: "Haider Ali", email: "haider.photo@localconnect.pk", phone: "+92 349 5566778",
      title: "Documentary & Mountain Event Photographer", bio: "Passionate photographer capturing weddings, festivals, scenic landscapes, and professional brand shoots across Gilgit-Baltistan.",
      skills: ["Portrait Photography", "Drone Videography", "Lightroom Editing", "Event Coverage"],
      experienceYears: 6, city: "Skardu", area: "Skardu Town", coordinates: [75.6333, 35.2971],
      categorySlug: "photography-services", verificationStatus: "pending", avgRating: 0, totalReviews: 0,
      services: [
        { title: "Wedding & Event Cinematic Photography Package", description: "Full day coverage with DSLR cameras and 4K aerial drone footage. Includes 100+ edited prints and teaser video.", price: 30000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Skardu Town", "Shigar", "Khaplu"], views: 45, bookings: 0 },
      ],
    },
    // 6. IT Technician
    {
      name: "Imran Baig", email: "imran.it@localconnect.pk", phone: "+92 342 7788990",
      title: "Computer Hardware & Network Specialist", bio: "Certified IT technician with 7 years handling laptop motherboard repairs, networking setups, CCTV, and server installations for GB businesses.",
      skills: ["Laptop Repair", "Network Setup", "CCTV Installation", "Windows/Linux", "Data Recovery"],
      experienceYears: 7, city: "Gilgit", area: "Gilgit City Center", coordinates: [74.3142, 35.9208],
      categorySlug: "computer-it-technician", verificationStatus: "verified", avgRating: 4.6, totalReviews: 19,
      services: [
        { title: "Laptop & PC Motherboard Repair", description: "Professional diagnosis and repair of laptop and desktop motherboard faults, burnt components, and hardware failures.", price: 2500, priceType: "fixed", images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit City", "Jutial", "Danyor", "Konodas"], views: 103, bookings: 15 },
        { title: "Home & Office Network & WiFi Setup", description: "Full LAN/WiFi network configuration, router setup, cable management, and internet troubleshooting for homes and offices.", price: 1500, priceType: "fixed", images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Danyor", "Jutial"], views: 87, bookings: 12 },
        { title: "CCTV Camera Installation & Monitoring Setup", description: "IP camera installation, DVR/NVR configuration, remote viewing setup, and cable routing for homes and shops.", price: 8000, priceType: "quote", images: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["All Gilgit District"], views: 65, bookings: 8 },
      ],
    },
    // 7. Teacher
    {
      name: "Rabia Hussain", email: "rabia.tutor@localconnect.pk", phone: "+92 331 8899001",
      title: "Senior Mathematics & Science Tutor", bio: "M.Sc Mathematics with 10 years of teaching experience. Specializing in Matric, FSc, and university-level maths and physics tutoring in Gilgit.",
      skills: ["Mathematics", "Physics", "Chemistry", "FSc Board Prep", "University Calculus"],
      experienceYears: 10, city: "Gilgit", area: "Jutial", coordinates: [74.3415, 35.8942],
      categorySlug: "education-tutoring", verificationStatus: "verified", avgRating: 4.8, totalReviews: 32,
      services: [
        { title: "Matric & FSc Maths & Physics Home Tuition", description: "Comprehensive home tutoring for Matric and FSc students covering full syllabus, past papers, and exam preparation with guaranteed improvement.", price: 3000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Jutial", "Gilgit City", "Konodas"], views: 156, bookings: 22 },
        { title: "University FYP & Programming Mentoring", description: "Complete mentoring for university final year projects in Python, Java, data structures, and algorithms. Online sessions available.", price: 5000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Online"], views: 89, bookings: 11 },
        { title: "English Language & IELTS Preparation", description: "Spoken English, grammar, writing skills, and IELTS test preparation for students and professionals aiming to study abroad.", price: 4000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Online"], views: 72, bookings: 9 },
      ],
    },
    // 8. Painter
    {
      name: "Faisal Noor", email: "faisal.painter@localconnect.pk", phone: "+92 335 2211009",
      title: "Professional Painter & Interior Decorator", bio: "Expert in interior emulsion painting, wood polish, weather-resistant exterior paints, and decorative wall textures for GB homes and hotels.",
      skills: ["Emulsion Painting", "Wood Polish", "Texture Work", "Exterior Paint", "Colour Consultation"],
      experienceYears: 9, city: "Gilgit", area: "Konodas", coordinates: [74.3218, 35.9287],
      categorySlug: "painting-renovation", verificationStatus: "verified", avgRating: 4.5, totalReviews: 14,
      services: [
        { title: "Full Interior Home Painting & Finishing", description: "Complete interior painting service including wall preparation, primer, two-coat emulsion in customer-chosen colors, and door/window frame finishing.", price: 1200, priceType: "quote", images: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Konodas", "Danyor", "Jutial"], views: 94, bookings: 11 },
        { title: "Exterior Weather-Shield Painting", description: "Weather-resistant exterior paint application to protect GB homes from harsh winters, rain, and UV exposure. Includes crack repair.", price: 2000, priceType: "quote", images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["All Gilgit District"], views: 71, bookings: 8 },
      ],
    },
    // 9. Tailor
    {
      name: "Sara Begum", email: "sara.tailor@localconnect.pk", phone: "+92 338 5544332",
      title: "Master Tailor & Traditional Dress Designer", bio: "Expert in traditional Gilgiti and Hunzai dress stitching, modern shalwar kameez, bridal wear, and embroidery. 14 years experience.",
      skills: ["Traditional GB Dresses", "Bridal Stitching", "Embroidery", "Shalwar Kameez", "Alterations"],
      experienceYears: 14, city: "Hunza", area: "Karimabad", coordinates: [74.6628, 36.3262],
      categorySlug: "tailoring-stitching", verificationStatus: "verified", avgRating: 4.9, totalReviews: 28,
      services: [
        { title: "Traditional Hunzai & Gilgiti Dress Stitching", description: "Hand-crafted traditional dresses with authentic embroidery patterns. Perfect for weddings, Nowruz, and cultural events in GB.", price: 3500, priceType: "fixed", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Karimabad", "Aliabad", "Gilgit"], views: 118, bookings: 20 },
        { title: "Bridal Dress & Mehndi Outfit Tailoring", description: "Custom bridal outfits in silk, chiffon, and velvet with heavy embroidery, mirror work, and lace finishing for GB weddings.", price: 12000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1519657831234-19e1a2eb8c7e?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Hunza", "Nagar", "Gilgit", "Skardu"], views: 87, bookings: 12 },
        { title: "Clothes Alteration & Fitting Service", description: "Quick alterations, resizing, hem adjustments, and repair for all types of garments. Home pickup and delivery available.", price: 500, priceType: "fixed", images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Hunza", "Gilgit"], views: 64, bookings: 9 },
      ],
    },
    // 10. Doctor
    {
      name: "Dr. Hassan Raza", email: "dr.hassan@localconnect.pk", phone: "+92 322 1100998",
      title: "MBBS General Physician & Family Doctor", bio: "Registered MBBS doctor offering home visit consultations, general health checkups, prescription, and chronic disease management for GB residents.",
      skills: ["General Medicine", "Home Visits", "Chronic Disease Management", "Child Health", "Prescription"],
      experienceYears: 11, city: "Gilgit", area: "Gilgit City Center", coordinates: [74.3142, 35.9208],
      categorySlug: "medical-health", verificationStatus: "verified", avgRating: 4.9, totalReviews: 41,
      services: [
        { title: "Home Visit Doctor Consultation", description: "Professional MBBS doctor home visit for general illness, fever, blood pressure check, blood sugar monitoring, and prescription.", price: 1500, priceType: "fixed", images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit City", "Jutial", "Konodas", "Danyor"], views: 189, bookings: 34 },
        { title: "Chronic Disease & Diabetes Management", description: "Regular monitoring and medical guidance for diabetes, hypertension, thyroid, and other chronic conditions with monthly follow-ups.", price: 2000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Gilgit", "Danyor", "Jutial"], views: 134, bookings: 19 },
        { title: "Child Health & Vaccination Guidance", description: "Pediatric health consultations, vaccination schedule guidance, growth monitoring, and nutrition advice for children 0-12 years.", price: 1200, priceType: "fixed", images: ["https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["All Gilgit District"], views: 97, bookings: 15 },
      ],
    },
    // 11. Second photographer (Skardu, verified)
    {
      name: "Bilal Hussain", email: "bilal.photo@localconnect.pk", phone: "+92 351 6677881",
      title: "Adventure & Landscape Photographer", bio: "Specialized in K2 base camp treks, Deosai plateau, Shigar Valley landscape photography, and tourism brand shoots for GB hotels.",
      skills: ["Landscape Photography", "Trek Documentation", "Night Sky Photography", "Tourism Branding", "Video Editing"],
      experienceYears: 8, city: "Skardu", area: "Skardu Town", coordinates: [75.6333, 35.2971],
      categorySlug: "photography-services", verificationStatus: "verified", avgRating: 4.7, totalReviews: 22,
      services: [
        { title: "Adventure Trek & K2 Trail Documentation", description: "Professional photography and videography for trekking groups to K2, Concordia, Deosai, and Shigar. Includes edited gallery and teaser video.", price: 20000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Skardu", "Shigar", "Khaplu", "K2 Base Camp"], views: 143, bookings: 18 },
        { title: "Hotel & Tourism Brand Photography", description: "Professional property photography, food photography, and social media content creation for GB hotels, guesthouses, and tourism businesses.", price: 15000, priceType: "fixed", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"], serviceAreas: ["Skardu", "Hunza", "Gilgit"], views: 98, bookings: 11 },
      ],
    },
  ];

  const allProviderUsers = [];
  const allServices = [];

  for (const prov of providersData) {
    const user = await User.create({
      name: prov.name, email: prov.email, password: commonPassword,
      phone: prov.phone, role: "provider",
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prov.name)}`,
      isActive: true,
    });

    const category = catMap[prov.categorySlug];
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
      location: { type: "Point", coordinates: prov.coordinates },
      verificationStatus: prov.verificationStatus,
      verificationDocuments: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      averageRating: prov.avgRating,
      totalReviews: prov.totalReviews,
      isAvailable: true,
    });

    // Add verification request for pending provider
    if (prov.verificationStatus === "pending") {
      await VerificationRequest.create({
        provider: user._id,
        documentType: "cnic",
        documentUrls: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
        status: "pending",
        adminNotes: "",
      });
    }

    for (const s of prov.services) {
      const service = await Service.create({
        provider: user._id,
        category: category?._id,
        title: s.title,
        slug: `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
        description: s.description,
        price: s.price,
        priceType: s.priceType,
        images: s.images,
        serviceAreas: s.serviceAreas,
        city: prov.city,
        area: prov.area,
        location: { type: "Point", coordinates: prov.coordinates },
        isActive: prov.verificationStatus === "verified",
        status: prov.verificationStatus === "verified" ? "approved" : "pending",
        approvedAt: prov.verificationStatus === "verified" ? new Date() : null,
        reviewedBy: prov.verificationStatus === "verified" ? adminUser._id : null,
        viewsCount: s.views || 0,
        bookingsCount: s.bookings || 0,
      });
      allServices.push({ service, providerUser: user, prov });
    }
    allProviderUsers.push({ user, prov });
  }

  console.log("Seeding Bookings...");
  const bookingsData = [
    // Completed bookings (with reviews)
    { ref: "LC-2026-ELEC-001", custIdx: 0, svcIdx: 0, date: "2026-11-05", time: "10:00 AM - 12:00 PM", desc: "Install 3 new circuit breakers and connect solar inverter cable in Jutial.", addr: "House 42, Street 3, Jutial, Gilgit", phone: "+92 344 5566778", status: "completed", hasReview: true },
    { ref: "LC-2026-PLUM-002", custIdx: 0, svcIdx: 3, date: "2026-11-08", time: "02:00 PM - 04:00 PM", desc: "Water geyser pilot light keeps turning off in cold mornings. Need thorough servicing.", addr: "Sector A, Danyor Road, Gilgit", phone: "+92 344 5566778", status: "completed", hasReview: true },
    { ref: "LC-2026-CARP-003", custIdx: 1, svcIdx: 6, date: "2026-11-10", time: "09:00 AM - 05:00 PM", desc: "Need custom walnut kitchen cabinets for newly constructed home in Aliabad.", addr: "Near Aliabad Bazaar, Hunza", phone: "+92 355 6677889", status: "completed", hasReview: true },
    { ref: "LC-2026-WEBD-004", custIdx: 2, svcIdx: 12, date: "2026-11-12", time: "11:00 AM - 01:00 PM", desc: "Need a business website for our Hunza tourism guesthouse.", addr: "Online / Remote", phone: "+92 333 1122334", status: "completed", hasReview: true },
    { ref: "LC-2026-DOCT-005", custIdx: 3, svcIdx: 27, date: "2026-11-14", time: "10:00 AM - 11:00 AM", desc: "Fever and throat infection for 3 days. Need home visit.", addr: "House 7, Qasim Abad, Gilgit", phone: "+92 321 9988776", status: "completed", hasReview: true },
    { ref: "LC-2026-TAIL-006", custIdx: 4, svcIdx: 24, date: "2026-11-15", time: "02:00 PM - 04:00 PM", desc: "Need traditional Hunzai dress for Nowruz celebration.", addr: "Karimabad Main Bazaar, Hunza", phone: "+92 312 4455667", status: "completed", hasReview: false },
    { ref: "LC-2026-TUTR-007", custIdx: 0, svcIdx: 18, date: "2026-11-01", time: "04:00 PM - 06:00 PM", desc: "Need FSc Part 2 maths tuition, weekly sessions for 3 months.", addr: "House 15, Jutial, Gilgit", phone: "+92 344 5566778", status: "completed", hasReview: true },
    // Active bookings
    { ref: "LC-2026-ELEC-008", custIdx: 1, svcIdx: 1, date: "2026-11-25", time: "11:00 AM - 01:00 PM", desc: "Emergency repair: main circuit breaker tripped and home has no power.", addr: "Jutial Colony, Gilgit", phone: "+92 355 6677889", status: "in_progress", hasReview: false },
    { ref: "LC-2026-DOCT-009", custIdx: 2, svcIdx: 28, date: "2026-11-26", time: "09:00 AM - 10:00 AM", desc: "Blood pressure and diabetes checkup, need monthly monitoring plan.", addr: "F-7, Danyor Road, Gilgit", phone: "+92 333 1122334", status: "accepted", hasReview: false },
    { ref: "LC-2026-PHOT-010", custIdx: 3, svcIdx: 30, date: "2026-11-28", time: "08:00 AM - 06:00 PM", desc: "Wedding photography for nikah ceremony and walima in Skardu.", addr: "Royal Hall, Skardu Town", phone: "+92 321 9988776", status: "accepted", hasReview: false },
    { ref: "LC-2026-PAIN-011", custIdx: 4, svcIdx: 22, date: "2026-11-27", time: "08:00 AM - 05:00 PM", desc: "Full interior painting for 5-room house in Konodas.", addr: "Block C, Konodas, Gilgit", phone: "+92 312 4455667", status: "accepted", hasReview: false },
    // Pending bookings
    { ref: "LC-2026-ELEC-012", custIdx: 2, svcIdx: 2, date: "2026-11-30", time: "10:00 AM - 02:00 PM", desc: "Need solar panel installation for 10-marla home in Nagar.", addr: "Main Road, Nagar Valley", phone: "+92 333 1122334", status: "pending", hasReview: false },
    { ref: "LC-2026-CARP-013", custIdx: 3, svcIdx: 7, date: "2026-12-02", time: "09:00 AM - 05:00 PM", desc: "Full bedroom furniture set in walnut wood. Need 2 single beds and wardrobes.", addr: "Karimabad, Hunza", phone: "+92 321 9988776", status: "pending", hasReview: false },
    { ref: "LC-2026-DOCT-014", custIdx: 4, svcIdx: 29, date: "2026-12-01", time: "10:00 AM - 11:00 AM", desc: "Vaccination checkup for 2-year-old child.", addr: "Konodas Lane, Gilgit", phone: "+92 312 4455667", status: "pending", hasReview: false },
    { ref: "LC-2026-TAIL-015", custIdx: 1, svcIdx: 25, date: "2026-12-05", time: "02:00 PM - 04:00 PM", desc: "Bridal dress for daughter's wedding, full embroidery with silk fabric.", addr: "Aliabad, Hunza", phone: "+92 355 6677889", status: "pending", hasReview: false },
    // Cancelled
    { ref: "LC-2026-WEBD-016", custIdx: 0, svcIdx: 13, date: "2026-11-18", time: "11:00 AM - 01:00 PM", desc: "WordPress store needed for handicraft business.", addr: "Online", phone: "+92 344 5566778", status: "cancelled", cancellationReason: "Customer decided to postpone project to next month.", hasReview: false },
  ];

  const createdBookings = [];
  for (const b of bookingsData) {
    const cust = customers[b.custIdx];
    const svcObj = allServices[b.svcIdx];
    if (!svcObj) continue;
    const booking = await Booking.create({
      bookingReference: b.ref,
      customer: cust._id,
      provider: svcObj.providerUser._id,
      service: svcObj.service._id,
      requestedDate: b.date,
      requestedTime: b.time,
      description: b.desc,
      serviceAddress: b.addr,
      contactPhone: b.phone,
      price: svcObj.service.price,
      status: b.status,
      cancellationReason: b.cancellationReason || undefined,
      completedAt: b.status === "completed" ? new Date() : undefined,
      hasReview: b.hasReview || false,
    });
    createdBookings.push({ booking, custIdx: b.custIdx, provUser: svcObj.providerUser, hasReview: b.hasReview });
  }

  console.log("Seeding Reviews...");
  const reviewComments = [
    { rating: 5, comment: "Muhammad Ibrahim is excellent! He arrived on time in Jutial and installed the solar inverter with great professionalism. The wiring is clean and safe. Highly recommended for anyone in Gilgit!" },
    { rating: 5, comment: "Khadim bhai fixed our geyser issue in Danyor within 2 hours. Very honest pricing and no hidden charges. The geyser now works perfectly even in the coldest winter mornings." },
    { rating: 5, comment: "Tariq sahab crafted beautiful walnut kitchen cabinets for our Aliabad home. The quality is outstanding and the finish is perfect. Worth every rupee!" },
    { rating: 4, comment: "Sajid built our guesthouse website and it looks very professional. Good communication throughout the project. Minor delay but final result was excellent." },
    { rating: 5, comment: "Dr. Hassan visited our home in Qasim Abad within 30 minutes of calling. Very thorough examination and proper prescription. Genuine doctor, we trust him completely." },
    { rating: 5, comment: "Rabia ma'am is an exceptional maths teacher. My son's grades improved from 55% to 85% in one term. Her teaching method is very clear and patient." },
    { rating: 4, comment: "Bilal's trek photography from K2 base camp trail is amazing! He captured every moment beautifully. The edited photos were delivered on time. Great work." },
  ];

  for (let i = 0; i < createdBookings.length; i++) {
    const b = createdBookings[i];
    if (b.hasReview && i < reviewComments.length) {
      await Review.create({
        customer: customers[b.custIdx]._id,
        provider: b.provUser._id,
        booking: b.booking._id,
        rating: reviewComments[i].rating,
        comment: reviewComments[i].comment,
      });
    }
  }

  console.log("Seeding Complaints...");
  await Complaint.create({
    submittedBy: customer2._id,
    relatedProvider: allServices[0].providerUser._id,
    relatedBooking: createdBookings[0]?.booking?._id,
    category: "booking_problem",
    description: "Provider arrived 2 hours late without any notice. The work was done eventually but the delay caused major inconvenience.",
    status: "resolved",
    adminResponse: "We spoke with the provider. He apologized for the delay due to a previous emergency job. He has been counselled to communicate delays proactively. Issue resolved.",
  });
  await Complaint.create({
    submittedBy: customer3._id,
    relatedProvider: allServices[12].providerUser._id,
    category: "service_quality",
    description: "The website delivered was different from what was agreed. Some features were missing and the design was not as discussed.",
    status: "under_review",
    adminResponse: "",
  });
  await Complaint.create({
    submittedBy: customer4._id,
    relatedProvider: allServices[27].providerUser._id,
    category: "pricing_dispute",
    description: "Dr. Hassan charged extra PKR 500 for travel beyond what was agreed. Need clarification on pricing policy.",
    status: "pending",
    adminResponse: "",
  });

  console.log("\n=================================================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================================");
  console.log(`Categories: 10 | Providers: 11 | Services: ${allServices.length}`);
  console.log(`Customers: 5 | Bookings: ${createdBookings.length} | Reviews: 7 | Complaints: 3`);
  console.log("=================================================================");
  console.log("DEMO ACCOUNTS:");
  console.log(`Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("Provider: provider@localconnect.pk / User@12345 (Verified)");
  console.log("Provider: haider.photo@localconnect.pk / User@12345 (Pending)");
  console.log("Customer: customer@localconnect.pk / User@12345");
  console.log("=================================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding Error:", err);
  process.exit(1);
});
