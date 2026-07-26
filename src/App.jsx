import { useRef, useState } from "react";
import NotesInput from "./components/NotesInput.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Quiz from "./components/Quiz.jsx";
import { generateStudySet } from "./lib/api.js";
import "./App.css";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [studySet, setStudySet] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("cards");

  // Guards against out-of-order responses: only the latest request may
  // update state. The previous in-flight request is also aborted outright.
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const lastNotesRef = useRef("");

  async function handleGenerate(notes) {
    lastNotesRef.current = notes;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setStatus("loading");
    setError("");
    try {
      const set = await generateStudySet(notes, controller.signal);
      if (requestId !== requestIdRef.current) return; // stale response, ignore
      setStudySet(set);
      setTab(set.cards.length > 0 ? "cards" : "quiz");
      setStatus("ready");
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      if (e.name === "AbortError") return; // cancelled by a newer request
      setError(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Study Assistant</h1>
        <p className="app-tagline">
          Paste your notes, get flashcards and a quiz. Powered by Gemini.
        </p>
      </header>

      <NotesInput onGenerate={handleGenerate} loading={status === "loading"} />

      {status === "loading" && (
        <div className="state-panel" role="status">
          <div className="spinner" />
          <p>Reading your notes and building a study set…</p>
        </div>
      )}

      {status === "error" && (
        <div className="state-panel state-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleGenerate(lastNotesRef.current)}
          >
            Retry
          </button>
        </div>
      )}

      {status === "idle" && !studySet && (
        <div className="state-panel state-empty">
          <p>
            Nothing here yet. Paste some notes above (or hit “Try an example”) and
            generate your first study set.
          </p>
        </div>
      )}

      {studySet && status !== "loading" && (
        <section className="study-set">
          <h2 className="study-set-title">{studySet.title}</h2>
          <div className="tabs" role="tablist">
            {studySet.cards.length > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={tab === "cards"}
                className={`tab ${tab === "cards" ? "tab-active" : ""}`}
                onClick={() => setTab("cards")}
              >
                Flashcards ({studySet.cards.length})
              </button>
            )}
            {studySet.quiz.length > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={tab === "quiz"}
                className={`tab ${tab === "quiz" ? "tab-active" : ""}`}
                onClick={() => setTab("quiz")}
              >
                Quiz ({studySet.quiz.length})
              </button>
            )}
          </div>

          {tab === "cards" && studySet.cards.length > 0 && (
            <Flashcards cards={studySet.cards} />
          )}
          {tab === "quiz" && studySet.quiz.length > 0 && <Quiz questions={studySet.quiz} />}
        </section>
      )}
    </div>
  );
}
