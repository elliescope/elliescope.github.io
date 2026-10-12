const REGIONS = {
  "north-america": {
    title: "Birds of North America",
    countScript: "https://script.google.com/macros/s/AKfycbxe4NClXq55jbnJaGiQTo_JZZY2337armVG1s7Jh-AuiKBWur-OjrIKXh41HVep3getbQ/exec",
    tabs: [
      {
        label: "Wetland",
        pad: 164,
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1386834576&single=true"
      },
      {
        label: "Forest",
        pad: 188,
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1392521724&single=true"
      },
      {
        label: "Sea&Shore",
        pad: 110,
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1996768528&single=true"
      },
      {
        label: "Raptor",
        pad: 100,
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1969026289&single=true"
      }
    ]
  },
  "china": {
    title: "Birds of China",
    countScript: "https://script.google.com/macros/s/AKfycbzMQZggcdLXMqIKzig7M0X-mfliHuEm0_K3_0F5f56iCOoSIAZGGseNyqY1RIvzeJE/exec",
    tabs: [
      {
        label: "2026 Trip",
        pad: 187,
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTotCkvZfUaMFMoAWxRNZQcSxbtq2MvAzqcYO_tUbomR3u0PC5h0kzZMuB5hqU3FCF2DHEKedahPcfS/pubhtml?gid=1996768528&single=true"
      }
    ]
  }
};

const iframe = document.getElementById("birdSheet");
const container = iframe.parentElement;
const titleEl = document.getElementById("birdChecklistTitle");
const habitatTabsEl = document.getElementById("habitatTabs");

let activeRegion = "north-america";
let activeTab = 0;
let currentRows = null;
let currentTab = null;

// Sizing constants for the embedded sheet (tune if needed).
// ROW_HEIGHT: one species row (with photo) is 229px tall in the published view.
// TITLE_BAR:  height (px) of Google's doc-title bar, cropped off the top.
// DEFAULT_PAD: fallback fix (px) for sheets without an explicit `pad`.
//              Each tab can override with its own `pad` so the page scrollbar
//              exactly fits that sheet's real height.
const ROW_HEIGHT = 229;
const TITLE_BAR = 30;
const DEFAULT_PAD = 100;

function csvUrlFromSheet(sheetUrl) {
  const url = sheetUrl.replace("/pubhtml", "/pub");
  return url + (url.indexOf("?") > -1 ? "&" : "?") + "output=csv";
}

function countCsvRecords(text) {
  let rows = 0;
  let inQuotes = false;
  let hasContent = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') i++;
        else inQuotes = false;
      } else if (c !== "\r" && c !== "\n") {
        hasContent = true;
      }
    } else if (c === '"') {
      inQuotes = true;
      hasContent = true;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (hasContent) rows++;
      hasContent = false;
    } else if (c !== " " && c !== "\t") {
      hasContent = true;
    }
  }
  if (hasContent) rows++;
  return rows;
}

async function loadRowCount(tab) {
  if (tab.rows) return tab.rows;
  try {
    const res = await fetch(csvUrlFromSheet(tab.sheet));
    if (!res.ok) throw new Error(res.status);
    tab.rows = countCsvRecords(await res.text());
  } catch (err) {
    console.error("Failed to load sheet size:", err);
    tab.rows = null;
  }
  return tab.rows;
}

async function applyRowCount(tab) {
  currentTab = tab;
  currentRows = tab.rows || null;
  adjustIframe();
  currentRows = await loadRowCount(tab);
  adjustIframe();
}

function setTitle(region) {
  titleEl.innerHTML = region.title;
}

async function updateTotalCompleted() {
  const region = REGIONS[activeRegion];
  const requestedRegion = activeRegion;
  if (!region.countScript) {
    return;
  }
  try {
    const response = await fetch(region.countScript);
    const total = await response.text();
    if (activeRegion !== requestedRegion) return;
    titleEl.innerHTML = `${region.title} (<span class="highlight-observed">Species I observed: ${total}</span>)`;
  } catch (error) {
    console.error("Failed to fetch total completed:", error);
    if (activeRegion !== requestedRegion) return;
    titleEl.innerHTML = `${region.title} (<span class="highlight-observed">Species count unavailable</span>)`;
  }
}

function renderHabitatTabs() {
  const region = REGIONS[activeRegion];
  habitatTabsEl.innerHTML = "";
  region.tabs.forEach((tab, index) => {
    const btn = document.createElement("button");
    btn.textContent = tab.label;
    if (index === activeTab) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      activeTab = index;
      document.querySelectorAll('#habitatTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      iframe.src = tab.sheet;
      applyRowCount(tab);
    });
    habitatTabsEl.appendChild(btn);
  });
}

function selectRegion(regionKey) {
  activeRegion = regionKey;
  activeTab = 0;

  document.querySelectorAll('.region-tabs button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.region-tabs button[data-region="${regionKey}"]`).classList.add('active');

  renderHabitatTabs();
  const tab = REGIONS[regionKey].tabs[0];
  iframe.src = tab.sheet;
  setTitle(REGIONS[regionKey]);
  updateTotalCompleted();
  applyRowCount(tab);
}

document.querySelectorAll('.region-tabs button').forEach(btn => {
  btn.addEventListener('click', () => selectRegion(btn.dataset.region));
});

function adjustIframe() {
  const scale = Math.min(container.clientWidth / 984, 1);

  iframe.style.transform = `scale(${scale})`;
  iframe.style.marginTop = `${-TITLE_BAR * scale}px`;

  let contentHeight;
  if (currentRows) {
    const dataRows = Math.max(currentRows - 2, 0);
    const pad = currentTab && typeof currentTab.pad === "number" ? currentTab.pad : DEFAULT_PAD;
    contentHeight = Math.max(dataRows * ROW_HEIGHT + pad, 400);
  } else {
    const vh = window.visualViewport?.height || window.innerHeight;
    const header = document.querySelector('.masthead');
    contentHeight = Math.max(vh - (header ? header.offsetHeight : 120), 400);
  }

  iframe.style.height = (contentHeight + TITLE_BAR) + "px";
  container.style.height = (contentHeight * scale) + "px";
  container.style.overflowX = "hidden";
}

renderHabitatTabs();
setTitle(REGIONS[activeRegion]);
updateTotalCompleted();
applyRowCount(REGIONS[activeRegion].tabs[activeTab]);

window.addEventListener("load", adjustIframe);
window.addEventListener("resize", () => requestAnimationFrame(adjustIframe));
window.addEventListener("orientationchange", () => requestAnimationFrame(adjustIframe));
if (window.ResizeObserver) {
  new ResizeObserver(adjustIframe).observe(container);
}