# Stayzy — Three Connected Experiences in One Unified Platform

Stayzy is a PG and flexible room/bed booking platform supporting **Hourly**, **Daily**, **Weekly**, **Monthly**, and **Yearly** stays. It provides **three fully connected experiences inside ONE single application** powered by the **same backend, Prisma database, authentication system, and design system**:

1. **Public Website** (No login required to explore)
2. **Customer / User Dashboard** (`/dashboard/*` — Authenticated residents)
3. **Admin Panel** (`/admin/*` — Authorized staff & property managers)

---

## 🎨 Design System & Palette

Stayzy follows the approved brand design aesthetic across all public, customer, and administrative views:
- **Warm Ivory Background**: `#F8F7F2`
- **Deep Forest Green**: `#123D2B`
- **Soft Lime Accents**: `#E8F1D5`
- **Dark Readable Text**: `#192621`
- **Borders & Dividers**: `#E8E6DF`
- **Modern Typography**: Google Font **Manrope**
- **Cards**: Pure white cards with generous rounded corners (`rounded-2xl`, `rounded-3xl`) and soft shadows (`shadow-card`)

---

## 🏛 The Three Connected Experiences

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ONE APPLICATION CODEBASE                        │
│                                                                        │
│   ┌─────────────────────┐  ┌───────────────────┐  ┌────────────────┐   │
│   │ 1. PUBLIC WEBSITE   │  │ 2. USER DASHBOARD │  │ 3. ADMIN PANEL │   │
│   │  Browse rooms,      │  │  Active stays,    │  │  Inventory,    │   │
│   │  duration pricing,  │  │  rent schedules,  │  │  rates, checks,│   │
│   │  visit scheduling   │  │  extensions, help │  │  CMS & ledger  │   │
│   └──────────┬──────────┘  └─────────┬─────────┘  └────────┬───────┘   │
│              │                       │                     │           │
│   ───────────┴───────────────────────┴─────────────────────┴────────   │
│                 SHARED PRISMA ORM & DATABASE ENGINE                    │
│      (Users, Properties, RoomTypes, Units, Rates, Bookings, CMS)       │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Public Website (`/`, `/rooms`, `/rooms/[slug]`, `/amenities`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/cancellation-policy`)
- Visitors browse real-time inventory, filter by dates, duration tier, and budget without needing to log in.
- Detailed room pages feature photo galleries, specs bar, amenity badges, and duration-specific price calculators.
- **Public-to-User Flow**: When proceeding to book, unauthenticated visitors are prompted to log in or register. Selected room, duration, dates, guest count, and the 15-minute checkout inventory hold are preserved seamlessly, redirecting back to checkout.

### 2. Customer Dashboard (`/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `/dashboard/payments`, `/dashboard/visits`, `/dashboard/support`, `/dashboard/profile`, `/checkout`, `/booking-confirmation/[id]`)
- Shows resident's active stay, keyless door PIN (`8921#`), Wi-Fi credentials, and next payment due.
- **My Bookings**: Itemized receipts, one-click extension requests (verified against real-time unit availability), and cancellation requests (calculated via 48-hour refund scale).
- **Payments**: Transaction ledger, monthly rent installment schedules, receipts, and refund tracking.
- **Visits**: Scheduled walkthrough tour requests with date/time status tracking.
- **Support**: Resident ticket submission with host response tracking (Maintenance, Housekeeping, Payment, General).
- **Profile**: Security settings, phone number for keyless locks, and password updates.
- Strictly isolated: Customers only access their own bookings, payments, and tickets.

