<h1 align="center">Oshudpati Marketplace — Server</h1>

<p align="center">
  <em>RESTful backend API for the Oshudpati healthcare marketplace</em>
</p>

<p align="center">
  <a href="https://oshudpati-marketplace-server.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_API-oshudpati--marketplace--server.vercel.app-0f766e?style=flat-square&logo=vercel&logoColor=white" alt="Live API">
  </a>
  <img src="https://img.shields.io/github/license/md-zeon/oshudpati-marketplace-server?style=flat-square&color=0f766e" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
  <img src="https://img.shields.io/github/package-json/v/md-zeon/oshudpati-marketplace-server?style=flat-square&color=0f766e" alt="Version">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma">
</p>

---

## 📖 About

**Oshudpati Marketplace Server** is the backend API that powers the Oshudpati healthcare e‑commerce platform. It provides a secure, scalable RESTful interface for medicine browsing, multi‑vendor ordering, user management, authentication, and administrative operations — all backed by PostgreSQL and Prisma ORM.

This server is built with Express.js 5 and TypeScript, and is designed to be deployed seamlessly on Vercel.

---

## 🚀 Live API

**→ [https://oshudpati-marketplace-server.vercel.app/](https://oshudpati-marketplace-server.vercel.app/)**

---

## 🧰 Tech Stack

| Category            | Technologies                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **Runtime**         | [Node.js](https://nodejs.org/) ≥ 20                                                       |
| **Framework**       | [Express.js 5](https://expressjs.com/)                                                    |
| **Language**        | [TypeScript](https://www.typescriptlang.org/)                                             |
| **Database**        | [PostgreSQL](https://www.postgresql.org/)                                                 |
| **ORM**             | [Prisma v7](https://www.prisma.io/) with `@prisma/adapter-pg`                             |
| **Authentication**  | [Better-Auth](https://www.better-auth.com/) (email/password, Google OAuth, Twitter OAuth) |
| **Validation**      | [Zod](https://zod.dev/)                                                                   |
| **Email**           | [Nodemailer](https://nodemailer.com/) (Gmail SMTP)                                        |
| **Build Tool**      | [tsup](https://tsup.egoist.dev/)                                                          |
| **Dev Runner**      | [tsx](https://tsx.is/)                                                                    |
| **Package Manager** | [pnpm](https://pnpm.io/)                                                                  |

---

## ✨ Key Features

- **🔐 Multi‑Provider Auth** — Email/password with email verification, plus Google and Twitter OAuth
- **👥 Role‑Based Access Control** — Three roles: `ADMIN`, `SELLER`, `CUSTOMER`
- **🏪 Multi‑Vendor Marketplace** — Medicines belong to seller shops; orders are split by vendor
- **📦 Order Management** — Full lifecycle: Placed → Processing → Shipped → Delivered → Cancelled
- **💳 Payment Tracking** — Pending / Paid / Refunded statuses (extensible for gateway integration)
- **⭐ Reviews & Replies** — Customers review products; sellers can reply
- **🛒 Cart & Wishlist** — Per‑user cart with unique product constraint, plus wishlist
- **📊 Dashboards** — Aggregated stats for customers (recent orders, quick reorder) and sellers (sales, vendor orders)
- **📍 Address Management** — Multiple saved addresses per user with default address support
- **📧 Beautiful Emails** — HTML email templates for account verification
- **🌐 CORS Ready** — Configured for production and Vercel preview deployments

---

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app setup, routes, CORS, middleware
├── server.ts              # Server entry point
├── lib/
│   ├── auth.ts            # Better-Auth configuration (providers, email, cookies)
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # Shared utilities
├── middlewares/
│   ├── auth.ts            # Authentication & role middleware
│   ├── globalErrorHandler.ts
│   ├── notFound.ts        # 404 handler
│   └── validateRequest.ts # Zod request validation middleware
├── modules/               # Feature modules (controller, service, routes, validation)
│   ├── address/
│   ├── auth/
│   ├── cart/
│   ├── category/
│   ├── dashboard/
│   ├── medicine/
│   ├── order/
│   ├── review/
│   ├── shop/
│   ├── user/
│   └── wishlist/
└── scripts/
    ├── seedAdmin.ts       # Seed admin user
    └── seedCategories.ts  # Seed symptom-based categories
prisma/
├── schema.prisma          # Database schema (17 models)
└── migrations/            # Migration history
generated/prisma/          # Generated Prisma client
api/                       # tsup build output for Vercel serverless
```

---

## 🗄️ API Endpoints

| Method | Endpoint                  | Description                    | Auth Required |
| ------ | ------------------------- | ------------------------------ | ------------- |
| POST   | `/api/auth/signup`        | Register a new account         | No            |
| POST   | `/api/auth/signin`        | Sign in with email/password    | No            |
| POST   | `/api/auth/social`        | Social login (Google, Twitter) | No            |
| POST   | `/api/auth/verify-email`  | Verify email address           | No            |
| POST   | `/api/auth/resend`        | Resend verification email      | No            |
| \*     | `/api/auth/*`             | Better-Auth passthrough routes | Varies        |
| GET    | `/api/categories`         | List all active categories     | No            |
| GET    | `/api/medicines`          | List/search/filter medicines   | No            |
| GET    | `/api/medicines/:slug`    | Get medicine by slug           | No            |
| POST   | `/api/medicines`          | Create a medicine (seller)     | Seller        |
| PUT    | `/api/medicines/:id`      | Update medicine (seller)       | Seller        |
| DELETE | `/api/medicines/:id`      | Delete medicine (seller)       | Seller        |
| GET    | `/api/shops`              | List all shops                 | No            |
| GET    | `/api/shops/:slug`        | Get shop by slug               | No            |
| POST   | `/api/shops`              | Create a shop (seller)         | Seller        |
| PUT    | `/api/shops/:id`          | Update shop (seller)           | Seller        |
| GET    | `/api/users/me`           | Get current user profile       | Yes           |
| PUT    | `/api/users/me`           | Update current user profile    | Yes           |
| GET    | `/api/users`              | List all users (admin)         | Admin         |
| PATCH  | `/api/users/:id/role`     | Update user role (admin)       | Admin         |
| PATCH  | `/api/users/:id/status`   | Ban/unban user (admin)         | Admin         |
| GET    | `/api/cart`               | Get user's cart                | Yes           |
| POST   | `/api/cart`               | Add item to cart               | Yes           |
| PUT    | `/api/cart/:id`           | Update cart item quantity      | Yes           |
| DELETE | `/api/cart/:id`           | Remove item from cart          | Yes           |
| POST   | `/api/orders`             | Place an order                 | Yes           |
| GET    | `/api/orders`             | List user's orders (customer)  | Yes           |
| GET    | `/api/orders/:id`         | Get order details              | Yes           |
| GET    | `/api/orders/vendor`      | List vendor orders (seller)    | Seller        |
| PATCH  | `/api/orders/:id/status`  | Update order status (seller)   | Seller        |
| GET    | `/api/addresses`          | List user's addresses          | Yes           |
| POST   | `/api/addresses`          | Create an address              | Yes           |
| PUT    | `/api/addresses/:id`      | Update an address              | Yes           |
| DELETE | `/api/addresses/:id`      | Delete an address              | Yes           |
| GET    | `/api/reviews`            | List reviews for a medicine    | No            |
| POST   | `/api/reviews`            | Create a review (customer)     | Customer      |
| PUT    | `/api/reviews/:id`        | Update a review (customer)     | Customer      |
| POST   | `/api/reviews/:id/reply`  | Reply to a review (seller)     | Seller        |
| GET    | `/api/wishlist`           | Get user's wishlist            | Yes           |
| POST   | `/api/wishlist`           | Add item to wishlist           | Yes           |
| DELETE | `/api/wishlist/:id`       | Remove item from wishlist      | Yes           |
| GET    | `/api/dashboard/customer` | Customer dashboard stats       | Customer      |
| GET    | `/api/dashboard/seller`   | Seller dashboard stats         | Seller        |

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) (recommended) or npm / yarn
- PostgreSQL instance (local or cloud, e.g., [Neon](https://neon.tech/), [Railway](https://railway.app/))

### Environment Variables

Create a `.env` file in the root:

```env
# App
PORT=5000
APP_URL=http://localhost:3000
PROD_APP_URL=https://oshudpati-marketplace-client.vercel.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/oshudpati?schema=public

# Better-Auth secrets (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Nodemailer (Gmail SMTP)
APP_USER=your_email@gmail.com
APP_PASS=your_app_password
```

### Install & Run

```bash
pnpm install
pnpm dev         # → http://localhost:5000
pnpm build       # Production build (outputs to /api)
pnpm seed:admin  # Seed an admin user
```

### Database

Migrations are automatically applied via `prisma migrate`. To run them manually:

```bash
pnpm prisma migrate deploy
```

To generate the Prisma client after schema changes:

```bash
pnpm prisma generate
```

---

## 🗃️ Database Models

| Model           | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `User`          | Users with roles (ADMIN, SELLER, CUSTOMER) and account status      |
| `Session`       | Auth sessions                                                      |
| `Account`       | Auth accounts (supports multi-provider linking)                    |
| `Verification`  | Email verification tokens                                          |
| `Category`      | Symptom-based medicine categories (e.g., "Gastric & Ulcer Relief") |
| `Medicine`      | Products with pricing, stock, dosage form, images                  |
| `MedicineImage` | Images associated with a medicine                                  |
| `Address`       | Saved shipping addresses per user                                  |
| `CartItem`      | Cart items (unique per user + medicine)                            |
| `Order`         | Customer orders with payment & shipping info                       |
| `VendorOrder`   | Per-seller order splits                                            |
| `OrderItem`     | Line items within a vendor order                                   |
| `Review`        | Product ratings & reviews with seller replies                      |
| `Wishlist`      | Saved medicines per user                                           |
| `Shop`          | Seller shop profiles with name, logo, banner, description          |

---

## 🚢 Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com/)
3. Set the **Root Directory** to `oshudpati-marketplace-server` (if using monorepo)
4. Set the **Build Command** to `pnpm build`
5. Set the **Output Directory** to `api`
6. Add all environment variables listed above
7. Ensure `PROD_APP_URL` points to your production frontend URL
8. Deploy!

> **Note:** The `vercel.json` file is pre‑configured for serverless function routing.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

ISC — see [LICENSE](LICENSE) for details.

## 👤 Author

**Zeanur Rahaman Zeon**  
[zeon.cse@gmail.com](mailto:zeon.cse@gmail.com)
