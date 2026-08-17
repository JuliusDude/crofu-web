import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import ForecastChart from "@/components/crofu/ForecastChart";
import { COMMODITIES, REGIONS } from "@/lib/forecastData";
import { useLenis, useTheme, toggleTheme, scrollToSection } from "@/lib/crofuHooks";

/* ---------- Reveal wrapper ---------- */
function Reveal({ children, delay = 0, y = 24, className = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.15, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ---------- Masked line reveal for hero headline ---------- */
function LineMask({ children, delay = 0 }) {
    return (
        <span className="line-mask">
            <motion.span
                className="line-inner"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                    duration: 1.1,
                    ease: [0.7, 0, 0.15, 1],
                    delay,
                }}
            >
                {children}
            </motion.span>
        </span>
    );
}

/* ---------- Nav ---------- */
function Nav({ onToggle, isDark, onNavigate }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileNavClick = (sectionHash) => {
        setMobileMenuOpen(false);
        if (sectionHash) {
            setTimeout(() => {
                const elem = document.querySelector(sectionHash);
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    return (
        <header
            className="fixed top-0 inset-x-0 z-40"
            style={{
                background:
                    "linear-gradient(to bottom, var(--bg) 60%, transparent)",
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
                <a
                    href="#top"
                    onClick={(e) => {
                        scrollToSection(e, "#top");
                        setMobileMenuOpen(false);
                    }}
                    className="font-serif text-[22px] tracking-tight"
                    style={{ color: "var(--ink)", fontWeight: 600 }}
                    data-testid="brand-logo"
                >
                    CroFu<span style={{ color: "var(--gold)" }}>.</span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <a
                        href="#coverage"
                        onClick={(e) => scrollToSection(e, "#coverage")}
                        className="linky"
                        data-testid="nav-coverage"
                    >
                        Coverage
                    </a>
                    <button
                        onClick={() => onNavigate && onNavigate("dashboard")}
                        className="linky text-left font-sans cursor-pointer font-bold text-[var(--gold)]"
                        data-testid="nav-dashboard"
                    >
                        Dashboard
                    </button>
                    <a
                        href="#pipeline"
                        onClick={(e) => scrollToSection(e, "#pipeline")}
                        className="linky"
                        data-testid="nav-pipeline"
                    >
                        Method
                    </a>
                    <a
                        href="#accuracy"
                        onClick={(e) => scrollToSection(e, "#accuracy")}
                        className="linky"
                        data-testid="nav-accuracy"
                    >
                        Accuracy
                    </a>
                    <a
                        href="#api"
                        onClick={(e) => scrollToSection(e, "#api")}
                        className="linky"
                        data-testid="nav-api"
                    >
                        API
                    </a>
                    <a
                        href="#app"
                        onClick={(e) => scrollToSection(e, "#app")}
                        className="linky"
                        data-testid="nav-app"
                    >
                        Android
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggle}
                        className="text-[11px] font-mono tracking-[0.14em] uppercase px-3 py-2 border"
                        style={{ borderColor: "var(--border)" }}
                        data-testid="theme-toggle"
                        aria-label="Toggle color mode"
                    >
                        {isDark ? "◐ Light" : "◑ Dark"}
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden px-3 py-2 border text-[11px] font-mono tracking-[0.14em] uppercase flex items-center justify-center"
                        style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                        aria-label="Toggle mobile menu"
                        data-testid="mobile-menu-toggle"
                    >
                        {mobileMenuOpen ? "✕ Close" : "☰ Menu"}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Drawer */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden border-b px-6 py-6 flex flex-col gap-4 font-mono text-sm shadow-2xl backdrop-blur-xl"
                    style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--ink)"
                    }}
                >
                    <a
                        href="#coverage"
                        onClick={() => handleMobileNavClick("#coverage")}
                        className="py-2 border-b text-base font-serif"
                        style={{ borderColor: "var(--border)" }}
                    >
                        Coverage
                    </a>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            onNavigate && onNavigate("dashboard");
                        }}
                        className="py-2 border-b text-left font-serif text-base font-bold text-[var(--gold)]"
                        style={{ borderColor: "var(--border)" }}
                    >
                        Dashboard
                    </button>
                    <a
                        href="#pipeline"
                        onClick={() => handleMobileNavClick("#pipeline")}
                        className="py-2 border-b text-base font-serif"
                        style={{ borderColor: "var(--border)" }}
                    >
                        Method
                    </a>
                    <a
                        href="#accuracy"
                        onClick={() => handleMobileNavClick("#accuracy")}
                        className="py-2 border-b text-base font-serif"
                        style={{ borderColor: "var(--border)" }}
                    >
                        Accuracy
                    </a>
                    <a
                        href="#api"
                        onClick={() => handleMobileNavClick("#api")}
                        className="py-2 border-b text-base font-serif"
                        style={{ borderColor: "var(--border)" }}
                    >
                        API
                    </a>
                    <a
                        href="#app"
                        onClick={() => handleMobileNavClick("#app")}
                        className="py-2 text-base font-serif"
                    >
                        Android
                    </a>
                </div>
            )}
        </header>
    );
}

