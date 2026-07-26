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

  // Optional refinement: an instruction plus the study set it should edit.
  let refine = null;
  const instruction =
    typeof req.body?.instruction === "string" ? req.body.instruction.trim() : "";
  if (instruction) {
    if (instruction.length > 500) {
      res.status(400).json({ error: "Refinement instruction is too long (max 500 characters)." });
      return;
    }
    const current = req.body?.current;
    if (!current || typeof current !== "object") {
      res.status(400).json({ error: "Refinement requires the current study set." });
      return;
    }
    refine = { instruction, current };
  }

  try {
    const raw = await generateStudySet(notes, refine);
    res.status(200).json({ raw });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Unexpected server error." });
  }
}
