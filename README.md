# LocalConnect — Smart Local Community & Service Marketplace
### Final Year Project (FYP) — Gilgit-Baltistan, Pakistan

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

---

## 1. Executive Summary

**LocalConnect** is a production-style, location-based web marketplace engineered to connect residents with skilled local trade professionals across **Gilgit-Baltistan, Pakistan** (including Gilgit City, Skardu, Hunza, Ghizer, Nagar, Diamer, Astore, Danyor, Jutial, and Konodas).

In mountain regions, finding dependable electricians, plumbers, carpenters, technicians, web developers, tutors, and mechanics often relies on word-of-mouth with zero price transparency. LocalConnect solves this by delivering:
- A centralized catalog of local trade and technical services with transparent upfront pricing.
- Interactive geospatial discovery using Leaflet and OpenStreetMap.
- An **Administrative Verification Pipeline** where provider credentials (CNIC, trade licenses, certificates) are vetted before issuing a **Verified Specialist** badge.
- Role-Based Access Control (**RBAC**) across Customers, Service Providers, and Administrators.
- Real-time one-to-one chat and in-app notifications powered by Socket.IO with resilient REST API fallbacks.
- Verified review system unlocked only after service order completion.
- Dual-language support (**English** and **Urdu**) with bidirectional layout (`ltr` and `rtl`).

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **State & Forms** | React Hook Form, Zod Validation, React Context |
| **Internationalization** | `next-intl` (English & Urdu dictionaries with RTL support) |
| **Analytics & Data Viz** | `recharts` for dashboard charts |
| **Mapping & Geospatial** | Leaflet, OpenStreetMap, HTML5 Geolocation API |
| **Backend API** | Next.js Route Handlers (`app/api/...`), Node.js runtime |
| **Database & ODM** | MongoDB with Mongoose ODM (2dsphere geospatial indexing) |
| **Authentication & RBAC** | Hashed passwords (`bcryptjs`), JWT in secure HTTP-only cookies |
| **Real-Time Services** | Socket.IO Client & Companion Node.js Socket Server (Port 4001) |
| **Media Storage** | Cloudinary SDK with automatic local buffer fallback |

---

## 3. Demo Credentials (For Evaluation & Defense)

The platform comes pre-seeded with realistic demonstration data for Gilgit-Baltistan:

