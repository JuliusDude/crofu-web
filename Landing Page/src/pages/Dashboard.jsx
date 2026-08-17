import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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
import { useLenis, useTheme, toggleTheme } from "@/lib/crofuHooks";

/* ---------- Reveal wrapper for Framer Motion scroll animations ---------- */
function Reveal({ children, delay = 0, y = 20, className = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.15, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ---------- Mock Master Dataset for Dashboard Analytics ---------- */
const COMMODITY_CONFIG = {
    tomato: {
        label: "Tomato",
        img: "/tomatoes.jpg",
        icon: "🍅",
        unitQuintal: 2320,
        championModel: "XGBoost",
        version: "v26.8.2",
        mape: 3.72,
        rmse: 74.55,
        mse: 5558.05,
        mae: 52.3,
        r2: 0.968,
        dirAccuracy: 94.2,
        trainDuration: "14.2s",
        lastRetrained: "2026-08-14",
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
        championModel: "ARIMA (5,1,0)",
        version: "v26.8.2",
        mape: 3.51,
        rmse: 89.75,
        mse: 8055.89,
        mae: 61.8,
        r2: 0.972,
        dirAccuracy: 95.5,
        trainDuration: "8.6s",
        lastRetrained: "2026-08-14",
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
        championModel: "ARIMA (5,1,0)",
        version: "v26.8.2",
        mape: 9.21,
        rmse: 103.74,
        mse: 10762.64,
        mae: 78.4,
        r2: 0.945,
        dirAccuracy: 92.8,
        trainDuration: "6.1s",
        lastRetrained: "2026-08-14",
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
        championModel: "XGBoost",
        version: "v26.8.2",
        mape: 3.64,
        rmse: 160.46,
        mse: 25747.72,
        mae: 112.5,
        r2: 0.938,
        dirAccuracy: 91.4,
        trainDuration: "12.9s",
        lastRetrained: "2026-08-14",
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
    const now = new Date();

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
    useLenis();

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

    // Interactive Hover Tooltip for Main Chart
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Active View Tab
    const [activeTab, setActiveTab] = useState("forecast"); // forecast | benchmark | evolution | mandis | alerts

    // Mandi Table Filter & Search
    const [mandiSearch, setMandiSearch] = useState("");
    const [sortKey, setSortKey] = useState("modal");
    const [sortAsc, setSortAsc] = useState(false);

    // Main Chart Table State & Filter
    const [chartTableSearch, setChartTableSearch] = useState("");
    const [chartTableSort, setChartTableSort] = useState("date");
    const [chartTableSortAsc, setChartTableSortAsc] = useState(false);
    const [chartTableFilter, setChartTableFilter] = useState("all"); // all | observed | forecast

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

    // Dynamic Chart Scaling & Math Computation
    const chartMath = useMemo(() => {
        const histActuals = seriesData.history.map((h) => h.actual);
        const fcLowers = activeForecast.map((f) => f.lower);
        const fcUppers = activeForecast.map((f) => f.upper);
        const allVals = [...histActuals, ...fcLowers, ...fcUppers];

        const minVal = Math.min(...allVals) * 0.94;
        const maxVal = Math.max(...allVals) * 1.06;

        const getY = (val) => {
            return 350 - ((val - minVal) / (maxVal - minVal)) * 310;
        };

        const historyPoints = seriesData.history.map((h, i) => {
            const x = 50 + i * (440 / Math.max(1, seriesData.history.length - 1));
            const y = getY(h.actual);
            const yMa = getY(h.ma7);
            return { ...h, x, y, yMa, type: "history" };
        });

        const todayStr = new Date().toISOString().split("T")[0];

        // Exact t=0 Present Cutoff Point at x=500
        const t0Point = {
            date: todayStr,
            actual: seriesData.currentObserved,
            predicted: seriesData.currentObserved,
            arrival: 4850,
            x: 500,
            y: getY(seriesData.currentObserved),
            type: "present",
            isT0: true,
        };

        const forecastPoints = activeForecast.map((f, i) => {
            const x = 510 + i * (440 / Math.max(1, activeForecast.length - 1));
            const y = getY(f.predicted);
            const yLower = getY(f.lower);
            const yUpper = getY(f.upper);
            return { ...f, x, y, yLower, yUpper, type: "forecast" };
        });

        return { minVal, maxVal, getY, historyPoints, t0Point, forecastPoints };
    }, [seriesData, activeForecast]);

    // Dynamic Chart Data Table Computation (Dates, Price, Change)
    const chartTableData = useMemo(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        const hist = seriesData.history.map((h) => ({
            date: h.date,
            price: h.actual,
            type: "Observed",
        }));

        const present = {
            date: todayStr,
            price: seriesData.currentObserved,
            type: "Observed",
            isT0: true,
        };

        const fc = activeForecast.map((f) => ({
            date: f.date,
            price: f.predicted,
            type: "Forecast",
        }));

        const combined = [...hist, present, ...fc];

        const processed = combined.map((item, idx) => {
            if (idx === 0) {
                return {
                    ...item,
                    changeVal: 0,
                    changePct: 0,
                    isPositive: true,
                    isZero: true,
                };
            }
            const prevPrice = combined[idx - 1].price;
            const diff = item.price - prevPrice;
            const pct = prevPrice !== 0 ? (diff / prevPrice) * 100 : 0;
            return {
                ...item,
                changeVal: diff,
                changePct: pct,
                isPositive: diff >= 0,
                isZero: diff === 0,
            };
        });

        let filtered = processed.filter((item) => {
            if (chartTableFilter === "observed") return item.type === "Observed";
            if (chartTableFilter === "forecast") return item.type === "Forecast";
            return true;
        });

        if (chartTableSearch.trim()) {
            const query = chartTableSearch.toLowerCase().trim();
            filtered = filtered.filter((item) => item.date.toLowerCase().includes(query));
        }

        filtered.sort((a, b) => {
            let valA, valB;
            if (chartTableSort === "date") {
                valA = a.date;
                valB = b.date;
                return chartTableSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else if (chartTableSort === "price") {
                valA = a.price;
                valB = b.price;
            } else if (chartTableSort === "change") {
                valA = a.changeVal;
                valB = b.changeVal;
            }
            return chartTableSortAsc ? valA - valB : valB - valA;
        });

        return filtered;
    }, [seriesData, activeForecast, chartTableFilter, chartTableSearch, chartTableSort, chartTableSortAsc]);

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

    // Helper: Export CSV Dataset
    const handleExportCSV = () => {
        try {
            const headers = ["Date", "Type", "Commodity", "Region", "Price_INR", "Lower_Bound", "Upper_Bound", "Arrival_Tonnes"];
            const rows = [];

            seriesData.history.forEach((h) => {
                rows.push([h.date, "Observed", commodity, region, Math.round(h.actual * unitMultiplier), "", "", h.arrival]);
            });

            activeForecast.forEach((f) => {
                rows.push([f.date, "Forecast", commodity, region, Math.round(f.predicted * unitMultiplier), Math.round(f.lower * unitMultiplier), Math.round(f.upper * unitMultiplier), f.arrival]);
            });

            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `crofu_${commodity}_${region}_forecast_data.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            triggerToast(`Exported crofu_${commodity}_${region}_forecast_data.csv successfully!`);
        } catch (err) {
            triggerToast("Failed to generate CSV export.");
        }
    };

    // Helper: Printable PDF Analytics Report
    const handleGeneratePDF = () => {
        triggerToast("Generating Printable PDF Analytics Report...");
        setTimeout(() => {
            window.print();
        }, 400);
    };

    // Helper: Export JSON API Payload
    const handleExportJSON = () => {
        try {
            const payload = {
                region,
                commodity,
                model: config.championModel,
                unit: priceUnit === "kg" ? "INR/kg" : "INR/quintal",
                timestamp: new Date().toISOString(),
                current_observed_price: Math.round(seriesData.currentObserved * unitMultiplier),
                forecast: activeForecast.map((f) => ({
                    day: f.day,
                    date: f.date,
                    point: Math.round(f.predicted * unitMultiplier),
                    lower_bound: Math.round(f.lower * unitMultiplier),
                    upper_bound: Math.round(f.upper * unitMultiplier),
                    arrival_tonnes: f.arrival,
                })),
                metrics: {
                    mape: config.mape,
                    rmse: config.rmse,
                },
            };

            const jsonString = JSON.stringify(payload, null, 2);

            if (navigator.clipboard) {
                navigator.clipboard.writeText(jsonString);
            }

            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `crofu_${commodity}_${region}_api_payload.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            triggerToast(`Copied JSON API Payload & downloaded crofu_${commodity}_${region}_api_payload.json!`);
        } catch (err) {
            triggerToast("Exported JSON API Payload!");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
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
                            className="font-serif text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity" 
                            style={{ color: "var(--ink)" }}
                        >
                            CroFu<span style={{ color: "var(--gold)" }}>.</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="hidden lg:flex items-center gap-2 text-[var(--ink-2)] border px-3 py-1.5" style={{ borderColor: "var(--border)" }}>
                            <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" />
                            <span>Agmarknet Sync: {new Date().toISOString().split("T")[0]} 08:00 IST</span>
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
                                    <motion.button
                                        key={key}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setCommodity(key)}
                                        className={`px-4 py-2 border transition-all flex items-center justify-center ${
                                            active ? "shadow-md scale-105 border-2" : "opacity-85 hover:opacity-100"
                                        }`}
                                        style={{
                                            borderColor: active ? "var(--ink)" : "var(--border)",
                                            background: active ? "var(--surface)" : "var(--bg)",
                                        }}
                                    >
                                        <span
                                            className="uppercase tracking-widest transition-all"
                                            style={{
                                                fontWeight: 900,
                                                fontSize: "15px",
                                                backgroundImage: `url(${c.img})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                color: "transparent",
                                                display: "inline-block",
                                                WebkitTextStroke: isDark
                                                    ? (active ? "0.6px rgba(255, 255, 255, 0.8)" : "0.4px rgba(255, 255, 255, 0.4)")
                                                    : (active ? "0.6px rgba(0, 0, 0, 0.85)" : "0.4px rgba(0, 0, 0, 0.5)"),
                                                textShadow: isDark
                                                    ? "0 1px 3px rgba(0,0,0,0.9)"
                                                    : "0 1px 2px rgba(255,255,255,0.8), 0 0 1px rgba(0,0,0,0.5)",
                                                filter: isDark
                                                    ? (active ? "brightness(1.45) contrast(1.5) saturate(1.2)" : "brightness(1.15) contrast(1.3)")
                                                    : (active ? "brightness(0.9) contrast(1.45) saturate(1.2)" : "brightness(0.85) contrast(1.3)"),
                                            }}
                                        >
                                            {c.label}
                                        </span>
                                    </motion.button>
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
                                    onClick={handleExportCSV}
                                    className="p-1.5 border hover:border-[var(--ink)]"
                                    style={{ borderColor: "var(--border)" }}
                                    title="Export CSV"
                                >
                                    <FileSpreadsheet size={15} />
                                </button>
                                <button
                                    onClick={handleGeneratePDF}
                                    className="p-1.5 border hover:border-[var(--ink)]"
                                    style={{ borderColor: "var(--border)" }}
                                    title="Export PDF Report"
                                >
                                    <FileText size={15} />
                                </button>
                                <button
                                    onClick={handleExportJSON}
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
                <Reveal delay={0.05}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* KPI 1: Current Observed Price */}
                        <motion.div
                            key={`kpi1-${commodity}-${priceUnit}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="p-5 border flex flex-col justify-between"
                            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Observed Price</div>
                            <div className="my-3">
                                <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>
                                    ₹{fmt(seriesData.currentObserved)}
                                </div>
                                <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">{unitLabel} · {new Date().toISOString().split("T")[0]}</div>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--positive)] font-semibold">
                                <TrendingUp size={14} />
                                <span>+₹{fmt(45)} (+1.98%) 24h</span>
                            </div>
                        </motion.div>

                        {/* KPI 2: Projected Target Price */}
                        <motion.div
                            key={`kpi2-${commodity}-${priceUnit}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                            className="p-5 border flex flex-col justify-between"
                            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
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
                        </motion.div>

                        {/* KPI 3: Expected Range & Volatility */}
                        <motion.div
                            key={`kpi3-${commodity}-${priceUnit}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="p-5 border flex flex-col justify-between"
                            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
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
                        </motion.div>

                        {/* KPI 4: Market Supply & Arrivals */}
                        <motion.div
                            key={`kpi4-${commodity}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="p-5 border flex flex-col justify-between"
                            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Market Arrivals</div>
                            <div className="my-3">
                                <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--brand)" }}>
                                    4,850 <span className="text-xs font-mono text-[var(--ink-2)] font-normal">Tonnes</span>
                                </div>
                                <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1">7d Moving Avg: 4,620 T</div>
                            </div>
                            <div className="font-mono text-xs text-[var(--positive)]">Supply Delta: +4.98%</div>
                        </motion.div>

                        {/* KPI 5: Active Champion Model */}
                        <motion.div
                            key={`kpi5-${commodity}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="p-5 border flex flex-col justify-between"
                            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-2)]">Active Model</div>
                            <div className="my-3">
                                <div className="font-serif text-xl font-bold flex items-baseline gap-2" style={{ color: "var(--ink)" }}>
                                    <span>{config.championModel}</span>
                                    <span className="font-mono text-xs font-semibold text-[var(--brand)] px-2 py-0.5 border" style={{ borderColor: "var(--border)" }}>
                                        {config.version || "v26.8.2"}
                                    </span>
                                </div>
                                <div className="font-mono text-[11px] text-[var(--ink-2)] mt-1.5 leading-relaxed">
                                    MAPE: <span className="text-[var(--brand)] font-bold">{config.mape}%</span> · RMSE: <span className="font-semibold">{config.rmse}</span> · MSE: <span className="font-semibold">{config.mse}</span>
                                </div>
                            </div>
                            <div className="font-mono text-[10px] text-[var(--ink-2)]">Retrained: {config.lastRetrained}</div>
                        </motion.div>
                    </div>
                </Reveal>

                {/* Section: Interactive Forecasting & Time-Series Module */}
                {(activeTab === "forecast" || activeTab === "all") && (
                    <Reveal delay={0.1}>
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
                            </div>
                        </div>

                        <div
                            className="relative w-full h-[440px] select-none font-mono text-[10px]"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clientX = e.clientX - rect.left;
                                const svgX = (clientX / rect.width) * 1000;
                                const allPts = [
                                    ...chartMath.historyPoints,
                                    chartMath.t0Point,
                                    ...chartMath.forecastPoints,
                                ];
                                let closest = allPts[0];
                                let minDist = Math.abs(svgX - closest.x);
                                for (let p of allPts) {
                                    const dist = Math.abs(svgX - p.x);
                                    if (dist < minDist) {
                                        minDist = dist;
                                        closest = p;
                                    }
                                }
                                setHoveredPoint(closest);
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                        >
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 400" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="confidenceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.05" />
                                    </linearGradient>
                                    <linearGradient id="historyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--positive)" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="var(--positive)" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Y-Axis Horizontal Grid Lines & Dynamic Price Labels */}
                                {[0, 1, 2, 3, 4].map((step) => {
                                    const yPos = 350 - step * (310 / 4);
                                    const priceStep = chartMath.minVal + step * ((chartMath.maxVal - chartMath.minVal) / 4);
                                    return (
                                        <g key={step}>
                                            <line x1="50" y1={yPos} x2="960" y2={yPos} stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
                                            <text x="5" y={yPos + 4} fill="var(--ink-2)" fontSize="10">
                                                ₹{fmt(priceStep)}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Chronological Present Cutoff Line (t=0) */}
                                <line x1="500" y1="20" x2="500" y2="360" stroke="var(--gold)" strokeWidth="2" strokeDasharray="4 4" />
                                <text x="506" y="32" fill="var(--gold)" fontWeight="bold" fontSize="10">
                                    PRESENT (t=0)
                                </text>

                                {/* Shaded Confidence Band Polygon */}
                                {showConfidence && chartMath.forecastPoints.length > 0 && (
                                    <polygon
                                        points={
                                            chartMath.forecastPoints
                                                .map((f) => `${f.x},${f.yUpper}`)
                                                .join(" ") +
                                            " " +
                                            chartMath.forecastPoints
                                                .slice()
                                                .reverse()
                                                .map((f) => `${f.x},${f.yLower}`)
                                                .join(" ")
                                        }
                                        fill="url(#confidenceGrad)"
                                    />
                                )}

                                {/* Market Arrivals Overlay Bars */}
                                {showArrivals &&
                                    chartMath.historyPoints.map((h, i) => {
                                        const barH = (h.arrival / 6000) * 80;
                                        return (
                                            <rect
                                                key={i}
                                                x={h.x - 3}
                                                y={350 - barH}
                                                width="6"
                                                height={barH}
                                                fill="var(--sage)"
                                                opacity="0.35"
                                                rx="1"
                                            />
                                        );
                                    })}

                                {/* Historical Area Gradient Fill */}
                                <polygon
                                    points={
                                        `50,350 ` +
                                        chartMath.historyPoints.map((h) => `${h.x},${h.y}`).join(" ") +
                                        ` 500,${chartMath.t0Point.y} 500,350`
                                    }
                                    fill="url(#historyGrad)"
                                />

                                {/* Historical Observed Price Line (Green / Brand) */}
                                <path
                                    d={
                                        chartMath.historyPoints.map((h, i) => `${i === 0 ? "M" : "L"} ${h.x} ${h.y}`).join(" ") +
                                        ` L 500 ${chartMath.t0Point.y}`
                                    }
                                    fill="none"
                                    stroke="var(--positive)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />

                                {/* 7-Day Moving Average Line */}
                                {showMA && (
                                    <path
                                        d={chartMath.historyPoints.map((h, i) => `${i === 0 ? "M" : "L"} ${h.x} ${h.yMa}`).join(" ")}
                                        fill="none"
                                        stroke="var(--brand)"
                                        strokeWidth="1.5"
                                        strokeDasharray="2 2"
                                        opacity="0.85"
                                    />
                                )}

                                {/* Forecast Trajectory Dashed Line (Gold) */}
                                <path
                                    d={
                                        `M 500 ${chartMath.t0Point.y} ` +
                                        chartMath.forecastPoints.map((f) => `L ${f.x} ${f.y}`).join(" ")
                                    }
                                    fill="none"
                                    stroke="var(--gold)"
                                    strokeWidth="2.5"
                                    strokeDasharray="6 4"
                                />

                                {/* Forecast Upper & Lower Bound Boundary Lines */}
                                {showConfidence && (
                                    <>
                                        <path
                                            d={chartMath.forecastPoints.map((f, i) => `${i === 0 ? "M" : "L"} ${f.x} ${f.yUpper}`).join(" ")}
                                            fill="none"
                                            stroke="var(--gold)"
                                            strokeWidth="1"
                                            opacity="0.5"
                                        />
                                        <path
                                            d={chartMath.forecastPoints.map((f, i) => `${i === 0 ? "M" : "L"} ${f.x} ${f.yLower}`).join(" ")}
                                            fill="none"
                                            stroke="var(--gold)"
                                            strokeWidth="1"
                                            opacity="0.5"
                                        />
                                    </>
                                )}

                                {/* Interactive Hover Crosshair & Node Highlight */}
                                {hoveredPoint && (
                                    <g>
                                        <line x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="360" stroke={hoveredPoint.type === "forecast" ? "var(--gold)" : "var(--positive)"} strokeWidth="1" strokeDasharray="2 2" />
                                        <line x1="40" y1={hoveredPoint.y} x2="960" y2={hoveredPoint.y} stroke="var(--ink-2)" strokeWidth="0.5" strokeDasharray="2 2" />
                                        <circle
                                            cx={hoveredPoint.x}
                                            cy={hoveredPoint.y}
                                            r="6"
                                            fill={hoveredPoint.type === "forecast" ? "var(--gold)" : "var(--positive)"}
                                            stroke="var(--bg)"
                                            strokeWidth="2"
                                            className="animate-pulse"
                                        />
                                    </g>
                                )}

                                {/* X-Axis Date Labels */}
                                <text x="50" y="380" fill="var(--ink-2)" fontSize="10">
                                    {chartMath.historyPoints[0]?.date}
                                </text>
                                <text x="470" y="380" fill="var(--gold)" fontWeight="bold" fontSize="10">
                                    {new Date().toISOString().split("T")[0]} (t=0)
                                </text>
                                <text x="900" y="380" fill="var(--ink-2)" fontSize="10">
                                    {chartMath.forecastPoints[chartMath.forecastPoints.length - 1]?.date}
                                </text>
                            </svg>

                            {/* Section 3.3: Dynamic Interactive Inspection Card Tooltip (Positioned safely away from Y-axis) */}
                            <div
                                className="absolute p-3 border font-mono text-xs space-y-1.5 shadow-xl transition-all pointer-events-none rounded"
                                style={{
                                    top: "16px",
                                    left: hoveredPoint && hoveredPoint.x > 500 ? "130px" : "auto",
                                    right: hoveredPoint && hoveredPoint.x <= 500 ? "20px" : "auto",
                                    background: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--ink)",
                                    minWidth: "250px",
                                    zIndex: 30,
                                }}
                            >
                                <div className="flex items-center justify-between border-b pb-1 font-bold" style={{ borderColor: "var(--border)" }}>
                                    <span style={{ color: hoveredPoint?.type === "forecast" ? "var(--gold)" : "var(--positive)" }}>
                                        {hoveredPoint ? hoveredPoint.date : `${new Date().toISOString().split("T")[0]} (t=0)`}
                                    </span>
                                    <span
                                        className="text-[10px] uppercase px-1.5 py-0.5 border font-bold"
                                        style={{
                                            borderColor: hoveredPoint?.type === "forecast" ? "var(--gold)" : "var(--positive)",
                                            color: hoveredPoint?.type === "forecast" ? "var(--gold)" : "var(--positive)",
                                        }}
                                    >
                                        {hoveredPoint?.isT0
                                            ? "PRESENT (t=0)"
                                            : hoveredPoint?.type === "forecast"
                                            ? "AI FORECAST"
                                            : "OBSERVED"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--ink-2)]">
                                        {hoveredPoint?.type === "forecast" ? "Forecast Target Price:" : "Observed Market Price:"}
                                    </span>
                                    <span
                                        className="font-bold"
                                        style={{ color: hoveredPoint?.type === "forecast" ? "var(--gold)" : "var(--positive)" }}
                                    >
                                        ₹{fmt(hoveredPoint ? (hoveredPoint.actual || hoveredPoint.predicted) : seriesData.currentObserved)} {unitLabel}
                                    </span>
                                </div>
                                {hoveredPoint?.type === "forecast" && (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-[var(--ink-2)]">Confidence Range:</span>
                                        <span className="text-[var(--gold)] font-semibold">₹{fmt(hoveredPoint.lower)} – ₹{fmt(hoveredPoint.upper)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-[var(--ink-2)]">Daily Arrivals:</span>
                                    <span>{(hoveredPoint ? hoveredPoint.arrival : 4850).toLocaleString()} Tonnes</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-[var(--ink-2)]">Active Champion Model:</span>
                                    <span className="font-bold text-[var(--brand)]">{config.championModel} {config.version || "v26.8.2"} (MAPE {config.mape}%, RMSE {config.rmse})</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Under Chart: Dates, Price, Change */}
                        <div className="pt-6 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                        <span>Time-Series Data Breakdown</span>
                                        <span className="font-mono text-xs font-normal text-[var(--ink-2)] px-2 py-0.5 border" style={{ borderColor: "var(--border)" }}>
                                            {chartTableData.length} Entries
                                        </span>
                                    </h3>
                                    <p className="font-mono text-xs text-[var(--ink-2)] mt-0.5">
                                        Historical observed market prices and future projected targets for {config.label}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
                                    {/* Type Filter */}
                                    <div className="flex border" style={{ borderColor: "var(--border)" }}>
                                        {[
                                            { id: "all", label: "All Data" },
                                            { id: "observed", label: "Observed" },
                                            { id: "forecast", label: "Forecast" },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setChartTableFilter(tab.id)}
                                                className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                                                    chartTableFilter === tab.id
                                                        ? "bg-[var(--ink)] text-[var(--bg)] font-bold"
                                                        : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search by date */}
                                    <div className="relative">
                                        <Search size={13} className="absolute left-2.5 top-2 text-[var(--ink-2)]" />
                                        <input
                                            type="text"
                                            placeholder="Search Date (YYYY-MM)..."
                                            value={chartTableSearch}
                                            onChange={(e) => setChartTableSearch(e.target.value)}
                                            className="pl-8 pr-3 py-1 border bg-transparent font-mono text-xs focus:outline-none"
                                            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table Element */}
                            <div className="overflow-x-auto border max-h-[380px] overflow-y-auto [scrollbar-gutter:stable]" style={{ borderColor: "var(--border)" }}>
                                <table className="w-full text-left border-collapse font-mono text-xs table-fixed">
                                    <colgroup>
                                        <col className="w-[30%]" />
                                        <col className="w-[24%]" />
                                        <col className="w-[31%]" />
                                        <col className="w-[15%]" />
                                    </colgroup>
                                    <thead className="sticky top-0 z-10" style={{ background: "var(--surface)" }}>
                                        <tr className="border-b uppercase text-[var(--ink-2)] h-10" style={{ borderColor: "var(--border)" }}>
                                            <th
                                                className="p-3 cursor-pointer select-none hover:text-[var(--ink)] align-middle"
                                                onClick={() => {
                                                    if (chartTableSort === "date") setChartTableSortAsc(!chartTableSortAsc);
                                                    else { setChartTableSort("date"); setChartTableSortAsc(false); }
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>Dates</span>
                                                    <span className="text-[10px]">{chartTableSort === "date" ? (chartTableSortAsc ? "↑" : "↓") : "↕"}</span>
                                                </div>
                                            </th>
                                            <th
                                                className="p-3 cursor-pointer select-none hover:text-[var(--ink)] align-middle"
                                                onClick={() => {
                                                    if (chartTableSort === "price") setChartTableSortAsc(!chartTableSortAsc);
                                                    else { setChartTableSort("price"); setChartTableSortAsc(false); }
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>Price ({unitLabel})</span>
                                                    <span className="text-[10px]">{chartTableSort === "price" ? (chartTableSortAsc ? "↑" : "↓") : "↕"}</span>
                                                </div>
                                            </th>
                                            <th
                                                className="p-3 cursor-pointer select-none hover:text-[var(--ink)] align-middle"
                                                onClick={() => {
                                                    if (chartTableSort === "change") setChartTableSortAsc(!chartTableSortAsc);
                                                    else { setChartTableSort("change"); setChartTableSortAsc(false); }
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>Change (DoD Δ)</span>
                                                    <span className="text-[10px]">{chartTableSort === "change" ? (chartTableSortAsc ? "↑" : "↓") : "↕"}</span>
                                                </div>
                                            </th>
                                            <th className="p-3 align-middle">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartTableData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-[var(--ink-2)]">
                                                    No matching time-series records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            chartTableData.map((row, idx) => {
                                                const isFc = row.type === "Forecast";
                                                return (
                                                    <tr
                                                        key={row.date + idx}
                                                        className={`border-b hover:bg-[var(--bg)] transition-colors h-11 ${
                                                            row.isT0 ? "bg-[var(--gold)]/10 font-semibold" : ""
                                                        }`}
                                                        style={{ borderColor: "var(--border)" }}
                                                    >
                                                        {/* Dates */}
                                                        <td className="p-3 font-bold align-middle">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={13} className="text-[var(--ink-2)] shrink-0" />
                                                                <span className="truncate">{row.date}</span>
                                                                {row.isT0 && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 border border-[var(--gold)] text-[var(--gold)] font-bold uppercase shrink-0">
                                                                        Present
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Price */}
                                                        <td className="p-3 font-bold align-middle" style={{ color: isFc ? "var(--gold)" : "var(--ink)" }}>
                                                            <div className="truncate">
                                                                ₹{fmt(row.price)} {unitLabel}
                                                            </div>
                                                        </td>

                                                        {/* Change */}
                                                        <td className="p-3 align-middle">
                                                            {row.isZero ? (
                                                                <span className="text-[var(--ink-2)]">-</span>
                                                            ) : row.isPositive ? (
                                                                <div className="text-[var(--positive)] font-semibold flex items-center gap-1 truncate">
                                                                    <TrendingUp size={13} className="shrink-0" />
                                                                    <span className="truncate">+₹{fmt(row.changeVal)} (+{row.changePct.toFixed(2)}%)</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-[var(--negative)] font-semibold flex items-center gap-1 truncate">
                                                                    <TrendingDown size={13} className="shrink-0" />
                                                                    <span className="truncate">-₹{fmt(Math.abs(row.changeVal))} ({row.changePct.toFixed(2)}%)</span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Type Badge */}
                                                        <td className="p-3 align-middle">
                                                            <span
                                                                className={`inline-block px-2 py-0.5 border text-[10px] uppercase font-bold shrink-0 ${
                                                                    isFc
                                                                        ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/5"
                                                                        : "border-[var(--positive)] text-[var(--positive)] bg-[var(--positive)]/5"
                                                                }`}
                                                            >
                                                                {row.type}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </Reveal>
                )}

                {/* Section 4: Multi-Model Benchmark & Comparison Module */}
                {(activeTab === "benchmark" || activeTab === "all") && (
                    <Reveal delay={0.1}>
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
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.35, delay: idx * 0.08 }}
                                                className="border-b hover:bg-[var(--bg)] transition-colors"
                                                style={{ borderColor: "var(--border)" }}
                                            >
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
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </Reveal>
                )}

                {/* Section 5: Prediction Evolution & Audit Module */}
                {(activeTab === "evolution" || activeTab === "all") && (
                    <Reveal delay={0.1}>
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
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.35, delay: idx * 0.08 }}
                                                className="border-b"
                                                style={{ borderColor: "var(--border)" }}
                                            >
                                                <td className="p-3 font-bold">{row.date}</td>
                                                <td className="p-3">₹{fmt(row.pred)}</td>
                                                <td className="p-3 font-bold text-[var(--gold)]">₹{fmt(row.actual)}</td>
                                                <td className="p-3">₹{fmt(row.err)}</td>
                                                <td className="p-3 text-[var(--positive)] font-semibold">{row.pct}</td>
                                                <td className="p-3 font-bold text-[var(--positive)] flex items-center gap-1">
                                                    <Check size={14} /> YES
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </Reveal>
                )}

                {/* Mandi-Level Regional Breakdown Module */}
                {(activeTab === "mandis" || activeTab === "all") && (
                    <Reveal delay={0.1}>
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
                                            <motion.tr
                                                key={m.name || idx}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: idx * 0.04 }}
                                                className="border-b hover:bg-[var(--bg)] transition-colors"
                                                style={{ borderColor: "var(--border)" }}
                                            >
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
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </Reveal>
                )}

                {/* Section 7 & 8: Risk Indicators & Automated Alert Configurator */}
                {(activeTab === "alerts" || activeTab === "all") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Indicators */}
                        <Reveal delay={0.1}>
                            <section className="p-6 border space-y-4 h-full" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                                <h2 className="font-serif text-2xl font-bold">Market Signals & Risk Indicators</h2>
                                <div className="space-y-3 font-mono text-xs">
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="p-3 border flex justify-between items-center transition-all"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <div>
                                            <div className="text-[var(--ink-2)]">Harvest Window Status</div>
                                            <div className="font-bold text-sm text-[var(--brand)]">{config.seasonStatus}</div>
                                        </div>
                                        <div className="font-bold text-lg">{config.seasonIndex}</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="p-3 border flex justify-between items-center transition-all"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <div>
                                            <div className="text-[var(--ink-2)]">Price Volatility Risk</div>
                                            <div className="font-bold text-sm">{config.volatilityLevel}</div>
                                        </div>
                                        <AlertTriangle className="text-[var(--gold)]" />
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="p-3 border flex justify-between items-center transition-all"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <div>
                                            <div className="text-[var(--ink-2)]">Regional Supply Surplus/Deficit</div>
                                            <div className="font-bold text-sm text-[var(--negative)]">{config.surplusIndex} Deficit Index</div>
                                        </div>
                                        <div className="font-mono text-xs font-bold text-[var(--negative)]">Deficit Warning</div>
                                    </motion.div>
                                </div>
                            </section>
                        </Reveal>

                        {/* Alert Configurator */}
                        <Reveal delay={0.15}>
                            <section className="p-6 border space-y-4 h-full" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
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

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-2.5 border font-bold uppercase tracking-wider transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                                        style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
                                    >
                                        {alertSaved ? "Rule Configured & Saved ✓" : "Save Price Alert Rules"}
                                    </motion.button>
                                </form>
                            </section>
                        </Reveal>
                    </div>
                )}
            </main>
        </motion.div>
    );
}
