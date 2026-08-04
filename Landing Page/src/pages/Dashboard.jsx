import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Sliders,
    Download,
    RefreshCw,
    Search,
    Bell,
    CheckCircle2,
    ArrowLeft,
    Layers,
    Calendar,
    Zap,
    AlertTriangle,
    Check,
    FileText,
    FileSpreadsheet,
    Code,
    Filter,
} from "lucide-react";
import { useTheme, toggleTheme } from "@/lib/crofuHooks";

/* ---------- Mock Master Dataset for Dashboard Analytics ---------- */
const COMMODITY_CONFIG = {
    tomato: {
        label: "Tomato",
        img: "/tomatoes.jpg",
        icon: "🍅",
        unitQuintal: 2320,
        championModel: "XGBoost V3",
        mape: 6.4,
        rmse: 142,
        mae: 108,
        r2: 0.941,
        dirAccuracy: 91.2,
        trainDuration: "14.2s",
        lastRetrained: "2026-08-01",
        seasonStatus: "Peak Harvest Window",
        seasonIndex: "1.12x",
        volatilityLevel: "Moderate Volatility Warning",
        surplusIndex: "-4.2%",
    },
    onion: {
        label: "Onion",
        img: "/onion.jpg",
        icon: "🧅",
        unitQuintal: 1950,
        championModel: "ARIMA (2,1,2)",
        mape: 5.1,
        rmse: 118,
        mae: 89,
        r2: 0.958,
        dirAccuracy: 93.5,
        trainDuration: "8.6s",
        lastRetrained: "2026-08-02",
        seasonStatus: "Storage Release Window",
        seasonIndex: "0.95x",
        volatilityLevel: "Low Volatility",
        surplusIndex: "+2.1%",
    },
    potato: {
        label: "Potato",
        img: "/potato.jpg",
        icon: "🥔",
        unitQuintal: 1680,
        championModel: "ARIMA (1,1,1)",
        mape: 4.3,
        rmse: 95,
        mae: 72,
        r2: 0.965,
        dirAccuracy: 94.8,
        trainDuration: "6.1s",
        lastRetrained: "2026-08-03",
        seasonStatus: "Post-Harvest Cold Store",
        seasonIndex: "0.98x",
        volatilityLevel: "Low Volatility",
        surplusIndex: "+5.4%",
    },
    brinjal: {
        label: "Brinjal",
        img: "/brinjal.png",
        icon: "🍆",
        unitQuintal: 2100,
        championModel: "XGBoost V2",
        mape: 7.8,
        rmse: 168,
        mae: 128,
        r2: 0.912,
        dirAccuracy: 88.4,
        trainDuration: "12.9s",
        lastRetrained: "2026-07-31",
        seasonStatus: "Sowing & Early Arrival",
        seasonIndex: "1.05x",
        volatilityLevel: "High Price Volatility Warning",
        surplusIndex: "-8.1%",
    },
};

const ALL_MANDIS = [
    { name: "Koyambedu Wholesale", district: "Chennai", modal: 2420, min: 2300, max: 2550, arrival: 1450, delta: 2.1, trend: "Rising" },
    { name: "Madurai Central Mandi", district: "Madurai", modal: 2280, min: 2150, max: 2400, arrival: 980, delta: -0.8, trend: "Stable" },
    { name: "Azadpur Mandi", district: "Delhi NCR", modal: 2350, min: 2200, max: 2500, arrival: 3200, delta: 1.5, trend: "Rising" },
    { name: "Agra Vegetable Market", district: "Agra", modal: 2210, min: 2100, max: 2320, arrival: 890, delta: -1.2, trend: "Falling" },
    { name: "Salem Market Yard", district: "Salem", modal: 2300, min: 2200, max: 2420, arrival: 650, delta: 0.4, trend: "Stable" },
    { name: "Tirunelveli Farmers Market", district: "Tirunelveli", modal: 2390, min: 2250, max: 2480, arrival: 520, delta: 3.2, trend: "Rising" },
    { name: "Coimbatore Uzhavar Sandhai", district: "Coimbatore", modal: 2370, min: 2260, max: 2490, arrival: 1100, delta: 1.8, trend: "Rising" },
    { name: "Vellore Main Market", district: "Vellore", modal: 2290, min: 2180, max: 2380, arrival: 480, delta: -0.5, trend: "Stable" },
];

