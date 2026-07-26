import { useState } from "react";

const MAX_LENGTH = 8000;

const EXAMPLE_NOTES = `The water cycle describes how water moves through Earth's systems.
Evaporation: the sun heats water in oceans and lakes, turning it into vapor.
Transpiration: plants release water vapor through their leaves.
Condensation: vapor cools in the atmosphere and forms clouds.
Precipitation: water falls back as rain, snow, or hail.
Collection: water gathers in rivers, lakes, oceans, and groundwater, and the cycle repeats.
Around 97% of Earth's water is in the oceans; only about 3% is freshwater, and most of that is frozen in glaciers.`;

export default function NotesInput({ onGenerate, loading }) {
  const [notes, setNotes] = useState("");

  const trimmed = notes.trim();
  const tooLong = notes.length > MAX_LENGTH;
  const canSubmit = trimmed !== "" && !tooLong && !loading;

  function handleSubmit(e) {
    e.preventDefault();
    if (canSubmit) onGenerate(trimmed);
  }

  return (
    <form className="notes-form" onSubmit={handleSubmit}>
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste your study notes here, or just type a topic like 'French Revolution basics'..."
        rows={7}
        aria-label="Study notes or topic"
      />
      <div className="notes-toolbar">
        <span className={`char-count ${tooLong ? "char-count-over" : ""}`}>
          {notes.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
        <div className="notes-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setNotes(EXAMPLE_NOTES)}
            disabled={loading}
          >
            Try an example
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {loading ? "Generating…" : "Generate study set"}
          </button>
        </div>
      </div>
    </form>
  );
}
