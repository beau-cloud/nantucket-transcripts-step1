# Nantucket Transcripts — Step 1 (Diagnostics)

This is a minimal Next.js app to verify your YouTube Data API v3 setup for **Nantucket Transcripts Web Plan v1**.

## What it does
- Confirms a YouTube API key is present on the server.
- Verifies the YouTube API is reachable.
- Resolves the Town of Nantucket channel (or any channel input) to an ID.

## Quick start
1. **Clone** this folder and enter it:
   ```bash
   npm i
   cp .env.local.example .env.local
   # Edit .env.local and set YT_API_KEY=...
   npm run dev
   ```
2. Open http://localhost:3000 and click **Run diagnostics**.
3. All 3 checks should be green. If they aren't, copy the JSON output and we’ll troubleshoot.

## Notes
- You can temporarily override the key in the UI; for production use the server env var.
- Channel input accepts a **UC… ID**, a **full URL**, or an **@handle**; we try to resolve it.
- Default channel is **Town of Nantucket** (`UC-sgxA1fdoxteLNzRAUHIxA`).

## Next
Once this is working, we'll add:
- `/api/videos` to list meetings by board and date
- `/api/transcript` with dual-path retrieval and caching
- A clean dark-mode UI with Board + Date filters, plus TXT/PDF export