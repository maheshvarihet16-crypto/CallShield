# 🛡️ CallShield — Scam & Phishing Link Detector

CallShield is a community-powered web platform designed to help users identify scam/fraud phone numbers and phishing links before falling victim, with targeted support for Indian regional scam patterns (digital arrest, fake police, bank KYC scams) and multilingual support in **English**, **Hindi**, and **Gujarati**.

---

## 🚀 Key Features

1. **Smart Number Lookup & Fraud Risk Score:**
   - Crowdsourced fraud risk calculation (0–100%) incorporating category severity, report volume, and recency decay.
   - Heuristic flags for fake caller ID spoofing (`140...` prefixes).

2. **Community Reporting System:**
   - Logged-in users can report scam numbers with categorized tags, detailed descriptions in Gujarati/Hindi/English, and optional evidence uploads (screenshots & consent-based saved audio recordings).
   - Anti-abuse rate limiting (max 10 reports per user per 24 hours).
   - User input sanitization.

3. **SMS & WhatsApp Phishing Link Scanner:**
   - URL reputation checks via **Google Safe Browsing API v4** with a rule-based heuristic fallback engine when API keys are unconfigured.

4. **One-Click Cybercrime Report Assist:**
   - Pre-filled incident summaries ready to copy and paste directly into the official portal ([cybercrime.gov.in](https://cybercrime.gov.in)).

5. **Community Analytics Dashboard:**
   - Public metrics counters, interactive `recharts` category distribution, and MongoDB-aggregated regional trends.

6. **Admin Moderation Panel:**
   - Role-protected panel (`role === "admin"`) for reviewing flagged community reports, inspecting reporter details, approving entries, or deleting abusive reports with automatic fraud score recalculation.

7. **Multilingual UI (i18n):**
   - Instant language switching across **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, TypeScript, React 19)
- **Styling:** Tailwind CSS (v4) + shadcn/ui
- **Database:** MongoDB (via Mongoose)
- **Authentication:** BetterAuth (Email/Password + Google OAuth)
- **External APIs:** Google Safe Browsing API (Link reputation)
- **Charts:** Recharts

---

## ⚙️ Environment Variables Reference

Create a `.env.local` file in the project root:

| Variable Name | Description | Example / Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (Atlas or Local) | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Database name | `callshild` |
| `BETTER_AUTH_SECRET` | 32-character secret key for signing auth tokens | `callshield_dev_secret_key_32chars_long` |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Application public URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (Optional) | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (Optional) | `GOCSPX-xxxx` |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing API Key (Optional) | `AIzaSyX...` |

---

## 🏃 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your database and API credentials:
```bash
cp .env.example .env.local
```

### 3. Seed Sample Database
Populate test phone numbers (+919876543210, +919123456789, +919988776655), reports in Gujarati/Hindi/English, and sample link scans:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Vercel Deployment

### 1. Production Build Check
Ensure the project compiles without TypeScript or build errors:
```bash
npm run build
```

### 2. Deploying to Vercel
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com).
3. In the Vercel project settings, configure the following Environment Variables before deploying:
   - `MONGODB_URI` (Your MongoDB Atlas connection URI)
   - `MONGODB_DB_NAME` (`callshild`)
   - `BETTER_AUTH_SECRET` (A strong random secret string)
   - `BETTER_AUTH_URL` (`https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (`https://your-domain.vercel.app`)
   - `GOOGLE_CLIENT_ID` (Google Cloud OAuth Client ID)
   - `GOOGLE_CLIENT_SECRET` (Google Cloud OAuth Client Secret)
   - `GOOGLE_SAFE_BROWSING_API_KEY` (Google Safe Browsing API Key)

---

## 🛡️ License & Community Note
CallShield is built for public safety and fraud prevention in India. Stay safe from scam calls and phishing links!
