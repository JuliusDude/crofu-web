/* ==========================================================================
   CroFu Landing Page — Interactive Application Logic (from Chat_with_othermodel.txt)
   ========================================================================== */

// Dataset Definition
const OBSERVED = [
    1820, 1855, 1810, 1795, 1840, 1875, 1890, 1855, 1902, 1935, 1980, 2010,
    1985, 2030, 2075, 2110, 2085, 2145, 2180, 2160, 2220, 2205, 2255, 2240,
    2280, 2295, 2310, 2295, 2315, 2320
];

const FORECAST = [
    { d: 1, p: 2340, lo: 2300, hi: 2380 },
    { d: 2, p: 2358, lo: 2305, hi: 2415 },
    { d: 3, p: 2378, lo: 2310, hi: 2450 },
    { d: 4, p: 2395, lo: 2312, hi: 2478 },
    { d: 5, p: 2412, lo: 2314, hi: 2510 },
    { d: 6, p: 2425, lo: 2316, hi: 2540 },
    { d: 7, p: 2438, lo: 2318, hi: 2560 },
    { d: 8, p: 2448, lo: 2318, hi: 2580 },
    { d: 9, p: 2455, lo: 2315, hi: 2598 },
    { d: 10, p: 2461, lo: 2310, hi: 2612 },
    { d: 11, p: 2466, lo: 2303, hi: 2630 },
    { d: 12, p: 2470, lo: 2295, hi: 2645 },
    { d: 13, p: 2473, lo: 2285, hi: 2662 },
    { d: 14, p: 2475.5, lo: 2270, hi: 2680 }
];

const CROP_DATA = {
  national: {
    tomato: { name: "Tomato", price: 2320, forecast: 2475.50, model: "XGBoost", mape: "6.4%", rmse: "142", mae: "108" },
    onion: { name: "Onion", price: 1845, forecast: 1910.00, model: "ARIMA", mape: "5.1%", rmse: "118", mae: "89" },
    potato: { name: "Potato", price: 1210, forecast: 1245.00, model: "ARIMA", mape: "4.3%", rmse: "95", mae: "72" },
    brinjal: { name: "Brinjal", price: 1580, forecast: 1690.00, model: "XGBoost", mape: "7.8%", rmse: "168", mae: "128" }
  },
  tn: {
    tomato: { name: "Tomato", price: 2150, forecast: 2290.00, model: "LSTM", mape: "5.8%", rmse: "128", mae: "96" },
    onion: { name: "Onion", price: 1760, forecast: 1810.00, model: "XGBoost", mape: "5.4%", rmse: "110", mae: "85" },
    potato: { name: "Potato", price: 1180, forecast: 1215.00, model: "ARIMA", mape: "4.1%", rmse: "88", mae: "68" },
    brinjal: { name: "Brinjal", price: 1490, forecast: 1585.00, model: "XGBoost", mape: "7.2%", rmse: "152", mae: "114" }
  }
};

let activeMarket = "national";
let activeCrop = "tomato";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMarketToggle();
  initCropCards();
  renderHeroChart();
  renderDetailChart();
  initApiExplorer();
  window.addEventListener("resize", () => {
    renderHeroChart();
    renderDetailChart();
  });
});

/* 1. Theme Management */
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const storedTheme = localStorage.getItem("crofu-theme") || "dark";
  document.documentElement.setAttribute("data-theme", storedTheme);
  document.documentElement.classList.toggle("dark", storedTheme === "dark");
  updateThemeBtnText(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("crofu-theme", next);
      updateThemeBtnText(next);
      renderHeroChart();
      renderDetailChart();
    });
  }
}

function updateThemeBtnText(theme) {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.textContent = theme === "dark" ? "◐ Light" : "◑ Dark";
  }
}

/* 2. Market Toggle */
function initMarketToggle() {
  const btnNat = document.getElementById("btn-market-national");
  const btnTN = document.getElementById("btn-market-tn");

  if (!btnNat || !btnTN) return;

  btnNat.addEventListener("click", () => {
    activeMarket = "national";
    btnNat.classList.add("active");
    btnTN.classList.remove("active");
    updateSelectionUI();
  });

  btnTN.addEventListener("click", () => {
    activeMarket = "tn";
    btnTN.classList.add("active");
    btnNat.classList.remove("active");
    updateSelectionUI();
  });
}

