Meow DL
=======

Aesthetic, responsive YouTube audio/video downloader UI with a Bun + Elysia proxy to the public meow-dl API.

Features
--------
- Paste YouTube links and fetch metadata (thumbnail, title, channel, filename, quality).
- Choose Audio (m4a) or Video (mp4) with selectable qualities (144–1080).
- History saved to localStorage with quick search via Fuse.js.
- Smooth UI animations with anime.js.
- Server-side proxy using Elysia that forwards queries to the meow-dl API to avoid CORS issues.
- Modern responsive UI, animated gradient background, and accessible controls.
- Copyright ©️ Priyanshi Kaur
- Open Source Project https://github.com/MeowGurl/Meow-dl
- Code With @MeowGurl And GPT-5

File structure
--------------
public/
  index.html
  style.css
  assets/
    downloader.js (built)
scripts/
  downloader.ts
api/
  index.ts
package.json
vercel.json
.bun-version
tsconfig.json
README.md

How it works
------------
1. The front-end (public/index.html + public/style.css + built assets/downloader.js) presents the UI and captures a pasted YouTube URL.
2. The front-end calls `/api/info?url=<URL>&format=<mp4|m4a>&quality=<q>` which the Elysia server forwards to `https://meow-dl.onrender.com/?url=...`.
3. The meow-dl API returns metadata including a direct download link. The UI displays metadata and presents Download buttons that redirect the user to the provided download link.
4. History is stored locally and searchable with Fuse.js.

Local development
-----------------
1. Install Bun (https://bun.sh) or use Node/npm with small adjustments.
2. Install dependencies