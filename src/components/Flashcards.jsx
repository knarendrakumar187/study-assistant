import { useEffect, useState } from "react";

export default function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Reset position whenever a new study set arrives.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function goTo(i) {
    if (i < 0 || i >= cards.length) return;
    setIndex(i);
    setFlipped(false);
  }

  const card = cards[index];
  if (!card) return null;

  return (
    <div className="flashcards">
      <button
        type="button"
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-label">Question</span>
            <p>{card.question}</p>
            <span className="flashcard-hint">tap to reveal</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-label">Answer</span>
            <p>{card.answer}</p>
          </div>
        </div>
      </button>

      <div className="flashcard-nav">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          ← Prev
        </button>
        <span className="flashcard-progress">
          {index + 1} / {cards.length}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => goTo(index + 1)}
          disabled={index === cards.length - 1}
        >
          Next →
        </button>
      </div>
      <p className="keyboard-hint">Keyboard: ← → to move, space to flip</p>
    </div>
  );
}
