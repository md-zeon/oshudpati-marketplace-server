var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// ================================================================\n// AUTHENTICATION MODELS (USERS, SESSIONS, ACCOUNTS, VERIFICATIONS)\n// ================================================================\n\nenum UserRole {\n  ADMIN\n  SELLER\n  CUSTOMER\n}\n\nenum AccountStatus {\n  ACTIVE\n  BANNED\n}\n\nmodel User {\n  id            String        @id\n  name          String\n  email         String\n  emailVerified Boolean       @default(false)\n  image         String?\n  createdAt     DateTime      @default(now())\n  updatedAt     DateTime      @updatedAt\n  role          UserRole      @default(CUSTOMER)\n  accountStatus AccountStatus @default(ACTIVE)\n  phoneNumber   String?\n\n  sessions Session[]\n  accounts Account[]\n\n  medicines    Medicine[] // For sellers: medicines they are selling\n  addresses    Address[] // For customers: their saved addresses\n  cartItems    CartItem[] // For customers: items in their cart\n  orders       Order[] // For customers: orders they have placed\n  vendorOrders VendorOrder[] // For sellers: orders they need to fulfill\n  reviews      Review[] // For customers: reviews they have written\n  shop         Shop? // For sellers: their shop (if they have one)\n  wishlists    Wishlist[] // For customers: medicines they have wishlisted\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\n// ==========================================\n// SYMPTOM-BASED CATEGORIES\n// ==========================================\n\nmodel Category {\n  id          String   @id @default(uuid())\n  slug        String   @unique\n  name        String // e.g., "Gastric & Ulcer Relief"\n  description String?\n  imageUrl    String?\n  isActive    Boolean  @default(true)\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  medicines Medicine[]\n\n  @@map("category")\n}\n\n// ==================================\n// MEDICINES MODEL\n// ==================================\n\nenum DosageForm {\n  TABLET\n  CAPSULE\n  SYRUP\n  OINTMENT\n  INJECTION\n  DROPS\n}\n\nmodel Medicine {\n  id                 String  @id @default(uuid())\n  slug               String  @unique\n  name               String // e.g., "Napa Extend"\n  genericName        String // e.g., "Paracetamol"\n  shortDescription   String?\n  description        String?\n  indications        String? // Symptoms this medicine targets (e.g., "Fever, Headache")\n  dosageInstructions String?\n  sideEffects        String?\n\n  manufacturerName String\n  brandName        String?\n  dosageForm       DosageForm\n  strength         String? // e.g., "20mg"\n  unitPresentation String // e.g., "10 Tablets"\n  sku              String?    @unique\n\n  price         Decimal  @db.Decimal(10, 2)\n  discountPrice Decimal? @db.Decimal(10, 2)\n  stockQuantity Int      @default(0)\n\n  averageRating   Float   @default(0)\n  reviewCount     Int     @default(0)\n  totalSalesCount Int     @default(0)\n  isFeatured      Boolean @default(false)\n  isActive        Boolean @default(true)\n\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n  sellerId   String\n  seller     User     @relation(fields: [sellerId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  images     MedicineImage[]\n  orderItems OrderItem[]\n  reviews    Review[]\n  cartItems  CartItem[]\n  wishlists  Wishlist[]\n\n  @@index([sellerId])\n  @@index([categoryId])\n  @@index([slug])\n  @@map("medicine")\n}\n\nmodel MedicineImage {\n  id         String   @id @default(uuid())\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  imageUrl   String\n  altText    String?\n  isPrimary  Boolean  @default(false)\n  createdAt  DateTime @default(now())\n\n  @@map("medicine_image")\n}\n\n// ==========================================\n// ADDRESSES\n// ==========================================\n\nmodel Address {\n  id            String   @id @default(uuid())\n  userId        String\n  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  fullName      String\n  phoneNumber   String\n  division      String\n  district      String\n  area          String\n  streetAddress String\n  postalCode    String?\n  addressLabel  String?\n  isDefault     Boolean  @default(false)\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  @@map("address")\n}\n\n// ===============================================\n// CART MODEL: SUPPORTING MULTIPLE VENDORS IN CART\n// ===============================================\n\nmodel CartItem {\n  id         String   @id @default(uuid())\n  userId     String\n  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  quantity   Int\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@unique([userId, medicineId])\n  @@index([userId])\n  @@index([medicineId])\n  @@map("cart_item")\n}\n\n// ===================================================\n// ORDERS MODEL: SUPPORTING MULTIPLE VENDORS PER ORDER\n// ===================================================\n\nenum PaymentStatus {\n  PENDING\n  PAID\n  REFUNDED\n}\n\nenum OrderStatus {\n  PLACED\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nmodel Order {\n  id                      String        @id @default(uuid())\n  orderNumber             String        @unique\n  customerId              String\n  customer                User          @relation(fields: [customerId], references: [id])\n  paymentStatus           PaymentStatus @default(PENDING)\n  subtotalAmount          Decimal       @db.Decimal(10, 2)\n  deliveryFee             Decimal       @db.Decimal(10, 2)\n  discountAmount          Decimal       @db.Decimal(10, 2)\n  totalAmount             Decimal       @db.Decimal(10, 2)\n  shippingAddressSnapshot Json\n  customerNote            String?\n  placedAt                DateTime      @default(now())\n  createdAt               DateTime      @default(now())\n  updatedAt               DateTime      @updatedAt\n\n  vendorOrders VendorOrder[]\n\n  @@map("order")\n}\n\nmodel VendorOrder {\n  id             String      @id @default(uuid())\n  orderId        String\n  order          Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  sellerId       String\n  seller         User        @relation(fields: [sellerId], references: [id])\n  orderStatus    OrderStatus @default(PLACED)\n  vendorSubtotal Decimal     @db.Decimal(10, 2)\n  createdAt      DateTime    @default(now())\n  updatedAt      DateTime    @updatedAt\n\n  orderItems OrderItem[]\n\n  @@index([sellerId])\n  @@index([orderId])\n  @@map("vendor_order")\n}\n\nmodel OrderItem {\n  id                    String      @id @default(uuid())\n  vendorOrderId         String\n  vendorOrder           VendorOrder @relation(fields: [vendorOrderId], references: [id], onDelete: Cascade)\n  medicineId            String\n  medicine              Medicine    @relation(fields: [medicineId], references: [id])\n  medicineNameSnapshot  String\n  medicineImageSnapshot String?\n  quantity              Int\n  unitPrice             Decimal     @db.Decimal(10, 2)\n  totalPrice            Decimal     @db.Decimal(10, 2)\n  createdAt             DateTime    @default(now())\n\n  @@map("order_item")\n}\n\n// ==========================================\n// WISHLIST\n// ==========================================\n\nmodel Wishlist {\n  id         String   @id @default(uuid())\n  userId     String\n  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  createdAt  DateTime @default(now())\n\n  @@unique([userId, medicineId])\n  @@index([userId])\n  @@index([medicineId])\n  @@map("wishlist")\n}\n\n// ==========================================\n// REVIEWS\n// ==========================================\n\nmodel Review {\n  id         String    @id @default(uuid())\n  customerId String\n  customer   User      @relation(fields: [customerId], references: [id])\n  medicineId String\n  medicine   Medicine  @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  rating     Int\n  comment    String?\n  isActive   Boolean   @default(true)\n  reply      String?\n  repliedAt  DateTime?\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n\n  @@unique([customerId, medicineId])\n  @@map("review")\n}\n\n// ==========================================\n// SHOPS MODEL\n// ==========================================\n\nmodel Shop {\n  id       String @id @default(uuid())\n  sellerId String @unique\n  seller   User   @relation(fields: [sellerId], references: [id], onDelete: Cascade)\n\n  name        String\n  slug        String  @unique\n  logo        String?\n  banner      String?\n  description String?\n\n  isActive Boolean @default(true)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("shop")\n}\n\n// ==========================================\n// RATE LIMITING\n// Shared counters so limits hold across Vercel\n// instances and survive cold starts.\n// ==========================================\n\nmodel RateLimit {\n  // Composite bucket id: "<tier>:<ip>" or "<tier>:<userId>"\n  key       String   @id\n  count     Int      @default(0)\n  resetAt   DateTime\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Supports opportunistic cleanup of expired windows\n  @@index([resetAt])\n  @@map("rate_limit")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"accountStatus","kind":"enum","type":"AccountStatus"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"MedicineToUser"},{"name":"addresses","kind":"object","type":"Address","relationName":"AddressToUser"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"vendorOrders","kind":"object","type":"VendorOrder","relationName":"UserToVendorOrder"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"shop","kind":"object","type":"Shop","relationName":"ShopToUser"},{"name":"wishlists","kind":"object","type":"Wishlist","relationName":"UserToWishlist"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"CategoryToMedicine"}],"dbName":"category"},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"genericName","kind":"scalar","type":"String"},{"name":"shortDescription","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"indications","kind":"scalar","type":"String"},{"name":"dosageInstructions","kind":"scalar","type":"String"},{"name":"sideEffects","kind":"scalar","type":"String"},{"name":"manufacturerName","kind":"scalar","type":"String"},{"name":"brandName","kind":"scalar","type":"String"},{"name":"dosageForm","kind":"enum","type":"DosageForm"},{"name":"strength","kind":"scalar","type":"String"},{"name":"unitPresentation","kind":"scalar","type":"String"},{"name":"sku","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"discountPrice","kind":"scalar","type":"Decimal"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"averageRating","kind":"scalar","type":"Float"},{"name":"reviewCount","kind":"scalar","type":"Int"},{"name":"totalSalesCount","kind":"scalar","type":"Int"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMedicine"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"MedicineToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"images","kind":"object","type":"MedicineImage","relationName":"MedicineToMedicineImage"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MedicineToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToMedicine"},{"name":"wishlists","kind":"object","type":"Wishlist","relationName":"MedicineToWishlist"}],"dbName":"medicine"},"MedicineImage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToMedicineImage"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"altText","kind":"scalar","type":"String"},{"name":"isPrimary","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"medicine_image"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AddressToUser"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"division","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"area","kind":"scalar","type":"String"},{"name":"streetAddress","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"addressLabel","kind":"scalar","type":"String"},{"name":"isDefault","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"address"},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartItemToUser"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"CartItemToMedicine"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"cart_item"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"subtotalAmount","kind":"scalar","type":"Decimal"},{"name":"deliveryFee","kind":"scalar","type":"Decimal"},{"name":"discountAmount","kind":"scalar","type":"Decimal"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"shippingAddressSnapshot","kind":"scalar","type":"Json"},{"name":"customerNote","kind":"scalar","type":"String"},{"name":"placedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"vendorOrders","kind":"object","type":"VendorOrder","relationName":"OrderToVendorOrder"}],"dbName":"order"},"VendorOrder":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToVendorOrder"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"UserToVendorOrder"},{"name":"orderStatus","kind":"enum","type":"OrderStatus"},{"name":"vendorSubtotal","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToVendorOrder"}],"dbName":"vendor_order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"vendorOrderId","kind":"scalar","type":"String"},{"name":"vendorOrder","kind":"object","type":"VendorOrder","relationName":"OrderItemToVendorOrder"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToOrderItem"},{"name":"medicineNameSnapshot","kind":"scalar","type":"String"},{"name":"medicineImageSnapshot","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"unitPrice","kind":"scalar","type":"Decimal"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"order_item"},"Wishlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToWishlist"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToWishlist"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"wishlist"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"reply","kind":"scalar","type":"String"},{"name":"repliedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"review"},"Shop":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"ShopToUser"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"logo","kind":"scalar","type":"String"},{"name":"banner","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"shop"},"RateLimit":{"fields":[{"name":"key","kind":"scalar","type":"String"},{"name":"count","kind":"scalar","type":"Int"},{"name":"resetAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"rate_limit"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","medicines","_count","category","seller","medicine","images","customer","vendorOrders","order","orderItems","vendorOrder","reviews","cartItems","wishlists","addresses","orders","shop","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Medicine.findUnique","Medicine.findUniqueOrThrow","Medicine.findFirst","Medicine.findFirstOrThrow","Medicine.findMany","Medicine.createOne","Medicine.createMany","Medicine.createManyAndReturn","Medicine.updateOne","Medicine.updateMany","Medicine.updateManyAndReturn","Medicine.upsertOne","Medicine.deleteOne","Medicine.deleteMany","_avg","_sum","Medicine.groupBy","Medicine.aggregate","MedicineImage.findUnique","MedicineImage.findUniqueOrThrow","MedicineImage.findFirst","MedicineImage.findFirstOrThrow","MedicineImage.findMany","MedicineImage.createOne","MedicineImage.createMany","MedicineImage.createManyAndReturn","MedicineImage.updateOne","MedicineImage.updateMany","MedicineImage.updateManyAndReturn","MedicineImage.upsertOne","MedicineImage.deleteOne","MedicineImage.deleteMany","MedicineImage.groupBy","MedicineImage.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","CartItem.findUnique","CartItem.findUniqueOrThrow","CartItem.findFirst","CartItem.findFirstOrThrow","CartItem.findMany","CartItem.createOne","CartItem.createMany","CartItem.createManyAndReturn","CartItem.updateOne","CartItem.updateMany","CartItem.updateManyAndReturn","CartItem.upsertOne","CartItem.deleteOne","CartItem.deleteMany","CartItem.groupBy","CartItem.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","VendorOrder.findUnique","VendorOrder.findUniqueOrThrow","VendorOrder.findFirst","VendorOrder.findFirstOrThrow","VendorOrder.findMany","VendorOrder.createOne","VendorOrder.createMany","VendorOrder.createManyAndReturn","VendorOrder.updateOne","VendorOrder.updateMany","VendorOrder.updateManyAndReturn","VendorOrder.upsertOne","VendorOrder.deleteOne","VendorOrder.deleteMany","VendorOrder.groupBy","VendorOrder.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Wishlist.findUnique","Wishlist.findUniqueOrThrow","Wishlist.findFirst","Wishlist.findFirstOrThrow","Wishlist.findMany","Wishlist.createOne","Wishlist.createMany","Wishlist.createManyAndReturn","Wishlist.updateOne","Wishlist.updateMany","Wishlist.updateManyAndReturn","Wishlist.upsertOne","Wishlist.deleteOne","Wishlist.deleteMany","Wishlist.groupBy","Wishlist.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Shop.findUnique","Shop.findUniqueOrThrow","Shop.findFirst","Shop.findFirstOrThrow","Shop.findMany","Shop.createOne","Shop.createMany","Shop.createManyAndReturn","Shop.updateOne","Shop.updateMany","Shop.updateManyAndReturn","Shop.upsertOne","Shop.deleteOne","Shop.deleteMany","Shop.groupBy","Shop.aggregate","RateLimit.findUnique","RateLimit.findUniqueOrThrow","RateLimit.findFirst","RateLimit.findFirstOrThrow","RateLimit.findMany","RateLimit.createOne","RateLimit.createMany","RateLimit.createManyAndReturn","RateLimit.updateOne","RateLimit.updateMany","RateLimit.updateManyAndReturn","RateLimit.upsertOne","RateLimit.deleteOne","RateLimit.deleteMany","RateLimit.groupBy","RateLimit.aggregate","AND","OR","NOT","key","count","resetAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","id","sellerId","name","slug","logo","banner","description","isActive","customerId","medicineId","rating","comment","reply","repliedAt","userId","vendorOrderId","medicineNameSnapshot","medicineImageSnapshot","quantity","unitPrice","totalPrice","orderId","OrderStatus","orderStatus","vendorSubtotal","orderNumber","PaymentStatus","paymentStatus","subtotalAmount","deliveryFee","discountAmount","totalAmount","shippingAddressSnapshot","customerNote","placedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","fullName","phoneNumber","division","district","area","streetAddress","postalCode","addressLabel","isDefault","imageUrl","altText","isPrimary","genericName","shortDescription","indications","dosageInstructions","sideEffects","manufacturerName","brandName","DosageForm","dosageForm","strength","unitPresentation","sku","price","discountPrice","stockQuantity","averageRating","reviewCount","totalSalesCount","isFeatured","categoryId","every","some","none","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","UserRole","role","AccountStatus","accountStatus","userId_medicineId","customerId_medicineId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "8weUAYACFwQAAP8DACAFAACABAAgBgAA8AMAIA0AAIQEACARAACFBAAgEgAAggQAIBMAAIcEACAUAACBBAAgFQAAgwQAIBYAAIYEACCfAgAA_AMAMKACAABJABChAgAA_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_AkAAlAQAIQUKAACDBwAgDAAAtAQAIL0CAACsBAAgvgIAAKwEACC_AgAArAQAIBAKAACPBAAgDAAAzgMAIJ8CAACTBAAwoAIAACAAEKECAACTBAAwpQJAAMIDACGmAkAAwgMAIbICAQAAAAG5AiAAzQMAIboCAQDAAwAhuwIBAMADACG8AgIAwQMAIb0CAQDMAwAhvgIBAMwDACG_AkAAlAQAIZUDAACSBAAgAwAAACAAIAEAACEAMAIAACIAIAsDAADOAwAgCgAAjwQAIJ8CAACRBAAwoAIAACQAEKECAACRBAAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAhuwIBAMADACHAAgEAwAMAIcQCAgDBAwAhAgMAALQEACAKAACDBwAgDAMAAM4DACAKAACPBAAgnwIAAJEEADCgAgAAJAAQoQIAAJEEADClAkAAwgMAIaYCQADCAwAhsgIBAAAAAbsCAQDAAwAhwAIBAMADACHEAgIAwQMAIZQDAACQBAAgAwAAACQAIAEAACUAMAIAACYAIAkDAADOAwAgCgAAjwQAIJ8CAACOBAAwoAIAACgAEKECAACOBAAwpQJAAMIDACGyAgEAwAMAIbsCAQDAAwAhwAIBAMADACECAwAAtAQAIAoAAIMHACAKAwAAzgMAIAoAAI8EACCfAgAAjgQAMKACAAAoABChAgAAjgQAMKUCQADCAwAhsgIBAAAAAbsCAQDAAwAhwAIBAMADACGUAwAAjQQAIAMAAAAoACABAAApADACAAAqACABAAAAEQAgAQAAABUAIAEAAAAgACABAAAAJAAgAQAAACgAIBEDAADOAwAgnwIAAIwEADCgAgAAMQAQoQIAAIwEADClAkAAwgMAIaYCQADCAwAhsgIBAMADACHAAgEAwAMAIdsCAQDAAwAh3AIBAMADACHdAgEAwAMAId4CAQDAAwAh3wIBAMADACHgAgEAwAMAIeECAQDMAwAh4gIBAMwDACHjAiAAzQMAIQMDAAC0BAAg4QIAAKwEACDiAgAArAQAIBEDAADOAwAgnwIAAIwEADCgAgAAMQAQoQIAAIwEADClAkAAwgMAIaYCQADCAwAhsgIBAAAAAcACAQDAAwAh2wIBAMADACHcAgEAwAMAId0CAQDAAwAh3gIBAMADACHfAgEAwAMAIeACAQDAAwAh4QIBAMwDACHiAgEAzAMAIeMCIADNAwAhAwAAADEAIAEAADIAMAIAADMAIAMAAAAkACABAAAlADACAAAmACASDAAAzgMAIA0AAIQEACCfAgAAiAQAMKACAAA2ABChAgAAiAQAMKUCQADCAwAhpgJAAMIDACGyAgEAwAMAIboCAQDAAwAhywIBAMADACHNAgAAiQTNAiLOAhAAigQAIc8CEACKBAAh0AIQAIoEACHRAhAAigQAIdICAACLBAAg0wIBAMwDACHUAkAAwgMAIQMMAAC0BAAgDQAA_wYAINMCAACsBAAgEgwAAM4DACANAACEBAAgnwIAAIgEADCgAgAANgAQoQIAAIgEADClAkAAwgMAIaYCQADCAwAhsgIBAAAAAboCAQDAAwAhywIBAAAAAc0CAACJBM0CIs4CEACKBAAhzwIQAIoEACHQAhAAigQAIdECEACKBAAh0gIAAIsEACDTAgEAzAMAIdQCQADCAwAhAwAAADYAIAEAADcAMAIAADgAIAMAAAAZACABAAAaADACAAAbACADAAAAIAAgAQAAIQAwAgAAIgAgDgkAAM4DACCfAgAAywMAMKACAAA8ABChAgAAywMAMKUCQADCAwAhpgJAAMIDACGyAgEAwAMAIbMCAQDAAwAhtAIBAMADACG1AgEAwAMAIbYCAQDMAwAhtwIBAMwDACG4AgEAzAMAIbkCIADNAwAhAQAAADwAIAMAAAAoACABAAApADACAAAqACABAAAAAwAgAQAAAAcAIAEAAAALACABAAAAMQAgAQAAACQAIAEAAAA2ACABAAAAGQAgAQAAACAAIAEAAAAoACABAAAAAQAgFwQAAP8DACAFAACABAAgBgAA8AMAIA0AAIQEACARAACFBAAgEgAAggQAIBMAAIcEACAUAACBBAAgFQAAgwQAIBYAAIYEACCfAgAA_AMAMKACAABJABChAgAA_AMAMKUCQADCAwAhpgJAAMIDACGyAgEAwAMAIbQCAQDAAwAh3AIBAMwDACGNAwEAwAMAIY4DIADNAwAhjwMBAMwDACGRAwAA_QORAyKTAwAA_gOTAyIMBAAA-gYAIAUAAPsGACAGAADxBQAgDQAA_wYAIBEAAIAHACASAAD9BgAgEwAAggcAIBQAAPwGACAVAAD-BgAgFgAAgQcAINwCAACsBAAgjwMAAKwEACADAAAASQAgAQAASgAwAgAAAQAgAwAAAEkAIAEAAEoAMAIAAAEAIAMAAABJACABAABKADACAAABACAUBAAA8AYAIAUAAPEGACAGAADyBgAgDQAA9gYAIBEAAPcGACASAAD0BgAgEwAA-QYAIBQAAPMGACAVAAD1BgAgFgAA-AYAIKUCQAAAAAGmAkAAAAABsgIBAAAAAbQCAQAAAAHcAgEAAAABjQMBAAAAAY4DIAAAAAGPAwEAAAABkQMAAACRAwKTAwAAAJMDAgEcAABOACAKpQJAAAAAAaYCQAAAAAGyAgEAAAABtAIBAAAAAdwCAQAAAAGNAwEAAAABjgMgAAAAAY8DAQAAAAGRAwAAAJEDApMDAAAAkwMCARwAAFAAMAEcAABQADAUBAAAhAYAIAUAAIUGACAGAACGBgAgDQAAigYAIBEAAIsGACASAACIBgAgEwAAjQYAIBQAAIcGACAVAACJBgAgFgAAjAYAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbQCAQCpBAAh3AIBALAEACGNAwEAqQQAIY4DIACxBAAhjwMBALAEACGRAwAAggaRAyKTAwAAgwaTAyICAAAAAQAgHAAAUwAgCqUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbQCAQCpBAAh3AIBALAEACGNAwEAqQQAIY4DIACxBAAhjwMBALAEACGRAwAAggaRAyKTAwAAgwaTAyICAAAASQAgHAAAVQAgAgAAAEkAIBwAAFUAIAMAAAABACAjAABOACAkAABTACABAAAAAQAgAQAAAEkAIAUHAAD_BQAgKQAAgQYAICoAAIAGACDcAgAArAQAII8DAACsBAAgDZ8CAAD1AwAwoAIAAFwAEKECAAD1AwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhtAIBALUDACHcAgEAxAMAIY0DAQC1AwAhjgMgAMUDACGPAwEAxAMAIZEDAAD2A5EDIpMDAAD3A5MDIgMAAABJACABAABbADAoAABcACADAAAASQAgAQAASgAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAJAwAA_gUAIKUCQAAAAAGmAkAAAAABsgIBAAAAAcACAQAAAAGAA0AAAAABigMBAAAAAYsDAQAAAAGMAwEAAAABARwAAGQAIAilAkAAAAABpgJAAAAAAbICAQAAAAHAAgEAAAABgANAAAAAAYoDAQAAAAGLAwEAAAABjAMBAAAAAQEcAABmADABHAAAZgAwCQMAAP0FACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACHAAgEAqQQAIYADQACrBAAhigMBAKkEACGLAwEAsAQAIYwDAQCwBAAhAgAAAAUAIBwAAGkAIAilAkAAqwQAIaYCQACrBAAhsgIBAKkEACHAAgEAqQQAIYADQACrBAAhigMBAKkEACGLAwEAsAQAIYwDAQCwBAAhAgAAAAMAIBwAAGsAIAIAAAADACAcAABrACADAAAABQAgIwAAZAAgJAAAaQAgAQAAAAUAIAEAAAADACAFBwAA-gUAICkAAPwFACAqAAD7BQAgiwMAAKwEACCMAwAArAQAIAufAgAA9AMAMKACAAByABChAgAA9AMAMKUCQAC3AwAhpgJAALcDACGyAgEAtQMAIcACAQC1AwAhgANAALcDACGKAwEAtQMAIYsDAQDEAwAhjAMBAMQDACEDAAAAAwAgAQAAcQAwKAAAcgAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgDgMAAPkFACClAkAAAAABpgJAAAAAAbICAQAAAAHAAgEAAAABgQMBAAAAAYIDAQAAAAGDAwEAAAABhAMBAAAAAYUDAQAAAAGGA0AAAAABhwNAAAAAAYgDAQAAAAGJAwEAAAABARwAAHoAIA2lAkAAAAABpgJAAAAAAbICAQAAAAHAAgEAAAABgQMBAAAAAYIDAQAAAAGDAwEAAAABhAMBAAAAAYUDAQAAAAGGA0AAAAABhwNAAAAAAYgDAQAAAAGJAwEAAAABARwAAHwAMAEcAAB8ADAOAwAA-AUAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIcACAQCpBAAhgQMBAKkEACGCAwEAqQQAIYMDAQCwBAAhhAMBALAEACGFAwEAsAQAIYYDQAC6BAAhhwNAALoEACGIAwEAsAQAIYkDAQCwBAAhAgAAAAkAIBwAAH8AIA2lAkAAqwQAIaYCQACrBAAhsgIBAKkEACHAAgEAqQQAIYEDAQCpBAAhggMBAKkEACGDAwEAsAQAIYQDAQCwBAAhhQMBALAEACGGA0AAugQAIYcDQAC6BAAhiAMBALAEACGJAwEAsAQAIQIAAAAHACAcAACBAQAgAgAAAAcAIBwAAIEBACADAAAACQAgIwAAegAgJAAAfwAgAQAAAAkAIAEAAAAHACAKBwAA9QUAICkAAPcFACAqAAD2BQAggwMAAKwEACCEAwAArAQAIIUDAACsBAAghgMAAKwEACCHAwAArAQAIIgDAACsBAAgiQMAAKwEACAQnwIAAPMDADCgAgAAiAEAEKECAADzAwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhwAIBALUDACGBAwEAtQMAIYIDAQC1AwAhgwMBAMQDACGEAwEAxAMAIYUDAQDEAwAhhgNAANADACGHA0AA0AMAIYgDAQDEAwAhiQMBAMQDACEDAAAABwAgAQAAhwEAMCgAAIgBACADAAAABwAgAQAACAAwAgAACQAgCZ8CAADyAwAwoAIAAI4BABChAgAA8gMAMKUCQADCAwAhpgJAAMIDACGyAgEAAAAB_gIBAMADACH_AgEAwAMAIYADQADCAwAhAQAAAIsBACABAAAAiwEAIAmfAgAA8gMAMKACAACOAQAQoQIAAPIDADClAkAAwgMAIaYCQADCAwAhsgIBAMADACH-AgEAwAMAIf8CAQDAAwAhgANAAMIDACEAAwAAAI4BACABAACPAQAwAgAAiwEAIAMAAACOAQAgAQAAjwEAMAIAAIsBACADAAAAjgEAIAEAAI8BADACAACLAQAgBqUCQAAAAAGmAkAAAAABsgIBAAAAAf4CAQAAAAH_AgEAAAABgANAAAAAAQEcAACTAQAgBqUCQAAAAAGmAkAAAAABsgIBAAAAAf4CAQAAAAH_AgEAAAABgANAAAAAAQEcAACVAQAwARwAAJUBADAGpQJAAKsEACGmAkAAqwQAIbICAQCpBAAh_gIBAKkEACH_AgEAqQQAIYADQACrBAAhAgAAAIsBACAcAACYAQAgBqUCQACrBAAhpgJAAKsEACGyAgEAqQQAIf4CAQCpBAAh_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_AEAIAMAAAAxACABAAAyADACAAAzACABAAAAJgAgAQAAACYAIAMAAAAkACABAAAlADACAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIAgDAACFBQAgCgAAhgUAIKUCQAAAAAGmAkAAAAABsgIBAAAAAbsCAQAAAAHAAgEAAAABxAICAAAAAQEcAACEAgAgBqUCQAAAAAGmAkAAAAABsgIBAAAAAbsCAQAAAAHAAgEAAAABxAICAAAAAQEcAACGAgAwARwAAIYCADAIAwAAgwUAIAoAAIQFACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACG7AgEAqQQAIcACAQCpBAAhxAICAKoEACECAAAAJgAgHAAAiQIAIAalAkAAqwQAIaYCQACrBAAhsgIBAKkEACG7AgEAqQQAIcACAQCpBAAhxAICAKoEACECAAAAJAAgHAAAiwIAIAIAAAAkACAcAACLAgAgAwAAACYAICMAAIQCACAkAACJAgAgAQAAACYAIAEAAAAkACAFBwAA_gQAICkAAIEFACAqAACABQAgewAA_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_BAAgKQAAwQQAICoAAMAEACAHnwIAANMDADCgAgAA6gIAEKECAADTAwAwpQJAALcDACGyAgEAtQMAIbsCAQC1AwAhwAIBALUDACEDAAAAKAAgAQAA6QIAMCgAAOoCACADAAAAKAAgAQAAKQAwAgAAKgAgAQAAACIAIAEAAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACAMCgAAvgQAIAwAAL0EACClAkAAAAABpgJAAAAAAbICAQAAAAG5AiAAAAABugIBAAAAAbsCAQAAAAG8AgIAAAABvQIBAAAAAb4CAQAAAAG_AkAAAAABARwAAPICACAKpQJAAAAAAaYCQAAAAAGyAgEAAAABuQIgAAAAAboCAQAAAAG7AgEAAAABvAICAAAAAb0CAQAAAAG-AgEAAAABvwJAAAAAAQEcAAD0AgAwARwAAPQCADAMCgAAvAQAIAwAALsEACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACG5AiAAsQQAIboCAQCpBAAhuwIBAKkEACG8AgIAqgQAIb0CAQCwBAAhvgIBALAEACG_AkAAugQAIQIAAAAiACAcAAD3AgAgCqUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbkCIACxBAAhugIBAKkEACG7AgEAqQQAIbwCAgCqBAAhvQIBALAEACG-AgEAsAQAIb8CQAC6BAAhAgAAACAAIBwAAPkCACACAAAAIAAgHAAA-QIAIAMAAAAiACAjAADyAgAgJAAA9wIAIAEAAAAiACABAAAAIAAgCAcAALUEACApAAC4BAAgKgAAtwQAIHsAALYEACB8AAC5BAAgvQIAAKwEACC-AgAArAQAIL8CAACsBAAgDZ8CAADPAwAwoAIAAIADABChAgAAzwMAMKUCQAC3AwAhpgJAALcDACGyAgEAtQMAIbkCIADFAwAhugIBALUDACG7AgEAtQMAIbwCAgC2AwAhvQIBAMQDACG-AgEAxAMAIb8CQADQAwAhAwAAACAAIAEAAP8CADAoAACAAwAgAwAAACAAIAEAACEAMAIAACIAIA4JAADOAwAgnwIAAMsDADCgAgAAPAAQoQIAAMsDADClAkAAwgMAIaYCQADCAwAhsgIBAAAAAbMCAQAAAAG0AgEAwAMAIbUCAQAAAAG2AgEAzAMAIbcCAQDMAwAhuAIBAMwDACG5AiAAzQMAIQEAAACDAwAgAQAAAIMDACAECQAAtAQAILYCAACsBAAgtwIAAKwEACC4AgAArAQAIAMAAAA8ACABAACGAwAwAgAAgwMAIAMAAAA8ACABAACGAwAwAgAAgwMAIAMAAAA8ACABAACGAwAwAgAAgwMAIAsJAACzBAAgpQJAAAAAAaYCQAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAG1AgEAAAABtgIBAAAAAbcCAQAAAAG4AgEAAAABuQIgAAAAAQEcAACKAwAgCqUCQAAAAAGmAkAAAAABsgIBAAAAAbMCAQAAAAG0AgEAAAABtQIBAAAAAbYCAQAAAAG3AgEAAAABuAIBAAAAAbkCIAAAAAEBHAAAjAMAMAEcAACMAwAwCwkAALIEACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACGzAgEAqQQAIbQCAQCpBAAhtQIBAKkEACG2AgEAsAQAIbcCAQCwBAAhuAIBALAEACG5AiAAsQQAIQIAAACDAwAgHAAAjwMAIAqlAkAAqwQAIaYCQACrBAAhsgIBAKkEACGzAgEAqQQAIbQCAQCpBAAhtQIBAKkEACG2AgEAsAQAIbcCAQCwBAAhuAIBALAEACG5AiAAsQQAIQIAAAA8ACAcAACRAwAgAgAAADwAIBwAAJEDACADAAAAgwMAICMAAIoDACAkAACPAwAgAQAAAIMDACABAAAAPAAgBgcAAK0EACApAACvBAAgKgAArgQAILYCAACsBAAgtwIAAKwEACC4AgAArAQAIA2fAgAAwwMAMKACAACYAwAQoQIAAMMDADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACGzAgEAtQMAIbQCAQC1AwAhtQIBALUDACG2AgEAxAMAIbcCAQDEAwAhuAIBAMQDACG5AiAAxQMAIQMAAAA8ACABAACXAwAwKAAAmAMAIAMAAAA8ACABAACGAwAwAgAAgwMAIAifAgAAvwMAMKACAACeAwAQoQIAAL8DADCiAgEAAAABowICAMEDACGkAkAAwgMAIaUCQADCAwAhpgJAAMIDACEBAAAAmwMAIAEAAACbAwAgCJ8CAAC_AwAwoAIAAJ4DABChAgAAvwMAMKICAQDAAwAhowICAMEDACGkAkAAwgMAIaUCQADCAwAhpgJAAMIDACEAAwAAAJ4DACABAACfAwAwAgAAmwMAIAMAAACeAwAgAQAAnwMAMAIAAJsDACADAAAAngMAIAEAAJ8DADACAACbAwAgBaICAQAAAAGjAgIAAAABpAJAAAAAAaUCQAAAAAGmAkAAAAABARwAAKMDACAFogIBAAAAAaMCAgAAAAGkAkAAAAABpQJAAAAAAaYCQAAAAAEBHAAApQMAMAEcAAClAwAwBaICAQCpBAAhowICAKoEACGkAkAAqwQAIaUCQACrBAAhpgJAAKsEACECAAAAmwMAIBwAAKgDACAFogIBAKkEACGjAgIAqgQAIaQCQACrBAAhpQJAAKsEACGmAkAAqwQAIQIAAACeAwAgHAAAqgMAIAIAAACeAwAgHAAAqgMAIAMAAACbAwAgIwAAowMAICQAAKgDACABAAAAmwMAIAEAAACeAwAgBQcAAKQEACApAACnBAAgKgAApgQAIHsAAKUEACB8AACoBAAgCJ8CAAC0AwAwoAIAALEDABChAgAAtAMAMKICAQC1AwAhowICALYDACGkAkAAtwMAIaUCQAC3AwAhpgJAALcDACEDAAAAngMAIAEAALADADAoAACxAwAgAwAAAJ4DACABAACfAwAwAgAAmwMAIAifAgAAtAMAMKACAACxAwAQoQIAALQDADCiAgEAtQMAIaMCAgC2AwAhpAJAALcDACGlAkAAtwMAIaYCQAC3AwAhDgcAALkDACApAAC-AwAgKgAAvgMAIKcCAQAAAAGoAgEAAAAEqQIBAAAABKoCAQAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAgEAvQMAIa8CAQAAAAGwAgEAAAABsQIBAAAAAQ0HAAC5AwAgKQAAuQMAICoAALkDACB7AAC8AwAgfAAAuQMAIKcCAgAAAAGoAgIAAAAEqQICAAAABKoCAgAAAAGrAgIAAAABrAICAAAAAa0CAgAAAAGuAgIAuwMAIQsHAAC5AwAgKQAAugMAICoAALoDACCnAkAAAAABqAJAAAAABKkCQAAAAASqAkAAAAABqwJAAAAAAawCQAAAAAGtAkAAAAABrgJAALgDACELBwAAuQMAICkAALoDACAqAAC6AwAgpwJAAAAAAagCQAAAAASpAkAAAAAEqgJAAAAAAasCQAAAAAGsAkAAAAABrQJAAAAAAa4CQAC4AwAhCKcCAgAAAAGoAgIAAAAEqQICAAAABKoCAgAAAAGrAgIAAAABrAICAAAAAa0CAgAAAAGuAgIAuQMAIQinAkAAAAABqAJAAAAABKkCQAAAAASqAkAAAAABqwJAAAAAAawCQAAAAAGtAkAAAAABrgJAALoDACENBwAAuQMAICkAALkDACAqAAC5AwAgewAAvAMAIHwAALkDACCnAgIAAAABqAICAAAABKkCAgAAAASqAgIAAAABqwICAAAAAawCAgAAAAGtAgIAAAABrgICALsDACEIpwIIAAAAAagCCAAAAASpAggAAAAEqgIIAAAAAasCCAAAAAGsAggAAAABrQIIAAAAAa4CCAC8AwAhDgcAALkDACApAAC-AwAgKgAAvgMAIKcCAQAAAAGoAgEAAAAEqQIBAAAABKoCAQAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAgEAvQMAIa8CAQAAAAGwAgEAAAABsQIBAAAAAQunAgEAAAABqAIBAAAABKkCAQAAAASqAgEAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAL4DACGvAgEAAAABsAIBAAAAAbECAQAAAAEInwIAAL8DADCgAgAAngMAEKECAAC_AwAwogIBAMADACGjAgIAwQMAIaQCQADCAwAhpQJAAMIDACGmAkAAwgMAIQunAgEAAAABqAIBAAAABKkCAQAAAASqAgEAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAL4DACGvAgEAAAABsAIBAAAAAbECAQAAAAEIpwICAAAAAagCAgAAAASpAgIAAAAEqgICAAAAAasCAgAAAAGsAgIAAAABrQICAAAAAa4CAgC5AwAhCKcCQAAAAAGoAkAAAAAEqQJAAAAABKoCQAAAAAGrAkAAAAABrAJAAAAAAa0CQAAAAAGuAkAAugMAIQ2fAgAAwwMAMKACAACYAwAQoQIAAMMDADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACGzAgEAtQMAIbQCAQC1AwAhtQIBALUDACG2AgEAxAMAIbcCAQDEAwAhuAIBAMQDACG5AiAAxQMAIQ4HAADJAwAgKQAAygMAICoAAMoDACCnAgEAAAABqAIBAAAABakCAQAAAAWqAgEAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAMgDACGvAgEAAAABsAIBAAAAAbECAQAAAAEFBwAAuQMAICkAAMcDACAqAADHAwAgpwIgAAAAAa4CIADGAwAhBQcAALkDACApAADHAwAgKgAAxwMAIKcCIAAAAAGuAiAAxgMAIQKnAiAAAAABrgIgAMcDACEOBwAAyQMAICkAAMoDACAqAADKAwAgpwIBAAAAAagCAQAAAAWpAgEAAAAFqgIBAAAAAasCAQAAAAGsAgEAAAABrQIBAAAAAa4CAQDIAwAhrwIBAAAAAbACAQAAAAGxAgEAAAABCKcCAgAAAAGoAgIAAAAFqQICAAAABaoCAgAAAAGrAgIAAAABrAICAAAAAa0CAgAAAAGuAgIAyQMAIQunAgEAAAABqAIBAAAABakCAQAAAAWqAgEAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAMoDACGvAgEAAAABsAIBAAAAAbECAQAAAAEOCQAAzgMAIJ8CAADLAwAwoAIAADwAEKECAADLAwAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAhswIBAMADACG0AgEAwAMAIbUCAQDAAwAhtgIBAMwDACG3AgEAzAMAIbgCAQDMAwAhuQIgAM0DACELpwIBAAAAAagCAQAAAAWpAgEAAAAFqgIBAAAAAasCAQAAAAGsAgEAAAABrQIBAAAAAa4CAQDKAwAhrwIBAAAAAbACAQAAAAGxAgEAAAABAqcCIAAAAAGuAiAAxwMAIRkEAAD_AwAgBQAAgAQAIAYAAPADACANAACEBAAgEQAAhQQAIBIAAIIEACATAACHBAAgFAAAgQQAIBUAAIMEACAWAACGBAAgnwIAAPwDADCgAgAASQAQoQIAAPwDADClAkAAwgMAIaYCQADCAwAhsgIBAMADACG0AgEAwAMAIdwCAQDMAwAhjQMBAMADACGOAyAAzQMAIY8DAQDMAwAhkQMAAP0DkQMikwMAAP4DkwMilgMAAEkAIJcDAABJACANnwIAAM8DADCgAgAAgAMAEKECAADPAwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhuQIgAMUDACG6AgEAtQMAIbsCAQC1AwAhvAICALYDACG9AgEAxAMAIb4CAQDEAwAhvwJAANADACELBwAAyQMAICkAANIDACAqAADSAwAgpwJAAAAAAagCQAAAAAWpAkAAAAAFqgJAAAAAAasCQAAAAAGsAkAAAAABrQJAAAAAAa4CQADRAwAhCwcAAMkDACApAADSAwAgKgAA0gMAIKcCQAAAAAGoAkAAAAAFqQJAAAAABaoCQAAAAAGrAkAAAAABrAJAAAAAAa0CQAAAAAGuAkAA0QMAIQinAkAAAAABqAJAAAAABakCQAAAAAWqAkAAAAABqwJAAAAAAawCQAAAAAGtAkAAAAABrgJAANIDACEHnwIAANMDADCgAgAA6gIAEKECAADTAwAwpQJAALcDACGyAgEAtQMAIbsCAQC1AwAhwAIBALUDACEMnwIAANQDADCgAgAA1AIAEKECAADUAwAwpQJAALcDACGyAgEAtQMAIbsCAQC1AwAhwQIBALUDACHCAgEAtQMAIcMCAQDEAwAhxAICALYDACHFAhAA1QMAIcYCEADVAwAhDQcAALkDACApAADXAwAgKgAA1wMAIHsAANcDACB8AADXAwAgpwIQAAAAAagCEAAAAASpAhAAAAAEqgIQAAAAAasCEAAAAAGsAhAAAAABrQIQAAAAAa4CEADWAwAhDQcAALkDACApAADXAwAgKgAA1wMAIHsAANcDACB8AADXAwAgpwIQAAAAAagCEAAAAASpAhAAAAAEqgIQAAAAAasCEAAAAAGsAhAAAAABrQIQAAAAAa4CEADWAwAhCKcCEAAAAAGoAhAAAAAEqQIQAAAABKoCEAAAAAGrAhAAAAABrAIQAAAAAa0CEAAAAAGuAhAA1wMAIQqfAgAA2AMAMKACAAC-AgAQoQIAANgDADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACGzAgEAtQMAIccCAQC1AwAhyQIAANkDyQIiygIQANUDACEHBwAAuQMAICkAANsDACAqAADbAwAgpwIAAADJAgKoAgAAAMkCCKkCAAAAyQIIrgIAANoDyQIiBwcAALkDACApAADbAwAgKgAA2wMAIKcCAAAAyQICqAIAAADJAgipAgAAAMkCCK4CAADaA8kCIgSnAgAAAMkCAqgCAAAAyQIIqQIAAADJAgiuAgAA2wPJAiIQnwIAANwDADCgAgAAqAIAEKECAADcAwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhugIBALUDACHLAgEAtQMAIc0CAADdA80CIs4CEADVAwAhzwIQANUDACHQAhAA1QMAIdECEADVAwAh0gIAAN4DACDTAgEAxAMAIdQCQAC3AwAhBwcAALkDACApAADhAwAgKgAA4QMAIKcCAAAAzQICqAIAAADNAgipAgAAAM0CCK4CAADgA80CIg8HAAC5AwAgKQAA3wMAICoAAN8DACCnAoAAAAABqgKAAAAAAasCgAAAAAGsAoAAAAABrQKAAAAAAa4CgAAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHYAoAAAAAB2QKAAAAAAdoCgAAAAAEMpwKAAAAAAaoCgAAAAAGrAoAAAAABrAKAAAAAAa0CgAAAAAGuAoAAAAAB1QIBAAAAAdYCAQAAAAHXAgEAAAAB2AKAAAAAAdkCgAAAAAHaAoAAAAABBwcAALkDACApAADhAwAgKgAA4QMAIKcCAAAAzQICqAIAAADNAgipAgAAAM0CCK4CAADgA80CIgSnAgAAAM0CAqgCAAAAzQIIqQIAAADNAgiuAgAA4QPNAiIJnwIAAOIDADCgAgAAkgIAEKECAADiAwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhuwIBALUDACHAAgEAtQMAIcQCAgC2AwAhEJ8CAADjAwAwoAIAAPwBABChAgAA4wMAMKUCQAC3AwAhpgJAALcDACGyAgEAtQMAIcACAQC1AwAh2wIBALUDACHcAgEAtQMAId0CAQC1AwAh3gIBALUDACHfAgEAtQMAIeACAQC1AwAh4QIBAMQDACHiAgEAxAMAIeMCIADFAwAhCZ8CAADkAwAwoAIAAOYBABChAgAA5AMAMKUCQAC3AwAhsgIBALUDACG7AgEAtQMAIeQCAQC1AwAh5QIBAMQDACHmAiAAxQMAIR6fAgAA5QMAMKACAADQAQAQoQIAAOUDADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACGzAgEAtQMAIbQCAQC1AwAhtQIBALUDACG4AgEAxAMAIbkCIADFAwAh5wIBALUDACHoAgEAxAMAIekCAQDEAwAh6gIBAMQDACHrAgEAxAMAIewCAQC1AwAh7QIBAMQDACHvAgAA5gPvAiLwAgEAxAMAIfECAQC1AwAh8gIBAMQDACHzAhAA1QMAIfQCEADnAwAh9QICALYDACH2AggA6AMAIfcCAgC2AwAh-AICALYDACH5AiAAxQMAIfoCAQC1AwAhBwcAALkDACApAADtAwAgKgAA7QMAIKcCAAAA7wICqAIAAADvAgipAgAAAO8CCK4CAADsA-8CIg0HAADJAwAgKQAA6wMAICoAAOsDACB7AADrAwAgfAAA6wMAIKcCEAAAAAGoAhAAAAAFqQIQAAAABaoCEAAAAAGrAhAAAAABrAIQAAAAAa0CEAAAAAGuAhAA6gMAIQ0HAAC5AwAgKQAAvAMAICoAALwDACB7AAC8AwAgfAAAvAMAIKcCCAAAAAGoAggAAAAEqQIIAAAABKoCCAAAAAGrAggAAAABrAIIAAAAAa0CCAAAAAGuAggA6QMAIQ0HAAC5AwAgKQAAvAMAICoAALwDACB7AAC8AwAgfAAAvAMAIKcCCAAAAAGoAggAAAAEqQIIAAAABKoCCAAAAAGrAggAAAABrAIIAAAAAa0CCAAAAAGuAggA6QMAIQ0HAADJAwAgKQAA6wMAICoAAOsDACB7AADrAwAgfAAA6wMAIKcCEAAAAAGoAhAAAAAFqQIQAAAABaoCEAAAAAGrAhAAAAABrAIQAAAAAa0CEAAAAAGuAhAA6gMAIQinAhAAAAABqAIQAAAABakCEAAAAAWqAhAAAAABqwIQAAAAAawCEAAAAAGtAhAAAAABrgIQAOsDACEHBwAAuQMAICkAAO0DACAqAADtAwAgpwIAAADvAgKoAgAAAO8CCKkCAAAA7wIIrgIAAOwD7wIiBKcCAAAA7wICqAIAAADvAgipAgAAAO8CCK4CAADtA-8CIgufAgAA7gMAMKACAAC6AQAQoQIAAO4DADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACG0AgEAtQMAIbUCAQC1AwAhuAIBAMQDACG5AiAAxQMAIeQCAQDEAwAhDAYAAPADACCfAgAA7wMAMKACAACnAQAQoQIAAO8DADClAkAAwgMAIaYCQADCAwAhsgIBAMADACG0AgEAwAMAIbUCAQDAAwAhuAIBAMwDACG5AiAAzQMAIeQCAQDMAwAhA_sCAAALACD8AgAACwAg_QIAAAsAIAmfAgAA8QMAMKACAAChAQAQoQIAAPEDADClAkAAtwMAIaYCQAC3AwAhsgIBALUDACH-AgEAtQMAIf8CAQC1AwAhgANAALcDACEJnwIAAPIDADCgAgAAjgEAEKECAADyAwAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAh_gIBAMADACH_AgEAwAMAIYADQADCAwAhEJ8CAADzAwAwoAIAAIgBABChAgAA8wMAMKUCQAC3AwAhpgJAALcDACGyAgEAtQMAIcACAQC1AwAhgQMBALUDACGCAwEAtQMAIYMDAQDEAwAhhAMBAMQDACGFAwEAxAMAIYYDQADQAwAhhwNAANADACGIAwEAxAMAIYkDAQDEAwAhC58CAAD0AwAwoAIAAHIAEKECAAD0AwAwpQJAALcDACGmAkAAtwMAIbICAQC1AwAhwAIBALUDACGAA0AAtwMAIYoDAQC1AwAhiwMBAMQDACGMAwEAxAMAIQ2fAgAA9QMAMKACAABcABChAgAA9QMAMKUCQAC3AwAhpgJAALcDACGyAgEAtQMAIbQCAQC1AwAh3AIBAMQDACGNAwEAtQMAIY4DIADFAwAhjwMBAMQDACGRAwAA9gORAyKTAwAA9wOTAyIHBwAAuQMAICkAAPsDACAqAAD7AwAgpwIAAACRAwKoAgAAAJEDCKkCAAAAkQMIrgIAAPoDkQMiBwcAALkDACApAAD5AwAgKgAA-QMAIKcCAAAAkwMCqAIAAACTAwipAgAAAJMDCK4CAAD4A5MDIgcHAAC5AwAgKQAA-QMAICoAAPkDACCnAgAAAJMDAqgCAAAAkwMIqQIAAACTAwiuAgAA-AOTAyIEpwIAAACTAwKoAgAAAJMDCKkCAAAAkwMIrgIAAPkDkwMiBwcAALkDACApAAD7AwAgKgAA-wMAIKcCAAAAkQMCqAIAAACRAwipAgAAAJEDCK4CAAD6A5EDIgSnAgAAAJEDAqgCAAAAkQMIqQIAAACRAwiuAgAA-wORAyIXBAAA_wMAIAUAAIAEACAGAADwAwAgDQAAhAQAIBEAAIUEACASAACCBAAgEwAAhwQAIBQAAIEEACAVAACDBAAgFgAAhgQAIJ8CAAD8AwAwoAIAAEkAEKECAAD8AwAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAhtAIBAMADACHcAgEAzAMAIY0DAQDAAwAhjgMgAM0DACGPAwEAzAMAIZEDAAD9A5EDIpMDAAD-A5MDIgSnAgAAAJEDAqgCAAAAkQMIqQIAAACRAwiuAgAA-wORAyIEpwIAAACTAwKoAgAAAJMDCKkCAAAAkwMIrgIAAPkDkwMiA_sCAAADACD8AgAAAwAg_QIAAAMAIAP7AgAABwAg_AIAAAcAIP0CAAAHACAD-wIAADEAIPwCAAAxACD9AgAAMQAgA_sCAAAkACD8AgAAJAAg_QIAACQAIAP7AgAANgAg_AIAADYAIP0CAAA2ACAD-wIAABkAIPwCAAAZACD9AgAAGQAgA_sCAAAgACD8AgAAIAAg_QIAACAAIBAJAADOAwAgnwIAAMsDADCgAgAAPAAQoQIAAMsDADClAkAAwgMAIaYCQADCAwAhsgIBAMADACGzAgEAwAMAIbQCAQDAAwAhtQIBAMADACG2AgEAzAMAIbcCAQDMAwAhuAIBAMwDACG5AiAAzQMAIZYDAAA8ACCXAwAAPAAgA_sCAAAoACD8AgAAKAAg_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-gYAIAUAAPsGACAGAADxBQAgDQAA_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-wQAIAMAAAAbACAjAAD7BAAgJAAA-gQAIAEcAADCBwAwDQkAAM4DACAOAACXBAAgDwAAmAQAIJ8CAACVBAAwoAIAABkAEKECAACVBAAwpQJAAMIDACGmAkAAwgMAIbICAQAAAAGzAgEAwAMAIccCAQDAAwAhyQIAAJYEyQIiygIQAIoEACECAAAAGwAgHAAA-gQAIAIAAAD4BAAgHAAA-QQAIAqfAgAA9wQAMKACAAD4BAAQoQIAAPcEADClAkAAwgMAIaYCQADCAwAhsgIBAMADACGzAgEAwAMAIccCAQDAAwAhyQIAAJYEyQIiygIQAIoEACEKnwIAAPcEADCgAgAA-AQAEKECAAD3BAAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAhswIBAMADACHHAgEAwAMAIckCAACWBMkCIsoCEACKBAAhBqUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbMCAQCpBAAhyQIAANUEyQIiygIQAMsEACEICQAA1wQAIA8AANgEACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACGzAgEAqQQAIckCAADVBMkCIsoCEADLBAAhCAkAAOYEACAPAADnBAAgpQJAAAAAAaYCQAAAAAGyAgEAAAABswIBAAAAAckCAAAAyQICygIQAAAAAQMjAADABwAgmAMAAMEHACCeAwAAAQAgBCMAAPAEADCYAwAA8QQAMJoDAADzBAAgngMAAPQEADAAAAAAAAUjAAC4BwAgJAAAvgcAIJgDAAC5BwAgmQMAAL0HACCeAwAAAQAgBSMAALYHACAkAAC7BwAgmAMAALcHACCZAwAAugcAIJ4DAAANACADIwAAuAcAIJgDAAC5BwAgngMAAAEAIAMjAAC2BwAgmAMAALcHACCeAwAADQAgAAAABSMAALEHACAkAAC0BwAgmAMAALIHACCZAwAAswcAIJ4DAAABACADIwAAsQcAIJgDAACyBwAgngMAAAEAIAAAAAUjAACsBwAgJAAArwcAIJgDAACtBwAgmQMAAK4HACCeAwAADQAgAyMAAKwHACCYAwAArQcAIJ4DAAANACAAAAAAAAGbAwAAAO8CAgWbAxAAAAABoQMQAAAAAaIDEAAAAAGjAxAAAAABpAMQAAAAAQWbAwgAAAABoQMIAAAAAaIDCAAAAAGjAwgAAAABpAMIAAAAAQUjAACfBwAgJAAAqgcAIJgDAACgBwAgmQMAAKkHACCeAwAApAEAIAUjAACdBwAgJAAApwcAIJgDAACeBwAgmQMAAKYHACCeAwAAAQAgCyMAAM0FADAkAADSBQAwmAMAAM4FADCZAwAAzwUAMJoDAADQBQAgmwMAANEFADCcAwAA0QUAMJ0DAADRBQAwngMAANEFADCfAwAA0wUAMKADAADUBQAwCyMAAMQFADAkAADIBQAwmAMAAMUFADCZAwAAxgUAMJoDAADHBQAgmwMAAN0EADCcAwAA3QQAMJ0DAADdBAAwngMAAN0EADCfAwAAyQUAMKADAADgBAAwCyMAALgFADAkAAC9BQAwmAMAALkFADCZAwAAugUAMJoDAAC7BQAgmwMAALwFADCcAwAAvAUAMJ0DAAC8BQAwngMAALwFADCfAwAAvgUAMKADAAC_BQAwCyMAAKwFADAkAACxBQAwmAMAAK0FADCZAwAArgUAMJoDAACvBQAgmwMAALAFADCcAwAAsAUAMJ0DAACwBQAwngMAALAFADCfAwAAsgUAMKADAACzBQAwCyMAAKAFADAkAAClBQAwmAMAAKEFADCZAwAAogUAMJoDAACjBQAgmwMAAKQFADCcAwAApAUAMJ0DAACkBQAwngMAAKQFADCfAwAApgUAMKADAACnBQAwBAMAAMQEACClAkAAAAABsgIBAAAAAcACAQAAAAECAAAAKgAgIwAAqwUAIAMAAAAqACAjAACrBQAgJAAAqgUAIAEcAAClBwAwCgMAAM4DACAKAACPBAAgnwIAAI4EADCgAgAAKAAQoQIAAI4EADClAkAAwgMAIbICAQAAAAG7AgEAwAMAIcACAQDAAwAhlAMAAI0EACACAAAAKgAgHAAAqgUAIAIAAACoBQAgHAAAqQUAIAefAgAApwUAMKACAACoBQAQoQIAAKcFADClAkAAwgMAIbICAQDAAwAhuwIBAMADACHAAgEAwAMAIQefAgAApwUAMKACAACoBQAQoQIAAKcFADClAkAAwgMAIbICAQDAAwAhuwIBAMADACHAAgEAwAMAIQOlAkAAqwQAIbICAQCpBAAhwAIBAKkEACEEAwAAwgQAIKUCQACrBAAhsgIBAKkEACHAAgEAqQQAIQQDAADEBAAgpQJAAAAAAbICAQAAAAHAAgEAAAABBgMAAIUFACClAkAAAAABpgJAAAAAAbICAQAAAAHAAgEAAAABxAICAAAAAQIAAAAmACAjAAC3BQAgAwAAACYAICMAALcFACAkAAC2BQAgARwAAKQHADAMAwAAzgMAIAoAAI8EACCfAgAAkQQAMKACAAAkABChAgAAkQQAMKUCQADCAwAhpgJAAMIDACGyAgEAAAABuwIBAMADACHAAgEAwAMAIcQCAgDBAwAhlAMAAJAEACACAAAAJgAgHAAAtgUAIAIAAAC0BQAgHAAAtQUAIAmfAgAAswUAMKACAAC0BQAQoQIAALMFADClAkAAwgMAIaYCQADCAwAhsgIBAMADACG7AgEAwAMAIcACAQDAAwAhxAICAMEDACEJnwIAALMFADCgAgAAtAUAEKECAACzBQAwpQJAAMIDACGmAkAAwgMAIbICAQDAAwAhuwIBAMADACHAAgEAwAMAIcQCAgDBAwAhBaUCQACrBAAhpgJAAKsEACGyAgEAqQQAIcACAQCpBAAhxAICAKoEACEGAwAAgwUAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIcACAQCpBAAhxAICAKoEACEGAwAAhQUAIKUCQAAAAAGmAkAAAAABsgIBAAAAAcACAQAAAAHEAgIAAAABCgwAAL0EACClAkAAAAABpgJAAAAAAbICAQAAAAG5AiAAAAABugIBAAAAAbwCAgAAAAG9AgEAAAABvgIBAAAAAb8CQAAAAAECAAAAIgAgIwAAwwUAIAMAAAAiACAjAADDBQAgJAAAwgUAIAEcAACjBwAwEAoAAI8EACAMAADOAwAgnwIAAJMEADCgAgAAIAAQoQIAAJMEADClAkAAwgMAIaYCQADCAwAhsgIBAAAAAbkCIADNAwAhugIBAMADACG7AgEAwAMAIbwCAgDBAwAhvQIBAMwDACG-AgEAzAMAIb8CQACUBAAhlQMAAJIEACACAAAAIgAgHAAAwgUAIAIAAADABQAgHAAAwQUAIA2fAgAAvwUAMKACAADABQAQoQIAAL8FADClAkAAwgMAIaYCQADCAwAhsgIBAMADACG5AiAAzQMAIboCAQDAAwAhuwIBAMADACG8AgIAwQMAIb0CAQDMAwAhvgIBAMwDACG_AkAAlAQAIQ2fAgAAvwUAMKACAADABQAQoQIAAL8FADClAkAAwgMAIaYCQADCAwAhsgIBAMADACG5AiAAzQMAIboCAQDAAwAhuwIBAMADACG8AgIAwQMAIb0CAQDMAwAhvgIBAMwDACG_AkAAlAQAIQmlAkAAqwQAIaYCQACrBAAhsgIBAKkEACG5AiAAsQQAIboCAQCpBAAhvAICAKoEACG9AgEAsAQAIb4CAQCwBAAhvwJAALoEACEKDAAAuwQAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbkCIACxBAAhugIBAKkEACG8AgIAqgQAIb0CAQCwBAAhvgIBALAEACG_AkAAugQAIQoMAAC9BAAgpQJAAAAAAaYCQAAAAAGyAgEAAAABuQIgAAAAAboCAQAAAAG8AgIAAAABvQIBAAAAAb4CAQAAAAG_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_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_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_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-QYAIBQAAPMGACAVAAD1BgAgFgAA-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_AQAIKUCQAAAAAGmAkAAAAABsgIBAAAAAboCAQAAAAHLAgEAAAABzQIAAADNAgLOAhAAAAABzwIQAAAAAdACEAAAAAHRAhAAAAAB0gKAAAAAAdMCAQAAAAHUAkAAAAABAgAAADgAICMAAMgHACAIpQJAAAAAAbICAQAAAAG7AgEAAAABwgIBAAAAAcMCAQAAAAHEAgIAAAABxQIQAAAAAcYCEAAAAAEDAAAASQAgIwAAxgcAICQAAM0HACAVAAAASQAgBAAAhAYAIAUAAIUGACAGAACGBgAgEQAAiwYAIBIAAIgGACATAACNBgAgFAAAhwYAIBUAAIkGACAWAACMBgAgHAAAzQcAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbQCAQCpBAAh3AIBALAEACGNAwEAqQQAIY4DIACxBAAhjwMBALAEACGRAwAAggaRAyKTAwAAgwaTAyITBAAAhAYAIAUAAIUGACAGAACGBgAgEQAAiwYAIBIAAIgGACATAACNBgAgFAAAhwYAIBUAAIkGACAWAACMBgAgpQJAAKsEACGmAkAAqwQAIbICAQCpBAAhtAIBAKkEACHcAgEAsAQAIY0DAQCpBAAhjgMgALEEACGPAwEAsAQAIZEDAACCBpEDIpMDAACDBpMDIgMAAAA2ACAjAADIBwAgJAAA0AcAIBAAAAA2ACAMAADuBAAgHAAA0AcAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIboCAQCpBAAhywIBAKkEACHNAgAA7QTNAiLOAhAAywQAIc8CEADLBAAh0AIQAMsEACHRAhAAywQAIdICgAAAAAHTAgEAsAQAIdQCQACrBAAhDgwAAO4EACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACG6AgEAqQQAIcsCAQCpBAAhzQIAAO0EzQIizgIQAMsEACHPAhAAywQAIdACEADLBAAh0QIQAMsEACHSAoAAAAAB0wIBALAEACHUAkAAqwQAISEIAADZBQAgCQAA2gUAIAsAANsFACARAADdBQAgEgAA3gUAIBMAAN8FACClAkAAAAABpgJAAAAAAbICAQAAAAGzAgEAAAABtAIBAAAAAbUCAQAAAAG4AgEAAAABuQIgAAAAAecCAQAAAAHoAgEAAAAB6QIBAAAAAeoCAQAAAAHrAgEAAAAB7AIBAAAAAe0CAQAAAAHvAgAAAO8CAvACAQAAAAHxAgEAAAAB8gIBAAAAAfMCEAAAAAH0AhAAAAAB9QICAAAAAfYCCAAAAAH3AgIAAAAB-AICAAAAAfkCIAAAAAH6AgEAAAABAgAAAA0AICMAANEHACAJCQAA5gQAIA4AAOUEACClAkAAAAABpgJAAAAAAbICAQAAAAGzAgEAAAABxwIBAAAAAckCAAAAyQICygIQAAAAAQIAAAAbACAjAADTBwAgAwAAAAsAICMAANEHACAkAADXBwAgIwAAAAsAIAgAAJkFACAJAACaBQAgCwAAmwUAIBEAAJ0FACASAACeBQAgEwAAnwUAIBwAANcHACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACGzAgEAqQQAIbQCAQCpBAAhtQIBAKkEACG4AgEAsAQAIbkCIACxBAAh5wIBAKkEACHoAgEAsAQAIekCAQCwBAAh6gIBALAEACHrAgEAsAQAIewCAQCpBAAh7QIBALAEACHvAgAAlgXvAiLwAgEAsAQAIfECAQCpBAAh8gIBALAEACHzAhAAywQAIfQCEACXBQAh9QICAKoEACH2AggAmAUAIfcCAgCqBAAh-AICAKoEACH5AiAAsQQAIfoCAQCpBAAhIQgAAJkFACAJAACaBQAgCwAAmwUAIBEAAJ0FACASAACeBQAgEwAAnwUAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbMCAQCpBAAhtAIBAKkEACG1AgEAqQQAIbgCAQCwBAAhuQIgALEEACHnAgEAqQQAIegCAQCwBAAh6QIBALAEACHqAgEAsAQAIesCAQCwBAAh7AIBAKkEACHtAgEAsAQAIe8CAACWBe8CIvACAQCwBAAh8QIBAKkEACHyAgEAsAQAIfMCEADLBAAh9AIQAJcFACH1AgIAqgQAIfYCCACYBQAh9wICAKoEACH4AgIAqgQAIfkCIACxBAAh-gIBAKkEACEDAAAAGQAgIwAA0wcAICQAANoHACALAAAAGQAgCQAA1wQAIA4AANYEACAcAADaBwAgpQJAAKsEACGmAkAAqwQAIbICAQCpBAAhswIBAKkEACHHAgEAqQQAIckCAADVBMkCIsoCEADLBAAhCQkAANcEACAOAADWBAAgpQJAAKsEACGmAkAAqwQAIbICAQCpBAAhswIBAKkEACHHAgEAqQQAIckCAADVBMkCIsoCEADLBAAhIQgAANkFACAJAADaBQAgCwAA2wUAIA8AANwFACARAADdBQAgEgAA3gUAIKUCQAAAAAGmAkAAAAABsgIBAAAAAbMCAQAAAAG0AgEAAAABtQIBAAAAAbgCAQAAAAG5AiAAAAAB5wIBAAAAAegCAQAAAAHpAgEAAAAB6gIBAAAAAesCAQAAAAHsAgEAAAAB7QIBAAAAAe8CAAAA7wIC8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIQAAAAAfQCEAAAAAH1AgIAAAAB9gIIAAAAAfcCAgAAAAH4AgIAAAAB-QIgAAAAAfoCAQAAAAECAAAADQAgIwAA2wcAIBMEAADwBgAgBQAA8QYAIAYAAPIGACANAAD2BgAgEQAA9wYAIBIAAPQGACAUAADzBgAgFQAA9QYAIBYAAPgGACClAkAAAAABpgJAAAAAAbICAQAAAAG0AgEAAAAB3AIBAAAAAY0DAQAAAAGOAyAAAAABjwMBAAAAAZEDAAAAkQMCkwMAAACTAwICAAAAAQAgIwAA3QcAIAMAAAALACAjAADbBwAgJAAA4QcAICMAAAALACAIAACZBQAgCQAAmgUAIAsAAJsFACAPAACcBQAgEQAAnQUAIBIAAJ4FACAcAADhBwAgpQJAAKsEACGmAkAAqwQAIbICAQCpBAAhswIBAKkEACG0AgEAqQQAIbUCAQCpBAAhuAIBALAEACG5AiAAsQQAIecCAQCpBAAh6AIBALAEACHpAgEAsAQAIeoCAQCwBAAh6wIBALAEACHsAgEAqQQAIe0CAQCwBAAh7wIAAJYF7wIi8AIBALAEACHxAgEAqQQAIfICAQCwBAAh8wIQAMsEACH0AhAAlwUAIfUCAgCqBAAh9gIIAJgFACH3AgIAqgQAIfgCAgCqBAAh-QIgALEEACH6AgEAqQQAISEIAACZBQAgCQAAmgUAIAsAAJsFACAPAACcBQAgEQAAnQUAIBIAAJ4FACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACGzAgEAqQQAIbQCAQCpBAAhtQIBAKkEACG4AgEAsAQAIbkCIACxBAAh5wIBAKkEACHoAgEAsAQAIekCAQCwBAAh6gIBALAEACHrAgEAsAQAIewCAQCpBAAh7QIBALAEACHvAgAAlgXvAiLwAgEAsAQAIfECAQCpBAAh8gIBALAEACHzAhAAywQAIfQCEACXBQAh9QICAKoEACH2AggAmAUAIfcCAgCqBAAh-AICAKoEACH5AiAAsQQAIfoCAQCpBAAhAwAAAEkAICMAAN0HACAkAADkBwAgFQAAAEkAIAQAAIQGACAFAACFBgAgBgAAhgYAIA0AAIoGACARAACLBgAgEgAAiAYAIBQAAIcGACAVAACJBgAgFgAAjAYAIBwAAOQHACClAkAAqwQAIaYCQACrBAAhsgIBAKkEACG0AgEAqQQAIdwCAQCwBAAhjQMBAKkEACGOAyAAsQQAIY8DAQCwBAAhkQMAAIIGkQMikwMAAIMGkwMiEwQAAIQGACAFAACFBgAgBgAAhgYAIA0AAIoGACARAACLBgAgEgAAiAYAIBQAAIcGACAVAACJBgAgFgAAjAYAIKUCQACrBAAhpgJAAKsEACGyAgEAqQQAIbQCAQCpBAAh3AIBALAEACGNAwEAqQQAIY4DIACxBAAhjwMBALAEACGRAwAAggaRAyKTAwAAgwaTAyIhCAAA2QUAIAkAANoFACALAADbBQAgDwAA3AUAIBIAAN4FACATAADfBQAgpQJAAAAAAaYCQAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAG1AgEAAAABuAIBAAAAAbkCIAAAAAHnAgEAAAAB6AIBAAAAAekCAQAAAAHqAgEAAAAB6wIBAAAAAewCAQAAAAHtAgEAAAAB7wIAAADvAgLwAgEAAAAB8QIBAAAAAfICAQAAAAHzAhAAAAAB9AIQAAAAAfUCAgAAAAH2AggAAAAB9wICAAAAAfgCAgAAAAH5AiAAAAAB-gIBAAAAAQIAAAANACAjAADlBwAgEwQAAPAGACAFAADxBgAgBgAA8gYAIA0AAPYGACASAAD0BgAgEwAA-QYAIBQAAPMGACAVAAD1BgAgFgAA-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_AAVAAAZBAA1FABFGABJDABNHABRCABVEAAAAAAMHABgpABkqABoAAAADBwAYKQAZKgAaAQMAAQEDAAEDBwAfKQAgKgAhAAAAAwcAHykAICoAIQEDAAEBAwABAwcAJikAJyoAKAAAAAMHACYpACcqACgAAAADBwAuKQAvKgAwAAAAAwcALikALyoAMAAAAwcANSkANioANwAAAAMHADUpADYqADcCCAAFCQABAggABQkAAQUHADwpAD8qAEB7AD18AD4AAAAAAAUHADwpAD8qAEB7AD18AD4BCgAEAQoABAMHAEUpAEYqAEcAAAADBwBFKQBGKgBHAQMAAQEDAAEDBwBMKQBNKgBOAAAAAwcATCkATSoATgIDAAEKAAQCAwABCgAEBQcAUykAVioAV3sAVHwAVQAAAAAABQcAUykAVioAV3sAVHwAVQEMAAEBDAABBQcAXCkAXyoAYHsAXXwAXgAAAAAABQcAXCkAXyoAYHsAXXwAXgIJAAEOAAoCCQABDgAKBQcAZSkAaCoAaXsAZnwAZwAAAAAABQcAZSkAaCoAaXsAZnwAZwIKAAQQAAkCCgAEEAAJBQcAbikAcSoAcnsAb3wAcAAAAAAABQcAbikAcSoAcnsAb3wAcAIDAAEKAAQCAwABCgAEAwcAdykAeCoAeQAAAAMHAHcpAHgqAHkCCgAEDAABAgoABAwAAQUHAH4pAIEBKgCCAXsAf3wAgAEAAAAAAAUHAH4pAIEBKgCCAXsAf3wAgAEBCQABAQkAAQMHAIcBKQCIASoAiQEAAAADBwCHASkAiAEqAIkBAAAABQcAjwEpAJIBKgCTAXsAkAF8AJEBAAAAAAAFBwCPASkAkgEqAJMBewCQAXwAkQEXAgEYSAEZSwEaTAEbTQEdTwEeURQfUhUgVAEhVhQiVxYlWAEmWQEnWhQrXRcsXhstXwIuYAIvYQIwYgIxYwIyZQIzZxQ0aBw1agI2bBQ3bR04bgI5bwI6cBQ7cx48dCI9dQM-dgM_dwNAeANBeQNCewNDfRREfiNFgAEDRoIBFEeDASRIhAEDSYUBA0qGARRLiQElTIoBKU2MASpOjQEqT5ABKlCRASpRkgEqUpQBKlOWARRUlwErVZkBKlabARRXnAEsWJ0BKlmeASpanwEUW6IBLVyjATFdpQEFXqYBBV-pAQVgqgEFYasBBWKtAQVjrwEUZLABMmWyAQVmtAEUZ7UBM2i2AQVptwEFargBFGu7ATRsvAE4bb0BBG6-AQRvvwEEcMABBHHBAQRywwEEc8UBFHTGATl1yAEEdsoBFHfLATp4zAEEec0BBHrOARR90QE7ftIBQX_TAQeAAdQBB4EB1QEHggHWAQeDAdcBB4QB2QEHhQHbARSGAdwBQocB3gEHiAHgARSJAeEBQ4oB4gEHiwHjAQeMAeQBFI0B5wFEjgHoAUiPAekBEZAB6gERkQHrARGSAewBEZMB7QERlAHvARGVAfEBFJYB8gFJlwH0ARGYAfYBFJkB9wFKmgH4ARGbAfkBEZwB-gEUnQH9AUueAf4BT58B_wEOoAGAAg6hAYECDqIBggIOowGDAg6kAYUCDqUBhwIUpgGIAlCnAYoCDqgBjAIUqQGNAlGqAY4CDqsBjwIOrAGQAhStAZMCUq4BlAJYrwGVAgqwAZYCCrEBlwIKsgGYAgqzAZkCCrQBmwIKtQGdAhS2AZ4CWbcBoAIKuAGiAhS5AaMCWroBpAIKuwGlAgq8AaYCFL0BqQJbvgGqAmG_AasCCcABrAIJwQGtAgnCAa4CCcMBrwIJxAGxAgnFAbMCFMYBtAJixwG2AgnIAbgCFMkBuQJjygG6AgnLAbsCCcwBvAIUzQG_AmTOAcACas8BwQII0AHCAgjRAcMCCNIBxAII0wHFAgjUAccCCNUByQIU1gHKAmvXAcwCCNgBzgIU2QHPAmzaAdACCNsB0QII3AHSAhTdAdUCbd4B1gJz3wHXAg_gAdgCD-EB2QIP4gHaAg_jAdsCD-QB3QIP5QHfAhTmAeACdOcB4gIP6AHkAhTpAeUCdeoB5gIP6wHnAg_sAegCFO0B6wJ27gHsAnrvAe0CDfAB7gIN8QHvAg3yAfACDfMB8QIN9AHzAg31AfUCFPYB9gJ79wH4Ag34AfoCFPkB-wJ8-gH8Ag37Af0CDfwB_gIU_QGBA33-AYIDgwH_AYQDEoAChQMSgQKHAxKCAogDEoMCiQMShAKLAxKFAo0DFIYCjgOEAYcCkAMSiAKSAxSJApMDhQGKApQDEosClQMSjAKWAxSNApkDhgGOApoDigGPApwDiwGQAp0DiwGRAqADiwGSAqEDiwGTAqIDiwGUAqQDiwGVAqYDFJYCpwOMAZcCqQOLAZgCqwMUmQKsA40BmgKtA4sBmwKuA4sBnAKvAxSdArIDjgGeArMDlAE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AddressScalarFieldEnum: () => AddressScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CartItemScalarFieldEnum: () => CartItemScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  JsonNullValueInput: () => JsonNullValueInput,
  MedicineImageScalarFieldEnum: () => MedicineImageScalarFieldEnum,
  MedicineScalarFieldEnum: () => MedicineScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RateLimitScalarFieldEnum: () => RateLimitScalarFieldEnum,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  ShopScalarFieldEnum: () => ShopScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VendorOrderScalarFieldEnum: () => VendorOrderScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  WishlistScalarFieldEnum: () => WishlistScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Category: "Category",
  Medicine: "Medicine",
  MedicineImage: "MedicineImage",
  Address: "Address",
  CartItem: "CartItem",
  Order: "Order",
  VendorOrder: "VendorOrder",
  OrderItem: "OrderItem",
  Wishlist: "Wishlist",
  Review: "Review",
  Shop: "Shop",
  RateLimit: "RateLimit"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  accountStatus: "accountStatus",
  phoneNumber: "phoneNumber"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  slug: "slug",
  name: "name",
  description: "description",
  imageUrl: "imageUrl",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var MedicineScalarFieldEnum = {
  id: "id",
  slug: "slug",
  name: "name",
  genericName: "genericName",
  shortDescription: "shortDescription",
  description: "description",
  indications: "indications",
  dosageInstructions: "dosageInstructions",
  sideEffects: "sideEffects",
  manufacturerName: "manufacturerName",
  brandName: "brandName",
  dosageForm: "dosageForm",
  strength: "strength",
  unitPresentation: "unitPresentation",
  sku: "sku",
  price: "price",
  discountPrice: "discountPrice",
  stockQuantity: "stockQuantity",
  averageRating: "averageRating",
  reviewCount: "reviewCount",
  totalSalesCount: "totalSalesCount",
  isFeatured: "isFeatured",
  isActive: "isActive",
  categoryId: "categoryId",
  sellerId: "sellerId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var MedicineImageScalarFieldEnum = {
  id: "id",
  medicineId: "medicineId",
  imageUrl: "imageUrl",
  altText: "altText",
  isPrimary: "isPrimary",
  createdAt: "createdAt"
};
var AddressScalarFieldEnum = {
  id: "id",
  userId: "userId",
  fullName: "fullName",
  phoneNumber: "phoneNumber",
  division: "division",
  district: "district",
  area: "area",
  streetAddress: "streetAddress",
  postalCode: "postalCode",
  addressLabel: "addressLabel",
  isDefault: "isDefault",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CartItemScalarFieldEnum = {
  id: "id",
  userId: "userId",
  medicineId: "medicineId",
  quantity: "quantity",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  orderNumber: "orderNumber",
  customerId: "customerId",
  paymentStatus: "paymentStatus",
  subtotalAmount: "subtotalAmount",
  deliveryFee: "deliveryFee",
  discountAmount: "discountAmount",
  totalAmount: "totalAmount",
  shippingAddressSnapshot: "shippingAddressSnapshot",
  customerNote: "customerNote",
  placedAt: "placedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VendorOrderScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  sellerId: "sellerId",
  orderStatus: "orderStatus",
  vendorSubtotal: "vendorSubtotal",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  vendorOrderId: "vendorOrderId",
  medicineId: "medicineId",
  medicineNameSnapshot: "medicineNameSnapshot",
  medicineImageSnapshot: "medicineImageSnapshot",
  quantity: "quantity",
  unitPrice: "unitPrice",
  totalPrice: "totalPrice",
  createdAt: "createdAt"
};
var WishlistScalarFieldEnum = {
  id: "id",
  userId: "userId",
  medicineId: "medicineId",
  createdAt: "createdAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  medicineId: "medicineId",
  rating: "rating",
  comment: "comment",
  isActive: "isActive",
  reply: "reply",
  repliedAt: "repliedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ShopScalarFieldEnum = {
  id: "id",
  sellerId: "sellerId",
  name: "name",
  slug: "slug",
  logo: "logo",
  banner: "banner",
  description: "description",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var RateLimitScalarFieldEnum = {
  key: "key",
  count: "count",
  resetAt: "resetAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var JsonNullValueInput = {
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var UserRole = {
  ADMIN: "ADMIN",
  SELLER: "SELLER",
  CUSTOMER: "CUSTOMER"
};
var AccountStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var DosageForm = {
  TABLET: "TABLET",
  CAPSULE: "CAPSULE",
  SYRUP: "SYRUP",
  OINTMENT: "OINTMENT",
  INJECTION: "INJECTION",
  DROPS: "DROPS"
};
var PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED"
};
var OrderStatus = {
  PLACED: "PLACED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
import { oAuthProxy } from "better-auth/plugins";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: process.env.PROD_APP_URL || "http://localhost:5000",
  trustedOrigins: [process.env.APP_URL || "http://localhost:3000"],
  // Enable social login providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent"
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER"
      },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE"
      },
      phoneNumber: {
        type: "string",
        required: false
      }
    }
  },
  // account: {
  //   skipStateCookieCheck: true, // Allow requests without state cookie (Postman, mobile apps, etc.)
  // },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`Send verification email to ${user.email} with URL: ${url}`);
      try {
        const info = await transporter.sendMail({
          from: `Oshudpati Marketplace <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Verify your email address",
          text: `Hello, ${user.name}. Please confirm your email address to finish creating your account and start using Oshudpati Marketplace.

Click the link below to verify your email:
${url}

If you did not request this email, you can safely ignore it.`,
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:40px 20px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">

                    <table width="600" cellspacing="0" cellpadding="0"
                      style="background:#ffffff;border-radius:12px;padding:40px;">

                      <tr>
                        <td>

                          <h1 style="margin:0 0 24px;color:#0f172a;font-size:28px;">
                            Verify your email address
                          </h1>

                          <p style="font-size:16px;color:#334155;line-height:1.7;">
                            Hello ${user.name},
                          </p>

                          <p style="font-size:16px;color:#334155;line-height:1.7;">
                            Thank you for creating an account with Oshudpati Marketplace.
                            Please verify your email address to activate your account.
                          </p>

                          <div style="margin:32px 0;text-align:center;">
                            <a
                              href="${url}"
                              style="
                                display:inline-block;
                                background:#0f766e;
                                color:#ffffff;
                                text-decoration:none;
                                padding:14px 28px;
                                border-radius:8px;
                                font-weight:600;
                              "
                            >
                              Verify Email
                            </a>
                          </div>

                          <p style="font-size:14px;color:#64748b;line-height:1.7;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>

                          <p style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            padding:12px;
                            border-radius:8px;
                            word-break:break-word;
                            font-size:14px;
                          ">
                            ${url}
                          </p>

                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">

                          <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
                            If you didn't create this account, you can safely ignore this email.
                          </p>

                          <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
                            Oshudpati Marketplace
                          </p>

                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>
              </table>
            </div>
            `
        });
        console.log("Verification email sent:", info.messageId);
      } catch (error) {
        console.log("Error sending verification email:", error);
      }
    }
  },
  advanced: {
    cookies: {
      session_token: {
        name: "session_token",
        // Force this exact name
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true
        }
      },
      state: {
        name: "session_token",
        // Force this exact name
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true
        }
      }
    }
  },
  plugins: [oAuthProxy()]
});

