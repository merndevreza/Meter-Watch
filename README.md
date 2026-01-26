# ⚡ Meter Watch

**Meter Watch** is a secure, full-stack dashboard built to monitor electric meter balances for NESCO users. It bridges the gap between raw utility data and user-centric monitoring with automated alerts, multi-meter tracking, and a modern, responsive interface.

---

## 🚀 Features

- **🔐 Robust Authentication**
  - Powered by **NextAuth.js v5 (Beta)**.
  - Supports Credentials, OAuth (Google), and Magic Links.
  - **Mandatory Email Verification:** Real-world email verification flow must be completed to access the dashboard.

- **📊 Meter Management (CRUD)**
  - Add, edit, and delete multiple meters per account.
  - Set custom **Minimum Balance Thresholds** for each meter. 

- **⏰ Smart Automated Alerts**
  - **Visual Cues:** Meters turn red/highlighted when the balance falls below the user-defined limit.
  - **Cron Jobs:** Integrated with **Vercel Cron Jobs** to scan balances daily at **11:59 PM BST**.
  - **Email Notifications:** Automatic alert emails sent via **Resend** to users with low-balance meters.

- **🌍 Premium UX/UI**
  - **Internationalization (i18n):** Support for multiple languages (Bangla and English).
  - **Theme Support:** Native Dark and Light mode via `next-themes`.
  - **Resiliency:** Custom 404, Error boundaries, and loading states for a seamless feel.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | NextAuth.js v5 |
| **Styling** | Tailwind CSS, Shadcn/UI |
| **State/Forms** | React Hook Form + Zod |
| **Email/Cron** | Resend, Vercel Cron |

---

## ⚙️ Installation & Setup

1. **ENV variables**

- NEXT_PUBLIC_BASE_URL
- MONGO_URI
- NODE_ENV
- AUTH_SECRET
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- AUTH_GITHUB_ID
- AUTH_GITHUB_SECRET
- AUTH_RESEND_KEY
- CRON_SECRET 