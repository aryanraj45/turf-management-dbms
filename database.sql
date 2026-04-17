-- ============================================================
-- Turf Management System - Database Schema & Sample Data
-- DBMS: MySQL
-- Normal Form: 3NF (Third Normal Form)
-- ============================================================

CREATE DATABASE IF NOT EXISTS turf_management;
USE turf_management;

-- ============================================================
-- Table 1: turfs
-- Stores information about each sports turf/ground.
-- 3NF: All attributes depend solely on turf_id (no transitive
--       or partial dependencies).
-- ============================================================
CREATE TABLE turfs (
    turf_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    location    VARCHAR(200)   NOT NULL,
    sport_type  VARCHAR(50)    NOT NULL,
    price_per_hour DECIMAL(8,2) NOT NULL,
    is_active   BOOLEAN        DEFAULT TRUE,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table 2: customers
-- Stores customer/user details.
-- 3NF: email is unique but not used as PK to avoid update
--       anomalies. All non-key attributes depend only on
--       customer_id.
-- ============================================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    email       VARCHAR(150)   NOT NULL UNIQUE,
    phone       VARCHAR(15)    NOT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table 3: bookings
-- Stores each booking linking a customer to a turf.
-- 3NF: total_amount is stored (not derived) because price may
--       change over time; storing it preserves the historical
--       cost. All attributes depend only on booking_id.
-- ============================================================
CREATE TABLE bookings (
    booking_id   INT AUTO_INCREMENT PRIMARY KEY,
    turf_id      INT            NOT NULL,
    customer_id  INT            NOT NULL,
    booking_date DATE           NOT NULL,
    start_time   TIME           NOT NULL,
    end_time     TIME           NOT NULL,
    total_amount DECIMAL(10,2)  NOT NULL,
    status       ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (turf_id)     REFERENCES turfs(turf_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- Table 4: payments
-- Stores payment records for each booking.
-- Separated from bookings to avoid update anomalies on
-- payment status changes. 3NF: all attributes depend on
-- payment_id alone.
-- ============================================================
CREATE TABLE payments (
    payment_id     INT AUTO_INCREMENT PRIMARY KEY,
    booking_id     INT            NOT NULL,
    amount         DECIMAL(10,2)  NOT NULL,
    payment_method ENUM('cash', 'upi', 'card', 'netbanking') NOT NULL,
    payment_status ENUM('pending', 'completed', 'refunded')  DEFAULT 'pending',
    paid_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- Sample Data
-- ============================================================

-- Turfs
INSERT INTO turfs (name, location, sport_type, price_per_hour) VALUES
('Green Arena',      'Sector 62, Noida',       'Football',  1200.00),
('Smash Court',      'Dwarka, New Delhi',       'Badminton',  800.00),
('Cricket Hub',      'Rohini, New Delhi',       'Cricket',   1500.00),
('PowerPlay Ground', 'Gurugram, Haryana',       'Football',  1800.00);

-- Customers
INSERT INTO customers (name, email, phone) VALUES
('Aarav Sharma',   'aarav.sharma@gmail.com',   '9876543210'),
('Priya Verma',    'priya.verma@gmail.com',    '9123456780'),
('Rohan Mehta',    'rohan.mehta@outlook.com',  '9988776655'),
('Sneha Kapoor',   'sneha.kapoor@gmail.com',   '9012345678');

-- Bookings
INSERT INTO bookings (turf_id, customer_id, booking_date, start_time, end_time, total_amount, status) VALUES
(1, 1, '2025-04-10', '17:00:00', '18:00:00', 1200.00, 'completed'),
(3, 2, '2025-04-11', '09:00:00', '11:00:00', 3000.00, 'completed'),
(2, 3, '2025-04-12', '18:00:00', '19:00:00',  800.00, 'confirmed'),
(4, 4, '2025-04-13', '16:00:00', '18:00:00', 3600.00, 'confirmed');

-- Payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES
(1, 1200.00, 'upi',  'completed'),
(2, 3000.00, 'card', 'completed'),
(3,  800.00, 'cash', 'pending'),
(4, 3600.00, 'upi',  'pending');

-- ============================================================
-- Useful Queries (for reference / viva)
-- ============================================================

-- JOIN: Get all bookings with customer and turf details
SELECT b.booking_id, c.name AS customer, t.name AS turf,
       t.sport_type, b.booking_date, b.start_time, b.end_time,
       b.total_amount, b.status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN turfs t     ON b.turf_id     = t.turf_id;

-- AGGREGATION: Total revenue per turf
SELECT t.name AS turf, COUNT(b.booking_id) AS total_bookings,
       SUM(b.total_amount) AS total_revenue
FROM turfs t
LEFT JOIN bookings b ON t.turf_id = b.turf_id
GROUP BY t.turf_id, t.name;

-- AGGREGATION: Revenue by sport type
SELECT t.sport_type, COUNT(b.booking_id) AS bookings,
       SUM(b.total_amount) AS revenue
FROM bookings b
JOIN turfs t ON b.turf_id = t.turf_id
GROUP BY t.sport_type;
