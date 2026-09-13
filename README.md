# ServiceHub Cordova — Frontend Client

> Hyperlocal Community Service Marketplace & Queue Management System for Cordova, Cebu, Philippines.

---

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router)
- **UI & Logic:** React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Custom CSS tokens
- **Forms & Validation:** React Hook Form, Zod
- **Real-Time Gateway:** Socket.io Client
- **HTTP Client:** Axios (with automatic token rotation & credentials)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Key Workspaces & Features
- **Seeker Workspace (`/seeker`):** Browse listings (Flow A), post custom requests (Flow B), manage bookings, live chat, and review completed jobs.
- **Provider Workspace (`/provider`):** Manage up to 3 active services, submit proposals/offers on seeker requests, manage FCFS queues, and track wallet earnings.
- **Admin Panel (`/admin`):** Review residency verification proofs, moderate service listings (3-strike policy), approve categories, and arbitrate dispute cases.
- **Real-Time Messages (`/seeker/messages`, `/provider/messages`):** Real-time chat rooms scoped to `bookingId` via Socket.io.