// src/modules/auth/auth.routes.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
var getCurrentUser = async (userId) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phoneNumber: true,
      emailVerified: true,
      accountStatus: true,
      createdAt: true
    }
  });
  return user;
};
var AuthService = {
  getCurrentUser
};

// src/modules/auth/auth.controller.ts
var getCurrentUser2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: You must be logged in to access this resource."
      });
    }
    const currentUser = await AuthService.getCurrentUser(user.id);
    res.json({
      success: true,
      message: "User retrieved successfully",
      data: currentUser
    });
  } catch (error) {
    next(error);
  }
};
var AuthController = {
  getCurrentUser: getCurrentUser2
};

// src/middlewares/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to perform this action."
        });
      }
      if (session.user.accountStatus === AccountStatus.BANNED) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned. Please contact support."
        });
      }
      if (session.user.emailVerified === false) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email to perform this action."
        });
      }
      if (roles.length && !roles.includes(session.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to perform this action."
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        accountStatus: session.user.accountStatus
      };
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while authenticating the user.",
        errorDetails: error
      });
    }
  };
};
var auth_default = auth2;

// src/modules/auth/auth.routes.ts
var router = Router();
router.get(
  "/me",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  AuthController.getCurrentUser
);
var AuthRoutes = router;

// src/middlewares/globalErrorHandler.ts
import { ZodError } from "zod";
function errorHandler(err, req, res, next) {
  let success = false;
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = null;
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message
    }));
    statusCode = 400;
    message = "Validation Error";
    errors = formattedErrors;
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = err.meta?.driverAdapterError?.cause?.constraint?.fields ? `Unique constraint failed on the field(s): ${(err.meta?.driverAdapterError).cause.constraint.fields.join(", ")}.` : "Unique constraint failed.";
        errors = err.meta?.driverAdapterError ? [err.meta?.driverAdapterError] : null;
        break;
      case "P2021":
        statusCode = 404;
        message = `The table ${err.meta?.modelName} does not exist in the current database.`;
        errors = err.meta?.driverAdapterError ? [err.meta?.driverAdapterError] : null;
        break;
      case "P2025":
        statusCode = 404;
        message = err.meta?.modelName ? `${err.meta.modelName} not found.` : "Record not found.";
        errors = [err.meta];
        break;
      default:
        message = `Prisma Error: ${err.code}`;
        errors = err.meta ? [err.meta] : null;
        break;
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    return res.status(statusCode).json({
      success,
      message: err.message,
      errors: err
    });
  } else if (err instanceof Error) {
    message = err.message;
    errors = [
      {
        name: err.name,
        cause: err.cause
      }
    ];
  }
  res.status(statusCode).json({ success, message, errors });
}
var globalErrorHandler_default = errorHandler;

