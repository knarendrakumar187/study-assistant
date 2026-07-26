import { useState } from "react";

export default function RefineBar({ onRefine, loading }) {
  const [instruction, setInstruction] = useState("");

  const trimmed = instruction.trim();
  const canSubmit = trimmed !== "" && trimmed.length <= 500 && !loading;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onRefine(trimmed);
    setInstruction("");
  }

  return (
    <form className="refine-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="refine-input"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder='Refine this set, e.g. "make the quiz harder" or "add cards about X"'
        aria-label="Refinement instruction"
        maxLength={500}
      />
      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        Refine
      </button>
    </form>
  );
}
