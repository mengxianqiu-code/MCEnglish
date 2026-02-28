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

  app.get("/api/articles", (req, res) => {
    try {
      const level = req.query.level ? Number(req.query.level) : 1;
      const articles = getArticlesByDifficulty(level);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", (req, res) => {
    try {
      const article = getArticleById(Number(req.params.id));
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.get("/api/scenarios", (req, res) => {
    try {
      const scenarios = getScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  app.get("/api/scenarios/:id", (req, res) => {
    try {
      const scenario = getScenarioById(Number(req.params.id));
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenario" });
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