// src/modules/category/category.routes.ts
import { Router as Router2 } from "express";

// src/lib/utils.ts
var generateSlug = (...inputs) => {
  const slugBase = inputs.join(" ");
  const slug = slugBase.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
  return slug;
};
var parsePaginationParams = (query) => {
  const page = isNaN(Number(query.page)) ? 1 : Number(query.page);
  const limit = isNaN(Number(query.limit)) ? 10 : Math.min(Number(query.limit), 50);
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
  return { page, limit, skip, sortBy, sortOrder };
};
var calculateDeliveryFee = (subtotal) => {
  if (subtotal >= 300) {
    return 0;
  }
  return 60;
};

// src/modules/category/category.service.ts
var categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      medicines: true
    }
  }
};
var getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true
    },
    select: categorySelect,
    orderBy: {
      name: "asc"
    }
  });
  return categories;
};
var getCategoryById = async (id) => {
  const category = await prisma.category.findFirstOrThrow({
    where: { id, isActive: true },
    select: categorySelect
  });
  return category;
};
var getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findFirstOrThrow({
    where: {
      slug,
      isActive: true
    },
    select: categorySelect
  });
  return category;
};
var createCategory = async (data) => {
  const slug = generateSlug(data.name);
  const newCategory = {
    name: data.name,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    slug
  };
  const res = await prisma.category.create({
    data: newCategory,
    select: categorySelect
  });
  return res;
};
var updateCategory = async (id, data) => {
  const updateData = {
    ...data
  };
  if (data.name && !data.slug) {
    updateData.slug = generateSlug(data.name);
  }
  const res = await prisma.category.update({
    where: { id },
    data: updateData,
    select: categorySelect
  });
  return res;
};
var deleteCategorySoft = async (id) => {
  const res = await prisma.category.update({
    where: { id },
    data: { isActive: false },
    select: categorySelect
  });
  return res;
};
var getInactiveCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: false
    },
    select: categorySelect,
    orderBy: {
      name: "asc"
    }
  });
  return categories;
};
var recoverCategory = async (id) => {
  await prisma.category.findFirstOrThrow({
    where: { id, isActive: false }
  });
  const res = await prisma.category.update({
    where: { id },
    data: { isActive: true },
    select: categorySelect
  });
  return res;
};
var CategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategoryById,
  getCategoryBySlug,
  deleteCategorySoft,
  recoverCategory,
  getInactiveCategories
};

