import { useState } from "react";

const MAX_LENGTH = 8000;

const EXAMPLES = [
  `Most asked JavaScript interview questions:
Difference between var, let, and const.
What is a closure? Give a practical use case.
How does the event loop handle promises vs setTimeout?
== vs === and type coercion.
What is hoisting?
Explain call, apply, and bind.
What are arrow functions and how does 'this' behave in them?`,

  `Most asked React interview questions:
What is the virtual DOM and how does reconciliation work?
Difference between state and props.
What are hooks? Rules of hooks, useState vs useRef.
Why do list items need a key prop?
What is lifting state up? When would you use context instead?
Controlled vs uncontrolled components.
What does useEffect do, and what is the cleanup function for?`,

  `Most asked operating systems interview questions:
A process is a program in execution with its own address space; threads share it.
Deadlock needs four conditions: mutual exclusion, hold and wait, no preemption, circular wait.
Scheduling algorithms: FCFS, SJF, Round Robin, priority scheduling.
Virtual memory uses paging to map virtual addresses to physical frames.
A context switch saves one process's state and loads another's.`,

  `Most asked DBMS and SQL interview questions:
Primary key uniquely identifies a row; foreign key references another table.
Normalization: 1NF removes repeating groups, 2NF removes partial dependencies, 3NF removes transitive dependencies.
ACID: atomicity, consistency, isolation, durability.
JOIN types: INNER, LEFT, RIGHT, FULL OUTER.
An index speeds up reads but slows down writes.`,

  `Most asked data structures and algorithms interview questions:
Array: O(1) access, O(n) insert/delete in the middle.
Linked list: O(1) insert/delete at head, O(n) access.
Stack is LIFO, queue is FIFO.
Binary search works on sorted data in O(log n).
Hash tables give average O(1) lookup using a hash function and collision handling.
BFS uses a queue, DFS uses a stack or recursion.`,

  `Most asked computer networks interview questions:
OSI model has 7 layers: physical, data link, network, transport, session, presentation, application.
TCP is connection-oriented and reliable; UDP is connectionless and faster.
IP addresses identify hosts; ports identify applications.
DNS translates domain names to IP addresses.
HTTP is stateless; cookies and sessions add state on top.
What happens when you type a URL in the browser?`,

  `Most asked HTML and CSS interview questions:
Difference between block, inline, and inline-block elements.
What is the box model? Content, padding, border, margin.
Flexbox vs Grid: when to use which?
What is specificity and how is it calculated?
Semantic HTML tags and why they matter for accessibility.
Difference between position relative, absolute, fixed, and sticky.`,
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
        placeholder="Paste your study notes, or type a topic like 'React hooks interview questions'..."
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