/* 3. Crop Selector Cards */
function initCropCards() {
  const cards = document.querySelectorAll(".crop-card-box");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      activeCrop = card.getAttribute("data-crop");
      updateSelectionUI();
    });
  });
}

function updateSelectionUI() {
  const data = CROP_DATA[activeMarket][activeCrop];
  if (!data) return;

  document.getElementById("selected-crop-name").textContent = `${data.name.toUpperCase()} · ${activeMarket.toUpperCase()}`;
  document.getElementById("selected-crop-price").textContent = `₹ ${data.price.toLocaleString('en-IN')} / Qtl`;
  document.getElementById("selected-crop-model").textContent = data.model;
  document.getElementById("selected-crop-mape").textContent = data.mape;
  document.getElementById("selected-crop-rmse").textContent = data.rmse;
  document.getElementById("selected-crop-mae").textContent = data.mae;

  renderDetailChart();
}

/* 4. Hero Signature Forecast Fan Chart Renderer */
function renderHeroChart() {
  const container = document.getElementById("hero-chart-svg-container");
  if (!container) return;

  const width = container.clientWidth || 600;
  const height = 360;
  const padL = 60;
  const padR = 24;
  const padT = 30;
  const padB = 45;

  const allVals = [...OBSERVED];
  FORECAST.forEach(f => allVals.push(f.p, f.lo, f.hi));

  const yMin = Math.floor(Math.min(...allVals) / 100) * 100 - 50;
  const yMax = Math.ceil(Math.max(...allVals) / 100) * 100 + 50;
  const totalPoints = OBSERVED.length + FORECAST.length;
  const stepX = (width - padL - padR) / (totalPoints - 1);

  const getX = (i) => padL + i * stepX;
  const getY = (v) => padT + ((yMax - v) / (yMax - yMin)) * (height - padT - padB);

  // Observed path
  let obsPath = "";
  OBSERVED.forEach((v, i) => {
    obsPath += `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)} `;
  });

  // Forecast path
  const lastObsIdx = OBSERVED.length - 1;
  let fcPath = `M ${getX(lastObsIdx)} ${getY(OBSERVED[lastObsIdx])} `;
  FORECAST.forEach((f, i) => {
    fcPath += `L ${getX(lastObsIdx + 1 + i)} ${getY(f.p)} `;
  });

  // Confidence Band Polygon
  const upperPts = FORECAST.map((f, i) => `${getX(lastObsIdx + 1 + i)},${getY(f.hi)}`);
  const lowerPts = FORECAST.map((f, i) => `${getX(lastObsIdx + 1 + i)},${getY(f.lo)}`).reverse();
  const bandPoints = [`${getX(lastObsIdx)},${getY(OBSERVED[lastObsIdx])}`, ...upperPts, ...lowerPts].join(" ");

  const transitionX = getX(lastObsIdx);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  const brandColor = isDark ? "#3e8b63" : "#204a38";
  const goldColor = isDark ? "#e0ac4c" : "#b8872e";
  const gridColor = isDark ? "#2a342d" : "#e3ddcb";
  const textColor = isDark ? "#93a090" : "#5c6659";

  const svgHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bandGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="${goldColor}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${goldColor}" stop-opacity="0.08" />
        </linearGradient>
      </defs>

      <!-- Y Grid -->
      <line x1="${padL}" y1="${getY(2000)}" x2="${width - padR}" y2="${getY(2000)}" stroke="${gridColor}" stroke-dasharray="2 4" />
      <line x1="${padL}" y1="${getY(2300)}" x2="${width - padR}" y2="${getY(2300)}" stroke="${gridColor}" stroke-dasharray="2 4" />
      <line x1="${padL}" y1="${getY(2600)}" x2="${width - padR}" y2="${getY(2600)}" stroke="${gridColor}" stroke-dasharray="2 4" />

      <!-- Y Axis Labels -->
      <text x="${padL - 10}" y="${getY(2000) + 4}" text-anchor="end" font-size="11" fill="${textColor}" font-family="var(--font-mono)">₹2,000</text>
      <text x="${padL - 10}" y="${getY(2300) + 4}" text-anchor="end" font-size="11" fill="${textColor}" font-family="var(--font-mono)">₹2,300</text>
      <text x="${padL - 10}" y="${getY(2600) + 4}" text-anchor="end" font-size="11" fill="${textColor}" font-family="var(--font-mono)">₹2,600</text>

      <!-- X Axis Labels -->
      <text x="${padL}" y="${height - 12}" font-size="10" fill="${textColor}" font-family="var(--font-mono)" letter-spacing="0.06em">30 DAYS AGO</text>
      <text x="${transitionX}" y="${height - 12}" text-anchor="middle" font-size="10" fill="${textColor}" font-family="var(--font-mono)" letter-spacing="0.06em">TODAY</text>
      <text x="${width - padR}" y="${height - 12}" text-anchor="end" font-size="10" fill="${textColor}" font-family="var(--font-mono)" letter-spacing="0.06em">+14 DAYS</text>

      <!-- Confidence Band -->
      <polygon points="${bandPoints}" fill="url(#bandGrad)" />

      <!-- Vertical Divider at Today -->
      <line x1="${transitionX}" x2="${transitionX}" y1="${padT}" y2="${height - padB}" stroke="${textColor}" stroke-dasharray="3 4" opacity="0.5" />

      <!-- Observed Line -->
      <path d="${obsPath}" fill="none" stroke="${brandColor}" stroke-width="2.2" stroke-linecap="round" />

      <!-- Forecast Line -->
      <path d="${fcPath}" fill="none" stroke="${goldColor}" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round" />

      <!-- Today Marker Dot -->
      <circle cx="${transitionX}" cy="${getY(OBSERVED[lastObsIdx])}" r="4.5" fill="${brandColor}" />

      <!-- Peak Forecast Dot -->
      <circle cx="${width - padR}" cy="${getY(FORECAST[FORECAST.length - 1].p)}" r="5" fill="${goldColor}" />
      <text x="${width - padR - 8}" y="${getY(FORECAST[FORECAST.length - 1].p) - 12}" text-anchor="end" font-size="11" fill="${goldColor}" font-family="var(--font-mono)" font-weight="600">₹2,475.50</text>
    </svg>
  `;

  container.innerHTML = svgHTML;
}

/* 5. Detail Chart Renderer */
function renderDetailChart() {
  const container = document.getElementById("chart-svg-container-detail");
  if (!container) return;

  const data = CROP_DATA[activeMarket][activeCrop];
  const price = data.price;
  const forecastVal = data.forecast;
  const width = container.clientWidth || 500;
  const height = 180;
  const pad = 20;

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const brandColor = isDark ? "#3e8b63" : "#204a38";
  const goldColor = isDark ? "#e0ac4c" : "#b8872e";

  const svgHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="M ${pad} ${height - pad - 20} Q ${width / 2} ${pad + 20} ${width - pad} ${pad}" fill="none" stroke="${brandColor}" stroke-width="2.5" />
      <path d="M ${width / 2} ${pad + 30} Q ${(width * 3) / 4} ${pad + 10} ${width - pad} ${pad - 5}" fill="none" stroke="${goldColor}" stroke-width="2.5" stroke-dasharray="4 4" />
      <circle cx="${width - pad}" cy="${pad - 5}" r="5" fill="${goldColor}" />
      <text x="${width - pad - 10}" y="${pad + 15}" text-anchor="end" font-size="12" fill="${goldColor}" font-family="var(--font-mono)" font-weight="700">₹ ${forecastVal.toFixed(2)}</text>
    </svg>
  `;

  container.innerHTML = svgHTML;
}