// src/modules/category/category.controller.ts
var getAllCategories2 = async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
var getCategoryById2 = async (req, res, next) => {
  try {
    const category = await CategoryService.getCategoryById(
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var getCategoryBySlug2 = async (req, res, next) => {
  try {
    const category = await CategoryService.getCategoryBySlug(
      req.params.slug
    );
    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var createCategory2 = async (req, res, next) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    await CategoryService.getCategoryById(req.params.id);
    const category = await CategoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var deleteCategorySoft2 = async (req, res, next) => {
  try {
    await CategoryService.getCategoryById(req.params.id);
    await CategoryService.deleteCategorySoft(req.params.id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var getInactiveCategories2 = async (req, res, next) => {
  try {
    const categories = await CategoryService.getInactiveCategories();
    res.status(200).json({
      success: true,
      message: "Inactive categories retrieved successfully",
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
var recoverCategory2 = async (req, res, next) => {
  try {
    const category = await CategoryService.recoverCategory(
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: "Category recovered successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var CategoryController = {
  getAllCategories: getAllCategories2,
  getCategoryById: getCategoryById2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  getCategoryBySlug: getCategoryBySlug2,
  deleteCategorySoft: deleteCategorySoft2,
  recoverCategory: recoverCategory2,
  getInactiveCategories: getInactiveCategories2
};

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/category/category.validation.ts
import { z } from "zod";
var createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({
      error: "Category name is required"
    }).min(3, "Category name must be at least 3 characters long").max(50, "Category name cannot exceed 50 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    imageUrl: z.string().url("Invalid image layout format. Must be a valid URL").optional(),
    isActive: z.boolean().optional()
  })
});
var updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Category name must be at least 3 characters long").max(50, "Category name cannot exceed 50 characters").optional(),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    slug: z.string().regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and can only contain letters, numbers, and hyphens"
    ).optional(),
    imageUrl: z.string().url("Invalid image layout format. Must be a valid URL").optional(),
    isActive: z.boolean().optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  }),
  params: z.object({
    id: z.string().uuid("Invalid Category ID format. Must be a valid UUID")
  })
});
var getCategoryByIdZodSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Category ID format. Must be a valid UUID")
  })
});
var getCategoryBySlugZodSchema = z.object({
  params: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug format")
  })
});
var CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  getCategoryByIdZodSchema,
  getCategoryBySlugZodSchema
};

