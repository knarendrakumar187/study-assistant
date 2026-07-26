// Calls the Gemini REST API directly (no SDK) so every step is explicit:
// build a prompt that demands JSON, send it, and return the model's raw text.
// Parsing + validation of that text happens on the frontend, which is the
// part of the app responsible for surviving bad model output.

// "latest" alias: Google keeps it pointed at the current flash model, so the
// app doesn't break when a specific version is retired (a pinned
// "gemini-2.5-flash" started returning 404 during development).
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GEMINI_TIMEOUT_MS = 25_000;

function buildPrompt(notes, refine) {
  if (refine) {
    return `You are a study assistant. The user already has the study set below
and wants it modified.

CURRENT STUDY SET (JSON):
${JSON.stringify(refine.current)}

USER'S INSTRUCTION:
"""
${refine.instruction}
"""

Apply the instruction to the current study set. Keep everything the user did not
ask to change exactly as it is. Respond with ONLY the FULL updated JSON object,
no markdown fences, in the same shape as the current study set (title, cards
with question/answer, quiz with question/options/correctIndex/explanation).
Every quiz question has exactly 4 options and correctIndex is 0-3.

For reference, the original notes/topic were:
"""
${notes}
"""`;
  }

  return `You are a study assistant. Based on the study notes or topic below,
create flashcards and a multiple-choice quiz.

Respond with ONLY a JSON object, no markdown fences, matching exactly this shape:
{
  "title": "short title for this study set",
  "cards": [
    { "question": "...", "answer": "..." }
  ],
  "quiz": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "one sentence explaining the correct answer"
    }
  ]
}

Rules:
- 6 to 12 flashcards, 4 to 8 quiz questions.
- Every quiz question has exactly 4 options and correctIndex is 0-3.
- Base everything only on the notes/topic given. Keep answers concise.

NOTES/TOPIC:
"""
${notes}
"""`;
}

function apiError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Dev-only mock (MOCK_AI=1): lets the UI be developed and demoed without a
// key or network. Returns the same "raw text" shape a real model would.
const MOCK_STUDY_SET = {
  title: "Mock Study Set (no API key used)",
  cards: [
    { question: "What is evaporation?", answer: "The sun heats water in oceans and lakes, turning it into vapor." },
    { question: "What is condensation?", answer: "Water vapor cools in the atmosphere and forms clouds." },
    { question: "Roughly how much of Earth's water is in the oceans?", answer: "About 97%." },
  ],
  quiz: [
    {
      question: "Which process describes plants releasing water vapor?",
      options: ["Evaporation", "Transpiration", "Precipitation", "Collection"],
      correctIndex: 1,
      explanation: "Transpiration is the release of water vapor through plant leaves.",
    },
    {
      question: "What happens during precipitation?",
      options: [
        "Water evaporates from the sea",
        "Clouds form from vapor",
        "Water falls as rain, snow, or hail",
        "Water collects underground",
      ],
      correctIndex: 2,
      explanation: "Precipitation is water falling back to Earth as rain, snow, or hail.",
    },
  ],
};

/**
 * Sends the notes to Gemini and returns the model's raw text response.
 * When `refine` ({ instruction, current }) is given, asks the model to edit
 * the existing study set instead of creating a new one.
 * Throws an Error with a `.status` property on any upstream failure.
 */
export async function generateStudySet(notes, refine = null) {
  if (process.env.MOCK_AI === "1") {
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return JSON.stringify(MOCK_STUDY_SET);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw apiError(500, "Server is not configured: GEMINI_API_KEY is missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(notes, refine) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
  } catch (e) {
    if (e.name === "TimeoutError" || e.name === "AbortError") {
      throw apiError(504, "The AI took too long to respond. Please try again.");
    }
    throw apiError(502, "Could not reach the AI service. Check your connection.");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw apiError(429, "AI rate limit reached. Wait a moment and try again.");
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw apiError(500, "The AI rejected the request (check the API key on the server).");
    }
    throw apiError(502, `The AI service returned an error (HTTP ${res.status}).`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || text.trim() === "") {
    throw apiError(502, "The AI returned an empty response. Please try again.");
  }
  return text;
}
