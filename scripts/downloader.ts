import * as anime from 'animejs';
import Fuse from 'fuse.js';

type ApiResponse = {
  status: string;
  videoId?: string;
  title?: string;
  quality?: string;
  channel?: string;
  thumbnail?: string;
  filename?: string;
  expiration?: string;
  infoFetchTime?: string;
  cached?: boolean;
  downloadLink?: string;
  [key: string]: any;
};

const pasteInput = document.getElementById('pasteInput') as HTMLInputElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const qualitySelect = document.getElementById('qualitySelect') as HTMLSelectElement;
const resultEl = document.getElementById('result') as HTMLElement;
const thumbEl = document.getElementById('thumb') as HTMLImageElement;
const titleEl = document.getElementById('title') as HTMLElement;
const channelEl = document.getElementById('channel') as HTMLElement;
const filenameEl = document.getElementById('filename') as HTMLElement;
const qualityLabelEl = document.getElementById('qualityLabel') as HTMLElement;
const audioBtn = document.getElementById('audioBtn') as HTMLButtonElement;
const videoBtn = document.getElementById('videoBtn') as HTMLButtonElement;
const historyList = document.getElementById('historyList') as HTMLUListElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;

type SavedItem = {
  id: string;
  title: string;
  channel?: string;
  thumb?: string;
  url: string;
  format?: string;
  quality?: string;
  downloadLink?: string;
  fetchedAt: string;
};

const KEY = 'meow_dl_history_v1';

function loadHistory(): SavedItem[] {
  try {
    const raw = localStorage.getItem(KEY) || '[]';
    return JSON.parse(raw) as SavedItem[];
  } catch {
    return [];
  }
}

function saveHistory(list: SavedItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 120)));
}

function pushHistory(item: SavedItem) {
  const list = loadHistory();
  const exists = list.findIndex(i => i.url === item.url && i.format === item.format) ;
  if (exists !== -1) {
    list.splice(exists, 1);
  }
  list.unshift(item);
  saveHistory(list);
  renderHistory(list);
}

function renderHistory(list?: SavedItem[]) {
  const items = list || loadHistory();
  historyList.innerHTML = '';
  items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.tabIndex = 0;
    li.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><img src="${escapeHtml(it.thumb||'')}" width="64" height="36" style="object-fit:cover;border-radius:6px" /><div><div class="hi-title">${escapeHtml(it.title||it.url)}</div><div class="hi-meta">${escapeHtml(it.channel||'')} • ${escapeHtml(it.quality||'')}</div></div></div>`;
    li.addEventListener('click', () => {
      pasteInput.value = it.url;
      const radios = document.querySelectorAll<HTMLInputElement>('input[name="format"]');
      radios.forEach(r => { if (r.value === (it.format||'mp4')) r.checked = true; });
      qualitySelect.value = it.quality || qualitySelect.value;
      submitBtn.click();
    });
    historyList.appendChild(li);
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c));
}

async function fetchInfo(url: string, format: string, quality?: string): Promise<ApiResponse> {
  const qs = new URLSearchParams();
  qs.set('url', url);
  qs.set('format', format);
  if (quality && format !== 'm4a') qs.set('quality', quality);
  const res = await fetch(`/api/info?${qs.toString()}`, { method: 'GET' });
  const json = await res.json();
  return json as ApiResponse;
}

function showResult(data: ApiResponse, requestedFormat: string) {
  if (!data || data.status === 'error') {
    resultEl.classList.remove('hidden');
    titleEl.textContent = 'Unable to fetch info';
    thumbEl.src = '';
    channelEl.textContent = '';
    filenameEl.textContent = '';
    qualityLabelEl.textContent = '';
    audioBtn.style.display = 'none';
    videoBtn.style.display = 'none';
    return;
  }
  thumbEl.src = data.thumbnail || '';
  titleEl.textContent = data.title || data.videoId || 'Untitled';
  channelEl.textContent = data.channel || '';
  filenameEl.textContent = data.filename ? `Filename: ${data.filename}` : '';
  qualityLabelEl.textContent = data.quality ? `Quality: ${data.quality}` : '';
  audioBtn.style.display = 'inline-block';
  videoBtn.style.display = 'inline-block';
  audioBtn.onclick = () => {
    if (requestedFormat === 'm4a' && data.downloadLink) {
      window.location.href = data.downloadLink;
    } else {
      fetchInfo(pasteInput.value.trim(), 'm4a').then(d => {
        if (d && d.downloadLink) window.location.href = d.downloadLink;
      });
    }
  };
  videoBtn.onclick = () => {
    if (requestedFormat === 'mp4' && data.downloadLink) {
      window.location.href = data.downloadLink;
    } else {
      const quality = qualitySelect.value;
      fetchInfo(pasteInput.value.trim(), 'mp4', quality).then(d => {
        if (d && d.downloadLink) window.location.href = d.downloadLink;
      });
    }
  };
  resultEl.classList.remove('hidden');
  anime.timeline().add({targets:'.result-card',translateY:[20,0],opacity:[0,1],easing:'spring(1,80,10,0)',duration:600});
}

submitBtn.addEventListener('click', async () => {
  const raw = pasteInput.value.trim();
  if (!raw) return;
  const format = (document.querySelector<HTMLInputElement>('input[name="format"]:checked') || {value:'mp4'}).value;
  const quality = qualitySelect.value;
  const start = performance.now();
  const info = await fetchInfo(raw, format, quality);
  const took = (performance.now() - start).toFixed(2);
  if (info && info.status === 'ok') {
    const saved: SavedItem = {
      id: info.videoId || String(Date.now()),
      title: info.title || '',
      channel: info.channel || '',
      thumb: info.thumbnail || '',
      url: raw,
      format,
      quality: format === 'm4a' ? info.quality || 'audio' : String(quality),
      downloadLink: info.downloadLink || '',
      fetchedAt: new Date().toISOString()
    };
    pushHistory(saved);
    showResult(info, format);
  } else {
    showResult({status:'error'}, format);
  }
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  const list = loadHistory();
  if (!q) {
    renderHistory(list);
    return;
  }
  const fuse = new Fuse(list, {keys:['title','channel','url'],threshold:0.35});
  const res = fuse.search(q).map(r => r.item);
  renderHistory(res);
});

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});