// src/modules/category/category.routes.ts
var router2 = Router2();
router2.get("/", CategoryController.getAllCategories);
router2.get(
  "/inactive",
  auth_default(UserRole.ADMIN),
  CategoryController.getInactiveCategories
);
router2.get(
  "/slug/:slug",
  validateRequest(CategoryValidation.getCategoryBySlugZodSchema),
  CategoryController.getCategoryBySlug
);
router2.get(
  "/:id",
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.getCategoryById
);
router2.post(
  "/",
  auth_default(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);
router2.patch(
  "/:id",
  auth_default(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory
);
router2.delete(
  "/:id",
  auth_default(UserRole.ADMIN),
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.deleteCategorySoft
);
router2.patch(
  "/:id/recover",
  auth_default(UserRole.ADMIN),
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.recoverCategory
);
var CategoryRoutes = router2;

// src/modules/medicine/medicine.routes.ts
import { Router as Router3 } from "express";

// src/modules/medicine/medicine.service.ts
var createMedicine = async (sellerId, payload) => {
  const slug = generateSlug(
    payload.name,
    payload.strength ?? payload.genericName,
    payload.dosageForm
  );
  const { images, price, discountPrice = null, ...medicineData } = payload;
  return await prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.create({
      data: {
        ...medicineData,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        sellerId,
        slug
      }
    });
    await tx.medicineImage.createMany({
      data: images.map((img) => ({
        medicineId: medicine.id,
        imageUrl: img.imageUrl,
        altText: img.altText || `${medicineData.name} ${medicineData.strength || medicineData.genericName} ${medicineData.dosageForm}`,
        isPrimary: img.isPrimary || false
      }))
    });
    return tx.medicine.findUniqueOrThrow({
      where: { id: medicine.id },
      include: {
        category: true,
        images: true
      }
    });
  });
};
var getMyMedicines = async (sellerId, metadata) => {
  const { page, limit, skip } = metadata;
  const medicines = await prisma.medicine.findMany({
    where: { sellerId },
    include: {
      category: true,
      images: true,
      _count: {
        select: { orderItems: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip
  });
  const total = await prisma.medicine.count({
    where: { sellerId }
  });
  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1
  };
  return { medicines, meta };
};
var getAllMedicines = async (query, metadata) => {
  const { search, isFeatured, category, manufacturer, minPrice, maxPrice } = query;
  const {
    page,
    limit,
    skip,
    sortBy: sortByMeta,
    sortOrder: sortOrderMeta
  } = metadata;
  let sortBy = "createdAt";
  let sortOrder = sortOrderMeta || "desc";
  if (sortByMeta === "latest") {
    sortBy = "createdAt";
  } else if (sortByMeta === "price-asc") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sortByMeta === "price-desc") {
    sortBy = "price";
    sortOrder = "desc";
  } else if (sortByMeta == "popular") {
    sortBy = "averageRating";
    sortOrder = "desc";
  }
  const priceFilter = {};
  if (Number.isFinite(minPrice)) {
    priceFilter.gte = minPrice;
  }
  if (Number.isFinite(maxPrice)) {
    priceFilter.lte = maxPrice;
  }
  const andConditions = [
    {
      isActive: true,
      ...Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}
    }
  ];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { manufacturerName: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  if (typeof isFeatured === "boolean") {
    andConditions.push({ isFeatured });
  }
  if (category.length > 0) {
    andConditions.push({ category: { slug: { in: category } } });
  }
  if (manufacturer.length > 0) {
    andConditions.push({ manufacturerName: { in: manufacturer } });
  }
  const medicines = await prisma.medicine.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      images: true
    }
  });
  const total = await prisma.medicine.count({
    where: {
      AND: andConditions
    }
  });
  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1
  };
  return { medicines, meta };
};
var getAllManufacturers = async () => {
  const manufacturers = await prisma.medicine.findMany({
    where: { isActive: true },
    select: {
      manufacturerName: true
    },
    distinct: ["manufacturerName"]
  });
  return manufacturers;
};
var getMedicineById = async (id) => {
  return await prisma.medicine.findUniqueOrThrow({
    where: { id, isActive: true },
    include: {
      category: true,
      images: true
    }
  });
};
var getMedicineBySlug = async (slug) => {
  return await prisma.medicine.findUniqueOrThrow({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: true
    }
  });
};
var updateMedicine = async (medicineId, payload) => {
  const { images, price, discountPrice, ...medicineData } = payload;
  return prisma.$transaction(async (tx) => {
    const existingMedicine = await tx.medicine.findUniqueOrThrow({
      where: { id: medicineId, isActive: true },
      include: { images: true }
    });
    const slug = generateSlug(
      medicineData.name || existingMedicine.name,
      medicineData.strength || existingMedicine.strength || existingMedicine.genericName,
      medicineData.dosageForm || existingMedicine.dosageForm
    );
    const updatedMedicine = await tx.medicine.update({
      where: { id: medicineId, isActive: true },
      data: {
        ...medicineData,
        slug,
        price: price !== void 0 ? Number(price) : existingMedicine.price,
        discountPrice: discountPrice !== void 0 ? Number(discountPrice) : existingMedicine.discountPrice
      }
    });
    if (images) {
      const incomingIds = images.filter((img) => img.id).map((img) => img.id);
      await tx.medicineImage.deleteMany({
        where: {
          medicineId,
          id: {
            notIn: incomingIds
          }
        }
      });
      for (const img of images) {
        if (img.id) {
          await tx.medicineImage.update({
            where: { id: img.id },
            data: {
              imageUrl: img.imageUrl || existingMedicine.images.find((i) => i.id === img.id)?.imageUrl,
              altText: img.altText || existingMedicine.images.find((i) => i.id === img.id)?.altText,
              isPrimary: img.isPrimary !== void 0 ? img.isPrimary : existingMedicine.images.find((i) => i.id === img.id)?.isPrimary || false
            }
          });
        } else {
          await tx.medicineImage.create({
            data: {
              medicineId,
              imageUrl: img.imageUrl,
              altText: img.altText || null,
              isPrimary: img.isPrimary || false
            }
          });
        }
      }
    }
    return tx.medicine.findUniqueOrThrow({
      where: { id: updatedMedicine.id },
      include: {
        category: true,
        images: true
      }
    });
  });
};
var deleteMedicineSoft = async (medicineId) => {
  return await prisma.medicine.update({
    where: { id: medicineId },
    data: { isActive: false }
  });
};
var deleteMedicine = async (medicineId) => {
  return await prisma.medicine.delete({
    where: { id: medicineId }
  });
};
var MedicineService = {
  createMedicine,
  getMyMedicines,
  getAllMedicines,
  getAllManufacturers,
  getMedicineById,
  getMedicineBySlug,
  updateMedicine,
  deleteMedicineSoft,
  deleteMedicine
};

// src/modules/medicine/medicine.controller.ts
var createMedicine2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const medicine = await MedicineService.createMedicine(
      sellerId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};
