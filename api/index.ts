import { Elysia } from 'elysia';

const app = new Elysia();

app.get('/api/info', async ({ query }) => {
  const url = String(query.url || '');
  const format = String(query.format || 'mp4');
  const quality = query.quality ? String(query.quality) : '';
  if (!url) {
    return { status: 'error', message: 'missing url' };
  }
  const base = 'https://meow-dl.onrender.com/';
  const params = new URLSearchParams();
  params.set('url', url);
  params.set('format', format);
  if (quality && format !== 'm4a') params.set('quality', quality);
  const target = `${base}?${params.toString()}`;
  const r = await fetch(target, { method: 'GET' });
  const json = await r.json();
  return json;
});

export default app.handle;