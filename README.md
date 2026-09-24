<div align="center">

<img src="https://github.com/user-attachments/assets/118e4e95-2546-44cb-9594-65fcb67cc968" alt="Yatrio logo" width="100%">

### Move Beyond Limits

*A MERN railway booking demo — live train search, PNR status, live tracking, and a full demo booking flow with Razorpay test payments.*

<br>

![Architecture](https://img.shields.io/badge/architecture-MERN-014CA9?style=for-the-badge&labelColor=04275B&logoColor=white)
![React](https://img.shields.io/badge/React%20%2B%20Vite-Frontend-0080F8?style=for-the-badge&labelColor=04275B)
![Node.js](https://img.shields.io/badge/Node.js%20%2B%20Express-Backend-3BB3FD?style=for-the-badge&labelColor=04275B)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-014CA9?style=for-the-badge&labelColor=04275B)
![Payments](https://img.shields.io/badge/Razorpay-Test%20Mode-0080F8?style=for-the-badge&labelColor=04275B)
![Status](https://img.shields.io/badge/Scope-MVP%20Demo-3BB3FD?style=for-the-badge&labelColor=04275B)

<br>

**[Architecture](#-architecture) · [Features](#-features) · [User Flow](#-user-flow) · [API Map](#-api-map) · [Pages](#-frontend-pages) · [Data](#-data-architecture) · [Brand](#-brand-kit)**

</div>

<br>

## 🚄 About

Yatrio puts every trip in the traveler's hand — live trains, honest timings, and booking that feels as fast as the train itself. Rail journeys, reimagined in motion.

This repository is the **Yatrio MERN Railway Booking Demo**. It connects to an **IRCTC / authorised Railway API** for real search and status data, but all payments run in **Razorpay TEST MODE** and every booking, PNR, and ticket is a **demo artifact** — **no real IRCTC ticket booking is performed**.

<div align="center">
  <img src="https://github.com/user-attachments/assets/842801d0-cff9-4d6f-9729-e80a67a2c6f9" alt="Yatrio primary lockup" width="220">
  <p><sub>Primary lockup — "Move Beyond Limits"</sub></p>
</div>

<br>

## 🏗 Architecture

```
┌────────────────────────────┐
│      YATRIO FRONTEND       │
│    React + Vite + Tailwind │
└─────────────┬──────────────┘
              │  HTTPS / REST
┌─────────────▼──────────────┐
│       YATRIO BACKEND       │
│    Node.js + Express.js    │
│                            │
│  Auth · Train Search ·     │
│  Live Status · Booking ·   │
│  Payment · Trips           │
└──────┬───────────┬─────────┘
       │           │
       ▼           ▼
┌────────────┐  ┌──────────────┐  ┌─────────────────┐
│  IRCTC /   │  │   Razorpay   │  │   MongoDB /     │
│ Railway API│  │  TEST MODE   │  │     MySQL       │
│            │  │              │  │                 │
│ • Search   │  │ • Demo Order │  │ • Users         │
│ • Avail.   │  │ • Test Pay   │  │ • Passengers    │
│ • Live     │  │ • Verify     │  │ • Bookings      │
│  Status    │  │              │  │ • Searches      │
└────────────┘  └──────────────┘  └─────────────────┘
```

<table width="100%">
<tr>
<td width="78%" valign="top">

### Application Modules

<table width="100%">
<tr>
<th>Module</th>
<th>Responsibilities</th>
</tr>
<tr>
<td><b>Auth</b></td>
<td>Login, Register, Sessions</td>
</tr>
<tr>
<td><b>Railway</b></td>
<td>Search, Availability, Schedule, Live Status, PNR</td>
</tr>
<tr>
<td><b>Booking</b></td>
<td>Passenger, Fare, Booking, Ticket</td>
</tr>
<tr>
<td><b>Payment</b></td>
<td>Razorpay test-mode orders, verification</td>
</tr>
<tr>
<td><b>Optional</b></td>
<td>Confirmation Prediction, Alternative Routes / Trains</td>
</tr>
</table>

</td>

<td width="22%" align="center" valign="middle">

<img
  src="https://github.com/user-attachments/assets/a2cd61ce-4a91-4abf-905a-f7c2bcd8c6eb"
  alt="Yatrio monogram"
  width="150"
/>

</td>
</tr>
</table>

## ✨ Features

- 🔍 **Train Search** — from / to / date search with trains, times, classes, availability, and fares
- 📍 **Live Train Status** — current station, delay, and ETA by train number
- 🎫 **PNR Status** — check reservation status by PNR
- 🧾 **Demo Booking** — passenger details → fare summary → demo ticket with a demo PNR
- 💳 **Razorpay Test Payments** — order creation, test checkout, and signature verification
- 🗂 **My Trips** — all bookings and tickets in one place
- 🔮 **Optional modules** — confirmation prediction ("78% Confirmation") and alternative train / route suggestions

<br>

## 🧭 User Flow

```
HOME
 ├── BOOK TRAIN ──── From / To / Date ──► SEARCH TRAINS
 ├── PNR STATUS ──── Enter PNR ─────────► PNR Result
 └── LIVE STATUS ─── Train Number ──────► Live Location
              │
              ▼
      TRAIN RESULTS  (train · time · classes · availability · fare)
              ▼
      SELECT TRAIN
              ▼
      PASSENGER DETAILS
              ▼
      FARE SUMMARY
              ▼
      RAZORPAY TEST PAYMENT ──── FAILED ──► RETRY
              │ SUCCESS
              ▼
      DEMO BOOKING ──► DEMO PNR ──► DEMO TICKET ──► MY TRIPS
```

### Train Search Flow

```
React → Search Form → GET /api/trains/search → Express Controller
      → Railway API Service → IRCTC / Authorised Railway API
      → Normalize Response → React Train Results
```

### Live Train Location Flow

```
React → Train Number → GET /api/trains/:trainNo/status → Express
      → Railway API Service → IRCTC / Railway Live Status API
      → Current Station + Delay + ETA → React Live Tracking UI
```

> ⚡ An **optional Redis cache** can hold the latest live status with a TTL.

### Demo Payment + Booking Flow

```
Passenger Details → Create Booking (PENDING) → Create Razorpay TEST Order
     → Razorpay TEST CHECKOUT ── FAIL ──► RETRY
                    │ SUCCESS
                    ▼
          Verify Payment → Mark PAID → Create DEMO Booking
                    → Generate DEMO PNR / Ticket
```

> ⚠️ **No real IRCTC booking** is ever made — this is a demo pipeline end to end.

<br>

## 🔮 Optional Modules

### Confirmation Prediction

Consumes train / availability data — WL / RAC position, class, quota, days remaining, and (optionally) historical data — to return an **estimated probability**, e.g. *"78% Confirmation"*.

### Alternative Trains / Routes

Given a selected journey, an alternative engine proposes same-route / different-train, nearby-station, different-class, or different-route options, then **filters and ranks** them into suggestions.

<br>

## 🗺 API Map

| Module | Endpoint | Method |
| --- | --- | --- |
| **Auth** | `/api/auth/register` | `POST` |
| | `/api/auth/login` | `POST` |
| **Trains** | `/api/trains/search` | `GET` |
| | `/api/trains/:id` | `GET` |
| | `/api/trains/:id/availability` | `GET` |
| | `/api/trains/:id/schedule` | `GET` |
| | `/api/trains/:id/status` | `GET` |
| **PNR** | `/api/pnr/:pnr` | `GET` |
| **Booking** | `/api/bookings` | `POST` |
| | `/api/bookings` | `GET` |
| | `/api/bookings/:id` | `GET` |
| | `/api/bookings/:id/cancel` | `POST` |
| **Payment** | `/api/payments/order` | `POST` |
| | `/api/payments/verify` | `POST` |
| **Optional** | `/api/prediction` | `POST` |
| | `/api/alternatives` | `POST` |

<br>

## 🖥 Frontend Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/search` | Train Search |
| `/trains` | Train Results |
| `/trains/:id` | Train Details |
| `/booking` | Passenger + Checkout |
| `/booking/success` | Demo Ticket |
| `/trips` | My Trips |
| `/trips/:id` | Ticket Details |
| `/pnr` | PNR Status |
| `/live-status` | Live Train Status |
| `/login` | Authentication |
| `/prediction` *(optional)* | Confirmation Prediction |
| `/alternatives` *(optional)* | Alternative Suggestions |

<br>

## 💾 Data Architecture

Three persistence options — **choose ONE primary DB**:

| Database | Collections / Tables | Notes |
| --- | --- | --- |
| **MongoDB** ✅ | Users, Passengers, Trips | Recommended for MERN — **MongoDB + Mongoose** |
| **MySQL** | Users, Bookings, Payments, Searches | If relational is preferred — **Prisma / Sequelize** |
| **Redis** *(optional)* | API cache, Live status | Latest live status + TTL |

<br>

## 🎯 MVP Boundary

| ✅ Real | 🧪 Demo | 🔮 Optional |
| --- | --- | --- |
| Train Search | Razorpay TEST | Prediction |
| Live Status | Demo Booking | Alternatives |
| Schedule | Demo PNR | Alternate Routes |
| Availability | Demo Ticket | |

**Real data source:** IRCTC / Authorised Railway API · **Never:** real ticket booking

<br>

<div align="center">

## 🎨 Brand Kit

<table>
  <tr>
    <!-- Original -->
    <td align="center" valign="middle" style="background:#F7F9FC; width:150px; height:110px; padding:8px;">
      <div style="width:130px; height:90px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
        <img
          src="https://github.com/user-attachments/assets/ec18333f-7054-468b-935f-1ac08a62aa97"
          alt="Yatrio original logo"
          width="120"
        >
      </div>
    </td>
    <td align="center" valign="middle" style="background:#F7F9FC; width:150px; height:110px; padding:8px;">
      <img
        src="https://github.com/user-attachments/assets/4fa0a403-24bc-497c-85ff-dbc0491b837b"
        alt="Yatrio azure logo"
        width="120"
      >
    </td>
    <td align="center" valign="middle" style="background:#FFFFFF; width:150px; height:110px; padding:8px;">
      <div style="width:130px; height:90px; background:#FFFFFF; display:flex; align-items:center; justify-content:center;">
        <img
          src="https://github.com/user-attachments/assets/ac09f82d-eea1-4c01-bca4-8e31f173a349"
          alt="Yatrio navy monogram"
          width="95"
        >
      </div>
    </td>
    <td align="center" valign="middle" style="background:#0B1B33; width:150px; height:110px; padding:8px;">
      <div style="width:130px; height:90px; background:#0B1B33; display:flex; align-items:center; justify-content:center;">
        <img
          src="https://github.com/user-attachments/assets/e859dbef-e8a3-44e6-9c44-724ae0b1468c"
          alt="Yatrio white monogram"
          width="95"
        >
      </div>
    </td>
  </tr>

  <tr>
    <td align="center"><sub>Original</sub></td>
    <td align="center"><sub>Azure</sub></td>
    <td align="center"><sub>Navy Mono</sub></td>
    <td align="center"><sub>White Mono</sub></td>
  </tr>
</table>

<br>

### 🎨 Color Palette

| Swatch | Color | Hex | When to Use |
|:---:|---|---|---|
| <img valign="middle" src="https://readme-swatches.vercel.app/04275B?style=square&size=28" alt="Navy"> | **Navy** | `#04275B` | Navbar, footer, primary brand surfaces |
| <img valign="middle" src="https://readme-swatches.vercel.app/014CA9?style=square&size=28" alt="Royal Blue"> | **Royal Blue** | `#014CA9` | Links, secondary buttons, active states |
| <img valign="middle" src="https://readme-swatches.vercel.app/0080F8?style=square&size=28" alt="Azure"> | **Azure** | `#0080F8` | Primary CTA, buttons, key interactions |
| <img valign="middle" src="https://readme-swatches.vercel.app/3BB3FD?style=square&size=28" alt="Sky"> | **Sky** | `#3BB3FD` | Hover states, icons, accents |
| <img valign="middle" src="https://readme-swatches.vercel.app/F7F9FC?style=square&size=28" alt="Paper"> | **Paper** | `#F7F9FC` | Page backgrounds, light sections |
| <img valign="middle" src="https://readme-swatches.vercel.app/FFFFFF?style=square&size=28" alt="White"> | **White** | `#FFFFFF` | Cards, logo backgrounds, clean surfaces |

### Extended Shades

| Swatch | Shade | Hex | Usage |
|:---:|---|---|---|
| <img valign="middle" src="https://readme-swatches.vercel.app/021B40?style=square&size=28" alt="Navy 950"> | Navy 950 | `#021B40` | Deep backgrounds |
| <img valign="middle" src="https://readme-swatches.vercel.app/04275B?style=square&size=28" alt="Navy 900"> | Navy 900 | `#04275B` | Core brand |
| <img valign="middle" src="https://readme-swatches.vercel.app/0B3A7A?style=square&size=28" alt="Navy 700"> | Navy 700 | `#0B3A7A` | Dark secondary surfaces |
| <img valign="middle" src="https://readme-swatches.vercel.app/014CA9?style=square&size=28" alt="Royal 600"> | Royal 600 | `#014CA9` | Secondary actions |
| <img valign="middle" src="https://readme-swatches.vercel.app/0080F8?style=square&size=28" alt="Azure 500"> | Azure 500 | `#0080F8` | Primary actions |
| <img valign="middle" src="https://readme-swatches.vercel.app/3BB3FD?style=square&size=28" alt="Sky 400"> | Sky 400 | `#3BB3FD` | Accents / hover |
| <img valign="middle" src="https://readme-swatches.vercel.app/A9DEFC?style=square&size=28" alt="Sky 200"> | Sky 200 | `#A9DEFC` | Soft highlights |
| <img valign="middle" src="https://readme-swatches.vercel.app/E6F4FF?style=square&size=28" alt="Blue 100"> | Blue 100 | `#E6F4FF` | Info backgrounds |
| <img valign="middle" src="https://readme-swatches.vercel.app/F7F9FC?style=square&size=28" alt="Paper 50"> | Paper 50 | `#F7F9FC` | Main background |
| <img valign="middle" src="https://readme-swatches.vercel.app/FFFFFF?style=square&size=28" alt="White"> | White | `#FFFFFF` | Cards / logo backgrounds |

> **Yatrio color rule:** Navy establishes the identity → Royal Blue supports hierarchy → Azure drives interaction → Sky adds energy → Paper keeps the interface clean.

**Typography** — Poppins Bold for display · Poppins Regular for body · Inter for UI

The Poppins webfonts (400 / 500 / 600 / 700) and all logo assets live in [`brandkit/assets/`](brandkit/assets). The full identity system — five brand boards with logo construction, color system, typography, and digital / physical applications — lives in [`brandkit/`](brandkit).

</div>

---

<div align="center">
  <sub><a href="#"><img src="brandkit/assets/logo-wordmark.png" alt="Yatrio wordmark" width="110"></a></sub>
  <br><br>
  <sub>Yatrio — Architecture v1 · MERN + Railway API + Razorpay Test Mode</sub>
  <br>
  <sub><i>Move Beyond Limits 🚄</i></sub>
</div>
