# Study Assistant

Paste your study notes or an interview topic, and the app uses Google Gemini to
generate **flashcards** and a **multiple-choice quiz**. Flip through the cards,
take the quiz, and re-test only the questions you got wrong.

**Demo recording:** https://drive.google.com/file/d/1GCkMqFr1G-BjrhZi8IHln7ijDHxBn9yl/view

**Live deployment:** https://study-assistant-livid-gamma.vercel.app/

## Setup

Requires Node.js 18+.

```bash
npm install
cp .env.example .env   # then put your Gemini API key in .env
npm start
```

Get a free Gemini API key at https://aistudio.google.com/apikey.

`npm start` runs two processes:

- an Express API server on `http://localhost:8787` (this is the only process
  that ever sees the API key), and
- the Vite dev server on `http://localhost:5173`, which proxies `/api/*` to
  the Express server.

Open `http://localhost:5173` in your browser.

**No API key yet?** Run in mock mode to try the UI:

```bash
# PowerShell
$env:MOCK_AI="1"; npm start

# bash
MOCK_AI=1 npm start
```

## Usage

1. Paste notes or an interview topic (or click **Try an example**).
2. Click **Generate study set**.
3. Flip through flashcards (arrow keys to move, space to flip).
4. Switch to the **Quiz** tab, answer each question, and at the end re-test
   just the ones you got wrong until you score 100%.

## Architecture

```
Browser (React) ──POST /api/generate──▶ Express / Vercel function ──▶ Gemini API
                ◀── { raw: "...model text..." } ◀──
```

- **The API key never reaches the browser.** The frontend only talks to
  `/api/generate`. Locally that's Express (`server/index.js`); on Vercel it's a
  serverless function (`api/generate.js`). Both share one handler
  (`server/handler.js`).
- **The model must return JSON**, requested via a strict prompt plus Gemini's
  `responseMimeType: "application/json"`. The server passes the raw text
  through; all parsing/validation happens in the frontend (`src/lib/validate.js`).

### Handling bad model output

This is where most of the defensive work is:

| Failure | Handling |
| --- | --- |
| JSON wrapped in markdown fences or prose | `extractJson` strips fences and slices to the outermost `{...}` before parsing |
| Malformed JSON / wrong shape | `parseStudySet` throws a `ValidationError`; the app auto-retries the request once, then shows an error with a Retry button |
| Individually broken items (missing fields, `correctIndex` out of range, non-string options) | Dropped item-by-item; the rest of the set is still usable |
| Empty response / no usable items | Explicit error with Retry |
| Slow response | 25s timeout server-side, 35s client-side (`AbortSignal.timeout`), with a clear timeout message |
| Rate limits / upstream errors | Mapped to friendly messages with correct HTTP status codes |
| Stale responses | Each request gets an id and an `AbortController`; a new request aborts the old one, and late responses that don't match the latest id are ignored, so an old result can never overwrite a newer one |

## AI-usage note

This project was built with heavy use of an AI coding assistant (Cursor) for
scaffolding, implementation, and debugging, with me directing the design,
reviewing the code, and testing the result. I understand and can explain every
part of the codebase. No SDK is used for the model call — the Gemini REST API
is called directly with `fetch` so the request/response handling is fully
explicit.

## Known limitations

- No streaming: results appear all at once after generation finishes.
- No session persistence: generated study sets are lost on page refresh.
- Quiz questions are multiple-choice only (exactly what the prompt asks for).
- The auto-retry on invalid output re-sends the same prompt; it doesn't feed
  the model's error back to it for a "repair" attempt.
- Notes are capped at 8,000 characters to stay within free-tier token limits.

## Time spent

~3 hours (build, deploy, and testing).