### 3. Admin Panel (`/admin`, `/admin/properties`, `/admin/rooms`, `/admin/beds`, `/admin/rates`, `/admin/bookings`, `/admin/bookings/[id]`, `/admin/calendar`, `/admin/customers`, `/admin/payments`, `/admin/visits`, `/admin/support`, `/admin/content`, `/admin/settings`)
- Dedicated operations console for authorized administrators (`role: "ADMIN"`).
- **Dashboard Overview**: Real database metrics (realized revenue, occupied units, active holds, pending visits).
- **Properties**: Multi-property configuration (Koramangala, HSR Layout), operating hours, address, and rules.
- **Rooms & Beds**: Manage room types, sharing categories, specs, physical rooms, and individual bed allocations.
- **Maintenance Blocks**: Schedule maintenance and deep cleaning blocks on individual beds or rooms.
- **Rate Engine**: Configure Hourly, Daily, Weekly, Monthly, and Yearly rates, deposit amounts, and meal plan costs.
- **Bookings & Check-ins**: Filter by status, search by guest phone/email, confirm check-ins, process check-outs, and create walk-in offline bookings.
- **Occupancy Calendar**: Visual timeline matrix across rooms and beds showing confirmed stays, holds, and blocks.
- **Customers**: Resident directory with lifetime stays count and total revenue spend.
- **Payments**: Financial ledger, manual offline cash/UPI payment recording, and CSV export.
- **Support Helpdesk**: Read tickets and compose host replies that immediately appear in resident dashboards.
- **Website CMS**: Live editor for hero copy, FAQs, house rules, and contact info saved to `prisma.siteContent`.
- **Settings**: GST rates (12%), cleaning buffer minutes (60 min), hold timeout (15 min), and payment gateway keys.

---

## ⚡ Connected End-to-End Flows

- **Flow A (Room & Rate Creation)**: Admin adds a room type, bed inventory, and rates in `/admin/rooms` and `/admin/rates`. The room immediately appears in the public `/rooms` catalog.
- **Flow B (Guest to Checkout)**: Visitor configures dates on `/rooms/[slug]` and clicks Proceed to Book. If not logged in, they authenticate via `/login` and land directly on `/checkout` with their hold and pricing intact.
- **Flow C (Booking Completion)**: Completing booking locks inventory unit, assigns reference (`STY-XXXXXX`), and appears instantly in resident's `/dashboard/bookings` and `/admin/bookings`.
- **Flow D (Check-In Transition)**: Admin marks guest as "Checked In" on `/admin/bookings`. The customer's dashboard updates their stay status to "Current Stay" with active room access PIN.
- **Flow E (Extensions & Cancellations)**: Customer requests stay extension or cancellation. Admin inspects the request in `/admin/bookings/[id]`, reviews availability or refund amounts, and confirms the update.
- **Flow F (Price Snapshots)**: Admin updates a room's daily price in `/admin/rates`. Future quotes use the new price, while existing confirmed bookings retain their agreed price snapshot.
- **Flow G (Support Helpdesk)**: Customer submits a maintenance ticket from `/dashboard/support`. Admin replies from `/admin/support`. The reply renders immediately in the customer's portal.

---

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
```bash
cp .env.example .env
```
Default configuration works out of the box with SQLite:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_DEFAULT_TIMEZONE="Asia/Kolkata"
AUTH_SECRET="stayzy_super_secret_jwt_key_2026_stay_flexible"
ADMIN_PIN="123456"
PAYMENT_PROVIDER="DEMO_ADAPTER"
PAYMENT_WEBHOOK_SECRET="stayzy_demo_secret_2026"
```

### 4. Database Setup & Seeding
```bash
npx prisma db push
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Secure Admin Provisioning

Public registration (`/register`) **strictly creates `CUSTOMER` accounts**. Users can never select `ADMIN` during public signup.

To securely create or provision an administrator account:
```bash
npm run provision-admin <email> <password> "<Full Name>" "<Phone>"
```
Example:
```bash
npm run provision-admin admin@stayzy.com admin123 "Stayzy Lead Admin" "+91 80 4567 8900"
```
The provisioning command logs the action in the database `AuditLog` table and enables immediate login at `/admin/login`.

---

## 🧪 Demo Credentials

- **Demo Resident Customer**:
  - Email: `aarav.sharma@example.com`
  - Password: `password123`
  - Or click the **1-Click Demo Customer Login** button on `/login`.
- **Demo Property Manager (Admin)**:
  - Email: `admin@stayzy.com`
  - Password: `admin123`
  - Or click the **1-Click Demo Admin Login** button on `/admin/login`.

---

## 📦 Production Integrations Checklist

For production deployment:
1. **PostgreSQL Database**: Update `prisma/schema.prisma` provider to `"postgresql"` and provide connection string in `DATABASE_URL`.
2. **Payment Gateway**: Add `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` or `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`.
3. **SMS Gateway**: Configure Twilio / Gupshup for instant keyless PIN dispatch upon check-in.
4. **Transactional Email**: Configure Resend or SendGrid for verified signed booking folios and receipts.
