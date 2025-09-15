# Meow DL

A modern and minimalist YouTube video/audio downloader web app with cat branding, background animations, smart search, and responsive UX.

## Features

- Download YouTube videos and audio in various formats/qualities
- Paste link or smart search by video title
- Modern, responsive UI/UX
- Animated gradient background
- Minimalist cat logo
- Settings: runtime (bunjs/nodejs), version (latest)
- API-based architecture (uses [https://meow-dl.onrender.com](https://meow-dl.onrender.com))
- Deployable via Vercel/BunJS/Node.js

## Web Libraries Used

- [Axios](https://axios-http.com/) for network requests
- [Aceternity UI](https://ui.aceternity.com/components/background-gradient-animation) for background animation [web:7]
- [Tailwind CSS](https://tailwindcss.com/) and custom styles for clean layout [web:11][web:18]
- SVG logo from Vecteezy or Freepik (cat minimalist) [web:13][web:20]

## API

- `GET /?url=<YouTube_Link>&format=<mp4|m4a>`
- Returns JSON with video details including download link, thumbnail, title, etc.

## Folders

- `/public`: assets & styles
- `/scripts`: typescript downloader UI/logic
- Config files at project root

## Instructions

1. Clone repository
2. Modify API endpoint if needed (`scripts/downloader.ts`).
3. Deploy to Vercel for production or run locally via BunJS.

## License

MIT
