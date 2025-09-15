import axios from "axios";

const API_BASE = "https://meow-dl.onrender.com";

const urlInput = document.getElementById("url-input") as HTMLInputElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const formatOptions = document.getElementsByName("format") as NodeListOf<HTMLInputElement>;
const videoDetails = document.getElementById("video-details") as HTMLDivElement;
const settingsBtn = document.getElementById("settings-btn") as HTMLButtonElement;
const settingsModal = document.getElementById("settings-modal") as HTMLDialogElement;

const settings: Record<string, string> = {
  runtime: "bunjs",
  version: "latest",
};

if (settingsBtn) {
  settingsBtn.onclick = () => settingsModal.showModal();
  settingsModal.onclick = e => { if ((e.target as HTMLElement) === settingsModal) settingsModal.close(); };
}

const settingsForm = document.getElementById("settings-form") as HTMLFormElement;
settingsForm.onchange = () => {
  const runtimeSelect = document.getElementById("runtime-select") as HTMLSelectElement;
  const versionSelect = document.getElementById("version-select") as HTMLSelectElement;
  settings.runtime = runtimeSelect.value;
  settings.version = versionSelect.value;
};

document.getElementById("download-form")!.onsubmit = async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  const format = [...formatOptions].find(f => f.checked)?.value || "mp4";

  if (!/^https?:\/\/(www\.)?youtube\.com|youtu\.be\//.test(url)) {
    alert("Paste a valid YouTube URL.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";

  try {
    const res = await axios.get(`${API_BASE}/?url=${encodeURIComponent(url)}&format=${format}`);
    const data = res.data;
    videoDetails.classList.add("active");
    videoDetails.innerHTML = `
      <img src="${data.thumbnail}" alt="Thumbnail">
      <div>
        <strong>${data.title}</strong>
        <span>Quality: ${data.quality || ""}</span>
        <span>Channel: ${data.channel}</span>
      </div>
      <button class="audio-btn">Audio</button>
      <button class="video-btn">Video</button>
    `;
    videoDetails.querySelector('.audio-btn')?.addEventListener('click', () =>
      window.location.href = `${API_BASE}/stream/audio/${data.videoId}`);
    videoDetails.querySelector('.video-btn')?.addEventListener('click', () =>
      window.location.href = `${API_BASE}/stream/video/${data.videoId}?quality=480`);
  } catch {
    alert("Failed to fetch video info.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Fetch";
  }
};

const searchBtn = document.getElementById("search-btn") as HTMLButtonElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  try {
    const res = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    // Show suggestions/results below input (implement UI as desired)
    // Example: Display first result in url-input for fast downloading
    urlInput.value = res.data?.[0]?.url || "";
  } catch {
    alert("Search failed.");
  } finally {
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
  }
};
