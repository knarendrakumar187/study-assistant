import { useEffect, useState } from "react";

export default function Quiz({ questions }) {
  // The set of questions in the current round: starts as the full quiz,
  // becomes just the wrongly-answered ones when the user re-tests.
  const [round, setRound] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    startRound(questions);
  }, [questions]);

  function startRound(qs) {
    setRound(qs);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setWrongQuestions([]);
    setFinished(false);
  }

  const question = round[index];

  function choose(optionIndex) {
    if (selected !== null) return; // already answered
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongQuestions((w) => [...w, question]);
    }
  }

  function next() {
    if (index + 1 < round.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  if (round.length === 0) return null;

  if (finished) {
    return (
      <div className="quiz-result">
        <p className="quiz-score">
          {correctCount} / {round.length} correct
        </p>
        <p className="quiz-score-note">
          {wrongQuestions.length === 0
            ? "Perfect round! 🎉"
            : `${wrongQuestions.length} to review — re-test them until they stick.`}
        </p>
        <div className="quiz-result-actions">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => startRound(wrongQuestions)}
            >
              Re-test wrong answers ({wrongQuestions.length})
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => startRound(questions)}>
            Restart full quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <p className="quiz-progress">
        Question {index + 1} of {round.length}
      </p>
      <h3 className="quiz-question">{question.question}</h3>
      <div className="quiz-options">
        {question.options.map((option, i) => {
          let cls = "quiz-option";
          if (selected !== null) {
            if (i === question.correctIndex) cls += " quiz-option-correct";
            else if (i === selected) cls += " quiz-option-wrong";
            else cls += " quiz-option-dimmed";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => choose(i)}
              disabled={selected !== null}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="quiz-feedback">
          {question.explanation && <p className="quiz-explanation">{question.explanation}</p>}
          <button type="button" className="btn btn-primary" onClick={next}>
            {index + 1 < round.length ? "Next question" : "See results"}
          </button>
        </div>
      )}
    </div>
  );
}
