# 🏟️ Turf Management System — DBMS Final Project

> **Course:** Database Management Systems (DBMS)  
> **Topic:** Turf Management System  
> **Due Date:** April 23, 2025  

---

## 📑 Table of Contents

1. [System Overview & Key Functionalities](#1-system-overview--key-functionalities)
2. [ER Model (Entity-Relationship Diagram)](#2-er-model-entity-relationship-diagram)
3. [Relational Schema (with PK & FK)](#3-relational-schema-with-pk--fk)
4. [Normalization Analysis (1NF → 2NF → 3NF)](#4-normalization-analysis-1nf--2nf--3nf)
5. [SQL Implementation](#5-sql-implementation)
6. [SQL Queries — JOINs & Aggregations](#6-sql-queries--joins--aggregations)
7. [REST API Documentation](#7-rest-api-documentation)
8. [Setup & Installation Guide](#8-setup--installation-guide)
9. [Project Structure](#9-project-structure)
10. [Team Members](#10-team-members)

---

## 1. System Overview & Key Functionalities

### 1.1 What is the Turf Management System?

A **Turf Management System** is a real-life software system designed to digitize the operations of sports turf/ground rental businesses. In cities like Delhi, Noida, and Gurugram, there are hundreds of private sports turfs (football grounds, cricket pitches, badminton courts) that are rented out on an hourly basis. Managing bookings, customer records, and payments for these turfs manually is error-prone and inefficient.

This system solves that problem by providing a centralized database-backed application that handles:

### 1.2 Key Functionalities

| # | Functionality | Description |
|---|---|---|
| 1 | **Turf Registration** | Add, view, and manage multiple sports grounds with details like name, location, sport type, and hourly pricing. |
| 2 | **Customer Management** | Store and retrieve customer personal information (name, email, phone) with unique email enforcement. |
| 3 | **Booking Management** | Create bookings that link a specific customer to a specific turf for a given date and time slot. Track booking status (confirmed / completed / cancelled). |
| 4 | **Payment Tracking** | Record payments against bookings. Support multiple payment methods (UPI, Card, Cash, Net Banking). Track payment status (pending / completed / refunded). |
| 5 | **Revenue Dashboard** | View aggregated statistics: total revenue, revenue per turf, revenue by sport type, total bookings count, and pending payments count. |

### 1.3 Real-World Use Case

Consider a business owner "Raj" who operates 4 sports turfs across Delhi-NCR. Before this system, he tracked bookings in a notebook and payments via WhatsApp messages. With this system:
- His staff can **register new turfs** when he opens a new ground.
- **Customers are stored once** and linked to any number of bookings (no duplicate data entry).
- **Hourly bookings** are tracked with date, start time, and end time.
- **Payments are separately logged** — if a customer pays in two installments, both are recorded.
- **Dashboard shows which turf earns the most**, helping Raj make business decisions.

---

## 2. ER Model (Entity-Relationship Diagram)

### 2.1 Entities Identified

We identified **4 entities** for this system:

| Entity | Description | Primary Key |
|---|---|---|
| **Turfs** | Sports grounds available for rent | `turf_id` |
| **Customers** | Users who book turfs | `customer_id` |
| **Bookings** | A reservation linking a customer to a turf for a time slot | `booking_id` |
| **Payments** | Financial transactions made against bookings | `payment_id` |

### 2.2 Attributes of Each Entity

#### Entity: `turfs`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `turf_id` | INT | **PRIMARY KEY**, AUTO_INCREMENT | Unique identifier for each turf |
| `name` | VARCHAR(100) | NOT NULL | Name of the turf (e.g., "Green Arena") |
| `location` | VARCHAR(200) | NOT NULL | Physical address |
| `sport_type` | VARCHAR(50) | NOT NULL | Type of sport (Football, Cricket, Badminton) |
| `price_per_hour` | DECIMAL(8,2) | NOT NULL | Rental cost per hour in INR |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether the turf is currently available |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

#### Entity: `customers`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `customer_id` | INT | **PRIMARY KEY**, AUTO_INCREMENT | Unique identifier for each customer |
| `name` | VARCHAR(100) | NOT NULL | Full name of the customer |
| `email` | VARCHAR(150) | NOT NULL, **UNIQUE** | Email address (enforces no duplicates) |
| `phone` | VARCHAR(15) | NOT NULL | Contact number |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

#### Entity: `bookings`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `booking_id` | INT | **PRIMARY KEY**, AUTO_INCREMENT | Unique identifier for each booking |
| `turf_id` | INT | **FOREIGN KEY** → `turfs(turf_id)`, NOT NULL | Which turf is booked |
| `customer_id` | INT | **FOREIGN KEY** → `customers(customer_id)`, NOT NULL | Who booked it |
| `booking_date` | DATE | NOT NULL | Date of the booking |
| `start_time` | TIME | NOT NULL | Booking start time |
| `end_time` | TIME | NOT NULL | Booking end time |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total cost for this booking |
| `status` | ENUM | DEFAULT 'confirmed' | confirmed / completed / cancelled |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

#### Entity: `payments`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `payment_id` | INT | **PRIMARY KEY**, AUTO_INCREMENT | Unique identifier for each payment |
| `booking_id` | INT | **FOREIGN KEY** → `bookings(booking_id)`, NOT NULL | Which booking this payment is for |
| `amount` | DECIMAL(10,2) | NOT NULL | Amount paid |
| `payment_method` | ENUM | NOT NULL | cash / upi / card / netbanking |
| `payment_status` | ENUM | DEFAULT 'pending' | pending / completed / refunded |
| `paid_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the payment was made |

### 2.3 ER Diagram

```
┌──────────────────┐                    ┌──────────────────┐
│     TURFS         │                    │    CUSTOMERS      │
│──────────────────│                    │──────────────────│
│ PK: turf_id      │                    │ PK: customer_id  │
│    name           │                    │    name           │
│    location       │                    │    email (UNIQUE) │
│    sport_type     │                    │    phone          │
│    price_per_hour │                    │    created_at     │
│    is_active      │                    └────────┬─────────┘
│    created_at     │                             │
└────────┬─────────┘                             │
         │                                        │
         │ 1                                   1  │
         │                                        │
         │ M                                   M  │
         │         ┌──────────────────┐           │
         └────────►│    BOOKINGS       │◄──────────┘
                   │──────────────────│
                   │ PK: booking_id   │
                   │ FK: turf_id      │───► turfs(turf_id)
                   │ FK: customer_id  │───► customers(customer_id)
                   │    booking_date  │
                   │    start_time    │
                   │    end_time      │
                   │    total_amount  │
                   │    status        │
                   │    created_at    │
                   └────────┬─────────┘
                            │
                            │ 1
                            │
                            │ M
                   ┌────────▼─────────┐
                   │    PAYMENTS       │
                   │──────────────────│
                   │ PK: payment_id   │
                   │ FK: booking_id   │───► bookings(booking_id)
                   │    amount        │
                   │    payment_method│
                   │    payment_status│
                   │    paid_at       │
                   └──────────────────┘
```

### 2.4 Relationships

| Relationship | Cardinality | Description | Participation |
|---|---|---|---|
| Turfs ↔ Bookings | **1 : M** (One-to-Many) | One turf can have many bookings over time, but each booking is for exactly one turf. | Turfs: Partial, Bookings: Total |
| Customers ↔ Bookings | **1 : M** (One-to-Many) | One customer can make many bookings, but each booking belongs to exactly one customer. | Customers: Partial, Bookings: Total |
| Bookings ↔ Payments | **1 : M** (One-to-Many) | One booking can have multiple payments (e.g., advance + balance), but each payment is tied to exactly one booking. | Bookings: Partial, Payments: Total |

---

## 3. Relational Schema (with PK & FK)

The ER model is converted into the following **4 relational schemas**:

### Schema 1: `turfs`
```
turfs (
    turf_id          INT          PRIMARY KEY  AUTO_INCREMENT,
    name             VARCHAR(100) NOT NULL,
    location         VARCHAR(200) NOT NULL,
    sport_type       VARCHAR(50)  NOT NULL,
    price_per_hour   DECIMAL(8,2) NOT NULL,
    is_active        BOOLEAN      DEFAULT TRUE,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
)
```

### Schema 2: `customers`
```
customers (
    customer_id      INT          PRIMARY KEY  AUTO_INCREMENT,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL  UNIQUE,
    phone            VARCHAR(15)  NOT NULL,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
)
```

### Schema 3: `bookings`
```
bookings (
    booking_id       INT          PRIMARY KEY  AUTO_INCREMENT,
    turf_id          INT          NOT NULL     FOREIGN KEY REFERENCES turfs(turf_id),
    customer_id      INT          NOT NULL     FOREIGN KEY REFERENCES customers(customer_id),
    booking_date     DATE         NOT NULL,
    start_time       TIME         NOT NULL,
    end_time         TIME         NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    status           ENUM('confirmed','cancelled','completed')  DEFAULT 'confirmed',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
)
```

### Schema 4: `payments`
```
payments (
    payment_id       INT          PRIMARY KEY  AUTO_INCREMENT,
    booking_id       INT          NOT NULL     FOREIGN KEY REFERENCES bookings(booking_id),
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   ENUM('cash','upi','card','netbanking')    NOT NULL,
    payment_status   ENUM('pending','completed','refunded')    DEFAULT 'pending',
    paid_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
)
```

### Foreign Key Constraints Summary

| Table | Foreign Key Column | References | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `bookings` | `turf_id` | `turfs(turf_id)` | RESTRICT | CASCADE |
| `bookings` | `customer_id` | `customers(customer_id)` | RESTRICT | CASCADE |
| `payments` | `booking_id` | `bookings(booking_id)` | RESTRICT | CASCADE |

> **Why RESTRICT on DELETE?** — We don't want to accidentally delete a turf or customer that has existing bookings. The system will prevent such deletions and show an error, forcing the user to handle bookings first.

> **Why CASCADE on UPDATE?** — If a primary key is ever updated, the change automatically propagates to all related foreign key rows, maintaining referential integrity.

---

## 4. Normalization Analysis (1NF → 2NF → 3NF)

### 4.1 Understanding Normal Forms

| Normal Form | Rule |
|---|---|
| **1NF** | All columns must hold **atomic (indivisible) values**. No repeating groups or arrays. Each row must be uniquely identifiable. |
| **2NF** | Must be in 1NF + **No partial dependency** (every non-key attribute must depend on the *entire* primary key, not just part of it). |
| **3NF** | Must be in 2NF + **No transitive dependency** (non-key attributes must not depend on other non-key attributes). |

### 4.2 Table-by-Table Normalization Proof

#### Table: `turfs` — Achieves **3NF** ✅

| Check | Analysis | Result |
|---|---|---|
| 1NF | All values are atomic. `name`, `location`, `sport_type` are single values (not lists). PK = `turf_id`. | ✅ |
| 2NF | PK is a single column (`turf_id`), so partial dependency is **impossible** by definition. | ✅ |
| 3NF | `name`, `location`, `sport_type`, `price_per_hour`, `is_active` all depend **only on `turf_id`** and not on each other. No transitive dependency exists. | ✅ |

**Functional Dependencies:**
```
turf_id → name, location, sport_type, price_per_hour, is_active, created_at
```

#### Table: `customers` — Achieves **3NF** ✅

| Check | Analysis | Result |
|---|---|---|
| 1NF | All values are atomic. `email` is constrained to be UNIQUE. PK = `customer_id`. | ✅ |
| 2NF | Single-column PK → no partial dependency possible. | ✅ |
| 3NF | `name`, `email`, `phone` all depend directly on `customer_id`. `email` is a candidate key but is **not used as PK** to avoid update anomalies (if email changes, all FKs referencing it would need updating). No transitive dependency. | ✅ |

**Functional Dependencies:**
```
customer_id → name, email, phone, created_at
email → customer_id, name, phone  (candidate key)
```

#### Table: `bookings` — Achieves **3NF** ✅

| Check | Analysis | Result |
|---|---|---|
| 1NF | All values are atomic. ENUM is a single value selected from a set. PK = `booking_id`. | ✅ |
| 2NF | Single-column PK → no partial dependency possible. | ✅ |
| 3NF | All attributes depend only on `booking_id`. Customer details (name, email) are **NOT stored here** — only `customer_id` FK is stored, which is correct. Turf details (name, price) are **NOT duplicated here** — only `turf_id` FK is stored. | ✅ |

**Functional Dependencies:**
```
booking_id → turf_id, customer_id, booking_date, start_time, end_time, total_amount, status, created_at
```

> **Important Design Decision:** `total_amount` is stored in bookings rather than being calculated from `turfs.price_per_hour × hours`. This is intentional because turf prices may change over time. Storing the amount at booking time **preserves the historical cost** and avoids the anomaly of retroactively changing past booking amounts.

#### Table: `payments` — Achieves **3NF** ✅

| Check | Analysis | Result |
|---|---|---|
| 1NF | All values atomic. PK = `payment_id`. | ✅ |
| 2NF | Single-column PK → no partial dependency possible. | ✅ |
| 3NF | `amount`, `payment_method`, `payment_status` all depend only on `payment_id`. Booking details are **NOT duplicated** — only `booking_id` FK is stored. | ✅ |

**Functional Dependencies:**
```
payment_id → booking_id, amount, payment_method, payment_status, paid_at
```

> **Why is `payments` a separate table from `bookings`?** If payment info (method, status) were stored inside `bookings`, updating a payment status would modify the booking row, causing **update anomalies**. Separating them also allows **multiple payments per booking** (e.g., advance + balance payment).

### 4.3 Normalization Summary

| Table | 1NF | 2NF | 3NF | Highest NF Achieved |
|---|---|---|---|---|
| `turfs` | ✅ | ✅ | ✅ | **3NF** |
| `customers` | ✅ | ✅ | ✅ | **3NF** |
| `bookings` | ✅ | ✅ | ✅ | **3NF** |
| `payments` | ✅ | ✅ | ✅ | **3NF** |

**All 4 relations achieve Third Normal Form (3NF).**

---

## 5. SQL Implementation

All SQL code is in the [`database.sql`](database.sql) file. Below is a summary of what it contains:

### 5.1 Database & Table Creation

```sql
CREATE DATABASE IF NOT EXISTS turf_management;
USE turf_management;
```

4 tables are created with proper constraints:
- `turfs` — with `PRIMARY KEY`, `NOT NULL`, `DEFAULT`
- `customers` — with `PRIMARY KEY`, `NOT NULL`, `UNIQUE`
- `bookings` — with `PRIMARY KEY`, `FOREIGN KEY` (×2), `ENUM`, `NOT NULL`
- `payments` — with `PRIMARY KEY`, `FOREIGN KEY`, `ENUM`, `NOT NULL`

### 5.2 Constraints Applied

| Constraint Type | Where Applied |
|---|---|
| `PRIMARY KEY` | All 4 tables (`turf_id`, `customer_id`, `booking_id`, `payment_id`) |
| `FOREIGN KEY` | `bookings.turf_id` → `turfs`, `bookings.customer_id` → `customers`, `payments.booking_id` → `bookings` |
| `NOT NULL` | All essential columns across all tables |
| `UNIQUE` | `customers.email` |
| `DEFAULT` | `is_active` (TRUE), `status` ('confirmed'), `payment_status` ('pending'), timestamps |
| `ENUM` | `bookings.status`, `payments.payment_method`, `payments.payment_status` |
| `ON DELETE RESTRICT` | Prevents deleting turfs/customers with existing bookings |
| `ON UPDATE CASCADE` | Propagates PK updates to FK references |
| `AUTO_INCREMENT` | All primary keys |

### 5.3 Sample Data Inserted

#### Turfs (4 rows)
| turf_id | name | location | sport_type | price_per_hour |
|---|---|---|---|---|
| 1 | Green Arena | Sector 62, Noida | Football | ₹1,200 |
| 2 | Smash Court | Dwarka, New Delhi | Badminton | ₹800 |
| 3 | Cricket Hub | Rohini, New Delhi | Cricket | ₹1,500 |
| 4 | PowerPlay Ground | Gurugram, Haryana | Football | ₹1,800 |

#### Customers (4 rows)
| customer_id | name | email | phone |
|---|---|---|---|
| 1 | Aarav Sharma | aarav.sharma@gmail.com | 9876543210 |
| 2 | Priya Verma | priya.verma@gmail.com | 9123456780 |
| 3 | Rohan Mehta | rohan.mehta@outlook.com | 9988776655 |
| 4 | Sneha Kapoor | sneha.kapoor@gmail.com | 9012345678 |

#### Bookings (4 rows)
| booking_id | turf | customer | date | time | amount | status |
|---|---|---|---|---|---|---|
| 1 | Green Arena | Aarav Sharma | 2025-04-10 | 17:00–18:00 | ₹1,200 | completed |
| 2 | Cricket Hub | Priya Verma | 2025-04-11 | 09:00–11:00 | ₹3,000 | completed |
| 3 | Smash Court | Rohan Mehta | 2025-04-12 | 18:00–19:00 | ₹800 | confirmed |
| 4 | PowerPlay Ground | Sneha Kapoor | 2025-04-13 | 16:00–18:00 | ₹3,600 | confirmed |

#### Payments (4 rows)
| payment_id | booking_id | amount | method | status |
|---|---|---|---|---|
| 1 | 1 | ₹1,200 | UPI | completed |
| 2 | 2 | ₹3,000 | Card | completed |
| 3 | 3 | ₹800 | Cash | pending |
| 4 | 4 | ₹3,600 | UPI | pending |

---

## 6. SQL Queries — JOINs & Aggregations

### 6.1 JOIN Query — All Bookings with Customer & Turf Details

This query combines data from **3 tables** (`bookings`, `customers`, `turfs`) using `INNER JOIN`:

```sql
SELECT b.booking_id,
       c.name AS customer,
       t.name AS turf,
       t.sport_type,
       b.booking_date,
       b.start_time,
       b.end_time,
       b.total_amount,
       b.status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN turfs t     ON b.turf_id     = t.turf_id;
```

**Output:**

| booking_id | customer | turf | sport_type | booking_date | start_time | end_time | total_amount | status |
|---|---|---|---|---|---|---|---|---|
| 1 | Aarav Sharma | Green Arena | Football | 2025-04-10 | 17:00:00 | 18:00:00 | 1200.00 | completed |
| 2 | Priya Verma | Cricket Hub | Cricket | 2025-04-11 | 09:00:00 | 11:00:00 | 3000.00 | completed |
| 3 | Rohan Mehta | Smash Court | Badminton | 2025-04-12 | 18:00:00 | 19:00:00 | 800.00 | confirmed |
| 4 | Sneha Kapoor | PowerPlay Ground | Football | 2025-04-13 | 16:00:00 | 18:00:00 | 3600.00 | confirmed |

**Explanation:** Without JOINs, the `bookings` table only stores IDs (`turf_id`, `customer_id`). The JOIN brings in the human-readable names from the related tables.

---

### 6.2 Aggregation Query — Total Revenue & Booking Count Per Turf

Uses `LEFT JOIN`, `COUNT()`, `SUM()`, and `GROUP BY`:

```sql
SELECT t.name AS turf,
       COUNT(b.booking_id) AS total_bookings,
       SUM(b.total_amount) AS total_revenue
FROM turfs t
LEFT JOIN bookings b ON t.turf_id = b.turf_id
GROUP BY t.turf_id, t.name;
```

**Output:**

| turf | total_bookings | total_revenue |
|---|---|---|
| Green Arena | 1 | 1200.00 |
| Smash Court | 1 | 800.00 |
| Cricket Hub | 1 | 3000.00 |
| PowerPlay Ground | 1 | 3600.00 |

**Why LEFT JOIN instead of INNER JOIN?** — We use `LEFT JOIN` so that turfs with **zero bookings** still appear in the result (with `total_bookings = 0`). An `INNER JOIN` would exclude them entirely.

---

### 6.3 Aggregation Query — Revenue Breakdown by Sport Type

Uses `JOIN`, `COUNT()`, `SUM()`, and `GROUP BY`:

```sql
SELECT t.sport_type,
       COUNT(b.booking_id) AS bookings,
       SUM(b.total_amount) AS revenue
FROM bookings b
JOIN turfs t ON b.turf_id = t.turf_id
GROUP BY t.sport_type;
```

**Output:**

| sport_type | bookings | revenue |
|---|---|---|
| Football | 2 | 4800.00 |
| Cricket | 1 | 3000.00 |
| Badminton | 1 | 800.00 |

**Insight:** Football generates the highest revenue (₹4,800 from 2 bookings), making it the most popular sport across all turfs.

---

## 7. REST API Documentation

The project includes a fully functional Node.js + Express REST API that interacts with the MySQL database.

**Base URL:** `http://localhost:3000`

### 7.1 CRUD Endpoints

| Method | Endpoint | Description | SQL Used |
|---|---|---|---|
| `GET` | `/api/turfs` | Fetch all turfs | `SELECT *` |
| `POST` | `/api/turfs` | Add a new turf | `INSERT INTO` |
| `GET` | `/api/customers` | Fetch all customers | `SELECT *` |
| `POST` | `/api/customers` | Add a new customer | `INSERT INTO` |
| `GET` | `/api/bookings` | Fetch all bookings with details | `SELECT` + `JOIN` (3 tables) |
| `POST` | `/api/bookings` | Create a new booking | `INSERT INTO` |
| `GET` | `/api/payments` | Fetch all payments with details | `SELECT` + `JOIN` (4 tables) |
| `POST` | `/api/payments` | Record a payment | `INSERT INTO` |

### 7.2 Aggregation / Dashboard Endpoints

| Method | Endpoint | SQL Features Used |
|---|---|---|
| `GET` | `/api/stats/dashboard` | `COUNT(*)`, `SUM()` |
| `GET` | `/api/stats/revenue-by-turf` | `LEFT JOIN`, `GROUP BY`, `SUM`, `COUNT`, `COALESCE` |
| `GET` | `/api/stats/revenue-by-sport` | `JOIN`, `GROUP BY`, `SUM`, `COUNT` |

### 7.3 Example POST Payloads

**Add a Turf:**
```json
POST /api/turfs
{
  "name": "Striker Arena",
  "location": "Connaught Place, Delhi",
  "sport_type": "Football",
  "price_per_hour": 1400.00
}
```

**Add a Customer:**
```json
POST /api/customers
{
  "name": "Vikram Singh",
  "email": "vikram.singh@gmail.com",
  "phone": "9876501234"
}
```

**Create a Booking:**
```json
POST /api/bookings
{
  "turf_id": 1,
  "customer_id": 2,
  "booking_date": "2025-04-15",
  "start_time": "17:00",
  "end_time": "18:00",
  "total_amount": 1200.00
}
```

**Record a Payment:**
```json
POST /api/payments
{
  "booking_id": 1,
  "amount": 1200.00,
  "payment_method": "upi"
}
```

---

## 8. Setup & Installation Guide

### Prerequisites

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) — Install via Homebrew: `brew install mysql`

### Step-by-Step Setup

```bash
# Step 1: Start MySQL (if not already running)
brew services start mysql

# Step 2: Import the database schema & sample data
mysql -u root -p < database.sql
# Enter your MySQL root password when prompted

# Step 3: Update MySQL password in server.js (line 15)
# Open server.js and set your password in the pool config

# Step 4: Install Node.js dependencies
npm install

# Step 5: Start the server
npm start
```

The application will be available at **http://localhost:3000**

---

## 9. Project Structure

```
dbms project/
│
├── database.sql          # MySQL schema, constraints, sample data & queries
├── server.js             # Node.js + Express REST API server
├── package.json          # Project metadata & dependencies
├── README.md             # This report
├── .gitignore            # Git ignore rules
│
└── public/
    └── index.html        # Frontend dashboard (dark-themed UI)
```

### Technology Stack

| Layer | Technology |
|---|---|
| **Database** | MySQL 8.0 (Relational / SQL) |
| **Backend** | Node.js + Express.js |
| **Database Driver** | mysql2 (with Promise/async-await support) |
| **Frontend** | Vanilla HTML + CSS + JavaScript |
| **API Format** | REST (JSON) |

---

## 10. Team Members

| Name | Roll Number | Contribution |
|---|---|---|
| Raj Aryan | 2024UIC4038 | Database Design, Frontend & Backend Development |
| | | |
| | | |

> *Team detail filled.*

---

*Generated as part of the DBMS Final Project.*
