import { parseStudySet, ValidationError } from "./validate.js";

const REQUEST_TIMEOUT_MS = 35_000;

async function requestOnce(notes, signal) {
  let res;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
      // Aborts when either the caller cancels or the timeout fires.
      signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
    });
  } catch (e) {
    if (signal.aborted) throw e; // caller cancelled: let App ignore it
    if (e.name === "TimeoutError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw new Error("Could not reach the server. Is it running?");
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!res.ok) {
    throw new Error(body?.error || `Server error (HTTP ${res.status}).`);
  }
  if (typeof body?.raw !== "string") {
    throw new Error("The server response was missing the AI output.");
  }
  return body.raw;
}

/**
 * Generates a study set from free-form notes.
 * If the model returns unusable output, it automatically retries once
 * before surfacing the error to the UI.
 */
export async function generateStudySet(notes, signal) {
  let lastValidationError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await requestOnce(notes, signal);
    try {
      return parseStudySet(raw);
    } catch (e) {
      if (!(e instanceof ValidationError)) throw e;
      lastValidationError = e;
    }
  }
  throw lastValidationError;
}
