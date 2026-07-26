// Vercel serverless function: on Vercel, requests to /api/generate land here.
// Locally the same handler runs inside the Express server (server/index.js).
import { handleGenerate } from "../server/handler.js";

export default handleGenerate;