/* Generate 30 days history + 30 days forecast */
function generateSeries(basePrice) {
    const history = [];
    const forecast = [];
    const now = new Date(2026, 7, 4); // Aug 4, 2026

    // 30 days history
    let p = basePrice - 300;
    for (let i = 30; i >= 1; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        p += Math.sin(i * 0.4) * 25 + (Math.random() * 20 - 10) + 10;
        history.push({
            date: d.toISOString().split("T")[0],
            actual: Math.round(p),
            arrival: Math.round(3500 + Math.sin(i * 0.5) * 800 + Math.random() * 400),
            ma7: Math.round(p - 15),
            ma30: Math.round(p - 60),
        });
    }

    // 30 days forecast
    let fcP = p;
    for (let i = 1; i <= 30; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + i);
        fcP += Math.sin(i * 0.3) * 15 + 6;
        const spread = 40 + i * 8;
        forecast.push({
            day: i,
            date: d.toISOString().split("T")[0],
            predicted: Math.round(fcP),
            lower: Math.round(fcP - spread),
            upper: Math.round(fcP + spread),
            arrival: Math.round(3800 + Math.cos(i * 0.4) * 600),
            xgboost: Math.round(fcP),
            arima: Math.round(fcP - 25 + Math.sin(i) * 30),
            grnn: Math.round(fcP + 15 - Math.cos(i) * 20),
            lstm: Math.round(fcP + 35 - i * 1.2),
        });
    }

    return { history, forecast, currentObserved: Math.round(p) };
}

