// Turns the model's raw text into a safe, normalized study set.
// The model can return anything: markdown-fenced JSON, broken JSON, missing
// fields, wrong types, out-of-range indexes. This module is the barrier
// between that unpredictability and the UI.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

// Models sometimes wrap output in ```json fences even when told not to,
// or add a sentence before/after the JSON. Extract the JSON object part.
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return candidate.trim();
  return candidate.slice(start, end + 1);
}

function normalizeCard(card) {
  if (!card || typeof card !== "object") return null;
  if (!isNonEmptyString(card.question) || !isNonEmptyString(card.answer)) return null;
  return { question: card.question.trim(), answer: card.answer.trim() };
}

function normalizeQuizQuestion(q) {
  if (!q || typeof q !== "object") return null;
  if (!isNonEmptyString(q.question)) return null;
  if (!Array.isArray(q.options)) return null;

  const options = q.options.filter(isNonEmptyString).map((o) => o.trim());
  if (options.length < 2) return null;

  const correctIndex = Number(q.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }

  return {
    question: q.question.trim(),
    options,
    correctIndex,
    explanation: isNonEmptyString(q.explanation) ? q.explanation.trim() : "",
  };
}

/**
 * Parses and validates the model's raw text.
 * Broken individual items are dropped; if nothing usable remains,
 * a ValidationError is thrown so the caller can retry.
 */
export function parseStudySet(rawText) {
  let data;
  try {
    data = JSON.parse(extractJson(rawText));
  } catch {
    throw new ValidationError("The AI response was not valid JSON.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("The AI response was not a JSON object.");
  }

  const cards = (Array.isArray(data.cards) ? data.cards : [])
    .map(normalizeCard)
    .filter(Boolean);

  const quiz = (Array.isArray(data.quiz) ? data.quiz : [])
    .map(normalizeQuizQuestion)
    .filter(Boolean);

  if (cards.length === 0 && quiz.length === 0) {
    throw new ValidationError("The AI response did not contain any usable flashcards or quiz questions.");
  }

  return {
    title: isNonEmptyString(data.title) ? data.title.trim() : "Study Set",
    cards,
    quiz,
  };
}
