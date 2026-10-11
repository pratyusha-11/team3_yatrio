# RailSetu

**Railway Ticket Booking and Management System**

RailSetu is a modern railway reservation and management system designed to provide a seamless experience for passengers and administrators.

## 🚆 Project Overview

RailSetu provides a complete platform for railway ticket reservation, passenger management, train management, booking management, and administrative operations.

The frontend is built with React and TypeScript, while the backend is built with Node.js and Express.js.

---

## ✨ Features

### 👤 Passenger

* Railway/train search
* Train details and route information
* Passenger details management
* Seat selection
* Ticket booking
* Booking review
* Payment interface
* PNR status
* My bookings
* Ticket/booking details
* Profile management

### 🛠️ Admin

* Dashboard
* Train management
* Station management
* Schedule management
* Booking management
* User management
* Fare management
* Reports
* Audit logs

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **CSS / Tailwind CSS**
* **React Router**
* **Lucide Icons**

### Backend

* **Node.js**
* **Express.js**
* **JWT Authentication**
* **bcryptjs**

### Database

* PostgreSQL *(planned / depending on current configuration)*

---

## 📁 Project Structure

```text
RailSetu/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
│
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/
│   │   ├── passenger/
│   │   └── public/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
│
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# ▶️ How to Run the Project

## 1. Clone the Repository

```bash
git clone https://github.com/BROKEN0103/RailSetu.git
```

Navigate into the project:

```bash
cd RailSetu
```

---

## 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

---

## 3. Install Backend Dependencies

Navigate to the backend:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

Then return to the project root:

```bash
cd ..
```

---

# 🔐 Environment Variables

The backend uses environment variables for configuration.

Create a `.env` file inside the `backend` directory:

```text
backend/
└── .env
```

Add the required environment variables according to your backend configuration.

For example:

```env
PORT=5000
JWT_SECRET=your_secret_key
```

> Do not commit your `.env` file to GitHub if it contains passwords, API keys, database credentials, or other secrets.

---

# 🚀 Start the Application

The frontend and backend should be run in **two separate terminals**.

## Terminal 1 — Start Backend

From the project root:

```bash
cd backend
npm run dev
```

The backend will start using Nodemon.

You should see output similar to:

```text
[nodemon] starting `node src/server.js`
```

---

## Terminal 2 — Start Frontend

Open another terminal and go to the project root:

```bash
cd RailSetu
```

Then run:

```bash
npm run dev
```

Vite will display the local development URL, usually something similar to:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 🔄 Running Both Servers

You need both servers running at the same time:

```text
Terminal 1
──────────────
cd backend
npm run dev

        ↓

Backend
http://localhost:5000
```

and:

```text
Terminal 2
──────────────
npm run dev

        ↓

Frontend
http://localhost:5173
```

The frontend communicates with the backend through the configured API endpoints.

---

# 🧪 Development

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd backend
npm run dev
```

### Build Frontend

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

# 🔮 Future Development

The project can be extended with:

* User authentication and authorization
* Train and station APIs
* Real-time train search
* Database-driven seat availability
* Ticket booking
* Automatic PNR generation
* Booking cancellation
* Fare calculation
* Payment processing
* RAC/waitlist management
* Administrative APIs
* Reports and analytics

---

# 📌 Project Status

| Component       | Status                      |
| --------------- | --------------------------- |
| Frontend        | ✅ Completed                 |
| Backend         | 🚧 Under Development        |
| Database        | 🚧 Planned / In Development |
| API Integration | 🚧 In Development           |
| Authentication  | 🚧 In Development           |

---

# 👨‍💻 Author

**BROKEN0103**

---

## 📄 License

This project is developed for educational and development purposes.

---

## Team 7: Admin, Analytics & System Infrastructure

### Scope
Team 7 implements the administrative observation, reporting, and system control layer. This includes the internal React admin shell, authentication guards, dynamic dashboard charting, and deep backend integrations for operational visibility.

### Frontend Routes (React)
- `/admin/login` - Premium Yatrio administrative authentication
- `/admin` - Operational dashboard overview
- `/admin/users` - Passenger and admin management
- `/admin/trains` - Fleet read-only observation
- `/admin/bookings`, `/admin/payments`, `/admin/cancellations` - Transactional interfaces
- `/admin/monitoring` - Real-time system telemetry and API health logs
- `/admin/reports` - Dynamic datasets with CSV export capabilities
- `/admin/analytics` - Visual charting workspaces
- `/admin/audit-logs` - Security event timeline

### Backend Routes (Express)
Mounted under `/api/v1/admin/`:
- `GET /dashboard`, `GET /users`, `GET /trains`, `GET /bookings`, `GET /payments`, `GET /cancellations`, `GET /audit-logs`, `GET /reports`, `GET /analytics`, `GET /monitoring`, `GET /monitoring/api`, `GET /monitoring/pnr`

### Database Objects (MySQL)
- **Tables**: `audit_logs`, `api_request_logs`
- **Views**: `vw_booking_summary`, `vw_revenue_summary`, `vw_train_occupancy`, `vw_user_activity`
- **Procedures**: `get_dashboard_statistics()`, `get_daily_revenue()`, `get_popular_routes()`, `get_train_occupancy()`
- **Indexes**: Includes composite `idx_users_role_status` and timestamp filters for telemetry tables.

### Caching & Telemetry (Redis)
Team 7 utilizes `ioredis` strictly connected to `127.0.0.1:6379`. It provides:
- Automatic short-TTL caching for heavy dashboard KPI queries.
- Health telemetry tracking inside `/admin/monitoring`.
- API request rate limiting.

### Demo Limitations & Cross-Team Integrations
Team 7 respects strict cross-team domain boundaries. Specifically, **Team 4 (Bookings)**, **Team 5 (Payments)**, and **Team 6 (PNR Live)** schemas are currently pending migration integrations.

**Until these tables become active:**
- The frontend displays honest `"Integration Pending"` empty states for booking and payment management pages.
- The dashboard and analytics engine will dynamically estimate `"proxy revenue"` and booking volume snapshots strictly via the `train_classes.available_seats` metric. No transactional fields are fabricated. As soon as the respective teams' schemas are integrated into the MySQL DB, these admin interfaces will instantly consume the live data.