var getAllMedicines2 = async (req, res, next) => {
  try {
    const { search, isFeatured, category, manufacturer, minPrice, maxPrice } = req.query;
    const queryParams = {
      search: typeof search === "string" ? search : void 0,
      isFeatured: typeof isFeatured === "string" ? isFeatured.toLowerCase() === "true" : void 0,
      category: typeof category === "string" && category.length > 0 ? category.split(",").filter(Boolean) : [],
      manufacturer: typeof manufacturer === "string" && manufacturer.length > 0 ? manufacturer.split(",").filter(Boolean) : [],
      minPrice: typeof minPrice === "string" ? Number(minPrice) : 0,
      maxPrice: typeof maxPrice === "string" ? Number(maxPrice) : Infinity
    };
    const paginationParams = parsePaginationParams(req.query);
    const { medicines, meta } = await MedicineService.getAllMedicines(
      queryParams,
      paginationParams
    );
    res.status(200).json({
      success: true,
      message: medicines.length > 0 ? "Medicines retrieved successfully" : "No medicines found",
      data: medicines,
      meta
    });
  } catch (error) {
    next(error);
  }
};
var getAllManufacturers2 = async (req, res, next) => {
  try {
    const manufacturers = await MedicineService.getAllManufacturers();
    res.status(200).json({
      success: true,
      message: manufacturers.length > 0 ? "Manufacturers retrieved successfully" : "No manufacturers found",
      data: manufacturers
    });
  } catch (error) {
    next(error);
  }
};
var getMedicineById2 = async (req, res, next) => {
  try {
    const medicineId = req.params.id;
    const medicine = await MedicineService.getMedicineById(
      medicineId
    );
    res.status(200).json({
      success: true,
      message: "Medicine retrieved successfully",
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};
var getMedicineBySlug2 = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const medicine = await MedicineService.getMedicineBySlug(slug);
    res.status(200).json({
      success: true,
      message: "Medicine retrieved successfully",
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};
var updateMedicine2 = async (req, res, next) => {
  try {
    const medicineId = req.params.id;
    const updatedMedicine = await MedicineService.updateMedicine(
      medicineId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine
    });
  } catch (error) {
    next(error);
  }
};
var deleteMedicineSoft2 = async (req, res, next) => {
  try {
    const medicineId = req.params.id;
    await MedicineService.deleteMedicineSoft(medicineId);
    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var getMyMedicines2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const paginationParams = parsePaginationParams(req.query);
    const result = await MedicineService.getMyMedicines(
      sellerId,
      paginationParams
    );
    res.status(200).json({
      success: true,
      message: result.medicines.length > 0 ? "Medicines retrieved successfully" : "No medicines found",
      data: result.medicines,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};
var MedicineController = {
  createMedicine: createMedicine2,
  getAllMedicines: getAllMedicines2,
  getAllManufacturers: getAllManufacturers2,
  getMedicineById: getMedicineById2,
  getMedicineBySlug: getMedicineBySlug2,
  getMyMedicines: getMyMedicines2,
  updateMedicine: updateMedicine2,
  deleteMedicineSoft: deleteMedicineSoft2
};

// src/modules/medicine/medicine.validation.ts
import { z as z2 } from "zod";
var createMedicineZodSchema = z2.object({
  body: z2.object({
    name: z2.string({ error: "Medicine name is required" }).min(1),
    genericName: z2.string({ error: "Generic name is required" }).min(1),
    shortDescription: z2.string().max(255).optional(),
    description: z2.string().optional(),
    indications: z2.string().optional(),
    dosageInstructions: z2.string().optional(),
    sideEffects: z2.string().optional(),
    manufacturerName: z2.string({
      error: "Manufacturer name is required"
    }),
    brandName: z2.string().optional(),
    dosageForm: z2.nativeEnum(DosageForm, {
      error: "Invalid dosage form enum type"
    }),
    strength: z2.string().optional(),
    unitPresentation: z2.string({
      error: "Unit presentation (e.g., 10 Tablets) is required"
    }),
    sku: z2.string().optional(),
    price: z2.number({ error: "Base price is required" }).positive("Price must be greater than 0"),
    discountPrice: z2.number("Discount price must be a number").positive("Discount price must be a positive number").optional(),
    stockQuantity: z2.number("Stock quantity must be a number").int("Stock quantity must be an integer").nonnegative("Stock quantity must be a non-negative integer").default(0),
    isFeatured: z2.boolean("Featured status must be a boolean").optional(),
    categoryId: z2.string({ error: "Category ID is required" }).uuid(),
    images: z2.array(
      z2.object({
        imageUrl: z2.string().url("Each image must have a valid URL format"),
        altText: z2.string("Alt text must be a string").optional(),
        isPrimary: z2.boolean("Primary image status must be a boolean").default(false)
      })
    ).min(1, "You must provide at least one image for the medicine listing")
  }).refine(
    (data) => {
      if (data.discountPrice && data.discountPrice >= data.price) {
        return false;
      }
      return true;
    },
    {
      message: "Discount price must be strictly less than the standard retail price",
      path: ["discountPrice"]
    }
  )
});
var updateMedicineZodSchema = z2.object({
  body: z2.object({
    name: z2.string().optional(),
    genericName: z2.string().optional(),
    shortDescription: z2.string().max(255).optional(),
    description: z2.string().optional(),
    indications: z2.string().optional(),
    dosageInstructions: z2.string().optional(),
    sideEffects: z2.string().optional(),
    manufacturerName: z2.string().optional(),
    brandName: z2.string().optional(),
    dosageForm: z2.nativeEnum(DosageForm).optional(),
    strength: z2.string().optional(),
    unitPresentation: z2.string().optional(),
    sku: z2.string().optional(),
    price: z2.number("Price must be a number").positive().optional(),
    discountPrice: z2.number("Discount price must be a number").positive("Discount price must be a positive number").optional(),
    stockQuantity: z2.number("Stock quantity must be a number").int("Stock quantity must be an integer").nonnegative("Stock quantity must be a non-negative integer").optional(),
    isFeatured: z2.boolean("Featured status must be a boolean").optional(),
    isActive: z2.boolean("Active status must be a boolean").optional(),
    categoryId: z2.string().uuid("Invalid category identifier UUID format").optional(),
    images: z2.array(
      z2.object({
        id: z2.string().uuid().optional(),
        imageUrl: z2.string().url(),
        altText: z2.string().optional(),
        isPrimary: z2.boolean().optional()
      })
    ).optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update medicine"
  }),
  params: z2.object({
    id: z2.string().uuid()
  })
});
var getSingleMedicineBySlugZodSchema = z2.object({
  params: z2.object({
    slug: z2.string({
      error: "Medicine lookup slug parameter is required"
    })
  })
});
var getsingleMedicineByIdZodSchema = z2.object({
  params: z2.object({
    id: z2.string().uuid("Invalid Medicine identifier UUID format")
  })
});
var deleteMedicineZodSchema = z2.object({
  params: z2.object({
    id: z2.string().uuid("Invalid Medicine identifier UUID format")
  })
});
var MedicineValidation = {
  createMedicineZodSchema,
  updateMedicineZodSchema,
  getSingleMedicineBySlugZodSchema,
  getsingleMedicineByIdZodSchema,
  deleteMedicineZodSchema
};

// src/modules/medicine/medicine.routes.ts
var router3 = Router3();
router3.get("/", MedicineController.getAllMedicines);
router3.get(
  "/my-medicines",
  auth_default(UserRole.SELLER),
  MedicineController.getMyMedicines
);
router3.get("/manufacturers", MedicineController.getAllManufacturers);
router3.get(
  "/:id",
  validateRequest(MedicineValidation.getsingleMedicineByIdZodSchema),
  MedicineController.getMedicineById
);
router3.get(
  "/slug/:slug",
  validateRequest(MedicineValidation.getSingleMedicineBySlugZodSchema),
  MedicineController.getMedicineBySlug
);
router3.post(
  "/",
  auth_default(UserRole.SELLER),
  validateRequest(MedicineValidation.createMedicineZodSchema),
  MedicineController.createMedicine
);
router3.patch(
  "/:id",
  auth_default(UserRole.SELLER),
  validateRequest(MedicineValidation.updateMedicineZodSchema),
  MedicineController.updateMedicine
);
router3.delete(
  "/:id",
  auth_default(UserRole.SELLER),
  validateRequest(MedicineValidation.deleteMedicineZodSchema),
  MedicineController.deleteMedicineSoft
);
var MedicineRoutes = router3;

// src/modules/user/user.routes.ts
import { Router as Router4 } from "express";

// src/modules/user/user.service.ts
var getAllUsers = async (query) => {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query);
  const { role, accountStatus, search } = query;
  const whereConditions = {};
  if (role && Object.values(UserRole).includes(role)) {
    whereConditions.role = role;
  }
  if (accountStatus && Object.values(AccountStatus).includes(accountStatus)) {
    whereConditions.accountStatus = accountStatus;
  }
  if (search) {
    whereConditions.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        email: {
          contains: search,
          mode: "insensitive"
        }
      }
    ];
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        image: true,
        phoneNumber: true,
        emailVerified: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.user.count({
      where: whereConditions
    })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: users
  };
};
var getUserById = async (id) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  });
  return user;
};
var updateUserAccountStatus = async (id, accountStatus) => {
  return await prisma.user.update({
    where: { id },
    data: { accountStatus }
  });
};
var updateProfile = async (userId, payload) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      image: payload.image
    }
  });
  return updatedUser;
};
var UserService = {
  getAllUsers,
  getUserById,
  updateUserAccountStatus,
  updateProfile
};

