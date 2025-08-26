const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const multer = require('multer');

const app = express(); // <-- This must be first!

app.use(cors());
app.use(express.json());

// PostgreSQL pool setup (update with your DB config)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cmrdb',
  password: 'Back@123',
  port: 5432,
});

// File upload setup
const upload = multer({ dest: 'uploads/' }); // or configure as needed

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// --- Global Search Endpoint ---
app.get('/api/global-search', async (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 2) return res.json({ results: [] });
  try {
    // Use ILIKE for case-insensitive search in Postgres
    const [companies, contacts, leads, reports, compliances] = await Promise.all([
      pool.query("SELECT *, 'company' as type FROM companies WHERE name ILIKE $1 OR industry ILIKE $1", [`%${q}%`]),
      pool.query("SELECT *, 'contact' as type FROM contacts WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR company ILIKE $1 OR role ILIKE $1 OR designation ILIKE $1 OR linkedin ILIKE $1", [`%${q}%`]),
      pool.query("SELECT *, 'lead' as type FROM leads WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1 OR status ILIKE $1", [`%${q}%`]),
      pool.query("SELECT *, 'report' as type FROM reports WHERE company ILIKE $1 OR summary ILIKE $1 OR metrics ILIKE $1 OR originalname ILIKE $1", [`%${q}%`]),
      pool.query("SELECT *, 'compliance' as type FROM compliances WHERE name ILIKE $1 OR status ILIKE $1 OR notes ILIKE $1", [`%${q}%`]),
    ]);
    res.json({
      results: [
        ...companies.rows,
        ...contacts.rows,
        ...leads.rows,
        ...reports.rows,
        ...compliances.rows
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Global search failed', details: err.message });
  }
});

// Signup request: save to pending_users
app.post('/api/signup-request', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO pending_users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, password]
    );
    res.json({ ok: true, message: 'Signup request submitted. Await admin approval.' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Admin: list pending users
app.get('/api/pending-users', async (req, res) => {
  const result = await pool.query('SELECT * FROM pending_users ORDER BY requested_at DESC');
  res.json(result.rows);
});

// Admin: approve user
app.post('/api/approve-user', async (req, res) => {
  const { id } = req.body;
  try {
    // Get pending user
    const result = await pool.query('SELECT * FROM pending_users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    const user = result.rows[0];
    // Add to users table (replace with your users table/logic)
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [user.name, user.email, user.password]);
    // Remove from pending_users
    await pool.query('DELETE FROM pending_users WHERE id = $1', [id]);
    res.json({ ok: true, message: 'User approved and activated.' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Admin: reject user
app.post('/api/reject-user', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('DELETE FROM pending_users WHERE id = $1', [id]);
    res.json({ ok: true, message: 'Signup request rejected.' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// TEST ENDPOINT FOR EXPRESS ROUTE DEBUGGING
app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'Express route is working.' });
});

// Users endpoint (sample data)
app.get("/api/users", async (req, res) => {
  res.json([
    { username: "admin", role: "admin" },
    { username: "user1", role: "user" },
    { username: "user2", role: "user" }
  ]);
});
// Dashboard analytics endpoints for charts
app.get("/api/analytics/sales", async (req, res) => {
  res.json({
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Sales Trend",
        data: [300000, 400000, 250000, 350000],
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167,139,250,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  });
});

// Dashboard events analytics endpoint (dummy data for chart)
app.get("/api/analytics/events", async (req, res) => {
  res.json({
    labels: ["Email", "Webinar", "Ad", "Referral", "Direct"],
    datasets: [
      {
        label: "Leads by Source",
        data: [120, 90, 60, 40, 30],
        borderColor: "#6A5ACD",
        backgroundColor: "rgba(106,90,205,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  });
});
// Dashboard KPI endpoint
app.get("/api/dashboard/kpi", async (req, res) => {
  // Replace with real DB queries as needed
  res.json({
    revenue: 1200000,
    leads: 1542,
    conversion: 38,
    companies: 23,
    outstandingPayments: 1200,
    summaryReport: "Your CRM is performing above industry average. Conversion rates are up 8% this quarter. Keep up the great work!"
  });
});

// Dashboard Metrics endpoint
app.get("/api/dashboard/metrics", async (req, res) => {
  // Replace with real DB queries as needed
  res.json({
    esg: 92,
    tasks: 8,
    compliance: 87,
    tickets: 3
  });
});

// PostgreSQL connection
const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Back@123",
  database: "cmrdb",
  port: 5432,
});

// --- Companies Endpoints ---
app.get("/api/companies", async (_, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM companies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/companies", async (req, res) => {
  const { name, industry, contact, esg_score } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO companies (name, industry, contact, esg_score) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, industry, contact, esg_score]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/companies/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM companies WHERE id = $1", [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/companies/:id", async (req, res) => {
  const { name, industry, contact, esg_score } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE companies SET name = $1, industry = $2, contact = $3, esg_score = $4 WHERE id = $5 RETURNING *",
      [name, industry, contact, esg_score, req.params.id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/api/companies/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query("DELETE FROM companies WHERE id = $1", [req.params.id]);
    if (rowCount > 0) {
      res.json({ message: "Company deleted" });
    } else {
     
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Activities Endpoints ---
app.get("/api/activities", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM activities ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.json([
      { type: "Meeting", title: "Kickoff with ABC Corp", timestamp: "2025-07-24 10:00" },
      { type: "Call", title: "Call with XYZ Pvt Ltd", timestamp: "2025-07-25 14:30" }
    ]);
  }
});
app.post("/api/activities", async (req, res) => {
  const { type, title, notes, outcome } = req.body;
  const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  try {
    const { rows } = await db.query(
      "INSERT INTO activities (type, title, notes, outcome, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [type, title, notes, outcome, timestamp]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/api/activities/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM activities WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Reminders Endpoints ---
app.get("/api/reminders", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM reminders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.json([
      { task: "Call Client", due: "Tomorrow" },
      { task: "Send ESG Update", due: "2 days" }
    ]);
  }
});
app.post("/api/reminders", async (req, res) => {
  const { task, due } = req.body;
  try {
    // Create reminder
    const { rows } = await db.query(
      "INSERT INTO reminders (task, due, done) VALUES ($1, $2, $3) RETURNING *",
      [task, due, false]
    );
    const reminder = rows[0];

    // Also create notification for the new reminder, including details
    await db.query(
      "INSERT INTO notifications (type, title, message, timestamp, read) VALUES ($1, $2, $3, $4, $5)",
      [
        "reminder",
        `Scheduled: ${task}`,
        `Task: ${task}\nDue: ${due}`,
        new Date().toISOString(),
        false
      ]
    );

    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.patch("/api/reminders/:id", async (req, res) => {
  const { done } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE reminders SET done = $1 WHERE id = $2 RETURNING *",
      [done, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/api/reminders/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM reminders WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Analytics Endpoints ---
app.get("/api/analytics", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM analytics ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/analytics", async (req, res) => {
  const { metric, value, period } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO analytics (metric, value, period) VALUES ($1, $2, $3) RETURNING *",
      [metric, value, period]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Compliances Endpoints ---
app.get("/api/compliances", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM compliances ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/compliances", async (req, res) => {
  const { name, status, due_date, notes } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO compliances (name, status, due_date, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, status, due_date, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Contacts Endpoints ---
app.get("/api/contacts", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM contacts ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/contacts", async (req, res) => {
  const { name, email, phone, company, role, designation, linkedin } = req.body;
  try {
    // Check if company exists
    const companyCheck = await db.query("SELECT * FROM companies WHERE name = $1", [company]);
    if (company && companyCheck.rows.length === 0) {
      // Create company with minimal info
      await db.query(
        "INSERT INTO companies (name, industry, contact, esg_score) VALUES ($1, $2, $3, $4)",
        [company, '', name, null]
      );
    }
    const { rows } = await db.query(
      "INSERT INTO contacts (name, email, phone, company, role, designation, linkedin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, email, phone, company, role, designation, linkedin]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/contacts/:id", async (req, res) => {
  const { name, email, phone, company, role, designation, linkedin } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE contacts SET name=$1, email=$2, phone=$3, company=$4, role=$5, designation=$6, linkedin=$7 WHERE id=$8 RETURNING *",
      [name, email, phone, company, role, designation, linkedin, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM contacts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Leads Endpoints ---
app.get("/api/leads", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM leads ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/leads", async (req, res) => {
  const { name, stage, value, contact, notes } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO leads (name, stage, value, contact, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, stage, value, contact, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Notifications Endpoints ---
app.get("/api/notifications", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM notifications ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.json([
      { type: "Alert", title: "New compliance deadline", timestamp: "2025-07-28 09:00" },
      { type: "Reminder", title: "Submit Q2 ESG report", timestamp: "2025-07-27 16:30" }
    ]);
  }
});
app.post("/api/notifications", async (req, res) => {
  const { type, title, message, timestamp, read } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO notifications (type, title, message, timestamp, read) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [type, title, message, timestamp, read || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id", async (req, res) => {
  const { read } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE notifications SET read = $1 WHERE id = $2 RETURNING *",
      [read, req.params.id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- Reports Endpoints ---
app.get("/api/reports", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM reports ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.json([
      { name: "Q2 ESG Report", url: "/files/q2-esg.pdf" },
      { name: "Annual Compliance", url: "/files/annual-compliance.pdf" }
    ]);
  }
});
app.post("/api/reports", async (req, res) => {
  const { name, url } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO reports (name, url) VALUES ($1, $2) RETURNING *",
      [name, url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// PDF parsing
const fs = require('fs');
const pdfParse = require('pdf-parse');
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Improved extraction logic for more flexible matching
    let company = null, year = null, metrics = null, summary = null, esg_score = null;

    // ESG Score: match 'ESG Score', 'ESG rating', 'ESG:', etc. (number or decimal)
    const scoreMatch = text.match(/ESG\s*(Score|Rating)?\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    if (scoreMatch) esg_score = parseFloat(scoreMatch[2]);

    // Company: match 'Company', 'Organization', 'Firm', etc.
    const companyMatch = text.match(/(Company|Organization|Firm|Entity)\s*[:\-]?\s*([A-Za-z0-9 &.,'-]+)/i);
    if (companyMatch) company = companyMatch[2].trim();

    // Year: match 4-digit year, prefer after 'Year', 'Report Year', etc.
    const yearMatch = text.match(/(Year|Report Year|Reporting Year)?\s*[:\-]?\s*(20\d{2}|19\d{2})/i);
    if (yearMatch) year = parseInt(yearMatch[2] || yearMatch[1]);

    // Metrics: look for ESG keywords, or fallback to 'metrics' line
    if (/Environment/i.test(text) && /Social/i.test(text) && /Governance/i.test(text)) {
      metrics = 'Environment, Social, Governance';
    } else {
      const metricsMatch = text.match(/Metrics\s*[:\-]?\s*([A-Za-z, ]+)/i);
      if (metricsMatch) metrics = metricsMatch[1].trim();
    }

    // Summary: match 'Summary', 'Overview', or first paragraph after ESG section
    let summaryMatch = text.match(/(Summary|Overview)\s*[:\-]?\s*([\s\S]{0,500})/i);
    if (summaryMatch) {
      summary = summaryMatch[2].split('\n')[0].trim();
    } else {
      // fallback: first 200 chars after ESG section
      const esgSection = text.match(/ESG[\s\S]{0,500}/i);
      if (esgSection) summary = esgSection[0].replace(/\n/g, ' ').slice(0, 200);
    }

    // Insert into reports table
    await pool.query(
      'INSERT INTO reports (filename, originalname, company, year, metrics, summary, esg_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [req.file.filename, req.file.originalname, company, year, metrics, summary, esg_score]
    );

    res.json({ ok: true, filename: req.file.filename, originalname: req.file.originalname, company, year, metrics, summary, esg_score });
    console.log('Extracted PDF text:', text.slice(0, 1000)); // Print first 1000 chars
  } catch (err) {
    console.error('PDF analysis failed:', err);
    res.status(500).json({ ok: false, message: 'PDF analysis failed', error: err.message });
  }
});

// Serve static files from React build (for production)
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start server on all interfaces (important for Windows/VMs)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});