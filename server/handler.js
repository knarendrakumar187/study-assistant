import { generateStudySet } from "./gemini.js";

const MAX_NOTES_LENGTH = 8000;

// One request handler shared by the local Express server (server/index.js)
// and the Vercel serverless function (api/generate.js).
export async function handleGenerate(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";
  if (!notes) {
    res.status(400).json({ error: "Please provide some notes or a topic." });
    return;
  }
  if (notes.length > MAX_NOTES_LENGTH) {
    res.status(400).json({
      error: `Notes are too long (${notes.length} characters, max ${MAX_NOTES_LENGTH}).`,
    });
    return;
  }

  try {
    const raw = await generateStudySet(notes);
    res.status(200).json({ raw });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Unexpected server error." });
  }
}
