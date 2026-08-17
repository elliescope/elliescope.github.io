const sheetURL = "/data/notes.json";

fetch(sheetURL)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("notes");
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>No notes found.</p>";
      return;
    }
    container.innerHTML = data.map(note => {
      let mediaList = [];
      if (note.images && Array.isArray(note.images)) {
        mediaList = note.images;
      } else if (note.image) {
        mediaList = note.image
          .split(/[\n,]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }

      const mediaHTML = mediaList
        .map(src => {
          if (src.match(/\.(mp4|webm|mov)$/i)) {
            return `<video controls muted playsinline referrerpolicy="no-referrer" src="${src}"></video>`;
          } else {
            return `<img referrerpolicy="no-referrer" src="${src}" alt="${note.title}">`;
          }
        })
        .join("");

      let noteClass = "note";
      if (mediaList.length === 1) {
        noteClass += " single-image right";
      } else if (mediaList.length > 1) {
        noteClass += " multi-image";
      }

      let mediaStyle = "";
      if (mediaList.length > 1) {
        mediaStyle = `style="display:flex; gap:10px; width:100%;"`;
      }

      return `
        <div class="${noteClass}">
          <div class="note-content">
            <h3>${note.title}</h3>
            <p class="note-date"><em>${note.date ? note.date.split("T")[0] : ""}</em></p>
            <p>${note.content.replace(/\n/g, "<br>")}</p>
          </div>
          <div class="note-images" ${mediaStyle}>${mediaHTML}</div>
        </div>
      `;
    }).join("");

    document.querySelectorAll('.note.multi-image').forEach(noteDiv => {
      const imgs = noteDiv.querySelectorAll('img, video');
      const count = imgs.length;
      imgs.forEach(img => {
        img.style.width = `calc(${100/count}% - ${(count-1)*10/count}px)`;
      });
    });
  })
  .catch(err => {
    console.error("Failed to load notes:", err);
    document.getElementById("notes").innerHTML =
      "<p>Failed to load notes. Please try refreshing the page.</p>";
  });
