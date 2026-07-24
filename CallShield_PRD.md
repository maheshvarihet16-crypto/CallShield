# Product Requirements Document (PRD)
## CallShield — Scam/Phishing Number & Link Detector (Web Application)

**Version:** 1.0
**Date:** July 24, 2026
**Owner:** [Your Name]
**Status:** Draft — for build (Antigravity)

---

## 1. Overview

CallShield is a community-powered web platform that helps users identify scam/fraud phone numbers and phishing links before they fall victim. Users can look up any phone number to see its crowdsourced fraud risk score, report suspicious numbers, and scan suspicious links (SMS/WhatsApp) for phishing risk — with special focus on India-specific scam patterns (fake bank, fake police, digital arrest, KYC update scams) and regional language support (Gujarati/Hindi).

### 1.1 Problem Statement
Scam calls and phishing SMS/links are a rapidly growing threat in India. Existing tools like Truecaller focus mainly on caller ID/spam labeling but lack a transparent, community-driven, fraud-pattern-specific database with regional language context and easy escalation to cybercrime authorities.

### 1.2 Goal
Build a web-based platform (V1) where users can:
- Check any number's fraud/spam risk before answering or calling back
- Report scam numbers with categorized tags and local-language notes
- Scan suspicious links for phishing risk
- View community trends via a reports dashboard
- Easily generate a report to file with cybercrime.gov.in

### 1.3 Out of Scope (V1 — Web)
The following require native mobile OS permissions (call interception, SMS reading, auto-block) and are **not feasible in a browser-based web app**. They are documented here as a Phase 2 native app roadmap item, not part of this PRD's build scope:
- Real-time live call audio recording/analysis during an active call
- Automatic call blocking
- Reading device SMS/WhatsApp automatically

---

## 2. Target Users
- General smartphone users in India (primary: Gujarat/Hindi-speaking regions) who receive unknown calls/SMS
- Elderly/less tech-savvy users vulnerable to bank/police impersonation scams
- Small business owners frequently targeted by fraud calls

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Database | MongoDB (Atlas or self-hosted) |
| Auth | BetterAuth — Email/Password + Google OAuth |
| File/Media storage | Google Drive API (for evidence screenshots attached to reports) |
| External APIs | Google Safe Browsing API (link/URL risk check) |
| Hosting target | Vercel (Next.js native) |

---

## 4. Core Features (V1 Scope)

### 4.1 Authentication
- Sign up / Login via Email + Password (BetterAuth)
- Sign up / Login via Google OAuth (BetterAuth)
- Session management, protected routes for reporting/dashboard actions
- Public number lookup and link scan available without login (to reduce friction); reporting requires login (prevents spam abuse)

**User Story:** As a user, I want to sign in quickly with Google so I can start reporting scam numbers without friction.

### 4.2 Smart Number Lookup + Fraud Score
- Search bar: enter a phone number
- Returns:
  - Fraud Risk % (calculated from weighted community reports)
  - Total report count
  - Top reported categories (e.g., "Fake Bank Call", "Fraud", "Telemarketing")
  - Recent report snippets (user-submitted notes, language-tagged)
- If number has zero reports: show "No reports yet — be the first to report" state

**User Story:** As a user, I receive a call from an unknown number and want to instantly check if others have flagged it as fraud.

### 4.3 Community Reporting System
- Logged-in users submit a report on a number:
  - Phone number
  - Category (dropdown: Scam, Fraud Bank Call, Fake Police/Digital Arrest, KYC Scam, Telemarketing, OTP Phishing, Other)
  - Description/note (supports Gujarati, Hindi, English text input)
  - Optional evidence screenshot upload (stored via Google Drive API, linked to report)
  - Optional call recording audio file upload (user-provided, NOT live-recorded by the app — consent-based, user uploads their own saved recording if they have one)
- Duplicate-number reports aggregate into the same number's fraud score (crowd-verified logic)
- Basic anti-abuse: rate limit reports per user per day, flag/report-a-report option for moderation

**User Story:** As a user who just received a fake bank call, I want to report the number with a category and short note so others are warned.