/* ---------- Main Dashboard Component ---------- */
export default function Dashboard({ onNavigate }) {
    useTheme();

    const [isDark, setIsDark] = useState(false);
    React.useEffect(() => {
        const check = () =>
            setIsDark(document.documentElement.classList.contains("dark"));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    // Global Controls State
    const [region, setRegion] = useState("national");
    const [commodity, setCommodity] = useState("tomato");
    const [selectedMandis, setSelectedMandis] = useState(["Koyambedu Wholesale", "Madurai Central Mandi"]);
    const [forecastHorizon, setForecastHorizon] = useState("30");
    const [lookbackWindow, setLookbackWindow] = useState("30");
    const [priceUnit, setPriceUnit] = useState("quintal"); // quintal | kg

    // Chart Layer Toggles
    const [showConfidence, setShowConfidence] = useState(true);
    const [showArrivals, setShowArrivals] = useState(true);
    const [showMA, setShowMA] = useState(true);
    const [scaleType, setScaleType] = useState("linear");

    // Interactive Hover Tooltip for Main Chart
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Active View Tab
    const [activeTab, setActiveTab] = useState("forecast"); // forecast | benchmark | evolution | mandis | alerts

    // Mandi Table Filter & Search
    const [mandiSearch, setMandiSearch] = useState("");
    const [sortKey, setSortKey] = useState("modal");
    const [sortAsc, setSortAsc] = useState(false);

    // Alert Config State
    const [alertUpper, setAlertUpper] = useState(2600);
    const [alertLower, setAlertLower] = useState(2100);
    const [alertShift, setAlertShift] = useState(5.0);
    const [alertChannels, setAlertChannels] = useState({ email: true, sms: true, push: false, webhook: false });
    const [alertFreq, setAlertFreq] = useState("daily");
    const [alertSaved, setAlertSaved] = useState(false);

    // Notification toast for export actions
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const config = COMMODITY_CONFIG[commodity];
    const unitMultiplier = priceUnit === "kg" ? 0.01 : 1.0;
    const unitLabel = priceUnit === "kg" ? "₹ / KG" : "₹ / QUINTAL";

    // Dataset generation based on commodity
    const seriesData = useMemo(() => generateSeries(config.unitQuintal), [commodity]);

    const horizonDays = parseInt(forecastHorizon, 10);
    const activeForecast = seriesData.forecast.slice(0, horizonDays);
    const targetFc = activeForecast[activeForecast.length - 1];

    // Filter & Sort Mandis
    const filteredMandis = useMemo(() => {
        return ALL_MANDIS.filter(
            (m) =>
                m.name.toLowerCase().includes(mandiSearch.toLowerCase()) ||
                m.district.toLowerCase().includes(mandiSearch.toLowerCase())
        ).sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (typeof valA === "string") {
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortAsc ? valA - valB : valB - valA;
        });
    }, [mandiSearch, sortKey, sortAsc]);

    // Format currency helper
    const fmt = (val) => {
        if (val === undefined || val === null) return "-";
        const res = val * unitMultiplier;
        return res >= 1000 ? res.toLocaleString("en-IN", { maximumFractionDigits: 1 }) : res.toFixed(1);
    };

    return (
        <div
            className="min-h-screen font-sans antialiased text-[var(--ink)] transition-colors duration-300"
            style={{ background: "var(--bg)" }}
        >
            {/* Notification Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-5 right-5 z-50 px-5 py-3 rounded border shadow-xl flex items-center gap-3 font-mono text-xs"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--brand)",
                            color: "var(--ink)",
                        }}
                    >
                        <CheckCircle2 size={16} className="text-[var(--brand)]" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---------- Header & Global Bar ---------- */}
            <header
                className="sticky top-0 z-40 border-b backdrop-blur-md"
                style={{
                    borderColor: "var(--border)",
                    background: "var(--bg)",
                    opacity: 0.98,
                }}
            >
                <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate && onNavigate("landing")}
                            className="flex items-center gap-2 px-3 py-1.5 border text-xs font-mono tracking-wider uppercase hover:border-[var(--ink)] transition-colors"
                            style={{ borderColor: "var(--border)", color: "var(--ink-2)" }}
                            title="Back to Landing Page"
                        >
                            <ArrowLeft size={14} />
                            <span>Landing Page</span>
                        </button>
                        <span className="font-serif text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                            CroFu<span style={{ color: "var(--gold)" }}>.</span>
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border text-[var(--ink-2)]" style={{ borderColor: "var(--border)" }}>
                                Desktop Analytics
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="hidden lg:flex items-center gap-2 text-[var(--ink-2)] border px-3 py-1.5" style={{ borderColor: "var(--border)" }}>
                            <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" />
                            <span>Agmarknet Sync: 2026-08-04 06:00 IST</span>
                            <span className="opacity-40">|</span>
                            <span className="text-[var(--positive)]">API Operational</span>
                        </div>

                        {/* Theme Switcher */}
                        <button
                            onClick={() => {
                                toggleTheme();
                                setIsDark(document.documentElement.classList.contains("dark"));
                            }}
                            className="px-3 py-1.5 border text-xs tracking-wider uppercase font-mono cursor-pointer transition-colors hover:border-[var(--ink)]"
                            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                            data-testid="dashboard-theme-toggle"
                        >
                            {isDark ? "◐ Light" : "◑ Dark"}
                        </button>
                    </div>
                </div>

                {/* Section 1.1 - 1.3: Global Controls Toolbar */}
                <div className="border-t py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <div className="max-w-[1500px] mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                        {/* Commodity Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[var(--ink-2)] uppercase tracking-wider text-[11px] font-bold">Crop:</span>
                            {Object.keys(COMMODITY_CONFIG).map((key) => {
                                const c = COMMODITY_CONFIG[key];
                                const active = commodity === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setCommodity(key)}
                                        className={`px-3.5 py-1.5 border transition-all flex items-center justify-center ${
                                            active ? "font-bold shadow-sm" : "opacity-85 hover:opacity-100"
                                        }`}
                                        style={{
                                            borderColor: active ? "var(--ink)" : "var(--border)",
                                            background: active ? "var(--ink)" : "transparent",
                                        }}
                                    >
                                        <span
                                            className="font-black text-sm tracking-widest uppercase"
                                            style={{
                                                backgroundImage: `url(${c.img})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                color: "transparent",
                                                display: "inline-block",
                                                filter: active ? "contrast(1.5) brightness(1.2) saturate(1.2)" : "contrast(1.1) opacity(0.85)",
                                            }}
                                        >
                                            {c.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Region & Controls Group */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Region */}
                            <div className="flex items-center gap-1">
                                <span className="text-[var(--ink-2)] uppercase text-[11px]">Region:</span>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="bg-transparent border px-2 py-1 focus:outline-none"
                                    style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                                >
                                    <option value="national">National (All-India)</option>
                                    <option value="tn">Tamil Nadu (State-Level)</option>
                                </select>
                            </div>

                            {/* Horizon */}
                            <div className="flex items-center gap-1">
                                <span className="text-[var(--ink-2)] uppercase text-[11px]">Horizon:</span>
                                <div className="flex border" style={{ borderColor: "var(--border)" }}>
                                    {["1", "7", "14", "30"].map((h) => (
                                        <button
                                            key={h}
                                            onClick={() => setForecastHorizon(h)}
                                            className={`px-2 py-1 ${forecastHorizon === h ? "bg-[var(--ink)] text-[var(--bg)] font-bold" : "hover:bg-[var(--border)]"}`}
                                        >
                                            {h}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Unit Converter */}
                            <div className="flex items-center gap-1">
                                <span className="text-[var(--ink-2)] uppercase text-[11px]">Unit:</span>
                                <div className="flex border" style={{ borderColor: "var(--border)" }}>
                                    <button
                                        onClick={() => setPriceUnit("quintal")}
                                        className={`px-2 py-1 ${priceUnit === "quintal" ? "bg-[var(--brand)] text-white font-bold" : ""}`}
                                    >
                                        ₹/Qtl
                                    </button>
                                    <button
                                        onClick={() => setPriceUnit("kg")}
                                        className={`px-2 py-1 ${priceUnit === "kg" ? "bg-[var(--brand)] text-white font-bold" : ""}`}
                                    >
                                        ₹/kg
                                    </button>
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => triggerToast("Exporting CSV dataset (crofu_forecast_data.csv)...")}
                                    className="p-1.5 border hover:border-[var(--ink)]"
                                    style={{ borderColor: "var(--border)" }}
                                    title="Export CSV"
                                >
                                    <FileSpreadsheet size={15} />
                                </button>
                                <button
                                    onClick={() => triggerToast("Generating Printable PDF Analytics Report...")}
                                    className="p-1.5 border hover:border-[var(--ink)]"
                                    style={{ borderColor: "var(--border)" }}
                                    title="Export PDF Report"
                                >
                                    <FileText size={15} />
                                </button>
                                <button
                                    onClick={() => triggerToast("Copied JSON API Payload to clipboard!")}
                                    className="p-1.5 border hover:border-[var(--ink)]"
                                    style={{ borderColor: "var(--border)" }}
                                    title="Export JSON API Payload"
                                >
                                    <Code size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ---------- Main Content Container ---------- */}
            <main className="max-w-[1500px] mx-auto px-4 md:px-8 py-6 space-y-8">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b overflow-x-auto pb-1" style={{ borderColor: "var(--border)" }}>
                    {[
                        { id: "forecast", label: "Main Forecast & Time-Series", icon: Activity },
                        { id: "benchmark", label: "Multi-Model Benchmark", icon: Layers },
                        { id: "evolution", label: "Prediction Evolution & Audit", icon: Zap },
                        { id: "mandis", label: "Mandi Regional Breakdown", icon: Filter },
                        { id: "alerts", label: "Risk Signals & Alert Rules", icon: Bell },
                    ].map((t) => {
                        const Icon = t.icon;
                        const active = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                                    active ? "border-[var(--gold)] font-bold text-[var(--ink)]" : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]"
                                }`}
                            >
                                <Icon size={14} />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Key Performance Indicators (KPI Summary Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* KPI 1: Current Observed Price */}
                    <div className="p-5 border flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Observed Price</div>
                        <div className="my-3">
                            <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
                                ₹{fmt(seriesData.currentObserved)}
                            </div>
                            <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">{unitLabel} · 2026-08-04</div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--positive)] font-semibold">
                            <TrendingUp size={14} />
                            <span>+₹{fmt(45)} (+1.98%) 24h</span>
                        </div>
                    </div>

                    {/* KPI 2: Projected Target Price */}
                    <div className="p-5 border flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Target Price ({forecastHorizon}d)</div>
                        <div className="my-3">
                            <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                                ₹{fmt(targetFc?.predicted)}
                            </div>
                            <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">Expected {targetFc?.date}</div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--positive)] font-semibold">
                            <span>Net Shift: +₹{fmt(targetFc?.predicted - seriesData.currentObserved)} (+6.7%)</span>
                        </div>
                    </div>

                    {/* KPI 3: Expected Range & Volatility */}
                    <div className="p-5 border flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Price Range & Volatility</div>
                        <div className="my-2 space-y-1 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-[var(--ink-2)]">Min:</span>
                                <span className="font-bold">₹{fmt(targetFc?.lower)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--ink-2)]">Max:</span>
                                <span className="font-bold">₹{fmt(targetFc?.upper)}</span>
                            </div>
                        </div>
                        <div className="font-mono text-[11px] text-[var(--ink-2)] pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                            Volatility σ = {fmt(84.2)}
                        </div>
                    </div>

                    {/* KPI 4: Market Supply & Arrivals */}
                    <div className="p-5 border flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Market Arrivals</div>
                        <div className="my-3">
                            <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--brand)" }}>
                                4,850 <span className="text-xs font-mono text-[var(--ink-2)] font-normal">Tonnes</span>
                            </div>
                            <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">7d Moving Avg: 4,620 T</div>
                        </div>
                        <div className="font-mono text-xs text-[var(--positive)]">Supply Delta: +4.98%</div>
                    </div>

                    {/* KPI 5: Active Champion Model */}
                    <div className="p-5 border flex flex-col justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Active Model</div>
                        <div className="my-3">
                            <div className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>
                                {config.championModel}
                            </div>
                            <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">MAPE: <span className="text-[var(--brand)] font-bold">{config.mape}%</span> · RMSE: {config.rmse}</div>
                        </div>
                        <div className="font-mono text-[10px] text-[var(--ink-2)]">Retrained: {config.lastRetrained}</div>
                    </div>
                </div>

                {/* Section: Interactive Forecasting & Time-Series Module */}
                {(activeTab === "forecast" || activeTab === "all") && (
                    <section className="p-6 border space-y-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                            <div>
                                <h2 className="font-serif text-2xl font-bold">Interactive Forecasting & Time-Series Engine</h2>
                                <p className="font-mono text-xs text-[var(--ink-2)] mt-1">
                                    Observed historical market prices vs 30-day projected model confidence bands ({config.label} · {region.toUpperCase()})
                                </p>
                            </div>

                            {/* Section: Layer Toggles */}
                            <div className="flex items-center gap-4 flex-wrap font-mono text-xs">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={showConfidence} onChange={(e) => setShowConfidence(e.target.checked)} />
                                    <span>Confidence Bounds</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={showArrivals} onChange={(e) => setShowArrivals(e.target.checked)} />
                                    <span>Arrival Volumes</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} />
                                    <span>Moving Averages</span>
                                </label>
                                <button
                                    onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}
                                    className="px-2 py-1 border uppercase text-[10px]"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    Scale: {scaleType}
                                </button>
                            </div>
                        </div>

                        {/* Custom SVG Interactive Chart Architecture */}
                        <div className="relative w-full h-[420px] select-none font-mono text-[10px]">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 400" preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 100, 200, 300, 400].map((y) => (
                                    <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                                ))}

                                {/* Vertical Chronological Cutoff Line (t=0) at x=500 */}
                                <line x1="500" y1="0" x2="500" y2="400" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="4 4" />
                                <text x="508" y="20" fill="var(--ink-2)" fontWeight="bold">PRESENT (t=0)</text>

                                {/* Shaded Confidence Band Polygon */}
                                {showConfidence && (
                                    <polygon
                                        points={
                                            activeForecast
                                                .map((f, i) => `${500 + i * (500 / activeForecast.length)},${350 - (f.upper - 1800) * 0.3}`)
                                                .join(" ") +
                                            " " +
                                            activeForecast
                                                .slice()
                                                .reverse()
                                                .map((f, i) => `${500 + (activeForecast.length - 1 - i) * (500 / activeForecast.length)},${350 - (f.lower - 1800) * 0.3}`)
                                                .join(" ")
                                        }
                                        fill="var(--gold)"
                                        fillOpacity="0.15"
                                    />
                                )}

                                {/* Market Arrivals Overlay Bars */}
                                {showArrivals &&
                                    seriesData.history.map((h, i) => {
                                        const x = i * (500 / seriesData.history.length);
                                        const hHeight = (h.arrival / 5000) * 100;
                                        return <rect key={i} x={x} y={400 - hHeight} width="8" height={hHeight} fill="var(--sage)" opacity="0.3" />;
                                    })}

                                {/* Historical Observed Price Line */}
                                <path
                                    d={seriesData.history
                                        .map((h, i) => `${i === 0 ? "M" : "L"} ${i * (500 / seriesData.history.length)} ${350 - (h.actual - 1800) * 0.3}`)
                                        .join(" ")}
                                    fill="none"
                                    stroke="var(--ink)"
                                    strokeWidth="2.5"
                                />

                                {/* Forecast Trajectory Dashed Line */}
                                <path
                                    d={
                                        "M 500 " +
                                        (350 - (seriesData.currentObserved - 1800) * 0.3) +
                                        " " +
                                        activeForecast
                                            .map((f, i) => `L ${500 + (i + 1) * (500 / activeForecast.length)} ${350 - (f.predicted - 1800) * 0.3}`)
                                            .join(" ")
                                    }
                                    fill="none"
                                    stroke="var(--gold)"
                                    strokeWidth="2.5"
                                    strokeDasharray="5 5"
                                />

                                {/* Moving Average Line */}
                                {showMA && (
                                    <path
                                        d={seriesData.history
                                            .map((h, i) => `${i === 0 ? "M" : "L"} ${i * (500 / seriesData.history.length)} ${350 - (h.ma7 - 1800) * 0.3}`)
                                            .join(" ")}
                                        fill="none"
                                        stroke="var(--brand)"
                                        strokeWidth="1.2"
                                        opacity="0.8"
                                    />
                                )}
                            </svg>

                            {/* Section 3.3: Interactive Tooltip Hover Overlay */}
                            <div className="absolute top-2 left-2 p-3 border font-mono text-xs space-y-1 shadow-md" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                                <div className="font-bold text-[var(--gold)]">Active Node Inspection</div>
                                <div>Observed: ₹{fmt(seriesData.currentObserved)}</div>
                                <div>Forecast Target: ₹{fmt(targetFc?.predicted)}</div>
                                <div>Lower Bound: ₹{fmt(targetFc?.lower)} | Upper Bound: ₹{fmt(targetFc?.upper)}</div>
                                <div>Daily Arrivals: 4,850 Tonnes</div>
                                <div>Active Model: {config.championModel}</div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 4: Multi-Model Benchmark & Comparison Module */}
                {(activeTab === "benchmark" || activeTab === "all") && (
                    <section className="p-6 border space-y-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div>
                            <h2 className="font-serif text-2xl font-bold">Multi-Model Benchmark Matrix & Comparison</h2>
                            <p className="font-mono text-xs text-[var(--ink-2)] mt-1">
                                Comparative evaluation across all evaluated time-series architectures for active commodity ({config.label})
                            </p>
                        </div>

                        {/* Section 4.1: Performance Matrix Table */}
                        <div className="overflow-x-auto border" style={{ borderColor: "var(--border)" }}>
                            <table className="w-full text-left border-collapse font-mono text-xs">
                                <thead>
                                    <tr className="border-b uppercase text-[var(--ink-2)]" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                                        <th className="p-3">Model Architecture</th>
                                        <th className="p-3">Test MAPE (%)</th>
                                        <th className="p-3">Test RMSE</th>
                                        <th className="p-3">Test MAE</th>
                                        <th className="p-3">R² Score</th>
                                        <th className="p-3">Direction Accuracy (%)</th>
                                        <th className="p-3">Train Duration</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: "XGBoost V3", mape: config.mape, rmse: config.rmse, mae: config.mae, r2: config.r2, dirAcc: config.dirAccuracy, time: config.trainDuration, isChamp: true },
                                        { name: "ARIMA (2,1,2)", mape: 5.8, rmse: 132, mae: 98, r2: 0.932, dirAcc: 89.5, time: "7.4s", isChamp: false },
                                        { name: "GRNN Neural Net", mape: 7.2, rmse: 156, mae: 115, r2: 0.918, dirAcc: 87.2, time: "18.1s", isChamp: false },
                                        { name: "LSTM Recurrent", mape: 6.9, rmse: 148, mae: 110, r2: 0.925, dirAcc: 88.9, time: "45.0s", isChamp: false },
                                    ].map((m, idx) => (
                                        <tr key={idx} className="border-b hover:bg-[var(--bg)] transition-colors" style={{ borderColor: "var(--border)" }}>
                                            <td className="p-3 font-bold flex items-center gap-2">
                                                {m.name}
                                                {m.isChamp && <span className="text-[10px] px-2 py-0.5 border bg-[var(--gold)] text-black font-bold uppercase">Active Champion</span>}
                                            </td>
                                            <td className="p-3 font-bold text-[var(--brand)]">{m.mape}%</td>
                                            <td className="p-3">{m.rmse}</td>
                                            <td className="p-3">{m.mae}</td>
                                            <td className="p-3">{m.r2}</td>
                                            <td className="p-3 text-[var(--positive)] font-semibold">{m.dirAcc}%</td>
                                            <td className="p-3">{m.time}</td>
                                            <td className="p-3 font-mono text-[11px]">{m.isChamp ? "Deployed" : "Candidate"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Section 5: Prediction Evolution & Audit Module */}
                {(activeTab === "evolution" || activeTab === "all") && (
                    <section className="p-6 border space-y-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div>
                            <h2 className="font-serif text-2xl font-bold">Prediction Evolution & Realized Accuracy Audit</h2>
                            <p className="font-mono text-xs text-[var(--ink-2)] mt-1">
                                Empirically auditing model predictions against actual ground-truth market realizations once dates pass
                            </p>
                        </div>

                        {/* Audit Table */}
                        <div className="overflow-x-auto border" style={{ borderColor: "var(--border)" }}>
                            <table className="w-full text-left border-collapse font-mono text-xs">
                                <thead>
                                    <tr className="border-b uppercase text-[var(--ink-2)]" style={{ borderColor: "var(--bg)" }}>
                                        <th className="p-3">Target Date</th>
                                        <th className="p-3">Predicted Price (30d Prior)</th>
                                        <th className="p-3">Actual Realized Price</th>
                                        <th className="p-3">Absolute Error (|Actual - Pred|)</th>
                                        <th className="p-3">Percentage Error (%)</th>
                                        <th className="p-3">Within Confidence Interval</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { date: "2026-08-03", pred: 2310, actual: 2315, err: 5, pct: "0.21%", inside: true },
                                        { date: "2026-08-02", pred: 2280, actual: 2295, err: 15, pct: "0.65%", inside: true },
                                        { date: "2026-08-01", pred: 2275, actual: 2295, err: 20, pct: "0.87%", inside: true },
                                        { date: "2026-07-31", pred: 2300, actual: 2280, err: 20, pct: "0.87%", inside: true },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b" style={{ borderColor: "var(--border)" }}>
                                            <td className="p-3 font-bold">{row.date}</td>
                                            <td className="p-3">₹{fmt(row.pred)}</td>
                                            <td className="p-3 font-bold text-[var(--gold)]">₹{fmt(row.actual)}</td>
                                            <td className="p-3">₹{fmt(row.err)}</td>
                                            <td className="p-3 text-[var(--positive)] font-semibold">{row.pct}</td>
                                            <td className="p-3 font-bold text-[var(--positive)] flex items-center gap-1">
                                                <Check size={14} /> YES
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Mandi-Level Regional Breakdown Module */}
                {(activeTab === "mandis" || activeTab === "all") && (
                    <section className="p-6 border space-y-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                            <div>
                                <h2 className="font-serif text-2xl font-bold">Wholesale Mandi Regional Data Breakdown</h2>
                                <p className="font-mono text-xs text-[var(--ink-2)] mt-1">
                                    Granular Mandi-level price recordings, arrival volumes, and day-over-day trends
                                </p>
                            </div>

                            {/* Section 6.2: Search & Sort Controls */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--ink-2)]" />
                                    <input
                                        type="text"
                                        placeholder="Search Mandi or District..."
                                        value={mandiSearch}
                                        onChange={(e) => setMandiSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 border bg-transparent font-mono text-xs focus:outline-none"
                                        style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6.1: Mandi Data Table */}
                        <div className="overflow-x-auto border" style={{ borderColor: "var(--border)" }}>
                            <table className="w-full text-left border-collapse font-mono text-xs">
                                <thead>
                                    <tr className="border-b uppercase text-[var(--ink-2)]" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                                        <th className="p-3 cursor-pointer" onClick={() => { setSortKey("name"); setSortAsc(!sortAsc); }}>
                                            Mandi Name ↕
                                        </th>
                                        <th className="p-3 cursor-pointer" onClick={() => { setSortKey("district"); setSortAsc(!sortAsc); }}>
                                            District ↕
                                        </th>
                                        <th className="p-3 cursor-pointer" onClick={() => { setSortKey("modal"); setSortAsc(!sortAsc); }}>
                                            Modal Price ↕
                                        </th>
                                        <th className="p-3">Min Price</th>
                                        <th className="p-3">Max Price</th>
                                        <th className="p-3 cursor-pointer" onClick={() => { setSortKey("arrival"); setSortAsc(!sortAsc); }}>
                                            Arrivals (T) ↕
                                        </th>
                                        <th className="p-3 cursor-pointer" onClick={() => { setSortKey("delta"); setSortAsc(!sortAsc); }}>
                                            DoD Δ (%) ↕
                                        </th>
                                        <th className="p-3">7d Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMandis.map((m, idx) => (
                                        <tr key={idx} className="border-b hover:bg-[var(--bg)] transition-colors" style={{ borderColor: "var(--border)" }}>
                                            <td className="p-3 font-bold">{m.name}</td>
                                            <td className="p-3 text-[var(--ink-2)]">{m.district}</td>
                                            <td className="p-3 font-bold text-[var(--gold)]">₹{fmt(m.modal)}</td>
                                            <td className="p-3">₹{fmt(m.min)}</td>
                                            <td className="p-3">₹{fmt(m.max)}</td>
                                            <td className="p-3">{m.arrival.toLocaleString()} T</td>
                                            <td className={`p-3 font-bold ${m.delta >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                                                {m.delta >= 0 ? "+" : ""}{m.delta}%
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 border text-[10px] uppercase font-bold" style={{ borderColor: "var(--border)" }}>
                                                    {m.trend}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Section 7 & 8: Risk Indicators & Automated Alert Configurator */}
                {(activeTab === "alerts" || activeTab === "all") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Indicators */}
                        <section className="p-6 border space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                            <h2 className="font-serif text-2xl font-bold">Market Signals & Risk Indicators</h2>
                            <div className="space-y-3 font-mono text-xs">
                                <div className="p-3 border flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                                    <div>
                                        <div className="text-[var(--ink-2)]">Harvest Window Status</div>
                                        <div className="font-bold text-sm text-[var(--brand)]">{config.seasonStatus}</div>
                                    </div>
                                    <div className="font-bold text-lg">{config.seasonIndex}</div>
                                </div>
                                <div className="p-3 border flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                                    <div>
                                        <div className="text-[var(--ink-2)]">Price Volatility Risk</div>
                                        <div className="font-bold text-sm">{config.volatilityLevel}</div>
                                    </div>
                                    <AlertTriangle className="text-[var(--gold)]" />
                                </div>
                                <div className="p-3 border flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                                    <div>
                                        <div className="text-[var(--ink-2)]">Regional Supply Surplus/Deficit</div>
                                        <div className="font-bold text-sm text-[var(--negative)]">{config.surplusIndex} Deficit Index</div>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-[var(--negative)]">Deficit Warning</div>
                                </div>
                            </div>
                        </section>

                        {/* Alert Configurator */}
                        <section className="p-6 border space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                            <h2 className="font-serif text-2xl font-bold">Automated Price Alert Configurator</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setAlertSaved(true);
                                    triggerToast("Price Volatility Alert Rules Saved Successfully!");
                                    setTimeout(() => setAlertSaved(false), 3000);
                                }}
                                className="space-y-3 font-mono text-xs"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[var(--ink-2)] block mb-1">Upper Trigger (₹/Qtl):</label>
                                        <input
                                            type="number"
                                            value={alertUpper}
                                            onChange={(e) => setAlertUpper(e.target.value)}
                                            className="w-full p-2 border bg-transparent"
                                            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[var(--ink-2)] block mb-1">Lower Trigger (₹/Qtl):</label>
                                        <input
                                            type="number"
                                            value={alertLower}
                                            onChange={(e) => setAlertLower(e.target.value)}
                                            className="w-full p-2 border bg-transparent"
                                            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 border font-bold uppercase tracking-wider transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                                    style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
                                >
                                    {alertSaved ? "Rule Configured & Saved ✓" : "Save Price Alert Rules"}
                                </button>
                            </form>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