| Role | Email | Password | Access Level & Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@localconnect.pk` | `Admin@12345` | Full platform control, verification audit, user suspension, categories |
| **Verified Provider** | `provider@localconnect.pk` | `User@12345` | Master Electrician (Gilgit & Jutial), active bookings & reviews |
| **Pending Provider** | `haider.photo@localconnect.pk` | `User@12345` | Photographer (Skardu), verification request awaiting admin review |
| **Customer** | `customer@localconnect.pk` | `User@12345` | Service seeker with active bookings, completed jobs, and chat |

> **Pro-Tip for Evaluators**: On the `/login` page, click the **1-Click Demo Sign-In** pills to test any role instantly without typing.

---

## 4. End-to-End Core Workflows

### A. Customer Workflow
1. **Discover**: Browse services via search bar, category filter, or interactive map.
2. **Review Credentials**: Inspect provider profile, verified badge, rating, coverage area, and transparent pricing.
3. **Request Booking**: Click *Book Now*, choose date, time slot, provide exact address in GB, and submit notes.
4. **Coordinate**: Chat in real-time with the provider to discuss details.
5. **Fulfill & Review**: Once the job is marked completed, submit a genuine 1–5 star rating and comment.

### B. Service Provider Workflow
1. **Register**: Sign up as a Service Provider.
2. **Profile & Verification**: Add trade bio, skills, coverage areas, and upload CNIC/certification images.
3. **Service Management**: Create, edit, and toggle active trade listings. (Drafts go live once verified by Admin).
4. **Order Handling**: Receive booking requests, accept/decline, transition to *In Progress*, and mark *Completed*.

### C. Administrator Workflow
1. **Command Center**: View real-time KPIs and growth telemetry via Recharts.
2. **Verification Screening**: Inspect uploaded documents, approve to award Verified Badge, or decline with feedback.
3. **User Governance**: Audit all customers and providers; suspend or reactivate accounts with 1 click.
4. **Dispute Resolution**: Mediate customer complaints and publish binding resolution notes.
5. **Taxonomy Management**: Add, update, and manage service categories and icon classifications.

---

## 5. Project Folder Architecture

```text
├── messages/
│   ├── en.json                       # Comprehensive English dictionary
│   └── ur.json                       # Comprehensive Urdu dictionary
├── scripts/
│   └── seed.mjs                      # MongoDB seed script (Idempotent demo setup)
├── socket-server/                    # Companion persistent Socket.IO server
│   ├── index.js                      # Real-time message & presence relay
│   └── package.json
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/               # Login, Register, Forgot/Reset Password
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/            # Command center, Verifications, Users, Categories, Disputes
│   │   │   │   ├── customer/         # Bookings, Live Chat, Notifications, Reviews, Complaints
│   │   │   │   └── provider/         # Services CRUD, Booking Orders, Verification, Reviews
│   │   │   ├── providers/[id]/       # Public Provider Profile
│   │   │   ├── services/             # Browse Directory & Service Details
│   │   │   ├── layout.tsx            # Locale provider, RTL layout switch, Toast context
│   │   │   └── page.tsx              # Public Landing Page & Leaflet Regional Map
│   │   ├── api/                      # REST Route Handlers (Auth, Services, Bookings, Chat, Admin)
│   │   └── globals.css               # Tailwind directives & RTL styling
│   ├── components/
│   │   ├── common/                   # LeafletMap, RatingStars, VerifiedBadge, LoadingSpinner
│   │   ├── layout/                   # Navbar, Footer, DashboardLayout, LanguageSwitcher
│   │   └── ui/                       # Button, Input, Textarea, Card, Modal, Badge, Toast
│   ├── i18n/                         # next-intl routing & server request configuration
│   ├── lib/                          # MongoDB connection, JWT auth, RBAC, validations, Cloudinary
│   └── models/                       # 12 Mongoose Schemas (User, Service, Booking, Message, etc.)
├── middleware.ts                     # URL localization & role-based dashboard protection
├── next.config.ts                    # Next.js configuration with next-intl plugin
├── package.json
└── README.md
```

---

## 6. Installation & Local Setup

### Step 1: Clone and Install Dependencies
Ensure **Node.js (v18+)** and **MongoDB** are installed and running locally.

```bash
cd "Smart Local Community & Service Marketplace-fyp"
npm install
```

Install socket-server dependencies:
```bash
cd socket-server
npm install
cd ..
```

### Step 2: Environment Variables
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/localconnect
JWT_SECRET=super_secret_localconnect_jwt_token_key_fyp_2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
SOCKET_SERVER_URL=http://localhost:4001
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4001
ADMIN_EMAIL=admin@localconnect.pk
ADMIN_PASSWORD=Admin@12345
```

### Step 3: Seed the Database
Populate the database with Gilgit-Baltistan trade categories, verified providers, services, bookings, and demo accounts:
```bash
npm run seed
```

### Step 4: Run Development Servers
Start the Next.js development server:
```bash
npm run dev
```

In a second terminal, start the Socket.IO real-time companion server:
```bash
npm run socket
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 7. Production Build Verification

To verify that the application compiles cleanly for production:
```bash
npm run build
npm start
```

---

## 8. Academic Project Disclaimer

This platform was developed as a university Final Year Project (FYP) for modernizing local service booking in Gilgit-Baltistan, Pakistan. All sample accounts, provider reviews, and customer testimonials are simulated demonstration artifacts designed to showcase full-stack software architecture, geospatial queries, and real-time communication.

