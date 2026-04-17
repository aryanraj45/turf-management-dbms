# 🏟️ Turf Management System

> A full-stack web application for managing sports turf bookings, customers, and payments.  
> Built with **Node.js**, **Express**, **MySQL**, and a modern web dashboard.

---

## 📋 System Overview

The Turf Management System digitizes the operations of a sports facility that rents out turfs (football, cricket, badminton grounds) to customers on an hourly basis. It handles:

- **Turf Registration** — Add and manage available sports grounds.
- **Customer Management** — Store customer contact information.
- **Booking Management** — Create and track bookings linking customers to turfs.
- **Payment Tracking** — Record payments for bookings with multiple payment methods.
- **Revenue Dashboard** — Aggregated statistics and revenue breakdowns.

---

## 🗂️ ER Model & Database Design

### Entities & Relationships

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│  turfs   │ 1───M │   bookings   │ M───1 │  customers   │
│          │       │              │       │              │
│ turf_id  │       │ booking_id   │       │ customer_id  │
│ name     │       │ turf_id (FK) │       │ name         │
│ location │       │ customer_id  │       │ email        │
│ sport    │       │   (FK)       │       │ phone        │
│ price/hr │       │ booking_date │       └──────────────┘
│ is_active│       │ start_time   │
└──────────┘       │ end_time     │
                   │ total_amount │
                   │ status       │
                   └──────┬───────┘
                          │ 1
                          │
                          │ M
                   ┌──────┴───────┐
                   │   payments   │
                   │              │
                   │ payment_id   │
                   │ booking_id   │
                   │   (FK)       │
                   │ amount       │
                   │ method       │
                   │ status       │
                   └──────────────┘
```

### Relationships

| Relationship | Type | Description |
|---|---|---|
| turfs → bookings | 1:M | A turf can have many bookings |
| customers → bookings | 1:M | A customer can make many bookings |
| bookings → payments | 1:M | A booking can have multiple payment records |

### Normalization (3NF)

All tables satisfy **Third Normal Form (3NF)**:

| Normal Form | Requirement | Status |
|---|---|---|
| **1NF** | All columns hold atomic (indivisible) values; each row is unique | ✅ |
| **2NF** | No partial dependencies (non-key attributes depend on the full PK) | ✅ |
| **3NF** | No transitive dependencies (non-key attributes don't depend on other non-key attributes) | ✅ |

**Design decisions for 3NF compliance:**
- `total_amount` is stored in `bookings` (not derived) because turf prices may change over time — storing it preserves the historical cost at booking time.
- `payments` is a separate table from `bookings` to avoid update anomalies when payment status changes.
- `customers` contact info (email, phone) is stored in `customers` only, not duplicated in `bookings`.

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v16+)
- **MySQL** (v8.0+)

### Step 1: Create the Database

```bash
mysql -u root -p < database.sql
```

Or open MySQL Workbench / phpMyAdmin and run the contents of `database.sql`.

### Step 2: Configure Database Connection

Open `server.js` and update the MySQL credentials (line 14-18):

```js
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",       // ← set your MySQL password here
  database: "turf_management",
});
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Server

```bash
npm start
```

The server runs at **http://localhost:3000**. Open it in a browser to see the dashboard.

---

## 📡 API Documentation

Base URL: `http://localhost:3000`

### Turfs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/turfs` | Get all turfs |
| POST | `/api/turfs` | Create a new turf |

**POST `/api/turfs`** — Example payload:
```json
{
  "name": "Striker Arena",
  "location": "Connaught Place, Delhi",
  "sport_type": "Football",
  "price_per_hour": 1400.00
}
```

### Customers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Create a new customer |

**POST `/api/customers`** — Example payload:
```json
{
  "name": "Vikram Singh",
  "email": "vikram.singh@gmail.com",
  "phone": "9876501234"
}
```

### Bookings (Uses SQL JOINs)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get all bookings with customer & turf details (JOIN) |
| POST | `/api/bookings` | Create a new booking |

**POST `/api/bookings`** — Example payload:
```json
{
  "turf_id": 1,
  "customer_id": 2,
  "booking_date": "2025-04-15",
  "start_time": "17:00",
  "end_time": "18:00",
  "total_amount": 1200.00
}
```

### Payments (Uses SQL JOINs)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | Get all payments with booking, customer & turf info (JOIN) |
| POST | `/api/payments` | Record a new payment |

**POST `/api/payments`** — Example payload:
```json
{
  "booking_id": 1,
  "amount": 1200.00,
  "payment_method": "upi"
}
```

### Dashboard / Stats (Uses SQL Aggregations)

| Method | Endpoint | SQL Features | Description |
|---|---|---|---|
| GET | `/api/stats/dashboard` | `COUNT(*)`, `SUM()` | Overall stats (totals) |
| GET | `/api/stats/revenue-by-turf` | `GROUP BY`, `SUM`, `COUNT`, `LEFT JOIN` | Revenue breakdown per turf |
| GET | `/api/stats/revenue-by-sport` | `GROUP BY`, `SUM`, `COUNT`, `JOIN` | Revenue breakdown per sport type |

---

## 📂 Project Structure

```
dbms project/
├── database.sql        # MySQL schema + sample data
├── server.js           # Express API server
├── package.json        # Node.js dependencies
├── README.md           # This file
└── public/
    └── index.html      # Frontend dashboard
```

---

## 🔍 Key SQL Queries Used

### JOIN — Fetch bookings with related data
```sql
SELECT b.booking_id, c.name AS customer, t.name AS turf,
       t.sport_type, b.booking_date, b.total_amount, b.status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN turfs t     ON b.turf_id     = t.turf_id;
```

### Aggregation — Revenue per turf
```sql
SELECT t.name, COUNT(b.booking_id) AS total_bookings,
       SUM(b.total_amount) AS total_revenue
FROM turfs t
LEFT JOIN bookings b ON t.turf_id = b.turf_id
GROUP BY t.turf_id, t.name;
```

### Aggregation — Revenue by sport type
```sql
SELECT t.sport_type, COUNT(b.booking_id) AS bookings,
       SUM(b.total_amount) AS revenue
FROM bookings b
JOIN turfs t ON b.turf_id = t.turf_id
GROUP BY t.sport_type;
```

---

## 👥 Team

| Name | Roll Number | Contribution |
|---|---|---|
| | | |
| | | |
| | | |

> *Fill in team details before submission.*
