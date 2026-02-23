import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "library.db");
let db: Database.Database;

try {
  db = new Database(dbPath);
} catch (err) {
  console.error("Failed to connect to SQLite database, falling back to in-memory:", err);
  db = new Database(":memory:");
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    father_name TEXT,
    address TEXT,
    state TEXT,
    email TEXT UNIQUE,
    contact TEXT,
    password TEXT NOT NULL,
    blood_group TEXT,
    emergency_contact TEXT,
    role TEXT DEFAULT 'librarian'
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    father_name TEXT,
    address TEXT,
    state TEXT,
    email TEXT UNIQUE,
    contact TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT, -- 'active', 'expired'
    amount REAL,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY,
    zone_id INTEGER,
    section TEXT,
    seat_number INTEGER,
    status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved'
    current_student_id TEXT,
    FOREIGN KEY(zone_id) REFERENCES zones(id),
    FOREIGN KEY(current_student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    seat_id TEXT,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(seat_id) REFERENCES seats(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Default settings
  INSERT OR IGNORE INTO settings (key, value) VALUES ('capacity', '50');
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Staff
  app.get("/api/staff", (req, res) => {
    const staff = db.prepare("SELECT * FROM staff").all();
    res.json(staff);
  });

  app.post("/api/staff", (req, res) => {
    const { id, name, father_name, address, state, email, contact, password, blood_group, emergency_contact } = req.body;
    try {
      db.prepare(`
        INSERT INTO staff (id, name, father_name, address, state, email, contact, password, blood_group, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, father_name, address, state, email, contact, password, blood_group, emergency_contact);
      res.status(201).json({ message: "Staff added" });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Students
  app.get("/api/students", (req, res) => {
    const students = db.prepare(`
      SELECT 
        s.*, 
        sub.status as sub_status, 
        sub.end_date as sub_expiry,
        a.seat_id as current_seat,
        a.check_in as last_check_in
      FROM students s
      LEFT JOIN subscriptions sub ON s.id = sub.student_id AND sub.status = 'active'
      LEFT JOIN attendance a ON s.id = a.student_id AND a.check_out IS NULL
    `).all();
    res.json(students);
  });

  app.post("/api/students", (req, res) => {
    const { id, name, father_name, address, state, email, contact, blood_group, emergency_contact } = req.body;
    try {
      db.prepare(`
        INSERT INTO students (id, name, father_name, address, state, email, contact, blood_group, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, father_name, address, state, email, contact, blood_group, emergency_contact);
      res.status(201).json({ message: "Student added" });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Subscriptions
  app.post("/api/subscriptions", (req, res) => {
    const { student_id, amount, months = 1 } = req.body;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      // Deactivate old subscriptions
      db.prepare("UPDATE subscriptions SET status = 'expired' WHERE student_id = ?").run(student_id);
      
      db.prepare(`
        INSERT INTO subscriptions (student_id, start_date, end_date, status, amount)
        VALUES (?, ?, ?, 'active', ?)
      `).run(student_id, startDate, endDateStr, amount);
      res.status(201).json({ message: "Subscription activated" });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/subscriptions/ledger", (req, res) => {
    const ledger = db.prepare(`
      SELECT 
        sub.*, 
        s.name as student_name
      FROM subscriptions sub
      JOIN students s ON sub.student_id = s.id
      ORDER BY sub.id DESC
    `).all();
    res.json(ledger);
  });

  // Seats
  app.get("/api/seats", (req, res) => {
    const seats = db.prepare(`
      SELECT s.*, z.name as zone_name 
      FROM seats s 
      JOIN zones z ON s.zone_id = z.id
    `).all();
    res.json(seats);
  });

  app.get("/api/zones", (req, res) => {
    const zones = db.prepare("SELECT * FROM zones").all();
    res.json(zones);
  });

  app.post("/api/zones", (req, res) => {
    const { name } = req.body;
    const info = db.prepare("INSERT INTO zones (name) VALUES (?)").run(name);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/seats/bulk", (req, res) => {
    const { zone_id, section, count } = req.body;
    const insert = db.prepare("INSERT INTO seats (id, zone_id, section, seat_number) VALUES (?, ?, ?, ?)");
    const lastSeat = db.prepare("SELECT MAX(seat_number) as max_num FROM seats WHERE zone_id = ? AND section = ?").get(zone_id, section);
    let startNum = (lastSeat?.max_num || 0) + 1;

    const transaction = db.transaction((seats) => {
      for (const seat of seats) {
        insert.run(seat.id, seat.zone_id, seat.section, seat.seat_number);
      }
    });

    const newSeats = [];
    for (let i = 0; i < count; i++) {
      const num = startNum + i;
      newSeats.push({
        id: `Z${zone_id}-S${section}-${num}`,
        zone_id,
        section,
        seat_number: num
      });
    }
    transaction(newSeats);
    res.json({ message: "Seats created" });
  });

  // Attendance & Auto Seat Allocation
  app.post("/api/attendance/check-in", (req, res) => {
    const { student_id } = req.body;
    
    // Check if student has active subscription
    const sub = db.prepare("SELECT * FROM subscriptions WHERE student_id = ? AND status = 'active' AND end_date >= date('now')").get(student_id);
    if (!sub) {
      return res.status(403).json({ error: "No active subscription" });
    }

    // Check if already checked in
    const active = db.prepare("SELECT * FROM attendance WHERE student_id = ? AND check_out IS NULL").get(student_id);
    if (active) {
      return res.status(400).json({ error: "Already checked in" });
    }

    // Find available seat
    const seat = db.prepare("SELECT * FROM seats WHERE status = 'available' ORDER BY zone_id, section, seat_number LIMIT 1").get();
    if (!seat) {
      return res.status(400).json({ error: "No seats available" });
    }

    try {
      const transaction = db.transaction(() => {
        db.prepare("UPDATE seats SET status = 'occupied', current_student_id = ? WHERE id = ?").run(student_id, seat.id);
        db.prepare("INSERT INTO attendance (student_id, seat_id) VALUES (?, ?)").run(student_id, seat.id);
      });
      transaction();
      res.json({ message: "Checked in", seat_id: seat.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/attendance/check-out", (req, res) => {
    const { student_id } = req.body;
    const active = db.prepare("SELECT * FROM attendance WHERE student_id = ? AND check_out IS NULL").get(student_id);
    if (!active) {
      return res.status(400).json({ error: "Not checked in" });
    }

    try {
      const transaction = db.transaction(() => {
        db.prepare("UPDATE seats SET status = 'available', current_student_id = NULL WHERE id = ?").run(active.seat_id);
        db.prepare("UPDATE attendance SET check_out = CURRENT_TIMESTAMP WHERE id = ?").run(active.id);
      });
      transaction();
      res.json({ message: "Checked out" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Reports
  app.get("/api/reports/attendance", (req, res) => {
    const logs = db.prepare(`
      SELECT 
        a.*, 
        s.name as student_name,
        z.name as zone_name,
        st.section,
        st.seat_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN seats st ON a.seat_id = st.id
      JOIN zones z ON st.zone_id = z.id
      ORDER BY a.check_in DESC
    `).all();
    res.json(logs);
  });

  app.get("/api/reports/occupancy", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM seats").get().count;
    const occupied = db.prepare("SELECT COUNT(*) as count FROM seats WHERE status = 'occupied'").get().count;
    res.json({ total, occupied });
  });

  app.get("/api/reports/subscriptions", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
      FROM subscriptions
    `).get();
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
