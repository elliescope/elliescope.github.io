---
layout: page
# title: Nature Notes
---

<div id="notes"></div>

<script>
  const sheetURL = "https://script.google.com/macros/s/AKfycbzJOCaTFbO1itoys61M-vXfPvMhE1IHbydHHQGU4ay_xnywJjhJtzNcHddhN940b2kTRw/exec";
  const CACHE_KEY = "natureNotesCache";
  const CACHE_TIME_KEY = "natureNotesCacheTime";
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // check for updates every 5 minutes

  async function fetchNotes() {
    const container = document.getElementById('notes');
    const now = Date.now();
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);

    // Use cache if not expired
    if (cachedData && cachedTime && now - cachedTime < CACHE_DURATION) {
      renderNotes(JSON.parse(cachedData));
    } else {
      try {
        const res = await fetch(sheetURL);
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, now);
        renderNotes(data);
      } catch (err) {
        container.innerHTML = "Failed to load notes.";
        console.error(err);
      }
    }
  }

  function renderNotes(data) {
    const container = document.getElementById('notes');
    container.innerHTML = data.map(note => `
      <div style="margin:20px 0; padding:15px; border-bottom:1px solid #ddd;">
        <h3>${note.title}</h3>
        <p><em>${note.date}</em></p>
        <p>${note.content}</p>
        ${note.image ? `<img src="${note.image}" style="max-width:100%; border-radius:8px;">` : ''}
      </div>
    `).join('');
  }

  // Initial load
  fetchNotes();

  // Auto-refresh in the background every 5 minutes
  setInterval(fetchNotes, AUTO_REFRESH_INTERVAL);
</script>





