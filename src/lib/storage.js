// Saves recent study sessions to localStorage so they survive a page
// refresh. localStorage can be unavailable (private mode) or full, and its
// contents can be corrupted — all of that degrades to "no saved sessions"
// rather than an error.

const KEY = "study-assistant:sessions";
const MAX_SESSIONS = 5;

export function loadSessions() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Prepends a session and returns the updated list (most recent first). */
export function saveSession(notes, studySet) {
  const session = {
    id: Date.now(),
    savedAt: new Date().toISOString(),
    title: studySet.title,
    notes,
    studySet,
  };
  const next = [session, ...loadSessions()].slice(0, MAX_SESSIONS);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the app still works, just without persistence.
  }
  return next;
}
