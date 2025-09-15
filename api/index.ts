import { Elysia } from "elysia";

const API_BASE = "https://meow-dl.onrender.com";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Meow DL API is live"
  }))
  .get("/info", async ({ query }) => {
    const { url, format = "mp4" } = query;
    if (!url) return { status: "error", error: "Missing video URL" };

    const res = await fetch(`${API_BASE}/?url=${encodeURIComponent(url)}&format=${format}`);
    const data = await res.json();
    return data;
  })
  .get("/search", async ({ query }) => {
    const { q } = query;
    if (!q) return { status: "error", error: "Missing search query" };
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data;
  })
  .get("/stream/audio/:id", async ({ params }) => {
    const res = await fetch(`${API_BASE}/stream/audio/${params.id}`);
    return new Response(await res.arrayBuffer(), {
      headers: {
        "content-type": "audio/mp4"
      }
    });
  })
  .get("/stream/video/:id", async ({ params }) => {
    const res = await fetch(`${API_BASE}/stream/video/${params.id}`);
    return new Response(await res.arrayBuffer(), {
      headers: {
        "content-type": "video/mp4"
      }
    });
  });

export default app;
