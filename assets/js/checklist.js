const REGIONS = {
  "north-america": {
    title: "Birds of North America",
    countScript: "https://script.google.com/macros/s/AKfycbxe4NClXq55jbnJaGiQTo_JZZY2337armVG1s7Jh-AuiKBWur-OjrIKXh41HVep3getbQ/exec",
    tabs: [
      {
        label: "Wetland",
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1386834576&single=true"
      },
      {
        label: "Forest",
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1392521724&single=true"
      },
      {
        label: "Sea&Shore",
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1996768528&single=true"
      },
      {
        label: "Raptor",
        sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIJ0x6PAfm2a2jW7dxYmhHGNbsbMCOvfYoL1HLh9qVSxD9nZfRUDUcLfjo8gFHq37NM6Ad52r2VL35/pubhtml?gid=1969026289&single=true"
      }
    ]
  },
  "china": {
    title: "Birds of China",
    countScript: null,
    tabs: [
      {
        label: "2026 Trip",
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
  iframe.src = REGIONS[regionKey].tabs[0].sheet;
  setTitle(REGIONS[regionKey]);
  updateTotalCompleted();
}

document.querySelectorAll('.region-tabs button').forEach(btn => {
  btn.addEventListener('click', () => selectRegion(btn.dataset.region));
});

function adjustIframe() {
  const w = window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;

  const header = document.querySelector('.masthead');
  const menuHeight = header ? header.offsetHeight : 120;
  const availableHeight = vh - menuHeight;
  const minHeight = 520;

  const baseTopMargin = 30;
  const scale = Math.min(container.clientWidth / 984, 1);

  iframe.style.transform = `scale(${scale})`;
  iframe.style.marginTop = `${-baseTopMargin * scale}px`;

  const scaledHeight = availableHeight / scale;
  iframe.style.height = Math.max(scaledHeight, minHeight) + "px";
  container.style.height = Math.max(availableHeight, minHeight) + "px";
  container.style.overflowX = "hidden";
}

renderHabitatTabs();
setTitle(REGIONS[activeRegion]);
updateTotalCompleted();

window.addEventListener("load", adjustIframe);
window.addEventListener("resize", () => requestAnimationFrame(adjustIframe));
window.addEventListener("orientationchange", () => requestAnimationFrame(adjustIframe));
if (window.ResizeObserver) {
  new ResizeObserver(adjustIframe).observe(container);
}