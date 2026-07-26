import { useState } from "react";

const MAX_LENGTH = 8000;

const EXAMPLES = [
  `The water cycle describes how water moves through Earth's systems.
Evaporation: the sun heats water in oceans and lakes, turning it into vapor.
Transpiration: plants release water vapor through their leaves.
Condensation: vapor cools in the atmosphere and forms clouds.
Precipitation: water falls back as rain, snow, or hail.
Collection: water gathers in rivers, lakes, oceans, and groundwater, and the cycle repeats.
Around 97% of Earth's water is in the oceans; only about 3% is freshwater, and most of that is frozen in glaciers.`,

  `Most asked React interview questions:
What is the virtual DOM and how does reconciliation work?
Difference between state and props.
What are hooks? Rules of hooks, useState vs useRef.
Why do list items need a key prop?
What is lifting state up? When would you use context instead?
Controlled vs uncontrolled components.
What does useEffect do, and what is the cleanup function for?`,

  `Operating systems basics:
A process is a program in execution with its own address space; threads share it.
Deadlock needs four conditions: mutual exclusion, hold and wait, no preemption, circular wait.
Scheduling algorithms: FCFS, SJF, Round Robin, priority scheduling.
Virtual memory uses paging to map virtual addresses to physical frames.
A context switch saves one process's state and loads another's.`,

  `DBMS and SQL essentials:
Primary key uniquely identifies a row; foreign key references another table.
Normalization: 1NF removes repeating groups, 2NF removes partial dependencies, 3NF removes transitive dependencies.
ACID: atomicity, consistency, isolation, durability.
JOIN types: INNER, LEFT, RIGHT, FULL OUTER.
An index speeds up reads but slows down writes.`,

  `Data structures and algorithms basics:
Array: O(1) access, O(n) insert/delete in the middle.
Linked list: O(1) insert/delete at head, O(n) access.
Stack is LIFO, queue is FIFO.
Binary search works on sorted data in O(log n).
Hash tables give average O(1) lookup using a hash function and collision handling.
BFS uses a queue, DFS uses a stack or recursion.`,

  `Computer networks fundamentals:
OSI model has 7 layers: physical, data link, network, transport, session, presentation, application.
TCP is connection-oriented and reliable; UDP is connectionless and faster.
IP addresses identify hosts; ports identify applications.
DNS translates domain names to IP addresses.
HTTP is stateless; cookies and sessions add state on top.`,
];

export default function NotesInput({ onGenerate, loading }) {
  const [notes, setNotes] = useState("");

  function pickExample() {
    // Random example, but never the one already shown.
    const pool = EXAMPLES.filter((e) => e !== notes);
    setNotes(pool[Math.floor(Math.random() * pool.length)]);
  }

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
            onClick={pickExample}
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
