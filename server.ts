import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb, getPacks, getWordsByPack } from "./src/db/database";

async function startServer() {
  // Initialize SQLite Database
  initDb();

  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/packs", (req, res) => {
    try {
      const packs = getPacks();
      res.json(packs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packs" });
    }
  });

  app.get("/api/packs/:id/words", (req, res) => {
    try {
      const words = getWordsByPack(Number(req.params.id));
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch words" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
