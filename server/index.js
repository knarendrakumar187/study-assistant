import "dotenv/config";
import express from "express";
import { handleGenerate } from "./handler.js";

const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/api/generate", handleGenerate);

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
