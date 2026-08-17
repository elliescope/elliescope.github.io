async function loadArtGallery() {
  const container = document.getElementById("art-gallery");
  try {
    const response = await fetch("/data/arts.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const artworks = await response.json();

    if (!Array.isArray(artworks) || artworks.length === 0) {
      container.innerHTML = "<p>No artwork found.</p>";
      return;
    }

    artworks.forEach((art) => {
      const item = document.createElement("div");
      item.className = "art-item";

      item.innerHTML = `
        <img referrerpolicy="no-referrer" src="${art.image}" alt="${art.title}">
        <div class="art-info">
          <h3>${art.title}</h3>
          <div class="date">${art.date ? art.date.split("T")[0] : ""}</div>
          <p>${art.content || ""}</p>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading art gallery:", err);
    container.innerHTML =
      "<p>Unable to load art gallery. Please try refreshing the page.</p>";
  }
}

window.addEventListener("load", loadArtGallery);