/* ---------- Marquee ---------- */
function EditorialMarquee() {
    const items = [
        "POTATO",
        "ONION",
        "TOMATO",
        "BRINJAL",
        "NATIONAL",
        "TAMIL NADU",
        "₹ / QUINTAL",
        "ARIMA",
        "XGBoost",
        "1 – 30 DAYS AHEAD",
        "MAPE · RMSE · MAE",
        "WALK-FORWARD VALIDATED",
    ];
    const row = [...items, ...items];
    return (
        <div
            className="py-8 border-y overflow-hidden"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="marquee-track">
                {row.map((t, i) => (
                    <span
                        key={i}
                        className="font-serif text-[42px] md:text-[64px] leading-none px-8 whitespace-nowrap"
                        style={{
                            color:
                                i % 2 === 0
                                    ? "var(--ink)"
                                    : "var(--ink-2)",
                            fontStyle: i % 3 === 0 ? "italic" : "normal",
                            fontWeight: 500,
                        }}
                    >
                        {t}{" "}
                        <span
                            style={{ color: "var(--gold)", margin: "0 0.4em" }}
                        >
                            ·
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---------- Hero ---------- */
function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const chartY = useTransform(scrollYProgress, [0, 1], [0, -40]);

    const today = new Date();
    const formattedTime = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) + " IST";

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 14);
    const formattedTargetDate = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTargetShort = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <section
            ref={ref}
            id="top"
            className="relative overflow-hidden pt-20 md:pt-28 pb-16 md:pb-24 grain"
        >
            {/* Parallax blobs */}
            <motion.div
                style={{ y: blob1Y }}
                className="parallax-blob"
                aria-hidden
            >
                <div
                    className="absolute -top-10 -right-10 w-[480px] h-[480px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(closest-side, var(--sage), transparent 70%)",
                        opacity: 0.25,
                    }}
                />
            </motion.div>
            <motion.div
                style={{ y: blob2Y }}
                className="parallax-blob"
                aria-hidden
            >
                <div
                    className="absolute top-[40%] -left-40 w-[520px] h-[520px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(closest-side, var(--gold), transparent 70%)",
                        opacity: 0.15,
                    }}
                />
            </motion.div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">
                {/* Meta row */}
                <div
                    className="flex items-center justify-end mb-4 font-mono text-[10.5px] tabular tracking-[0.14em] uppercase"
                    style={{ color: "var(--ink-2)" }}
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <span style={{ color: "var(--positive)" }}>●</span>{" "}
                        Live · Updated {formattedTime}
                    </motion.span>
                </div>

                {/* Two-column layout: forecast number & headline on left, chart on right */}
                <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
                    <div className="md:col-span-5">
                        <div
                            className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                            style={{ color: "var(--ink-2)" }}
                        >
                            Tomato · National · +14&nbsp;days
                        </div>

                        <div className="mb-6">
                            <div
                                className="font-sans tabular leading-[0.9] mb-3"
                                style={{
                                    fontWeight: 700,
                                    fontSize: "clamp(42px, 9vw, 132px)",
                                    color: "var(--gold)",
                                    letterSpacing: "-0.02em",
                                }}
                                data-testid="hero-forecast-number"
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 1.2,
                                        delay: 0.6,
                                        ease: [0.7, 0, 0.15, 1],
                                    }}
                                    className="inline-block"
                                >
                                    ₹2,475
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 1.6 }}
                                    className="font-sans font-medium"
                                    style={{
                                        fontSize: "0.42em",
                                        letterSpacing: 0,
                                    }}
                                >
                                    .50
                                </motion.span>
                            </div>
                            <div
                                className="font-mono text-xs tabular tracking-[0.1em] uppercase"
                                style={{ color: "var(--ink-2)" }}
                            >
                                per Quintal &nbsp;·&nbsp; expected {formattedTargetDate}
                            </div>
                        </div>

                        <h1
                            className="font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.08] mb-8"
                            style={{
                                fontWeight: 500,
                                letterSpacing: "-0.015em",
                                color: "var(--ink)",
                            }}
                        >
                            <LineMask delay={0.35}>
                                Tomatoes are expected to reach
                            </LineMask>{" "}
                            <LineMask delay={0.45}>
                                <em
                                    style={{
                                        fontStyle: "italic",
                                        color: "var(--brand)",
                                    }}
                                >
                                    ₹2,475.50 / Quintal
                                </em>
                            </LineMask>{" "}
                            <LineMask delay={0.55}>
                                on {formattedTargetShort} across national mandis —
                            </LineMask>{" "}
                            <LineMask delay={0.65}>
                                <span style={{ color: "var(--ink-2)" }}>
                                    a 6.7% rise from today, with a
                                </span>
                            </LineMask>{" "}
                            <LineMask delay={0.75}>
                                <span style={{ color: "var(--ink-2)" }}>
                                    ±8% confidence band by day 14.
                                </span>
                            </LineMask>
                        </h1>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.7 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <a
                                href="#coverage"
                                onClick={(e) => scrollToSection(e, "#coverage")}
                                className="btn-primary"
                                data-testid="cta-explore-forecasts"
                            >
                                Check tomorrow&rsquo;s prices
                                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                    <path d="M1 6h13m0 0L9 1m5 5L9 11" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                            </a>
                            <a
                                href="#app"
                                onClick={(e) => scrollToSection(e, "#app")}
                                className="text-sm linky"
                                style={{ color: "var(--ink-2)" }}
                                data-testid="cta-app-secondary"
                            >
                                or download the Android app
                            </a>
                        </motion.div>
                    </div>

                    <motion.div
                        className="md:col-span-7"
                        style={{ y: chartY }}
                    >
                        <div
                            className="p-4 md:p-6 border relative"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border)",
                            }}
                        >
                            <div
                                className="flex items-center justify-between mb-3 font-mono text-[10.5px] tabular tracking-[0.14em] uppercase"
                                style={{ color: "var(--ink-2)" }}
                            >
                                <span>Fig. 01 &nbsp;·&nbsp; Tomato / National</span>
                                <span>
                                    Model:{" "}
                                    <span style={{ color: "var(--ink)" }}>
                                        XGBoost
                                    </span>{" "}
                                    · MAPE 6.4%
                                </span>
                            </div>
                            <ForecastChart />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ---------- Coverage ---------- */