// src/modules/user/user.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers(req.query);
    res.json({
      success: true,
      message: result.data.length > 0 ? "Users retrieved successfully" : "No users found",
      meta: result.meta,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var updateUserAccountStatus2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;
    const requestingUserId = req.user?.id;
    if (id === requestingUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot update your own account status",
        data: null
      });
    }
    const user = await UserService.getUserById(id);
    if (user.accountStatus === accountStatus) {
      return res.status(400).json({
        success: false,
        message: `User account is already in ${accountStatus} status`,
        data: null
      });
    }
    const updatedUser = await UserService.updateUserAccountStatus(
      id,
      accountStatus
    );
    res.json({
      success: true,
      message: "User account status updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
var updateProfile2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updatedUser = await UserService.updateProfile(userId, req.body);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
var UserController = {
  getAllUsers: getAllUsers2,
  updateUserAccountStatus: updateUserAccountStatus2,
  updateProfile: updateProfile2
};

// src/modules/user/user.validation.ts
import { z as z3 } from "zod";
var updateUserAccountStatusZodSchema = z3.object({
  body: z3.object({
    accountStatus: z3.nativeEnum(AccountStatus, {
      error: `Invalid account status. Account Status must be one of ${Object.values(AccountStatus).join(", ")} `
    })
  }),
  params: z3.object({
    id: z3.string().min(1, "User ID is required")
  })
});
var updateProfileZodSchema = z3.object({
  body: z3.object({
    name: z3.string().min(2).optional(),
    phoneNumber: z3.string().optional(),
    image: z3.string().url().optional()
  })
});
var UserValidation = {
  updateUserAccountStatusZodSchema,
  updateProfileZodSchema
};

// src/modules/user/user.routes.ts
var router4 = Router4();
router4.get("/", auth_default(UserRole.ADMIN), UserController.getAllUsers);
router4.patch(
  "/:id/account-status",
  auth_default(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserAccountStatusZodSchema),
  UserController.updateUserAccountStatus
);
router4.patch(
  "/profile",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(UserValidation.updateProfileZodSchema),
  UserController.updateProfile
);
var UserRoutes = router4;

// src/modules/order/order.routes.ts
import { Router as Router5 } from "express";

// src/modules/order/order.service.ts
var generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};
var createOrder = async (customerId, payload) => {
  const { shippingAddressSnapshot, customerNote, items } = payload;
  return prisma.$transaction(async (tx) => {
    const medicineIds = items.map((i) => i.medicineId);
    const uniqueMedicineIds = new Set(medicineIds);
    if (uniqueMedicineIds.size !== medicineIds.length) {
      throw new Error("Duplicate medicines are not allowed in order", {
        cause: {
          name: "DuplicateMedicineError",
          message: "Order contains duplicate medicine IDs"
        }
      });
    }
    const medicines = await tx.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isActive: true
      },
      include: {
        images: true
      }
    });
    const medicineMap = new Map(
      medicines.map((medicine) => [medicine.id, medicine])
    );
    if (medicines.length !== medicineIds.length) {
      throw new Error("Some medicines are invalid or inactive");
    }
    for (const item of items) {
      const medicine = medicineMap.get(item.medicineId);
      if (medicine.stockQuantity < item.quantity) {
        throw new Error(`${medicine.name} out of stock`, {
          cause: {
            name: "InsufficientStockError",
            message: `${medicine.name} has only ${medicine.stockQuantity} items left in stock`,
            medicineId: medicine.id,
            requestedQuantity: item.quantity,
            availableStock: medicine.stockQuantity
          }
        });
      }
    }
    const grouped = {};
    for (const item of items) {
      const medicine = medicineMap.get(item.medicineId);
      if (!grouped[medicine.sellerId]) {
        grouped[medicine.sellerId] = [];
      }
      grouped[medicine.sellerId].push({
        medicine,
        quantity: item.quantity
      });
    }
    let subtotal = 0;
    Object.values(grouped).forEach((list) => {
      list.forEach(({ medicine, quantity }) => {
        const price = Number(medicine.discountPrice ?? medicine.price);
        subtotal += price * quantity;
      });
    });
    const deliveryFee = calculateDeliveryFee(subtotal);
    const totalAmount = subtotal + deliveryFee;
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        shippingAddressSnapshot,
        customerNote: customerNote ?? null,
        subtotalAmount: new prismaNamespace_exports.Decimal(subtotal),
        deliveryFee: new prismaNamespace_exports.Decimal(deliveryFee),
        discountAmount: new prismaNamespace_exports.Decimal(0),
        totalAmount: new prismaNamespace_exports.Decimal(totalAmount)
      }
    });
    for (const sellerId in grouped) {
      const sellerItems = grouped[sellerId];
      let vendorSubtotal = 0;
      sellerItems.forEach(({ medicine, quantity }) => {
        const price = Number(medicine.discountPrice ?? medicine.price);
        vendorSubtotal += price * quantity;
      });
      const vendorOrder = await tx.vendorOrder.create({
        data: {
          orderId: order.id,
          sellerId,
          vendorSubtotal: new prismaNamespace_exports.Decimal(vendorSubtotal)
        }
      });
      for (const item of sellerItems) {
        const medicine = item.medicine;
        const unitPrice = Number(medicine.discountPrice ?? medicine.price);
        const primaryImage = medicine.images.find(
          (img) => img.isPrimary
        );
        await tx.orderItem.create({
          data: {
            vendorOrderId: vendorOrder.id,
            medicineId: medicine.id,
            medicineNameSnapshot: medicine.name,
            medicineImageSnapshot: primaryImage?.imageUrl || null,
            quantity: item.quantity,
            unitPrice: new prismaNamespace_exports.Decimal(unitPrice),
            totalPrice: new prismaNamespace_exports.Decimal(unitPrice * item.quantity)
          }
        });
        await tx.medicine.update({
          where: { id: medicine.id },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }
    }
    await tx.cartItem.deleteMany({
      where: {
        userId: customerId,
        medicineId: { in: medicineIds }
      }
    });
    return tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        vendorOrders: {
          include: {
            orderItems: true,
            seller: true
          }
        }
      }
    });
  });
};
var getMyOrders = async (customerId) => {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      vendorOrders: {
        include: {
          orderItems: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var getSellerVendorOrders = async (sellerId, metadata) => {
  const { page, limit, skip } = metadata;
  const orders = await prisma.vendorOrder.findMany({
    where: { sellerId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          placedAt: true,
          shippingAddressSnapshot: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      },
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                where: { isPrimary: true },
                select: { imageUrl: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip
  });
  const total = await prisma.vendorOrder.count({
    where: { sellerId }
  });
  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1
  };
  return { orders, meta };
};
var getOrderById = async (orderId, user) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      vendorOrders: {
        include: {
          orderItems: true,
          seller: true
        }
      }
    }
  });
  if (user.role === "CUSTOMER" && order.customerId !== user.id) {
    throw new Error("You are not allowed to access this order");
  }
  if (user.role === "SELLER") {
    const hasVendorOrder = order.vendorOrders.some(
      (v) => v.sellerId === user.id
    );
    if (!hasVendorOrder) {
      throw new Error("You are not allowed to access this order", {
        cause: {
          name: "UnauthorizedAccessError",
          message: `Seller with ID ${user.id} attempted to access order ${orderId} without authorization`,
          orderId,
          sellerId: user.id
        }
      });
    }
  }
  return order;
};
var getOrderByOrderNumber = async (orderNumber, user) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { orderNumber },
    include: {
      vendorOrders: {
        include: {
          orderItems: true,
          seller: true
        }
      }
    }
  });
  if (user.role === "CUSTOMER" && order.customerId !== user.id) {
    throw new Error("You are not allowed to access this order");
  }
  if (user.role === "SELLER") {
    const hasVendorOrder = order.vendorOrders.some(
      (v) => v.sellerId === user.id
    );
    if (!hasVendorOrder) {
      throw new Error("You are not allowed to access this order", {
        cause: {
          name: "UnauthorizedAccessError",
          message: `Seller with ID ${user.id} attempted to access order ${orderNumber} without authorization`,
          orderNumber,
          sellerId: user.id
        }
      });
    }
  }
  return order;
};
var updateOrderStatus = async (orderId, sellerId, newStatus) => {
  const vendorOrder = await prisma.vendorOrder.findFirstOrThrow({
    where: {
      orderId,
      sellerId
    }
  });
  if (vendorOrder.orderStatus === newStatus) {
    throw new Error(
      `Order is already in ${newStatus} status. No update needed.`,
      {
        cause: {
          name: "SameStatusUpdateError",
          message: `Attempted to update order status to the same status: ${newStatus}`,
          orderId
        }
      }
    );
  }
  const validTransitions = {
    [OrderStatus.PLACED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: []
  };
  if (!validTransitions[vendorOrder.orderStatus].includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${vendorOrder.orderStatus} to ${newStatus}`,
      {
        cause: {
          name: "InvalidStatusTransitionError",
          message: `Cannot transition order status from ${vendorOrder.orderStatus} to ${newStatus}`,
          orderId,
          currentStatus: vendorOrder.orderStatus
        }
      }
    );
  }
  await prisma.$transaction(async (tx) => {
    await tx.vendorOrder.update({
      where: { id: vendorOrder.id },
      data: { orderStatus: newStatus }
    });
    if (newStatus === OrderStatus.DELIVERED || newStatus === OrderStatus.CANCELLED) {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: newStatus === OrderStatus.DELIVERED ? PaymentStatus.PAID : PaymentStatus.REFUNDED
        }
      });
    }
  });
};
var cancelVendorOrder = async (vendorOrderId, customerId) => {
  const vendorOrder = await prisma.vendorOrder.findFirstOrThrow({
    where: { id: vendorOrderId },
    include: {
      order: {
        select: { customerId: true }
      }
    }
  });
  if (vendorOrder.order.customerId !== customerId) {
    throw new Error("You are not allowed to cancel this vendor order", {
      cause: {
        name: "UnauthorizedCancellationError",
        vendorOrderId
      }
    });
  }
  if (vendorOrder.orderStatus !== OrderStatus.PLACED) {
    throw new Error(
      "Vendor order can only be cancelled when in PLACED status",
      {
        cause: {
          name: "InvalidCancellationError",
          vendorOrderId,
          currentStatus: vendorOrder.orderStatus
        }
      }
    );
  }
  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { orderStatus: "CANCELLED" }
  });
  return prisma.vendorOrder.findUniqueOrThrow({
    where: { id: vendorOrderId },
    include: {
      orderItems: true,
      seller: {
        select: { id: true, name: true }
      }
    }
  });
};
var getAllOrders = async () => {
  return prisma.order.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true }
      },
      vendorOrders: {
        include: {
          orderItems: true,
          seller: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
};
var OrderService = {
  createOrder,
  getMyOrders,
  getSellerVendorOrders,
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  updateOrderStatus,
  cancelVendorOrder
};

// src/modules/order/order.controller.ts
var createOrder2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const order = await OrderService.createOrder(
      customerId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};
var getMyOrders2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const orders = await OrderService.getMyOrders(customerId);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
var getOrderById2 = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderService.getOrderById(orderId, req.user);
    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};
var getOrderByOrderNumber2 = async (req, res, next) => {
  try {
    const orderNumber = req.params.orderNumber;
    const order = await OrderService.getOrderByOrderNumber(
      orderNumber,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};
var updateOrderStatus2 = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const sellerId = req.user?.id;
    const newStatus = req.body.status;
    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      sellerId,
      newStatus
    );
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};
var getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const paginationParams = parsePaginationParams(req.query);
    const result = await OrderService.getSellerVendorOrders(
      sellerId,
      paginationParams
    );
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result.orders,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};
var cancelVendorOrder2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const vendorOrderId = req.params.vendorOrderId;
    const order = await OrderService.cancelVendorOrder(
      vendorOrderId,
      customerId
    );
    res.status(200).json({
      success: true,
      message: "Vendor order cancelled successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};
var getAllOrders2 = async (req, res, next) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
var orderController = {
  createOrder: createOrder2,
  getMyOrders: getMyOrders2,
  getSellerOrders,
  getAllOrders: getAllOrders2,
  getOrderById: getOrderById2,
  getOrderByOrderNumber: getOrderByOrderNumber2,
  updateOrderStatus: updateOrderStatus2,
  cancelVendorOrder: cancelVendorOrder2
};

// src/modules/order/order.validation.ts
import { z as z4 } from "zod";
var addressSnapshotSchema = z4.object({
  fullName: z4.string(),
  phoneNumber: z4.string(),
  division: z4.string(),
  district: z4.string(),
  area: z4.string(),
  streetAddress: z4.string(),
  postalCode: z4.string().optional(),
  addressLabel: z4.string().optional()
});
var createOrderZodSchema = z4.object({
  body: z4.object({
    shippingAddressSnapshot: addressSnapshotSchema,
    customerNote: z4.string().optional(),
    items: z4.array(
      z4.object({
        medicineId: z4.string().uuid("Invalid medicine identifier uuid format"),
        quantity: z4.number().int().positive()
      })
    ).min(1, "At least one item is required")
  })
});
var getOrderByIdZodSchema = z4.object({
  params: z4.object({
    orderId: z4.string().uuid("Invalid order identifier uuid format")
  })
});
var updateOrderStatusZodSchema = z4.object({
  params: z4.object({
    orderId: z4.string().uuid("Invalid order identifier uuid format")
  }),
  body: z4.object({
    status: z4.nativeEnum(OrderStatus, {
      error: `Status must be one of: ${Object.values(OrderStatus).join(", ")}`
    })
  })
});
var OrderValidation = {
  createOrderZodSchema,
  getOrderByIdZodSchema,
  updateOrderStatusZodSchema
};

// src/modules/order/order.routes.ts
var router5 = Router5();
router5.post(
  "/",
  auth_default(UserRole.CUSTOMER),
  validateRequest(OrderValidation.createOrderZodSchema),
  orderController.createOrder
);
router5.get("/my-orders", auth_default(UserRole.CUSTOMER), orderController.getMyOrders);
router5.get(
  "/seller-orders",
  auth_default(UserRole.SELLER),
  orderController.getSellerOrders
);
router5.get("/all-orders", auth_default(UserRole.ADMIN), orderController.getAllOrders);
router5.get(
  "/:orderId",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER),
  validateRequest(OrderValidation.getOrderByIdZodSchema),
  orderController.getOrderById
);
router5.get(
  "/order-number/:orderNumber",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  orderController.getOrderByOrderNumber
);
router5.patch(
  "/vendor-order/:vendorOrderId/cancel",
  auth_default(UserRole.CUSTOMER),
  orderController.cancelVendorOrder
);
router5.patch(
  "/:orderId/status",
  auth_default(UserRole.SELLER),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  orderController.updateOrderStatus
);
var orderRoutes = router5;

// src/modules/cart/cart.routes.ts
import { Router as Router6 } from "express";

// src/modules/cart/cart.service.ts
var addToCart = async (userId, payload) => {
  const { medicineId, quantity } = payload;
  const medicine = await prisma.medicine.findUniqueOrThrow({
    where: {
      id: medicineId,
      isActive: true
    }
  });
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId
      }
    }
  });
  const totalQuantity = (existingCartItem?.quantity || 0) + quantity;
  if (totalQuantity > medicine.stockQuantity) {
    throw new Error(`Only ${medicine.stockQuantity} items available in stock`, {
      cause: {
        name: "StockError",
        currentStock: medicine.stockQuantity,
        requestedQuantity: totalQuantity
      }
    });
  }
  if (existingCartItem) {
    return prisma.cartItem.update({
      where: {
        id: existingCartItem.id
      },
      data: {
        quantity: totalQuantity
      },
      include: {
        medicine: {
          include: {
            images: true,
            seller: true
          }
        }
      }
    });
  }
  return prisma.cartItem.create({
    data: {
      userId,
      medicineId,
      quantity
    },
    include: {
      medicine: {
        include: {
          images: true,
          seller: true
        }
      }
    }
  });
};
var getMyCart = async (userId) => {
  return prisma.cartItem.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      userId: true,
      medicineId: true,
      quantity: true,
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          slug: true,
          price: true,
          discountPrice: true,
          stockQuantity: true,
          images: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var mergeGuestCart = async (userId, items) => {
  return prisma.$transaction(async (tx) => {
    if (!items || items.length === 0) return null;
    for (const guestItem of items) {
      const { medicineId, quantity } = guestItem;
      const medicine = await tx.medicine.findUniqueOrThrow({
        where: {
          id: medicineId,
          isActive: true
        }
      });
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          userId_medicineId: {
            userId,
            medicineId
          }
        }
      });
      const totalQuantity = (existingCartItem?.quantity || 0) + quantity;
      if (totalQuantity > medicine.stockQuantity) {
        throw new Error(
          `Cannot merge: Only ${medicine.stockQuantity} items available for ${medicine.name}`,
          {
            cause: {
              name: "StockError",
              currentStock: medicine.stockQuantity,
              requestedQuantity: totalQuantity
            }
          }
        );
      }
      if (existingCartItem) {
        await tx.cartItem.update({
          where: {
            id: existingCartItem.id
          },
          data: {
            quantity: totalQuantity
          }
        });
      } else {
        await tx.cartItem.create({
          data: {
            userId,
            medicineId,
            quantity
          }
        });
      }
    }
    return null;
  });
};
var updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  const cartItem = await prisma.cartItem.findFirstOrThrow({
    where: {
      id: cartItemId,
      userId
    },
    include: {
      medicine: true
    }
  });
  if (quantity > cartItem.medicine.stockQuantity) {
    throw new Error(
      `Only ${cartItem.medicine.stockQuantity} items available in stock`,
      {
        cause: {
          name: "StockError",
          currentStock: cartItem.medicine.stockQuantity,
          requestedQuantity: quantity
        }
      }
    );
  }
  return prisma.cartItem.update({
    where: {
      id: cartItemId
    },
    data: {
      quantity
    },
    include: {
      medicine: {
        include: {
          images: true,
          seller: true
        }
      }
    }
  });
};
var getCartSummary = async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      medicine: {
        include: {
          images: true
        }
      }
    }
  });
  let subtotal = 0;
  let totalDiscount = 0;
  let totalItems = 0;
  const items = cartItems.map((item) => {
    const price = Number(item.medicine.price);
    const discountPrice = item.medicine.discountPrice ? Number(item.medicine.discountPrice) : price;
    const itemSubtotal = discountPrice * item.quantity;
    const originalSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    totalDiscount += originalSubtotal - itemSubtotal;
    totalItems += item.quantity;
    return {
      id: item.id,
      quantity: item.quantity,
      medicine: {
        id: item.medicine.id,
        name: item.medicine.name,
        price: item.medicine.price,
        discountPrice: item.medicine.discountPrice,
        images: item.medicine.images
      },
      subtotal: itemSubtotal
    };
  });
  return {
    items,
    totalItems,
    subtotal,
    totalDiscount,
    finalTotal: subtotal
  };
};
var removeCartItem = async (userId, cartItemId) => {
  await prisma.cartItem.findFirstOrThrow({
    where: {
      id: cartItemId,
      userId
    }
  });
  return prisma.cartItem.delete({
    where: {
      id: cartItemId
    }
  });
};
var clearCart = async (userId) => {
  return prisma.cartItem.deleteMany({
    where: {
      userId
    }
  });
};
var CartService = {
  addToCart,
  getMyCart,
  getCartSummary,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeGuestCart
};

// src/modules/cart/cart.controller.ts
var addToCart2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const cartItem = await CartService.addToCart(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};
var getMyCart2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const cartItems = await CartService.getMyCart(userId);
    res.json({
      success: true,
      message: cartItems.length > 0 ? "Cart retrieved successfully" : "Cart is empty",
      data: cartItems
    });
  } catch (error) {
    next(error);
  }
};
var getCartSummary2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const summary = await CartService.getCartSummary(userId);
    res.json({
      success: true,
      message: "Cart summary fetched successfully",
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
var mergeGuestCart2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { items } = req.body;
    const mergedCart = await CartService.mergeGuestCart(userId, items);
    res.json({
      success: true,
      message: "Guest cart merged successfully",
      data: mergedCart
    });
  } catch (error) {
    next(error);
  }
};
var updateCartItemQuantity2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { quantity } = req.body;
    const updatedCartItem = await CartService.updateCartItemQuantity(
      userId,
      req.params.id,
      quantity
    );
    res.json({
      success: true,
      message: "Cart item quantity updated successfully",
      data: updatedCartItem
    });
  } catch (error) {
    next(error);
  }
};
var removeCartItem2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await CartService.removeCartItem(userId, req.params.id);
    res.json({
      success: true,
      message: "Cart item removed successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var clearCart2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await CartService.clearCart(userId);
    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var CartController = {
  addToCart: addToCart2,
  getMyCart: getMyCart2,
  getCartSummary: getCartSummary2,
  updateCartItemQuantity: updateCartItemQuantity2,
  removeCartItem: removeCartItem2,
  clearCart: clearCart2,
  mergeGuestCart: mergeGuestCart2
};

// src/modules/cart/cart.validation.ts
import { z as z5 } from "zod";
var addToCartZodSchema = z5.object({
  body: z5.object({
    medicineId: z5.string().uuid("Invalid medicine ID format"),
    quantity: z5.number("Quantity must be a number").int("Quantity must be an integer")
  })
});
var updateCartItemQuantityZodSchema = z5.object({
  body: z5.object({
    quantity: z5.number("Quantity must be a number").int("Quantity must be an integer").positive("Quantity must be greater than 0")
  }),
  params: z5.object({
    id: z5.string().uuid("Invalid cart item ID format")
  })
});
var removeCartItemZodSchema = z5.object({
  params: z5.object({
    id: z5.string().uuid("Invalid cart item ID format")
  })
});
var mergeGuestCartZodSchema = z5.object({
  body: z5.object({
    items: z5.array(
      z5.object({
        medicineId: z5.string().uuid("Invalid medicine ID format"),
        quantity: z5.number("Quantity must be a number").int("Quantity must be an integer").positive("Quantity must be greater than 0")
      })
    )
  })
});
var CartValidation = {
  addToCartZodSchema,
  updateCartItemQuantityZodSchema,
  removeCartItemZodSchema,
  mergeGuestCartZodSchema
};

// src/modules/cart/cart.routes.ts
var router6 = Router6();
router6.post(
  "/",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.addToCartZodSchema),
  CartController.addToCart
);
router6.get(
  "/",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.getMyCart
);
router6.get(
  "/summary",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.getCartSummary
);
router6.post(
  "/merge",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.mergeGuestCartZodSchema),
  CartController.mergeGuestCart
);
router6.patch(
  "/:id",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.updateCartItemQuantityZodSchema),
  CartController.updateCartItemQuantity
);
router6.delete(
  "/:id",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.removeCartItemZodSchema),
  CartController.removeCartItem
);
router6.delete(
  "/",
  auth_default(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.clearCart
);
var CartRoutes = router6;

// src/modules/address/address.routes.ts
import { Router as Router7 } from "express";

// src/modules/address/address.service.ts
var createAddress = async (userId, payload) => {
  const { isDefault, ...data } = payload;
  return prisma.$transaction(async (tx) => {
    const existingAddressCount = await tx.address.count({
      where: { userId }
    });
    const shouldBeDefault = isDefault || existingAddressCount === 0;
    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }
    return tx.address.create({
      data: {
        userId,
        ...data,
        isDefault: shouldBeDefault
      }
    });
  });
};
var getMyAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};
var getAddressById = async (userId, addressId) => {
  return prisma.address.findFirstOrThrow({
    where: { id: addressId, userId }
  });
};
var updateAddress = async (userId, addressId, payload) => {
  const { isDefault, ...data } = payload;
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirstOrThrow({
      where: { id: addressId, userId }
    });
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }
    return tx.address.update({
      where: { id: address.id },
      data: {
        ...data,
        ...isDefault !== void 0 && { isDefault }
      }
    });
  });
};
var deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirstOrThrow({
    where: { id: addressId, userId }
  });
  await prisma.address.delete({
    where: { id: addressId }
  });
  if (address.isDefault) {
    const anotherAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" }
    });
    if (anotherAddress) {
      await prisma.address.update({
        where: { id: anotherAddress.id },
        data: { isDefault: true }
      });
    }
  }
  return null;
};
var setDefaultAddress = async (userId, addressId) => {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirstOrThrow({
      where: {
        id: addressId,
        userId
      }
    });
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
    return tx.address.update({
      where: { id: address.id },
      data: { isDefault: true }
    });
  });
};
var AddressService = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};

// src/modules/address/address.controller.ts
var createAddress2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await AddressService.createAddress(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMyAddresses2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await AddressService.getMyAddresses(userId);
    res.json({
      success: true,
      message: "Addresses fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAddressById2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.id;
    const result = await AddressService.getAddressById(userId, addressId);
    res.json({
      success: true,
      message: "Address details fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateAddress2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await AddressService.updateAddress(
      userId,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: "Address updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteAddress2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await AddressService.deleteAddress(userId, req.params.id);
    res.json({
      success: true,
      message: "Address deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var setDefaultAddress2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await AddressService.setDefaultAddress(
      userId,
      req.params.id
    );
    res.json({
      success: true,
      message: "Default address updated",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var AddressController = {
  createAddress: createAddress2,
  getMyAddresses: getMyAddresses2,
  getAddressById: getAddressById2,
  updateAddress: updateAddress2,
  deleteAddress: deleteAddress2,
  setDefaultAddress: setDefaultAddress2
};

// src/modules/address/address.validation.ts
import { z as z6 } from "zod";
var createAddressZodSchema = z6.object({
  body: z6.object({
    fullName: z6.string(),
    phoneNumber: z6.string(),
    division: z6.string(),
    district: z6.string(),
    area: z6.string(),
    streetAddress: z6.string(),
    postalCode: z6.string().optional(),
    addressLabel: z6.string().optional(),
    isDefault: z6.boolean().optional()
  })
});
var updateAddressZodSchema = z6.object({
  body: z6.object({
    fullName: z6.string().optional(),
    phoneNumber: z6.string().optional(),
    division: z6.string().optional(),
    district: z6.string().optional(),
    area: z6.string().optional(),
    streetAddress: z6.string().optional(),
    postalCode: z6.string().optional(),
    addressLabel: z6.string().optional(),
    isDefault: z6.boolean().optional()
  }),
  params: z6.object({
    id: z6.string().uuid()
  })
});
var addressIdZodSchema = z6.object({
  params: z6.object({
    id: z6.string().uuid()
  })
});
var AddressValidation = {
  createAddressZodSchema,
  updateAddressZodSchema,
  addressIdZodSchema
};

// src/modules/address/address.routes.ts
var router7 = Router7();
router7.post(
  "/",
  auth_default(UserRole.CUSTOMER),
  validateRequest(AddressValidation.createAddressZodSchema),
  AddressController.createAddress
);
router7.get("/", auth_default(UserRole.CUSTOMER), AddressController.getMyAddresses);
router7.get(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(AddressValidation.addressIdZodSchema),
  AddressController.getAddressById
);
router7.patch(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(AddressValidation.updateAddressZodSchema),
  AddressController.updateAddress
);
router7.delete(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(AddressValidation.addressIdZodSchema),
  AddressController.deleteAddress
);
router7.patch(
  "/:id/default",
  auth_default(UserRole.CUSTOMER),
  validateRequest(AddressValidation.addressIdZodSchema),
  AddressController.setDefaultAddress
);
var AddressRoutes = router7;

// src/middlewares/notFound.ts
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    description: `The route ${req.originalUrl} does not exist on this server.`,
    path: req.originalUrl,
    date: (/* @__PURE__ */ new Date()).toDateString()
  });
}

// src/modules/review/review.routes.ts
import { Router as Router8 } from "express";

// src/modules/review/review.service.ts
var recalcMedicineRating = async (tx, medicineId) => {
  const stats = await tx.review.aggregate({
    where: { medicineId, isActive: true },
    _avg: { rating: true },
    _count: { rating: true }
  });
  await tx.medicine.update({
    where: { id: medicineId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating
    }
  });
};
var createReview = async (customerId, payload) => {
  return prisma.$transaction(async (tx) => {
    const hasPurchased = await tx.orderItem.findFirst({
      where: {
        medicineId: payload.medicineId,
        vendorOrder: {
          order: {
            customerId
          }
        }
      }
    });
    if (!hasPurchased) {
      throw new Error("You can only review purchased medicines", {
        cause: {
          name: "UnauthorizedReviewError",
          medicineId: payload.medicineId
        }
      });
    }
    const existing = await tx.review.findUnique({
      where: {
        customerId_medicineId: {
          customerId,
          medicineId: payload.medicineId
        }
      }
    });
    if (existing) {
      throw new Error("You have already reviewed this medicine", {
        cause: {
          name: "DuplicateReviewError",
          medicineId: payload.medicineId
        }
      });
    }
    const review = await tx.review.create({
      data: {
        customerId,
        ...payload
      }
    });
    await recalcMedicineRating(tx, payload.medicineId);
    return review;
  });
};
var getMedicineReviews = async (medicineId) => {
  return prisma.review.findMany({
    where: { medicineId, isActive: true },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var updateReview = async (customerId, reviewId, payload) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.findFirstOrThrow({
      where: { id: reviewId, customerId }
    });
    const updated = await tx.review.update({
      where: { id: review.id },
      data: payload
    });
    await recalcMedicineRating(tx, review.medicineId);
    return updated;
  });
};
var deleteReview = async (customerId, reviewId) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.findFirstOrThrow({
      where: { id: reviewId, customerId }
    });
    await tx.review.delete({
      where: { id: review.id }
    });
    await recalcMedicineRating(tx, review.medicineId);
    return true;
  });
};
var getAllReviews = async () => {
  return prisma.review.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      medicine: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });
};
var toggleReviewStatus = async (reviewId, isActive) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.findUniqueOrThrow({
      where: { id: reviewId }
    });
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { isActive }
    });
    await recalcMedicineRating(tx, review.medicineId);
    return updated;
  });
};
var addReviewReply = async (reviewId, reply) => {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      reply,
      repliedAt: /* @__PURE__ */ new Date()
    }
  });
};
var ReviewService = {
  createReview,
  getMedicineReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewStatus,
  addReviewReply
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const result = await ReviewService.createReview(customerId, req.body);
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMedicineReviews2 = async (req, res, next) => {
  try {
    const result = await ReviewService.getMedicineReviews(
      req.params.medicineId
    );
    res.json({
      success: true,
      message: "Reviews fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateReview2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const result = await ReviewService.updateReview(
      customerId,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: "Review updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteReview2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    await ReviewService.deleteReview(customerId, req.params.id);
    res.json({
      success: true,
      message: "Review deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var getAllReviews2 = async (req, res, next) => {
  try {
    const result = await ReviewService.getAllReviews();
    res.json({
      success: true,
      message: "All reviews fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var toggleReviewStatus2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const result = await ReviewService.toggleReviewStatus(
      id,
      isActive
    );
    res.json({
      success: true,
      message: `Review ${isActive ? "activated" : "deactivated"} successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const result = await ReviewService.addReviewReply(id, reply);
    res.json({
      success: true,
      message: "Reply added successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var ReviewController = {
  createReview: createReview2,
  getMedicineReviews: getMedicineReviews2,
  updateReview: updateReview2,
  deleteReview: deleteReview2,
  getAllReviews: getAllReviews2,
  toggleReviewStatus: toggleReviewStatus2,
  addReply
};

// src/modules/review/review.validation.ts
import { z as z7 } from "zod";
var createReviewZodSchema = z7.object({
  body: z7.object({
    medicineId: z7.string().uuid(),
    rating: z7.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z7.string().max(500).optional()
  })
});
var updateReviewZodSchema = z7.object({
  body: z7.object({
    rating: z7.number().int().min(1).max(5).optional(),
    comment: z7.string().max(500).optional()
  }),
  params: z7.object({
    id: z7.string().uuid()
  })
});
var reviewIdZodSchema = z7.object({
  params: z7.object({
    id: z7.string().uuid()
  })
});
var ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
  reviewIdZodSchema
};

// src/modules/review/review.routes.ts
var router8 = Router8();
router8.post(
  "/",
  auth_default(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);
router8.get("/medicine/:medicineId", ReviewController.getMedicineReviews);
router8.get("/all", auth_default(UserRole.ADMIN), ReviewController.getAllReviews);
router8.patch(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
);
router8.delete(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.reviewIdZodSchema),
  ReviewController.deleteReview
);
router8.patch(
  "/:id/status",
  auth_default(UserRole.ADMIN),
  ReviewController.toggleReviewStatus
);
router8.patch("/:id/reply", auth_default(UserRole.ADMIN), ReviewController.addReply);
var ReviewRoutes = router8;

// src/modules/wishlist/wishlist.routes.ts
import { Router as Router9 } from "express";

// src/modules/wishlist/wishlist.service.ts
var toggleWishlist = async (userId, medicineId) => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId
      }
    }
  });
  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id }
    });
    return { added: false };
  }
  await prisma.wishlist.create({
    data: { userId, medicineId }
  });
  return { added: true };
};
var getMyWishlist = async (userId) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      medicine: {
        include: {
          images: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return items;
};
var isWishlisted = async (userId, medicineId) => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId
      }
    }
  });
  return !!existing;
};
var removeFromWishlist = async (userId, wishlistId) => {
  const item = await prisma.wishlist.findFirstOrThrow({
    where: { id: wishlistId, userId }
  });
  await prisma.wishlist.delete({
    where: { id: item.id }
  });
  return { removed: true };
};
var WishlistService = {
  toggleWishlist,
  getMyWishlist,
  isWishlisted,
  removeFromWishlist
};

