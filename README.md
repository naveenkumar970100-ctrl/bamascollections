# Bamas Collections · Full-Stack Next.js Atelier

A luxury e-commerce web application for **Bamas Collections** ("Timeless Sarees. Modern You."), architected as a **Full-Stack Next.js 15 (App Router)** application with unified frontend pages, serverless API routes, MongoDB Atlas integration, and Cloudinary media storage — optimized for 1-click deployment on **Vercel**.

---

## 🏗️ Architecture Overview

The application is completely unified under Next.js:

```
bamascollections/
├── src/
│   ├── app/                            # Next.js App Router (Pages & Serverless APIs)
│   │   ├── layout.tsx                  # Root HTML layout with Google Fonts & metadata
│   │   ├── page.tsx                    # Luxury Homepage
│   │   ├── products/page.tsx           # Collection Catalog & search
│   │   ├── cart/page.tsx               # Silk Bag checkout & address drawer
│   │   ├── bookings/page.tsx           # Customer orders & bookings
│   │   ├── about/page.tsx              # Our Story page
│   │   ├── contact/page.tsx            # Concierge & contact desk
│   │   ├── faq/page.tsx                # FAQs & inquiry desk
│   │   ├── profile/page.tsx            # Customer profile
│   │   ├── address/page.tsx            # Saved delivery addresses
│   │   ├── notifications/page.tsx      # Notifications center
│   │   ├── admin/page.tsx              # Executive Admin Suite
│   │   ├── login/page.tsx              # Customer login
│   │   ├── register/page.tsx           # Customer registration
│   │   └── api/                        # Next.js Serverless API Route Handlers
│   │       ├── products/               # Saree catalog, details, search
│   │       ├── auth/                   # JWT auth, login, register, profile
│   │       ├── orders/                 # Order booking & status tracking
│   │       ├── payments/               # Payment screenshot submission & review
│   │       ├── inquiries/              # Customer styling requests
│   │       ├── notifications/          # Real-time customer notifications
│   │       ├── site-config/            # Storewide banners, hero images, UPI settings
│   │       └── upload/                 # Direct Cloudinary image uploader
│   ├── components/
│   │   ├── bamas/                      # Branded luxury UI components
│   │   └── ui/                         # Accessible Radix primitives
│   ├── models/                         # Mongoose Models (Singleton cached)
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Payment.ts
│   │   ├── Inquiry.ts
│   │   ├── Notification.ts
│   │   ├── SiteConfig.ts
│   │   └── PaymentMethod.ts
│   ├── lib/
│   │   ├── mongodb.ts                  # Serverless MongoDB Atlas connection pool
│   │   ├── auth.ts                     # JWT signing & verification helpers
│   │   ├── api.ts                      # Client-side API caller
│   │   └── collection.ts               # Core atelier catalog dataset
│   └── styles.css / globals.css        # Luxury design system & typography
├── public/                             # Static imagery & brand assets
├── scripts/
│   └── seed.mjs                        # MongoDB Atlas collection seeder
├── next.config.mjs                     # Next.js configuration
├── package.json
└── .env.example                        # Template environment variables
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Ensure `.env` contains your MongoDB Atlas URI, JWT Secret, and Cloudinary keys:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_NAME="Bamas Collection"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ 1-Click Vercel Deployment

1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Framework preset will automatically detect **Next.js**.
3. In **Project Settings** $\rightarrow$ **Environment Variables**, paste the keys from `.env.example`:
   * `MONGO_URI`
   * `JWT_SECRET`
   * `CLOUDINARY_CLOUD_NAME`
   * `CLOUDINARY_API_KEY`
   * `CLOUDINARY_API_SECRET`
   * `NEXT_PUBLIC_API_URL`
   * `NEXT_PUBLIC_SITE_NAME`
   * `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**.