function Coverage({ onNavigate }) {
    const [region, setRegion] = useState("national");
    const [veg, setVeg] = useState("tomato");
    const selected = COMMODITIES.find((c) => c.key === veg);

    const prices = {
        "national-tomato": 2320,
        "national-onion": 1845,
        "national-potato": 1210,
        "national-brinjal": 1580,
        "tn-tomato": 2415,
        "tn-onion": 1920,
        "tn-potato": 1350,
        "tn-brinjal": 1720,
    };
    const price = prices[`${region}-${veg}`];

    return (
        <section
            id="coverage"
            className="py-24 md:py-32 border-t"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal>
                    <div className="grid md:grid-cols-12 gap-8 mb-14 items-end">
                        <div className="md:col-span-4">
                            <div
                                className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                                style={{ color: "var(--gold)" }}
                            >
                                Ch. 01 &nbsp;/&nbsp; Coverage
                            </div>
                            <h2
                                className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.98]"
                                style={{
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Four crops.<br />
                                <em style={{ color: "var(--brand)" }}>
                                    Two markets.
                                </em>
                            </h2>
                        </div>
                        <div className="md:col-span-6 md:col-start-7">
                            <p
                                className="text-base md:text-lg leading-relaxed"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Pick a commodity and a market. The number
                                updates. Every pair is trained
                                independently — the model that wins
                                walk-forward validation gets the job.
                            </p>
                        </div>
                    </div>
                </Reveal>

                {/* Region toggle */}
                <Reveal delay={0.1}>
                    <div className="flex items-center gap-1 mb-10 font-mono text-[11px] tabular tracking-[0.14em] uppercase">
                        {REGIONS.map((r) => (
                            <button
                                key={r.key}
                                onClick={() => setRegion(r.key)}
                                data-testid={`region-${r.key}`}
                                className="px-4 py-2 border transition-colors"
                                style={{
                                    borderColor:
                                        region === r.key
                                            ? "var(--ink)"
                                            : "var(--border)",
                                    background:
                                        region === r.key
                                            ? "var(--ink)"
                                            : "transparent",
                                    color:
                                        region === r.key
                                            ? "var(--bg)"
                                            : "var(--ink)",
                                }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </Reveal>

                {/* Commodity grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {COMMODITIES.map((c, i) => {
                        const active = veg === c.key;
                        return (
                            <Reveal key={c.key} delay={0.1 + i * 0.08}>
                                <button
                                    onClick={() => setVeg(c.key)}
                                    data-testid={`commodity-${c.key}`}
                                    className="group text-left w-full block border transition-colors"
                                    style={{
                                        borderColor: active
                                            ? "var(--ink)"
                                            : "var(--border)",
                                        background: active
                                            ? "var(--ink)"
                                            : "var(--surface)",
                                        color: active
                                            ? "var(--bg)"
                                            : "var(--ink)",
                                    }}
                                >
                                    <div
                                        className="relative overflow-hidden aspect-[4/5]"
                                        style={{
                                            background:
                                                "var(--bg)",
                                        }}
                                    >
                                        <img
                                            src={c.img}
                                            alt={c.label}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms]"
                                            style={{
                                                filter:
                                                    "grayscale(0.2) contrast(1.05)",
                                                transform: active
                                                    ? "scale(1.06)"
                                                    : "scale(1)",
                                            }}
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    "radial-gradient(60% 50% at 30% 30%, transparent 0%, rgba(15,22,19,0.55) 100%)",
                                            }}
                                        />
                                        <div className="absolute top-3 left-3 font-mono text-[10px] tabular tracking-[0.14em] uppercase text-white opacity-80">
                                            0{i + 1}
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-5">
                                        <div className="flex items-baseline justify-between mb-3">
                                            <div
                                                className="font-serif text-2xl md:text-3xl"
                                                style={{
                                                    fontWeight: 500,
                                                    letterSpacing:
                                                        "-0.01em",
                                                }}
                                            >
                                                {c.label}
                                            </div>
                                            <div className="font-mono text-[10px] tabular tracking-[0.12em] uppercase opacity-70">
                                                {c.model}
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm tabular flex items-baseline justify-between">
                                            <span className="opacity-70">
                                                today
                                            </span>
                                            <span>
                                                ₹
                                                {(active
                                                    ? price
                                                    : prices[
                                                          `${region}-${c.key}`
                                                      ]
                                                ).toLocaleString(
                                                    "en-IN",
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </Reveal>
                        );
                    })}
                </div>

                {/* Selection summary */}
                <Reveal delay={0.3}>
                    <div
                        className="mt-10 p-6 md:p-8 border flex flex-col md:flex-row md:items-end justify-between gap-6"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--surface)",
                        }}
                    >
                        {/* Left Column: Metadata & Price */}
                        <div>
                            <div
                                className="font-mono text-[10.5px] tabular tracking-[0.14em] uppercase mb-2"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Selected · {selected.label} ·{" "}
                                {REGIONS.find((r) => r.key === region).label}
                            </div>
                            <div
                                className="font-sans font-bold tabular"
                                style={{
                                    fontWeight: 600,
                                    fontSize: "clamp(40px, 5vw, 64px)",
                                    color: "var(--gold)",
                                    letterSpacing: "-0.02em",
                                    lineHeight: 1,
                                }}
                                data-testid="coverage-price"
                            >
                                ₹{price.toLocaleString("en-IN")}
                                <span
                                    className="font-mono ml-2"
                                    style={{
                                        color: "var(--ink-2)",
                                        fontSize: "0.28em",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    / QUINTAL · TODAY
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Model Specs & Bottom Right CTA Button */}
                        <div className="flex flex-col items-start md:items-end gap-4">
                            <div
                                className="font-mono text-sm tabular md:text-right"
                                style={{ color: "var(--ink-2)" }}
                            >
                                <div>
                                    Best model:{" "}
                                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                                        {selected.model}
                                    </span>
                                </div>
                                <div className="mt-1">
                                    MAPE{" "}
                                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                                        {selected.mape}%
                                    </span>{" "}
                                    · RMSE {selected.rmse} · MAE {selected.mae}
                                </div>
                            </div>

                            {/* Bottom Right Button */}
                            <button
                                onClick={() => onNavigate && onNavigate("dashboard")}
                                className="btn-primary inline-flex items-center gap-2.5 px-6 py-3 text-xs tracking-wider uppercase font-mono cursor-pointer font-bold shadow-md hover:opacity-90 transition-all"
                                data-testid="btn-more-insights"
                            >
                                <span>More Insights</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ---------- Pipeline ---------- */
function Pipeline() {
    const steps = [
        {
            n: "01",
            title: "Ingest",
            body: "Daily scrapes of Agmarknet mandi records. Prices, arrival volumes, source markets. Outliers stripped, calendar reindexed to a continuous daily grid.",
            tag: "Data",
        },
        {
            n: "02",
            title: "Engineer",
            body: "Lagged prices (t-1, t-7, t-30), rolling means & volatility across 7 / 14 / 30 day windows, arrival-volume features, seasonality flags.",
            tag: "Features",
        },
        {
            n: "03",
            title: "Route",
            body: "For each region × commodity pair, both ARIMA and XGBoost are trained. The one with lower out-of-sample MAPE gets shipped.",
            tag: "Model",
        },
        {
            n: "04",
            title: "Bound",
            body: "Statistical intervals for ARIMA; empirical RMSE bands for XGBoost. Uncertainty is a first-class output, not an afterthought.",
            tag: "Confidence",
        },
    ];
    return (
        <section
            id="pipeline"
            className="py-24 md:py-32 border-t"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal>
                    <div className="mb-16 md:mb-20 grid md:grid-cols-12 gap-8 items-end">
                        <div className="md:col-span-6">
                            <div
                                className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                                style={{ color: "var(--gold)" }}
                            >
                                Ch. 02 &nbsp;/&nbsp; Method
                            </div>
                            <h2
                                className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.98]"
                                style={{
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                How a forecast<br />
                                <em style={{ color: "var(--brand)" }}>
                                    is actually made.
                                </em>
                            </h2>
                        </div>
                        <div className="md:col-span-5 md:col-start-8">
                            <p
                                className="text-base md:text-lg leading-relaxed"
                                style={{ color: "var(--ink-2)" }}
                            >
                                A number in a headline is easy. What sits
                                behind it — data, features, model routing,
                                confidence — is what makes it worth acting
                                on. Four steps, each earned.
                            </p>
                        </div>
                    </div>
                </Reveal>

                <div className="relative">
                    <div
                        className="hidden md:block absolute top-[36px] left-0 right-0 h-px"
                        style={{ background: "var(--border)" }}
                    />
                    <div className="grid md:grid-cols-4 gap-8 md:gap-6">
                        {steps.map((s, i) => (
                            <Reveal key={s.n} delay={0.1 + i * 0.12}>
                                <div className="relative">
                                    <div className="hidden md:flex items-center justify-center absolute -top-[6px] left-0 w-3 h-3">
                                        <span
                                            className="w-3 h-3"
                                            style={{
                                                background: "var(--brand)",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </div>
                                    <div
                                        className="font-mono text-[11px] tabular tracking-[0.16em] uppercase pt-4 md:pt-10 mb-3"
                                        style={{ color: "var(--ink-2)" }}
                                    >
                                        {s.n} &nbsp;·&nbsp; {s.tag}
                                    </div>
                                    <h3
                                        className="font-serif text-3xl md:text-4xl mb-4"
                                        style={{
                                            fontWeight: 500,
                                            letterSpacing: "-0.015em",
                                        }}
                                    >
                                        {s.title}
                                    </h3>
                                    <p
                                        className="text-sm md:text-[15px] leading-relaxed"
                                        style={{ color: "var(--ink-2)" }}
                                    >
                                        {s.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------- Accuracy ---------- */
function Accuracy() {
    const changelog = [
        {
            date: "2025-07-28",
            region: "National",
            veg: "Tomato",
            model: "XGBoost",
            mape: 6.4,
            rmse: 142,
            note: "Retrained with July arrival-volume features. −0.9 MAPE.",
        },
        {
            date: "2025-07-28",
            region: "National",
            veg: "Onion",
            model: "ARIMA",
            mape: 5.1,
            rmse: 118,
            note: "ARIMA (2,1,2) held. XGBoost lost walk-forward by 0.4 MAPE.",
        },
        {
            date: "2025-07-28",
            region: "Tamil Nadu",
            veg: "Potato",
            model: "ARIMA",
            mape: 4.3,
            rmse: 95,
            note: "Best-in-class. Low volatility, seasonal.",
        },
        {
            date: "2025-07-28",
            region: "Tamil Nadu",
            veg: "Brinjal",
            model: "XGBoost",
            mape: 7.8,
            rmse: 168,
            note: "High variance crop. Confidence band widened +12%.",
        },
    ];
    return (
        <section
            id="accuracy"
            className="py-24 md:py-32 border-t"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal>
                    <div className="mb-14 md:mb-20 grid md:grid-cols-12 gap-8">
                        <div className="md:col-span-6">
                            <div
                                className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                                style={{ color: "var(--gold)" }}
                            >
                                Ch. 03 &nbsp;/&nbsp; Accuracy
                            </div>
                            <h2
                                className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.98]"
                                style={{
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Tracked like<br />
                                <em style={{ color: "var(--brand)" }}>
                                    a changelog,
                                </em>{" "}
                                not a<br />marketing claim.
                            </h2>
                        </div>
                        <div className="md:col-span-5 md:col-start-8 self-end">
                            <p
                                className="text-base md:text-lg leading-relaxed"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Every model is validated with walk-forward
                                out-of-sample testing — no lookahead, no
                                cherry-picked windows. MAPE, RMSE and MAE
                                are logged per region-commodity pair and
                                published below.
                            </p>
                        </div>
                    </div>
                </Reveal>

                <div
                    className="border overflow-x-auto"
                    style={{ borderColor: "var(--border)" }}
                >
                    <div className="min-w-[750px]">
                    <div
                        className="grid grid-cols-12 gap-4 px-6 py-4 font-mono text-[10.5px] tabular tracking-[0.14em] uppercase border-b"
                        style={{
                            borderColor: "var(--border)",
                            color: "var(--ink-2)",
                        }}
                    >
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Market</div>
                        <div className="col-span-2">Crop</div>
                        <div className="col-span-1">Model</div>
                        <div className="col-span-1 text-right">MAPE</div>
                        <div className="col-span-1 text-right">RMSE</div>
                        <div className="col-span-3">Note</div>
                    </div>
                    {changelog.map((row, i) => (
                        <Reveal key={i} delay={0.05 * i}>
                            <div
                                className="grid grid-cols-12 gap-4 px-6 py-5 items-baseline border-b last:border-b-0 font-mono text-sm tabular"
                                style={{ borderColor: "var(--border)" }}
                            >
                                <div
                                    className="col-span-2"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    {row.date}
                                </div>
                                <div className="col-span-2">
                                    {row.region}
                                </div>
                                <div
                                    className="col-span-2 font-serif text-lg"
                                    style={{
                                        fontWeight: 500,
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {row.veg}
                                </div>
                                <div
                                    className="col-span-1"
                                    style={{ color: "var(--brand)" }}
                                >
                                    {row.model}
                                </div>
                                <div className="col-span-1 text-right font-mono" style={{ color: "var(--positive)", fontWeight: 600 }}>
                                    {row.mape}%
                                </div>
                                <div
                                    className="col-span-1 text-right"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    {row.rmse}
                                </div>
                                <div
                                    className="col-span-3 font-sans text-[13px]"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    {row.note}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------- DevAPI ---------- */
function DevAPI() {
    return (
        <section
            id="api"
            className="py-24 md:py-32 border-t"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal>
                    <div className="mb-14 md:mb-16 grid md:grid-cols-12 gap-8 items-end">
                        <div className="md:col-span-6">
                            <div
                                className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                                style={{ color: "var(--gold)" }}
                            >
                                Ch. 04 &nbsp;/&nbsp; Developers
                            </div>
                            <h2
                                className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.98]"
                                style={{
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Public REST.<br />
                                <em style={{ color: "var(--brand)" }}>
                                    Plain JSON.
                                </em>
                            </h2>
                        </div>
                        <div className="md:col-span-5 md:col-start-8">
                            <p
                                className="text-base md:text-lg leading-relaxed"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Three endpoints, no auth for read access, no
                                webhooks to wire up. Query a pair, get a
                                point forecast plus bounds.
                            </p>
                        </div>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-2 gap-6">
                    <Reveal>
                        <div>
                            <div
                                className="font-mono text-[10.5px] tabular tracking-[0.14em] uppercase mb-3"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Request
                            </div>
                            <pre
                                className="code-block"
                                data-testid="api-request"
                            >
{`GET /predict/national/tomato?horizon=14
Host: api.crofu.in
Accept: application/json`}
                            </pre>
                        </div>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div>
                            <div
                                className="font-mono text-[10.5px] tabular tracking-[0.14em] uppercase mb-3"
                                style={{ color: "var(--ink-2)" }}
                            >
                                Response · 200 OK
                            </div>
                            <pre
                                className="code-block"
                                data-testid="api-response"
                            >
{`{
  `}<span className="k">"region"</span>{`: `}<span className="s">"national"</span>{`,
  `}<span className="k">"vegetable"</span>{`: `}<span className="s">"tomato"</span>{`,
  `}<span className="k">"model"</span>{`: `}<span className="s">"xgboost"</span>{`,
  `}<span className="k">"unit"</span>{`: `}<span className="s">"INR/quintal"</span>{`,
  `}<span className="k">"forecast"</span>{`: [
    { `}<span className="k">"day"</span>{`: `}<span className="n">1</span>{`, `}<span className="k">"point"</span>{`: `}<span className="n">2340</span>{`, `}<span className="k">"lo"</span>{`: `}<span className="n">2300</span>{`, `}<span className="k">"hi"</span>{`: `}<span className="n">2380</span>{` },
    { `}<span className="k">"day"</span>{`: `}<span className="n">7</span>{`, `}<span className="k">"point"</span>{`: `}<span className="n">2438</span>{`, `}<span className="k">"lo"</span>{`: `}<span className="n">2318</span>{`, `}<span className="k">"hi"</span>{`: `}<span className="n">2560</span>{` },
    { `}<span className="k">"day"</span>{`: `}<span className="n">14</span>{`, `}<span className="k">"point"</span>{`: `}<span className="n">2475.5</span>{`, `}<span className="k">"lo"</span>{`: `}<span className="n">2270</span>{`, `}<span className="k">"hi"</span>{`: `}<span className="n">2680</span>{` }
  ],
  `}<span className="k">"metrics"</span>{`: { `}<span className="k">"mape"</span>{`: `}<span className="n">6.4</span>{`, `}<span className="k">"rmse"</span>{`: `}<span className="n">142</span>{`, `}<span className="k">"mae"</span>{`: `}<span className="n">108</span>{` }
}`}
                            </pre>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.2}>
                    <div className="mt-10 grid md:grid-cols-3 gap-4 font-mono text-sm tabular">
                        {[
                            { m: "GET", p: "/health", d: "Liveness" },
                            {
                                m: "GET",
                                p: "/vegetables",
                                d: "Supported crop × market pairs",
                            },
                            {
                                m: "GET",
                                p: "/predict/{region}/{vegetable}",
                                d: "Point forecast + bounds",
                            },
                        ].map((e, i) => (
                            <div
                                key={i}
                                className="p-5 border flex flex-col gap-2"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--surface)",
                                }}
                            >
                                <div className="flex items-baseline gap-3">
                                    <span
                                        className="text-[10.5px] tracking-[0.14em] uppercase"
                                        style={{ color: "var(--positive)" }}
                                    >
                                        {e.m}
                                    </span>
                                    <span style={{ color: "var(--ink)" }}>
                                        {e.p}
                                    </span>
                                </div>
                                <span
                                    className="text-[13px] font-sans"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    {e.d}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ---------- GetApp ---------- */
function GetApp() {
    return (
        <section
            id="app"
            className="py-24 md:py-32 border-t relative overflow-hidden"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10">
                <div className="md:col-span-6">
                    <Reveal>
                        <div
                            className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-4"
                            style={{ color: "var(--gold)" }}
                        >
                            Ch. 05 &nbsp;/&nbsp; Android
                        </div>
                        <h2
                            className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.98] mb-6"
                            style={{
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Check prices<br />
                            <em style={{ color: "var(--brand)" }}>
                                on the ground.
                            </em>
                        </h2>
                        <p
                            className="text-base md:text-lg leading-relaxed mb-8 max-w-md"
                            style={{ color: "var(--ink-2)" }}
                        >
                            The same forecasts, cached for patchy signal —
                            what a mandi trader actually needs at 5&nbsp;AM.
                            Direct APK. No store, no login.
                        </p>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <a
                            href="#"
                            className="btn-primary inline-flex items-start flex-col !gap-1 !py-5 !px-6"
                            data-testid="apk-download-button"
                        >
                            <span className="flex items-center gap-3">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16" />
                                </svg>
                                <span className="text-base">
                                    Download APK
                                </span>
                            </span>
                            <span
                                className="font-mono text-[11px] tabular tracking-[0.1em] ml-[30px]"
                                style={{ opacity: 0.85 }}
                            >
                                v0.1.0 &nbsp;·&nbsp; ~12 MB &nbsp;·&nbsp;
                                Android 8+
                            </span>
                        </a>

                        <p
                            className="mt-4 text-sm max-w-sm"
                            style={{ color: "var(--ink-2)" }}
                        >
                            You’ll need to allow installs from
                            unknown sources in your device settings.
                        </p>
                    </Reveal>
                </div>

                <div className="md:col-span-6 flex items-center justify-center">
                    <Reveal delay={0.2}>
                        <motion.div
                            initial={{ rotate: -6, y: 10 }}
                            whileInView={{ rotate: -3, y: 0 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.7, 0, 0.15, 1],
                            }}
                            viewport={{ once: true }}
                            className="relative"
                            style={{
                                width: 280,
                                height: 560,
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: 32,
                                padding: 14,
                            }}
                        >
                            <div
                                className="w-full h-full flex flex-col p-5"
                                style={{
                                    background: "var(--bg)",
                                    borderRadius: 20,
                                }}
                            >
                                <div
                                    className="font-mono text-[9.5px] tabular tracking-[0.16em] uppercase mb-1"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    Tomato · National
                                </div>
                                <div
                                    className="font-sans font-bold tabular leading-none mb-1"
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 44,
                                        color: "var(--gold)",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    ₹2,475
                                </div>
                                <div
                                    className="font-mono text-[10px] tabular mb-4"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    +14 days · ±8%
                                </div>
                                <svg
                                    viewBox="0 0 240 120"
                                    className="w-full h-24"
                                >
                                    <polyline
                                        points="0,90 20,85 40,82 60,72 80,70 100,60 120,58 140,50 160,45 180,38 200,32 220,28 240,22"
                                        fill="none"
                                        stroke="var(--brand)"
                                        strokeWidth="1.5"
                                    />
                                    <polyline
                                        points="120,58 140,50 160,45 180,38 200,32 220,28 240,22"
                                        fill="none"
                                        stroke="var(--gold)"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                    />
                                </svg>
                                <div
                                    className="mt-auto grid grid-cols-2 gap-2 font-mono text-[10px] tabular"
                                    style={{ color: "var(--ink-2)" }}
                                >
                                    {["Onion", "Potato", "Brinjal", "TN"].map(
                                        (t) => (
                                            <div
                                                key={t}
                                                className="p-2 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border)",
                                                }}
                                            >
                                                {t}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ---------- FinalCTA ---------- */
function FinalCTA() {
    return (
        <section
            className="py-32 md:py-48 border-t relative"
            style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal>
                    <div
                        className="font-mono text-[11px] tabular tracking-[0.16em] uppercase mb-6"
                        style={{ color: "var(--gold)" }}
                    >
                        Decide with the number
                    </div>
                    <h2
                        className="font-serif text-[clamp(48px,9vw,148px)] leading-[0.9]"
                        style={{
                            fontWeight: 500,
                            letterSpacing: "-0.025em",
                            maxWidth: "18ch",
                        }}
                    >
                        Sell at the right{" "}
                        <em style={{ color: "var(--brand)" }}>day.</em>{" "}
                        Buy at the right{" "}
                        <em style={{ color: "var(--gold)" }}>price.</em>
                    </h2>
                    <div className="mt-12 flex flex-wrap items-center gap-6">
                        <a
                            href="#coverage"
                            onClick={(e) => scrollToSection(e, "#coverage")}
                            className="btn-primary"
                            data-testid="cta-final-primary"
                        >
                            Check tomorrow’s prices
                            <svg
                                width="16"
                                height="12"
                                viewBox="0 0 16 12"
                                fill="none"
                            >
                                <path
                                    d="M1 6h13m0 0L9 1m5 5L9 11"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        </a>
                        <a
                            href="#api"
                            onClick={(e) => scrollToSection(e, "#api")}
                            className="text-sm linky"
                            style={{ color: "var(--ink-2)" }}
                            data-testid="cta-final-secondary"
                        >
                            or read the API docs
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ---------- Footer ---------- */
function Footer() {
    return (
        <footer
            className="py-10 border-t"
            style={{ borderColor: "var(--border)" }}
        >
            <div
                className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-wrap items-center justify-between gap-6 font-mono text-[11px] tabular tracking-[0.1em] uppercase"
                style={{ color: "var(--ink-2)" }}
            >
                <span>
                    CroFu · Market intelligence for Indian mandis
                </span>
                <span>
                    Data: Agmarknet · Built with FastAPI + Python
                </span>
                <span>© {new Date().getFullYear()}</span>
            </div>
        </footer>
    );
}

/* ---------- Page ---------- */
export default function Crofu({ onNavigate }) {
    useTheme();
    useLenis();

    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
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

    return (
        <main className="w-full max-w-[100vw] overflow-x-hidden" style={{ background: "var(--bg)" }} data-testid="crofu-page">
            <Nav
                onToggle={() => {
                    toggleTheme();
                    setIsDark(
                        document.documentElement.classList.contains("dark"),
                    );
                }}
                isDark={isDark}
                onNavigate={onNavigate}
            />
            <Hero />
            <EditorialMarquee />
            <Coverage onNavigate={onNavigate} />
            <Pipeline />
            <Accuracy />
            <DevAPI />
            <GetApp />
            <FinalCTA />
            <Footer />
        </main>
    );
}
