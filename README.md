# ⚡ Meter Watch

**Meter Watch** is a full-stack dashboard designed for NESCO users to easily monitor multiple electric meter balances in one place. It provides a modern, responsive interface with visual insights through graphs and tables, highlights low balances based on user-defined thresholds, sends automated email alerts, and updates meter data daily for accurate tracking.

---
## 🌐 Data Source

Meter data is securely collected by scraping from the official prepaid customer portal of  
**[Northern Electricity Supply Company Limited (NESCO)](https://customer.nesco.gov.bd/pre/panel)**.

> 🔗 Source: https://customer.nesco.gov.bd/pre/panel

---

## 🚀 Features

- **🔐 Authentication**
  - Powered by **NextAuth.js v5**.
  - Supports Credentials, OAuth (Google, Github), and Magic Links.
  - **Mandatory Email Verification:** Real-world email verification flow must be completed to access the dashboard.

- **📊 NESCO Meter Management (CRUD)**
  - Add, update, and delete multiple NESCO meters per account.
  - Set custom **Minimum Balance Thresholds** for each meter. 

- **⏰ Smart Automated Alerts**
  - **Visual Cues:** Meters turn red/highlighted when the balance falls below the user-defined limit.
  - **Cron Jobs:** Integrated with **Vercel Cron Jobs** to update meters data by scraping from original site daily at **11:59 PM BST**.
  - **Email Notifications:** Automatic alert emails sent via **Resend** to users with low-balance meters.

- **🌍 Premium UX/UI**
  - **Internationalization (i18n):** Support for multiple languages (Bangla and English).
  - **Theme Support:** Native Dark and Light mode via `next-themes`.
  - **Resiliency:** Custom 404, Error boundaries, and loading states for a seamless feel.

---

## 🛠️ Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB (Mongoose ODM)
- NextAuth.js v5
- Tailwind CSS, Shadcn/UI
- React Hook Form + Zod
- Resend, Vercel Cron
- Puppeteer, Cheerio, Browserless.io
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
- BROWSERLESS_TOKEN
- EMAIL_FROM
---

## 🧪 Sample Consumer Numbers

The following NESCO consumer numbers can be used for testing purposes:

- `32016951`
- `32016952`
- `32016953`
- `32016954`
- `32016955`
- `32016956`
- `32016957`
- `32016965`
- `32016966`
- `32016967`
- `32016968`
---
> This project is **not affiliated with** Northern Electricity Supply Company Limited (NESCO).