/* 6. API Explorer Snippets */
function initApiExplorer() {
  const codeEl = document.getElementById("api-code-snippet");
  if (!codeEl) return;

  const snippets = {
    predict: `// GET /predict/national/tomato?horizon=14
{
  "region": "national",
  "vegetable": "tomato",
  "model_type": "xgboost",
  "last_observed_date": "2026-08-01",
  "last_observed_price": 2320.0,
  "forecast_days": 14,
  "prices": [
    { "day": 1, "date": "2026-08-02", "price": 2350.0, "low": 2208.0, "high": 2492.0 },
    { "day": 14, "date": "2026-08-15", "price": 2475.5, "low": 2333.5, "high": 2617.5 }
  ]
}`,
    health: `// GET /health
{
  "status": "healthy",
  "loaded_models_count": 8,
  "models": ["national_potato", "national_onion", "national_tomato", "national_brinjal", "tn_potato", "tn_onion", "tn_tomato", "tn_brinjal"]
}`,
    vegetables: `// GET /vegetables
{
  "regions": ["national", "tn"],
  "vegetables": ["potato", "onion", "tomato", "brinjal"]
}`
  };

  document.querySelectorAll(".api-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-api");
      if (snippets[type]) {
        codeEl.textContent = snippets[type];
      }
    });
  });
}
