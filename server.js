import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <h1>SwiftTransfer ✅</h1>
    <p>UK (GBP) → Nigeria (NGN)</p>
    <p>Your app is LIVE 🎉</p>
  `);
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SwiftTransfer running on port", PORT));
