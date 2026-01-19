import express from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Serve the UI (public folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// In-memory "database"
const users = new Map(); // email -> { email, password }
const tokens = new Map(); // token -> email
const transfersByEmail = new Map(); // email -> [transfer]

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const email = tokens.get(token);
  if (!email) return res.status(401).json({ error: "Unauthorized" });
  req.email = email;
  next();
}

app.get("/health", (req, res) => res.json({ ok: true }));

// Auth
app.post("/auth/register", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email + password required" });
  if (users.has(email)) return res.status(409).json({ error: "User already exists" });

  users.set(email, { email, password });
  transfersByEmail.set(email, []);
  return res.json({ ok: true });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const u = users.get(email);
  if (!u || u.password !== password) return res.status(401).json({ error: "Invalid credentials" });

  const token = crypto.randomBytes(24).toString("hex");
  tokens.set(token, email);
  return res.json({ token, email });
});

// Transfers
app.post("/transfers", auth, (req, res) => {
  const { amount_gbp, receiver_name, bank_name, account_number } = req.body || {};
  if (!amount_gbp || !receiver_name || !bank_name || !account_number) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const t = {
    id: crypto.randomUUID(),
    amount_gbp: Number(amount_gbp),
    receiver_name,
    bank_name,
    account_number,
    status: "PENDING",
    created_at: new Date().toISOString(),
  };

  const list = transfersByEmail.get(req.email) || [];
  list.unshift(t);
  transfersByEmail.set(req.email, list);
  return res.json(t);
});

app.get("/transfers", auth, (req, res) => {
  return res.json(transfersByEmail.get(req.email) || []);
});

// Fallback to UI for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SwiftTransfer running on port", PORT));
