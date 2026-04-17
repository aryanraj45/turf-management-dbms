const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- MySQL Connection Pool ---
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Raj",       // change this to your MySQL root password
  database: "turf_management",
  waitForConnections: true,
  connectionLimit: 10,
});

// ============================================================
// TURFS
// ============================================================

// GET all turfs
app.get("/api/turfs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM turfs ORDER BY turf_id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new turf
app.post("/api/turfs", async (req, res) => {
  try {
    const { name, location, sport_type, price_per_hour } = req.body;
    const [result] = await pool.query(
      "INSERT INTO turfs (name, location, sport_type, price_per_hour) VALUES (?, ?, ?, ?)",
      [name, location, sport_type, price_per_hour]
    );
    res.status(201).json({ turf_id: result.insertId, message: "Turf created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CUSTOMERS
// ============================================================

// GET all customers
app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers ORDER BY customer_id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new customer
app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const [result] = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    res.status(201).json({ customer_id: result.insertId, message: "Customer created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// BOOKINGS
// ============================================================

// GET all bookings (JOIN with turfs + customers)
app.get("/api/bookings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.booking_id, b.booking_date, b.start_time, b.end_time,
             b.total_amount, b.status,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             t.name AS turf_name, t.location AS turf_location, t.sport_type
      FROM bookings b
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN turfs t     ON b.turf_id     = t.turf_id
      ORDER BY b.booking_date DESC, b.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { turf_id, customer_id, booking_date, start_time, end_time, total_amount } = req.body;
    const [result] = await pool.query(
      `INSERT INTO bookings (turf_id, customer_id, booking_date, start_time, end_time, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [turf_id, customer_id, booking_date, start_time, end_time, total_amount]
    );
    res.status(201).json({ booking_id: result.insertId, message: "Booking created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PAYMENTS
// ============================================================

// GET all payments (JOIN with bookings)
app.get("/api/payments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.payment_id, p.amount, p.payment_method, p.payment_status, p.paid_at,
             b.booking_id, b.booking_date, c.name AS customer_name, t.name AS turf_name
      FROM payments p
      JOIN bookings b  ON p.booking_id  = b.booking_id
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN turfs t     ON b.turf_id     = t.turf_id
      ORDER BY p.paid_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new payment
app.post("/api/payments", async (req, res) => {
  try {
    const { booking_id, amount, payment_method } = req.body;
    const [result] = await pool.query(
      "INSERT INTO payments (booking_id, amount, payment_method) VALUES (?, ?, ?)",
      [booking_id, amount, payment_method]
    );
    res.status(201).json({ payment_id: result.insertId, message: "Payment recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DASHBOARD / STATS (Aggregation Endpoints)
// ============================================================

// Revenue and booking count per turf (GROUP BY + SUM + COUNT)
app.get("/api/stats/revenue-by-turf", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.turf_id, t.name AS turf_name, t.sport_type,
             COUNT(b.booking_id) AS total_bookings,
             COALESCE(SUM(b.total_amount), 0) AS total_revenue
      FROM turfs t
      LEFT JOIN bookings b ON t.turf_id = b.turf_id
      GROUP BY t.turf_id, t.name, t.sport_type
      ORDER BY total_revenue DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revenue by sport type (GROUP BY + SUM)
app.get("/api/stats/revenue-by-sport", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.sport_type,
             COUNT(b.booking_id) AS total_bookings,
             COALESCE(SUM(b.total_amount), 0) AS total_revenue
      FROM bookings b
      JOIN turfs t ON b.turf_id = t.turf_id
      GROUP BY t.sport_type
      ORDER BY total_revenue DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Overall dashboard stats
app.get("/api/stats/dashboard", async (req, res) => {
  try {
    const [[{ total_turfs }]] = await pool.query("SELECT COUNT(*) AS total_turfs FROM turfs");
    const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) AS total_customers FROM customers");
    const [[{ total_bookings }]] = await pool.query("SELECT COUNT(*) AS total_bookings FROM bookings");
    const [[{ total_revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bookings"
    );
    const [[{ pending_payments }]] = await pool.query(
      "SELECT COUNT(*) AS pending_payments FROM payments WHERE payment_status = 'pending'"
    );

    res.json({ total_turfs, total_customers, total_bookings, total_revenue, pending_payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Serve frontend
// ============================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Turf Management Server running at http://localhost:${PORT}`);
});
