# Bamas Collections · MERN Stack Architecture (MVC)

A modern e-commerce web application for **Bamas Collections** ("Timeless Sarees. Modern You."), architected with the full **MERN Stack** (MongoDB, Express, React, Node.js) and adhering strictly to the **MVC (Model-View-Controller)** pattern.

---

## 🏗️ Architecture Overview

The project is decoupled into two clean tiers: `backend/` and `frontend/`:

```
bamascollections/
├── backend/                        # Node.js + Express + MongoDB Atlas
│   ├── config/                     # Configuration (Database connection)
│   │   └── db.js                   # Mongoose connection with resilient DNS resolver
│   ├── models/                     # [M]ODELS: Schemas and business entities
│   │   ├── User.js                 # Customer accounts, roles, bcrypt hashing
│   │   ├── Product.js              # Sarees, fabrics, prices, stock, ratings
│   │   ├── Order.js                # Orders, line items, address, payment status
│   │   └── Inquiry.js              # Styling consultations and customer inquiries
│   ├── views/                      # [V]IEWS: Presentation and response formatting
│   │   ├── responseView.js         # API JSON response presenters & sanitizers
│   │   └── homeView.js             # Visual HTML API console & server health monitor
│   ├── controllers/                # [C]ONTROLLERS: Request handling and business logic
│   │   ├── authController.js       # Customer registration, login, profile management
│   │   ├── productController.js    # Saree catalog, category filtering, featured edits
│   │   ├── orderController.js      # Order placement and history
│   │   └── inquiryController.js    # Saree questions & consultation submissions
│   ├── routes/                     # Express modular routing
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── productRoutes.js        # /api/products
│   │   ├── orderRoutes.js          # /api/orders
│   │   └── inquiryRoutes.js        # /api/inquiries
│   ├── middleware/                 # Middleware layer
│   │   ├── authMiddleware.js       # JWT Bearer verification & Admin guards
│   │   └── errorMiddleware.js      # 404 handler and central error response
│   ├── data/                       # Seed datasets
│   │   └── products.js             # Initial Bamas Collection sarees
│   ├── seeder.js                   # MongoDB Atlas seeding utility
│   ├── server.js                   # Express application entry point
│   ├── .env                        # Environment variables (Mongo URI, JWT Secret)
│   └── package.json
│
├── frontend/                       # React + Vite + Tailwind + TanStack Router
│   ├── src/
│   │   ├── components/bamas/       # Branded UI components (pieces, dialog, auth)
│   │   │   ├── auth-context.tsx    # Customer context connected to MERN JWT
│   │   │   ├── auth-form.tsx       # Sign In, Register, Profile, Sign Out
│   │   │   ├── pieces.tsx          # Saree card grid, price display & inquiry form
│   │   │   └── shell.tsx           # Header, mobile nav, wordmark, footer
│   │   ├── lib/
│   │   │   └── api.ts              # Universal client for backend API communication
│   │   ├── routes/                 # Multi-page TanStack routing
│   │   │   ├── index.tsx           # Home page
│   │   │   ├── products.tsx        # Collection page (Live MongoDB data fetch)
│   │   │   ├── about.tsx           # Brand story page
│   │   │   ├── faq.tsx             # FAQs & Styling Consultation form
│   │   │   ├── login.tsx           # Customer sign in
│   │   │   └── register.tsx        # Customer registration
│   │   └── styles.css              # Curated design system and animations
│   ├── .env                        # VITE_API_URL pointing to http://localhost:5000/api
│   └── package.json
│
├── package.json                    # Root scripts orchestrating both tiers
└── README.md
```

---

## 🗄️ Database: MongoDB Atlas

The backend connects to MongoDB Atlas using the configured connection string:

- **Cluster:** `bamascollenctions.uefgz3u.mongodb.net`
- **Database:** `bamascollections`
- **Collections:** `users`, `products`, `orders`, `inquiries`

### Seeded Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@bamas.com` | `BamasAdmin123!` |
| **Customer** | `bama@bamas.com` | `Bama123!` |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

Install root, backend, and frontend dependencies in one command:

```sh
npm run install:all
```

Or individually:

```sh
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Seed Database (Optional)

Populate MongoDB Atlas with initial sarees and demo accounts:

```sh
npm run seed
```

### 3. Run Development Servers

Run both backend and frontend concurrently:

```sh
npm run dev
```

Or run them individually in separate terminals:

```sh
# Terminal 1: Backend API (port 5000)
npm run server

# Terminal 2: Frontend Client (port 5173)
npm run client
```

---

## 🌐 URLs & Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Client** | `http://localhost:5173` | React web application |
| **Backend API Home** | `http://localhost:5000/` | Interactive API Health Console & Docs |
| **Products API** | `http://localhost:5000/api/products` | Saree catalog with filtering |
| **Featured Sarees** | `http://localhost:5000/api/products/featured` | Curated editorial sarees |
| **Auth Register** | `POST http://localhost:5000/api/auth/register` | Create customer account |
| **Auth Login** | `POST http://localhost:5000/api/auth/login` | Sign in & receive JWT |
| **Customer Profile** | `GET http://localhost:5000/api/auth/profile` | Authenticated profile details |
| **Inquiries** | `POST http://localhost:5000/api/inquiries` | Submit drape questions |
| **Orders** | `POST http://localhost:5000/api/orders` | Place saree orders |

---

## 🏛️ MVC Pattern Implementation

1. **Model (`backend/models/`)**:
   Mongoose models encapsulate data schemas, field types, validation rules, relationships (`ref`), and lifecycle hooks (e.g. password hashing with `bcryptjs`).

2. **View (`backend/views/`)**:
   - `responseView.js`: Formats JSON envelopes, sanitizes sensitive data (omitting password hashes), calculates dynamic presentation fields (`formattedPrice`, stock badges).
   - `homeView.js`: Renders a server dashboard at `GET /` displaying database connection status, uptime, and available API routes.

3. **Controller (`backend/controllers/`)**:
   Controllers act as intermediaries handling request validation, invoking models for queries and mutations, applying business rules, and passing results to views.

4. **Routes (`backend/routes/`)**:
   Express routers map HTTP verbs and endpoints to controller methods and apply security middleware (`protect`, `admin`).