// src/modules/wishlist/wishlist.controller.ts
var toggleWishlist2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { medicineId } = req.body;
    const result = await WishlistService.toggleWishlist(userId, medicineId);
    res.status(200).json({
      success: true,
      message: result.added ? "Added to wishlist" : "Removed from wishlist",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMyWishlist2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const items = await WishlistService.getMyWishlist(userId);
    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: items
    });
  } catch (error) {
    next(error);
  }
};
var isWishlisted2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const medicineId = req.params.medicineId;
    const wishlisted = await WishlistService.isWishlisted(userId, medicineId);
    res.status(200).json({
      success: true,
      data: { wishlisted }
    });
  } catch (error) {
    next(error);
  }
};
var removeFromWishlist2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const wishlistId = req.params.id;
    await WishlistService.removeFromWishlist(userId, wishlistId);
    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
var WishlistController = {
  toggleWishlist: toggleWishlist2,
  getMyWishlist: getMyWishlist2,
  isWishlisted: isWishlisted2,
  removeFromWishlist: removeFromWishlist2
};

// src/modules/wishlist/wishlist.validation.ts
import { z as z8 } from "zod";
var toggleWishlistZodSchema = z8.object({
  body: z8.object({
    medicineId: z8.string().uuid("Invalid medicine ID format")
  })
});
var wishlistIdZodSchema = z8.object({
  params: z8.object({
    id: z8.string().uuid()
  })
});
var WishlistValidation = {
  toggleWishlistZodSchema,
  wishlistIdZodSchema
};

// src/modules/wishlist/wishlist.routes.ts
var router9 = Router9();
router9.get("/", auth_default(UserRole.CUSTOMER), WishlistController.getMyWishlist);
router9.post(
  "/",
  auth_default(UserRole.CUSTOMER),
  validateRequest(WishlistValidation.toggleWishlistZodSchema),
  WishlistController.toggleWishlist
);
router9.delete(
  "/:id",
  auth_default(UserRole.CUSTOMER),
  validateRequest(WishlistValidation.wishlistIdZodSchema),
  WishlistController.removeFromWishlist
);
router9.get(
  "/check/:medicineId",
  auth_default(UserRole.CUSTOMER),
  WishlistController.isWishlisted
);
var WishlistRoutes = router9;

// src/modules/dashboard/dashboard.routes.ts
import { Router as Router10 } from "express";

// src/modules/dashboard/dashboard.service.ts
var getCustomerDashboard = async (customerId) => {
  const [orders, addresses, cartSummary] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: {
        vendorOrders: {
          include: {
            orderItems: {
              include: {
                medicine: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    images: {
                      take: 1,
                      where: { isPrimary: true },
                      select: { imageUrl: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.address.findMany({
      where: { userId: customerId },
      orderBy: { isDefault: "desc" }
    }),
    prisma.cartItem.aggregate({
      where: { userId: customerId },
      _sum: { quantity: true }
    })
  ]);
  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.vendorOrders.some(
      (vo) => vo.orderStatus !== "DELIVERED" && vo.orderStatus !== "CANCELLED"
    )
  ).length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalSavings = orders.reduce((sum, o) => {
    const orderSavings = o.vendorOrders.reduce((vendorSum, vo) => {
      const itemSavings = vo.orderItems.reduce((itemSum, item) => {
        const medicinePrice = item.medicine?.price ? Number(item.medicine.price) : Number(item.unitPrice);
        const discountPrice = item.medicine?.discountPrice ? Number(item.medicine.discountPrice) : Number(item.unitPrice);
        return itemSum + (medicinePrice - discountPrice) * item.quantity;
      }, 0);
      return vendorSum + itemSavings;
    }, 0);
    return sum + orderSavings;
  }, 0);
  const recentMedicineIds = /* @__PURE__ */ new Set();
  const quickReorder = [];
  for (const order of orders) {
    for (const vendor of order.vendorOrders) {
      for (const item of vendor.orderItems) {
        if (item.medicine && !recentMedicineIds.has(item.medicine.id) && quickReorder.length < 6) {
          recentMedicineIds.add(item.medicine.id);
          quickReorder.push({
            id: item.medicine.id,
            name: item.medicine.name,
            slug: item.medicine.slug,
            price: Number(item.medicine.price),
            discountPrice: item.medicine.discountPrice ? Number(item.medicine.discountPrice) : null,
            image: item.medicine.images?.[0]?.imageUrl || null
          });
        }
      }
    }
  }
  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    subtotalAmount: Number(order.subtotalAmount),
    deliveryFee: Number(order.deliveryFee),
    paymentStatus: order.paymentStatus,
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    vendorOrders: order.vendorOrders.map((vo) => ({
      id: vo.id,
      sellerId: vo.sellerId,
      orderStatus: vo.orderStatus,
      vendorSubtotal: Number(vo.vendorSubtotal),
      orderItems: vo.orderItems.map((oi) => ({
        id: oi.id,
        medicineId: oi.medicineId,
        medicineNameSnapshot: oi.medicineNameSnapshot,
        medicineImageSnapshot: oi.medicineImageSnapshot,
        quantity: oi.quantity,
        unitPrice: Number(oi.unitPrice),
        totalPrice: Number(oi.totalPrice)
      }))
    }))
  }));
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  return {
    stats: {
      totalOrders,
      activeOrders,
      totalSpent,
      totalSavings,
      savedAddresses: addresses.length,
      cartItemCount: cartSummary._sum.quantity || 0
    },
    recentOrders,
    quickReorder,
    defaultAddress: defaultAddress ? {
      id: defaultAddress.id,
      fullName: defaultAddress.fullName,
      phoneNumber: defaultAddress.phoneNumber,
      division: defaultAddress.division,
      district: defaultAddress.district,
      area: defaultAddress.area,
      streetAddress: defaultAddress.streetAddress,
      addressLabel: defaultAddress.addressLabel,
      isDefault: defaultAddress.isDefault
    } : null
  };
};
var getSellerDashboard = async (sellerId) => {
  const [shop, medicines, vendorOrders] = await Promise.all([
    prisma.shop.findUnique({ where: { sellerId } }),
    prisma.medicine.findMany({
      where: { sellerId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        stockQuantity: true,
        totalSalesCount: true,
        isActive: true,
        _count: { select: { orderItems: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.vendorOrder.findMany({
      where: { sellerId },
      include: {
        order: { select: { orderNumber: true, createdAt: true } },
        orderItems: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);
  const totalMedicines = medicines.length;
  const totalOrders = vendorOrders.length;
  const pendingOrders = vendorOrders.filter(
    (v) => v.orderStatus !== "DELIVERED" && v.orderStatus !== "CANCELLED"
  ).length;
  const totalRevenue = vendorOrders.filter((v) => v.orderStatus === "DELIVERED").reduce((sum, v) => sum + Number(v.vendorSubtotal), 0);
  const recentOrders = vendorOrders.slice(0, 5).map((vo) => ({
    id: vo.id,
    orderId: vo.orderId,
    orderNumber: vo.order.orderNumber,
    orderStatus: vo.orderStatus,
    vendorSubtotal: Number(vo.vendorSubtotal),
    itemCount: vo.orderItems.length,
    createdAt: vo.createdAt
  }));
  return {
    shop: shop ? {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      logo: shop.logo,
      description: shop.description
    } : null,
    stats: {
      totalMedicines,
      totalOrders,
      pendingOrders,
      totalRevenue
    },
    recentOrders
  };
};
var getAdminDashboard = async () => {
  const [
    totalUsers,
    totalSellers,
    totalMedicines,
    totalOrders,
    totalRevenue,
    recentOrders
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.medicine.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.vendorOrder.aggregate({
      where: { orderStatus: "DELIVERED" },
      _sum: { vendorSubtotal: true }
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        placedAt: true,
        customer: { select: { name: true, email: true } }
      }
    })
  ]);
  return {
    stats: {
      totalUsers,
      totalSellers,
      totalMedicines,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.vendorSubtotal || 0)
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      placedAt: o.placedAt,
      customerName: o.customer.name,
      customerEmail: o.customer.email
    }))
  };
};
var DashboardService = {
  getCustomerDashboard,
  getSellerDashboard,
  getAdminDashboard
};

// src/modules/dashboard/dashboard.controller.ts
var getCustomerDashboard2 = async (req, res, next) => {
  try {
    const customerId = req.user?.id;
    const dashboard = await DashboardService.getCustomerDashboard(customerId);
    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};
var getSellerDashboard2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const dashboard = await DashboardService.getSellerDashboard(sellerId);
    res.status(200).json({
      success: true,
      message: "Seller dashboard data retrieved successfully",
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};
var getAdminDashboard2 = async (req, res, next) => {
  try {
    const dashboard = await DashboardService.getAdminDashboard();
    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};
var DashboardController = {
  getCustomerDashboard: getCustomerDashboard2,
  getSellerDashboard: getSellerDashboard2,
  getAdminDashboard: getAdminDashboard2
};

// src/modules/dashboard/dashboard.routes.ts
var router10 = Router10();
router10.get(
  "/customer",
  auth_default(UserRole.CUSTOMER),
  DashboardController.getCustomerDashboard
);
router10.get(
  "/seller",
  auth_default(UserRole.SELLER),
  DashboardController.getSellerDashboard
);
router10.get(
  "/admin",
  auth_default(UserRole.ADMIN),
  DashboardController.getAdminDashboard
);
var DashboardRoutes = router10;

// src/modules/shop/shop.routes.ts
import { Router as Router11 } from "express";

// src/modules/shop/shop.service.ts
var createShop = async (sellerId, payload) => {
  const { name, description, logo, banner } = payload;
  const slug = generateSlug(name);
  const existing = await prisma.shop.findUnique({
    where: { sellerId }
  });
  if (existing) {
    throw new Error("You already have a shop", {
      cause: {
        name: "ShopExistsError",
        message: `Seller ${sellerId} already has a shop named "${existing.name}"`
      }
    });
  }
  return prisma.shop.create({
    data: {
      sellerId,
      name,
      slug,
      description,
      logo,
      banner
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
};
var getMyShop = async (sellerId) => {
  const shop = await prisma.shop.findUnique({
    where: { sellerId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
  if (!shop) {
    throw new Error("You haven't created a shop yet");
  }
  return shop;
};
var getShopBySlug = async (slug) => {
  const shop = await prisma.shop.findUniqueOrThrow({
    where: { slug, isActive: true },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  });
  return shop;
};
var updateShop = async (sellerId, payload) => {
  const { name, ...data } = payload;
  const updateData = { ...data };
  if (name) {
    updateData.name = name;
    updateData.slug = generateSlug(name);
  }
  return prisma.shop.update({
    where: { sellerId },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
};
var ShopService = {
  createShop,
  getMyShop,
  getShopBySlug,
  updateShop
};

// src/modules/shop/shop.controller.ts
var createShop2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const shop = await ShopService.createShop(sellerId, req.body);
    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop
    });
  } catch (error) {
    next(error);
  }
};
var getMyShop2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const shop = await ShopService.getMyShop(sellerId);
    res.status(200).json({
      success: true,
      message: "Shop retrieved successfully",
      data: shop
    });
  } catch (error) {
    next(error);
  }
};
var getShopBySlug2 = async (req, res, next) => {
  try {
    const shop = await ShopService.getShopBySlug(req.params.slug);
    res.status(200).json({
      success: true,
      message: "Shop retrieved successfully",
      data: shop
    });
  } catch (error) {
    next(error);
  }
};
var updateShop2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const shop = await ShopService.updateShop(sellerId, req.body);
    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: shop
    });
  } catch (error) {
    next(error);
  }
};
var ShopController = {
  createShop: createShop2,
  getMyShop: getMyShop2,
  getShopBySlug: getShopBySlug2,
  updateShop: updateShop2
};

// src/modules/shop/shop.validation.ts
import { z as z9 } from "zod";
var createShopZodSchema = z9.object({
  body: z9.object({
    name: z9.string({ error: "Shop name is required" }).min(2).max(100),
    description: z9.string().max(500).optional(),
    logo: z9.string().url().optional(),
    banner: z9.string().url().optional()
  })
});
var updateShopZodSchema = z9.object({
  body: z9.object({
    name: z9.string().min(2).max(100).optional(),
    description: z9.string().max(500).optional(),
    logo: z9.string().url().optional(),
    banner: z9.string().url().optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  })
});
var getShopBySlugZodSchema = z9.object({
  params: z9.object({
    slug: z9.string()
  })
});
var ShopValidation = {
  createShopZodSchema,
  updateShopZodSchema,
  getShopBySlugZodSchema
};

// src/modules/shop/shop.routes.ts
var router11 = Router11();
router11.get("/my-shop", auth_default(UserRole.SELLER), ShopController.getMyShop);
router11.get(
  "/:slug",
  validateRequest(ShopValidation.getShopBySlugZodSchema),
  ShopController.getShopBySlug
);
router11.post(
  "/",
  auth_default(UserRole.SELLER),
  validateRequest(ShopValidation.createShopZodSchema),
  ShopController.createShop
);
router11.patch(
  "/",
  auth_default(UserRole.SELLER),
  validateRequest(ShopValidation.updateShopZodSchema),
  ShopController.updateShop
);
var ShopRoutes = router11;

// src/middlewares/botBlock.ts
var botPatterns = [
  "Bytespider",
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Amazonbot",
  "Applebot-Extended",
  "FacebookBot",
  "Meta-ExternalAgent",
  "DataForSeoBot",
  "Scrapy",
  "Semrush",
  "Ahrefs",
  "MJ12bot",
  "DotBot",
  "SeekportBot",
  "Sogou",
  "Exabot",
  "Nutch",
  "Baiduspider",
  "YandexBot",
  "bingbot",
  "MicrosoftPreview",
  "msnbot",
  "MicrosoftBingPreview",
  "MicrosoftBingbot",
  "Bingbot",
  "BingPreview"
];
var suspiciousPatterns = [
  "\\.php",
  "\\.asp",
  "\\.cgi",
  "\\.pl",
  "\\.py",
  "wp-admin",
  "wp-login",
  "xmlrpc",
  "wp-content",
  "wp-includes",
  "phpmyadmin"
];
function isBot(userAgent) {
  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((bot) => lowerUA.includes(bot.toLowerCase()));
}
function isSuspicious(path2) {
  const lowerPath = path2.toLowerCase();
  return suspiciousPatterns.some(
    (pattern) => new RegExp(pattern, "i").test(lowerPath)
  );
}
function botBlock(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  if (isBot(userAgent)) {
    res.status(403).json({ error: "Access Denied" });
    return;
  }
  if (isSuspicious(req.path)) {
    res.status(403).json({ error: "Access Denied" });
    return;
  }
  next();
}

// src/config/rateLimit.config.ts
var TIER_POLICIES = {
  // Credential endpoints: the only real brute-force surface.
  auth: { max: 10, windowMs: 15 * 6e4 },
  // Absorbs Next.js RSC prefetch fan-out from <Link> tags in the viewport.
  read: { max: 300, windowMs: 6e4 },
  write: { max: 60, windowMs: 6e4 }
};
var READ_METHODS = /* @__PURE__ */ new Set(["GET", "HEAD"]);
var AUTH_PREFIX = "/api/auth";
function resolveTier(method, pathname) {
  if (pathname.startsWith(AUTH_PREFIX) && !READ_METHODS.has(method)) {
    return "auth";
  }
  return READ_METHODS.has(method) ? "read" : "write";
}
function isExemptFromLimiting(method, pathname) {
  if (method === "OPTIONS") return true;
  if (pathname === "/" || pathname === "/health") return true;
  if (!pathname.startsWith(AUTH_PREFIX)) return false;
  return READ_METHODS.has(method);
}

// src/middlewares/rateLimit.ts
var PRUNE_INTERVAL_MS = 5 * 6e4;
var lastPruneAt = 0;
async function consume(tier, identifier) {
  const { windowMs } = TIER_POLICIES[tier];
  const rows = await prisma.$queryRaw`
    INSERT INTO "rate_limit" ("key", "count", "resetAt", "createdAt", "updatedAt")
    VALUES (${bucketKey(tier, identifier)}, 1, ${new Date(Date.now() + windowMs)}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count"     = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN 1 ELSE "rate_limit"."count" + 1 END,
      "resetAt"   = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "rate_limit"."resetAt" END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;
  return rows[0] ?? null;
}
function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(",")[0];
    if (first) return first.trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}
function bucketKey(tier, identifier) {
  return `${tier}:${identifier}`;
}
async function pruneExpiredBuckets() {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  try {
    await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date(now) } }
    });
  } catch (error) {
    console.error("rate limit prune failed", error);
  }
}
function rateLimit(req, res, next) {
  if (isExemptFromLimiting(req.method, req.path)) {
    next();
    return;
  }
  const tier = resolveTier(req.method, req.path);
  const { max, windowMs } = TIER_POLICIES[tier];
  const identifier = clientIp(req);
  consume(tier, identifier).then((row) => {
    if (!row) {
      next();
      return;
    }
    const remaining = Math.max(0, max - row.count);
    const resetSeconds = Math.max(
      0,
      Math.ceil((row.resetAt.getTime() - Date.now()) / 1e3)
    );
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSeconds));
    res.setHeader("RateLimit-Policy", `${max};w=${Math.round(windowMs / 1e3)}`);
    if (row.count > max) {
      res.setHeader("Retry-After", String(resetSeconds));
      res.status(429).json({
        error: "Too many requests",
        retryAfter: resetSeconds
      });
      return;
    }
    void pruneExpiredBuckets();
    next();
  }).catch((error) => {
    console.error("rate limit check failed, allowing request", error);
    next();
  });
}

// src/app.ts
var app = express();
app.use(botBlock);
app.use(rateLimit);
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/oshudpati-marketplace-client.*\.vercel\.app$/.test(
        origin
      ) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: [
      "Set-Cookie",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
      "RateLimit-Policy",
      "Retry-After"
    ]
  })
);
app.use("/api/auth", AuthRoutes);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/categories", CategoryRoutes);
app.use("/api/medicines", MedicineRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/addresses", AddressRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/wishlist", WishlistRoutes);
app.use("/api/shops", ShopRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.get("/", (req, res) => {
  res.send("Oshudpati Marketplace API is running!");
});
app.use(notFoundHandler);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 5e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app_default.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