### 4.4 SMS/WhatsApp Phishing Link Scanner
- Text input or paste box where user pastes a suspicious link (from SMS/WhatsApp forwarded message)
- Backend calls Google Safe Browsing API to check URL reputation
- Result shown: Safe / Suspicious / Malicious, with explanation
- Scan history saved for logged-in users

**User Story:** As a user who received a link via SMS claiming to be from my bank, I want to check it's safe before clicking.

### 4.5 Fake Caller ID / Spoofed Number Pattern Flag
- Heuristic-based flag (V1, rule-based — not ML): numbers claiming to be bank/government but not matching known official number patterns/prefixes get an automatic "⚠️ Possible Spoofed Number" badge on the lookup result
- Community can confirm/deny this flag via reporting

### 4.6 Community Dashboard
- Public dashboard page showing:
  - Total numbers reported
  - Top scam categories (chart)
  - Regional heatmap (state/city-level, based on reporter-provided location — optional field)
  - Recent reports feed (anonymized)

**User Story:** As a visitor, I want to see current scam trends in my region before I even get targeted.

### 4.7 One-Click Cybercrime Report Assist
- On a high-risk number's page, a "Report to Cybercrime.gov.in" button
- V1: generates a pre-filled summary (number, category, description, date) the user can copy, plus a direct link to https://cybercrime.gov.in to file manually
- (Full API auto-filing not available publicly — documented as future integration if/when an official API exists)

---

## 5. Data Model (MongoDB Collections)

### `users`
```
{
  _id, name, email, passwordHash (if email/password),
  googleId (if Google OAuth), createdAt, role: "user" | "admin"
}
```

### `numbers`
```
{
  _id, phoneNumber (indexed, unique), fraudScore (calculated),
  totalReports, topCategory, isSpoofedFlag, lastReportedAt
}
```

### `reports`
```
{
  _id, numberId (ref), reportedBy (userId), category,
  description, language, evidenceUrl (Google Drive link),
  audioUrl (optional), location (optional), createdAt
}
```

### `linkScans`
```
{
  _id, url, scannedBy (userId, optional), result: "safe"|"suspicious"|"malicious",
  rawApiResponse, createdAt
}
```

---

## 6. Key Pages / Routes (Next.js App Router)

| Route | Purpose |
|---|---|
| `/` | Landing page — number lookup search bar (public) |
| `/number/[phone]` | Fraud score result page for a specific number |
| `/report` | Submit a scam report (auth required) |
| `/scan-link` | Phishing link scanner |
| `/dashboard` | Public community stats dashboard |
| `/login`, `/signup` | BetterAuth flows |
| `/account` | User's own report history |
| `/admin` | Moderation panel (admin role only) — review flagged/abusive reports |

---

## 7. Non-Functional Requirements
- **Performance:** Number lookup response < 500ms (indexed MongoDB query)
- **Security:** Rate-limiting on report submission and link scans to prevent abuse; sanitize all user text input
- **Privacy:** No storing of actual call audio unless explicitly uploaded by consenting user; evidence files access-controlled
- **Localization:** UI + report descriptions support English, Hindi, Gujarati (i18n via next-intl or similar)
- **Accessibility:** Mobile-responsive (since target users primarily browse on phones)

---

## 8. Success Metrics (for MVP demo/pitch)
- Number of unique numbers in database
- Number of reports submitted
- % of lookups returning a "risk found" result
- Link scans performed
- Projected/estimated ₹ scam amount prevented (based on avg. reported fraud attempt value)

---

## 9. Future Roadmap (Phase 2 — Native App)
- Native Android/iOS app for real-time call screening
- On-device AI voice analysis during live calls (consent-based) for scam script detection
- Auto-block high-risk numbers
- Offline-first local scam pattern database
- Trained NLP model (not just keyword matching) for regional-language scam script detection
- Official API integration with cybercrime.gov.in (if available)

---

## 10. Open Questions
- Will report location data be self-reported (privacy-friendly) or IP-based?
- Moderation policy for disputed/false reports — need a dispute/appeal flow?
- Rate limits and abuse-prevention thresholds — exact numbers TBD during build
