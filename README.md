# Online Canteen Ordering System 🍽️☁️

A production-style, cloud-native full-stack web application designed for college campus dining. Students can browse digital menus, customize orders, track preparation stages in real time, and receive instant pickup notifications. Kitchen staff manage incoming orders via a Kitchen Display System (KDS), and administrators monitor real-time sales analytics, hourly rush patterns, and the most-ordered dishes of the day.

Built for academic evaluation and production cloud deployment using **React + Vite + TypeScript + Tailwind CSS**, **Node.js + Express + TypeScript**, **Firebase Authentication**, **Cloud Firestore**, **Firebase Cloud Messaging (FCM)**, **Google Cloud Run**, and **Firebase Hosting**.

---

## 📑 Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Security Model](#3-user-roles--security-model)
4. [Order Lifecycle & State Machine](#4-order-lifecycle--state-machine)
5. [Firestore Database Schema](#5-firestore-database-schema)
6. [Payment Architecture](#6-payment-architecture)
7. [Step-by-Step Local Setup & Execution](#7-step-by-step-local-setup--execution)
8. [Database Seeding & Test Accounts](#8-database-seeding--test-accounts)
9. [Administrator Bootstrapping](#9-administrator-bootstrapping)
10. [Step-by-Step Cloud Deployment Guide](#10-step-by-step-cloud-deployment-guide)
11. [End-to-End Workflow Demonstration](#11-end-to-end-workflow-demonstration)
12. [Cloud Cost Management & Monitoring](#12-cloud-cost-management--monitoring)

---

## 1. System Architecture

```
                               ┌────────────────────────────────────────────────┐
                               │             Client Web Application             │
                               │        (React + Vite + Tailwind + TS)          │
                               │          Hosted on Firebase Hosting            │
                               └───────┬───────────────────────────────┬────────┘
                                       │                               │
                      Real-time Document Listeners            REST API Requests
                      (Active Orders & Notifications)     (Auth Token in Bearer Header)
                                       │                               │
                                       ▼                               ▼
                     ┌──────────────────────────────────┐   ┌───────────────────────────┐
                     │          Cloud Firestore         │   │   Express Backend API     │
                     │          (Native Mode)           │   │    (Node.js + TypeScript) │
                     │  - Users, Orders, Menu Items,    │   │  Hosted on Cloud Run      │
                     │    Notifications, Payments       │   └─────────────┬─────────────┘
                     └──────────────────────────────────┘                 │
                                       ▲                                  │
                                       │      Trusted Server Operations   │
                                       └──────────────────────────────────┘
                                             (Firebase Admin SDK)
```

### Why This Coherent Cloud Architecture Was Chosen:
1. **Separation of Concerns**: Frontend static assets are served instantly worldwide via **Firebase Hosting CDN**, reducing server load to zero for static content.
2. **Serverless Auto-Scaling**: The API runs on **Google Cloud Run** in a lightweight container that scales down to 0 instances during off-peak campus hours (e.g., late night), keeping cloud costs near \$0 while seamlessly handling high traffic during college lunch breaks.
3. **Real-Time Data Sync**: **Cloud Firestore** provides native reactive snapshots (`onSnapshot`), allowing students to watch their food transition from *Placed* to *Preparing* to *Ready* without polling or refreshing the browser.
4. **Authoritative Server Pricing**: All calculations and transitions are verified server-side with **Firebase Admin SDK** to eliminate client-side price tampering.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Analytics Charts**: Recharts (Responsive Line, Area, Bar, and Donut charts)
- **Icons**: Lucide React
- **Client Cloud Services**: Firebase Web SDK v10/v11 (`firebase/auth`, `firebase/firestore`, `firebase/messaging`)

### Backend:
- **Runtime**: Node.js (v20+ / v24+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Cloud Database & Auth**: Firebase Admin SDK (`firebase-admin`)
- **Data Validation**: Zod schema parsing
- **Security & Middleware**: CORS, Bearer ID token validation, Role Authorization guards
- **Payments**: Test Instant Capture + Optional Razorpay HMAC-SHA256 signature verification

---

## 3. User Roles & Security Model

The system enforces strict role-based access control (RBAC). Newly registered users **always default to the `student` role**. Modifying user roles is restricted to backend administrators.

| Feature / Action | Student | Kitchen Staff | Administrator |
|---|---|---|---|
| Browse Campus Menu & Categories | ✅ | ✅ | ✅ |
| Add to Cart & Place Order | ✅ | ❌ | ✅ |
| View Own Orders & Live Tracker | ✅ (Own orders) | ✅ (All operational orders) | ✅ (All orders) |
| In-App & Browser Push Notifications | ✅ | ❌ | ✅ |
| Update Order Preparation Status | ❌ | ✅ (Step-by-step lifecycle) | ✅ (All transitions) |
| Manage Food Menu Items (CRUD) | ❌ | ❌ | ✅ |
| Toggle Dish Availability (In Stock / Sold Out) | ❌ | ❌ | ✅ |
| View Sales Analytics, KPIs & Recharts | ❌ | ❌ | ✅ |
| View Highest-Ordered Food of the Day | ❌ | ❌ | ✅ |
| Assign Roles & Activate/Deactivate Users | ❌ | ❌ | ✅ |

---

## 4. Order Lifecycle & State Machine

Order status transitions follow a strict, enforced state machine on the backend. Illegal transitions (e.g., jumping from `placed` directly to `collected`, or reverting a `collected` order) are rejected with HTTP 400 Bad Request.

```
┌──────────┐      Accept Order      ┌───────────┐      Start Cooking     ┌───────────┐
│  Placed  ├───────────────────────>│  Accepted ├───────────────────────>│ Preparing │
└────┬─────┘                        └─────┬─────┘                        └─────┬─────┘
     │                                    │                                    │
     │ Cancel (Permitted)                 │ Cancel (Permitted)                 │ Mark Ready
     ▼                                    ▼                                    ▼
┌───────────┐                        ┌───────────┐                       ┌───────────┐
│ Cancelled │                        │ Cancelled │                       │   Ready   │
└───────────┘                        └───────────┘                       └─────┬─────┘
                                                                               │
                                                                               │ Student picks up
                                                                               ▼
                                                                         ┌───────────┐
                                                                         │ Collected │
                                                                         └───────────┘
```

### Automated Student Notifications:
- **Accepted**: *"Kitchen staff accepted your order #ORD-xxxx."*
- **Preparing**: *"Your meal is now on the prep stove / counter."*
- **Ready** (High Priority): *"Order #ORD-xxxx is hot & ready! Please show your order ID at Counter #1."*
- **Collected**: *"Thank you! Order marked collected. Enjoy your meal!"*

---

## 5. Firestore Database Schema

### 1. `users/{uid}`
- `uid` (string): Firebase Auth User ID
- `displayName` (string): Student or Staff member's name
- `email` (string): College email address
- `role` (string): `'student' | 'staff' | 'admin'`
- `active` (boolean): Account active status
- `fcmTokens` (string[]): Optional device registration tokens for FCM
- `createdAt` / `updatedAt` (ISO timestamp strings)

### 2. `categories/{categoryId}`
- `categoryId` (string): e.g. `'breakfast'`, `'lunch'`, `'snacks'`, `'beverages'`, `'desserts'`
- `name` (string): Display name
- `description` (string): Short category summary
- `displayOrder` (number): Numeric sort order
- `active` (boolean): Visibility toggle

### 3. `menuItems/{itemId}`
- `itemId` (string): Unique food ID
- `name` (string): Dish name
- `description` (string): Ingredients and preparation details
- `categoryId` (string): Reference to category
- `price` (number): Price in Indian Rupees (₹)
- `imageUrl` (string): High-resolution food photography URL
- `available` (boolean): In stock / sold out toggle
- `preparationTimeMinutes` (number): Estimated cooking time

### 4. `orders/{orderId}`
- `orderId` (string): Format `ORD-YYYYMMDD-XXXX`
- `studentId` (string): UID of ordering student
- `studentName` (string): Student display name
- `studentEmail` (string): Student email
- `items` (array): `[{ itemId, name, price, quantity, subtotal }]`
- `instructions` (string): Kitchen preparation notes
- `subtotal` / `tax` / `total` (number): Authoritative server-calculated amounts
- `paymentMethod` (string): `'test_mode' | 'cash' | 'razorpay'`
- `paymentStatus` (string): `'paid' | 'pending' | 'failed'`
- `status` (string): `'placed' | 'accepted' | 'preparing' | 'ready' | 'collected' | 'cancelled'`
- `statusHistory` (array): Audit trail of transitions `[{ status, timestamp, actorUid, actorRole, note }]`
- `idempotencyKey` (string): Client-generated key preventing duplicate submissions
- `createdAt` / `updatedAt` / `collectedAt` (ISO timestamp strings)

### 5. `notifications/{notificationId}`
- `notificationId` (string): Unique document ID
- `recipientId` (string): UID of student
- `orderId` (string): Associated order reference
- `title` (string): Short title
- `message` (string): Detailed body
- `type` (string): `'order_status' | 'system'`
- `read` (boolean): Read / unread status
- `readAt` (ISO timestamp or null)
- `createdAt` (ISO timestamp)

### 6. `payments/{paymentId}`
- `paymentId` (string): Document ID
- `orderId` (string): Order ID
- `studentId` (string): Student UID
- `amount` (number): Amount in ₹
- `provider` (string): `'test' | 'cash' | 'razorpay'`
- `providerReference` (string): Transaction ID or simulated reference
- `status` (string): `'captured' | 'pending' | 'failed'`

---

## 6. Payment Architecture

The application provides multiple payment configurations:
1. **Test Mode (Instant Simulated Payment)**:
   - Default mode recommended for project evaluation.
   - Instantly marks orders as paid without transmitting banking credentials.
2. **Cash at Collection**:
   - Order is placed with `paymentStatus: 'pending'`.
   - When the student picks up the tray and staff marks the order *Collected*, the payment is automatically marked as paid.
3. **Razorpay Test Mode (Optional Integration)**:
   - Secret keys remain strictly on the backend.
   - Orders are created via Razorpay API on the server.
   - Webhook / client response signatures are cryptographically verified using `HMAC-SHA256` before marking orders as paid.

---

## 7. Step-by-Step Local Setup & Execution

### Prerequisites:
- Node.js (v18, v20, or v22+)
- npm (v9+)
- Git

### 1. Clone & Enter Project:
```bash
git clone <your-repository-url>
cd online-canteen-ordering-system
```

### 2. Configure Environment Files:
Copy the example environment templates:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 3. Install Dependencies:
Install all packages from the project root:
```bash
# In frontend directory
cd frontend
npm install

# In backend directory
cd ../backend
npm install
```

### 4. Run Automated Backend Tests:
Verify business rules, state machine transitions, pricing protection, and analytics logic:
```bash
cd backend
npm test
```
*All 9 unit test suites should pass immediately.*

### 5. Start Development Servers:
Run both servers simultaneously:
- **Backend API**:
  ```bash
  cd backend
  npm run dev
  # Server starts on http://localhost:5000
  ```
- **Frontend SPA**:
  ```bash
  cd frontend
  npm run dev
  # Vite opens on http://localhost:5173
  ```

---

## 8. Database Seeding & Test Accounts

To immediately test the application with realistic dishes, past orders, and Recharts analytics, run the development seed script:

```bash
cd backend
npm run seed
```

This populates:
- **5 Categories**: Breakfast, Lunch, Snacks, Beverages, Desserts.
- **18 Delicious Campus Dishes**: Crispy Masala Dosa, Hyderabadi Veg Biryani, Executive Thali, Chole Bhature, Masala Chai, Cold Coffee, Gulab Jamun, Brownie, etc.
- **3 Evaluator Test Accounts**:
  - **Student**: `student@canteen.edu`
  - **Staff**: `staff@canteen.edu`
  - **Admin**: `admin@canteen.edu`
- **Past & Today Orders**: Automatically distributes realistic orders across the past 7 days and today so that all Recharts line charts, hourly distributions, category breakdowns, and the "Star Dish of the Day" show authentic, rich data right away.

> **Evaluation Tip**: On the frontend navbar or login screen, click the **Evaluation Quick Switcher** to seamlessly switch between Student, Kitchen Staff, and Administrator views with a single click!

---

## 9. Administrator Bootstrapping

To promote any registered Firebase Auth account to the Administrator role securely (without opening public registration backdoors):

```bash
cd backend
npm run bootstrap-admin <user-email>

# Example:
npm run bootstrap-admin principal@college.edu
```

The script sets the document `role: 'admin'` in Firestore and configures custom claims via Firebase Admin SDK.

---

## 10. Step-by-Step Cloud Deployment Guide

### A. Deploy Backend to Google Cloud Run:
1. Ensure the Google Cloud SDK (`gcloud`) is installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project <YOUR_GCP_PROJECT_ID>
   ```
2. Build and deploy the container image using the included `backend/Dockerfile`:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/<YOUR_GCP_PROJECT_ID>/canteen-backend
   gcloud run deploy canteen-backend \
     --image gcr.io/<YOUR_GCP_PROJECT_ID>/canteen-backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=<YOUR_PROJECT_ID>,CORS_ORIGIN=https://<YOUR_FIREBASE_HOSTING_DOMAIN>.web.app
   ```
3. Copy the resulting Service URL (e.g., `https://canteen-backend-xyz.a.run.app`).

### B. Configure Frontend Production Environment:
Update `frontend/.env` with the deployed Cloud Run URL:
```env
VITE_API_BASE_URL=https://canteen-backend-xyz.a.run.app/api
VITE_FIREBASE_API_KEY=<Your_Firebase_Web_Key>
VITE_FIREBASE_PROJECT_ID=<Your_Firebase_Project_ID>
```

### C. Deploy Frontend to Firebase Hosting:
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Build the production frontend bundle:
   ```bash
   npm run build:frontend
   ```
3. Deploy Firestore rules, indexes, and hosting:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,hosting
   ```

### D. Authorized Domains in Firebase Authentication:
In the [Firebase Console](https://console.firebase.io) under **Authentication** → **Settings** → **Authorized domains**, add:
- `<YOUR_PROJECT_ID>.web.app`
- `<YOUR_PROJECT_ID>.firebaseapp.com`

---

## 11. End-to-End Workflow Demonstration

To present this project to faculty or interviewers, follow this 5-minute demonstration script:

1. **Menu Browsing**:
   - Open `http://localhost:5173`.
   - Filter by categories (*Breakfast*, *Lunch*, *Beverages*).
   - Search for "Dosa" or "Biryani".
2. **Ordering & Idempotency**:
   - Add *Crispy Masala Dosa* and *Masala Chai* to the cart tray.
   - Click **Proceed to Checkout**.
   - Add special instructions: *"Extra coconut chutney please"*.
   - Select **Test Mode (Instant Simulated Payment)** and click **Place Order**.
   - Notice the celebratory confetti and redirection to `/orders/ORD-xxxx`.
3. **Real-Time Live Tracking (Student View)**:
   - Keep the student's order tracker page open in one window.
   - View the 5-step stepper in the `Placed` state.
4. **Kitchen Display System (Staff View)**:
   - In another window (or incognito tab), click the navbar role switcher and choose **Staff View** (`/staff`).
   - Notice the newly placed order appears immediately without refreshing!
   - Click **Accept Order** → Notice the student's tracker advances to `Accepted` in real time.
   - Click **Start Cooking** → Notice the order turns amber and shows `Preparing` with live timestamps.
   - Click **Mark as Ready** → The student's screen flashes a prominent green banner: *"Your Food is Hot & Ready for Pickup at Counter #1"*, and an in-app notification is created!
5. **Collection & Revenue Realization**:
   - Staff marks **Collected**.
   - Switch to the **Admin Console** (`/admin`).
   - Notice the KPI cards, daily revenue area charts, and food popularity bar charts reflect the newly collected order with zero delay!

---

## 12. Cloud Cost Management & Monitoring

- **Google Cloud Run**: Configured with minimum instances = 0. When no requests are occurring, instance count scales to zero, incurring zero CPU charges. Google Cloud provides 2 million free requests per month.
- **Cloud Firestore**: Free tier includes 50,000 document reads and 20,000 document writes per day, more than sufficient for college campus usage and laboratory demonstrations.
- **Firebase Hosting**: Free tier includes 10 GB of storage and 360 MB/day transfer.
- **Logs & Auditing**:
  - Monitor live Cloud Run requests via Google Cloud Logging:
    `gcloud logging read "resource.type=cloud_run_revision" --limit 20`
  - Monitor Firestore usage via Firebase Console Usage & Billing tab.
