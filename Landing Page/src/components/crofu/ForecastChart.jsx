import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForecastData } from "@/hooks/useForecastData";

export default function ForecastChart({ animate = true, commodity = 'tomato', region = 'national' }) {
    const [hover, setHover] = useState(null);
    
    // Fetch data directly from Supabase via our custom hook
    const { observed, forecast, loading, error } = useForecastData(commodity, region);

    const width = 1120;
    const height = 460;
    const padL = 74;
    const padR = 24;
    const padT = 40;
    const padB = 56;

    const allValues = useMemo(() => {
        const arr = [...observed];
        forecast.forEach((f) => {
            arr.push(f.p, f.lo, f.hi);
        });
        return arr;
    }, [observed, forecast]);

    if (loading) {
        return (
            <div className="relative w-full h-[460px] flex items-center justify-center text-sm font-mono opacity-50 border border-dashed border-[var(--border)]">
                Loading live data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative w-full h-[460px] flex items-center justify-center text-sm text-red-500 font-mono opacity-80 border border-dashed border-red-500/30">
                Failed to load data: {error}
            </div>
        );
    }

    if (allValues.length === 0) {
        return (
            <div className="relative w-full h-[460px] flex items-center justify-center text-sm font-mono opacity-50 border border-dashed border-[var(--border)]">
                Awaiting Data
            </div>
        );
    }

    const yMin = Math.floor(Math.min(...allValues) / 100) * 100 - 100;
    const yMax = Math.ceil(Math.max(...allValues) / 100) * 100 + 100;

    const totalPoints = observed.length + forecast.length;
    const stepX = (width - padL - padR) / (totalPoints - 1);

    const xAt = (i) => padL + i * stepX;
    const yAt = (v) =>
        padT + ((yMax - v) / (yMax - yMin)) * (height - padT - padB);

    const observedPath = observed
        .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
        .join(" ");

    const lastObsIdx = observed.length - 1;
    const forecastPath = [
        `M ${xAt(lastObsIdx)} ${yAt(observed[lastObsIdx])}`,
        ...forecast.map((f, i) => `L ${xAt(lastObsIdx + 1 + i)} ${yAt(f.p)}`),
    ].join(" ");

    const upperPts = forecast.map(
        (f, i) => `${xAt(lastObsIdx + 1 + i)},${yAt(f.hi)}`,
    );
    const lowerPts = forecast
        .map((f, i) => `${xAt(lastObsIdx + 1 + i)},${yAt(f.lo)}`)
        .reverse();
    const bandPoints = [
        `${xAt(lastObsIdx)},${yAt(observed[lastObsIdx])}`,
        ...upperPts,
        ...lowerPts,
    ].join(" ");

    const gridSteps = 4;
    const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
        const v = yMin + ((yMax - yMin) / gridSteps) * i;
        return { v, y: yAt(v) };
    });

    const onMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = width / rect.width;
        const localX = (e.clientX - rect.left) * scaleX;
        const idx = Math.round((localX - padL) / stepX);
        if (idx < 0 || idx >= totalPoints) return setHover(null);
        if (idx <= lastObsIdx) {
            setHover({
                idx,
                type: "obs",
                v: observed[idx],
                x: xAt(idx),
                y: yAt(observed[idx]),
            });
        } else {
            const f = forecast[idx - lastObsIdx - 1];
            setHover({
                idx,
                type: "fc",
                v: f.p,
                lo: f.lo,
                hi: f.hi,
                x: xAt(idx),
                y: yAt(f.p),
            });
        }
    };

    const transitionX = xAt(lastObsIdx);

    return (
        <div
            className="relative w-full"
            style={{ color: "var(--ink)" }}
            data-testid="forecast-chart"
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                onMouseMove={onMove}
                onMouseLeave={() => setHover(null)}
                role="img"
                aria-label="Tomato National forecast: last 30 days observed, next 14 days predicted with confidence band"
            >
                <defs>
                    <linearGradient
                        id="bandGrad"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--gold)"
                            stopOpacity="0.28"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--gold)"
                            stopOpacity="0.10"
                        />
                    </linearGradient>
                    <clipPath id="revealClip">
                        <motion.rect
                            x={padL}
                            y={0}
                            height={height}
                            initial={{ width: animate ? 0 : width - padL - padR }}
                            animate={{ width: width - padL - padR }}
                            transition={{ duration: 2.2, ease: [0.7, 0, 0.15, 1], delay: 0.35 }}
                        />
                    </clipPath>
                    <clipPath id="bandClip">
                        <motion.rect
                            x={transitionX}
                            y={0}
                            height={height}
                            initial={{ width: animate ? 0 : width - transitionX - padR }}
                            animate={{ width: width - transitionX - padR }}
                            transition={{ duration: 1.6, ease: [0.7, 0, 0.15, 1], delay: 1.4 }}
                        />
                    </clipPath>
                </defs>

                {/* horizontal gridlines */}
                {gridLines.map((g, i) => (
                    <g key={i}>
                        <line
                            x1={padL}
                            x2={width - padR}
                            y1={g.y}
                            y2={g.y}
                            stroke="var(--border)"
                            strokeWidth="1"
                            strokeDasharray={i === 0 || i === gridSteps ? "" : "2 4"}
                        />
                        <text
                            x={padL - 12}
                            y={g.y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="var(--ink-2)"
                            fontFamily="var(--font-mono)"
                        >
                            ₹{g.v.toLocaleString("en-IN")}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                <text
                    x={padL}
                    y={height - padB + 22}
                    fontSize="10.5"
                    fill="var(--ink-2)"
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.06em"
                >
                    30 DAYS AGO
                </text>
                <text
                    x={transitionX}
                    y={height - padB + 22}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="var(--ink)"
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.06em"
                >
                    TODAY
                </text>
                <text
                    x={width - padR}
                    y={height - padB + 22}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="var(--ink-2)"
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.06em"
                >
                    +14 DAYS
                </text>

                {/* Confidence band */}
                <g clipPath="url(#bandClip)">
                    <polygon
                        points={bandPoints}
                        fill="url(#bandGrad)"
                        stroke="none"
                    />
                </g>

                {/* Vertical divider at transition */}
                <line
                    x1={transitionX}
                    x2={transitionX}
                    y1={padT}
                    y2={height - padB}
                    stroke="var(--ink-2)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity="0.45"
                />

                {/* Observed line */}
                <g clipPath="url(#revealClip)">
                    <path
                        d={observedPath}
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>

                {/* Forecast line */}
                <g clipPath="url(#bandClip)">
                    <path
                        d={forecastPath}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="1.8"
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>

                {/* End marker on forecast peak */}
                <motion.g
                    initial={{ opacity: animate ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2.6 }}
                >
                    <circle
                        cx={xAt(totalPoints - 1)}
                        cy={yAt(forecast[forecast.length - 1].p)}
                        r="5"
                        fill="var(--bg)"
                        stroke="var(--gold)"
                        strokeWidth="2"
                    />
                    <text
                        x={xAt(totalPoints - 1) - 10}
                        y={yAt(forecast[forecast.length - 1].p) - 14}
                        textAnchor="end"
                        fontSize="11"
                        fill="var(--gold)"
                        fontFamily="var(--font-mono)"
                        fontWeight="500"
                    >
                        ₹2,475.50
                    </text>
                </motion.g>

                {/* Today marker */}
                <circle
                    cx={transitionX}
                    cy={yAt(observed[lastObsIdx])}
                    r="4"
                    fill="var(--brand)"
                />

                {/* Hover crosshair */}
                {hover && (
                    <g>
                        <line
                            x1={hover.x}
                            x2={hover.x}
                            y1={padT}
                            y2={height - padB}
                            stroke="var(--ink)"
                            strokeWidth="1"
                            opacity="0.35"
                        />
                        <circle
                            cx={hover.x}
                            cy={hover.y}
                            r="4"
                            fill={
                                hover.type === "obs"
                                    ? "var(--brand)"
                                    : "var(--gold)"
                            }
                        />
                    </g>
                )}
            </svg>

            {/* Tooltip */}
            {hover && (
                <div
                    className="absolute pointer-events-none px-3 py-2 text-xs font-mono tabular"
                    style={{
                        left: `${(hover.x / width) * 100}%`,
                        top: `${(hover.y / height) * 100}%`,
                        transform: "translate(-50%, calc(-100% - 14px))",
                        background: "var(--ink)",
                        color: "var(--bg)",
                        whiteSpace: "nowrap",
                    }}
                >
                    <div className="opacity-70 mb-0.5" style={{ letterSpacing: "0.06em" }}>
                        {hover.type === "obs" ? "OBSERVED" : "FORECAST"}
                    </div>
                    <div>
                        ₹{Number(hover.v).toLocaleString("en-IN")} /Q
                    </div>
                    {hover.type === "fc" && (
                        <div className="opacity-70 mt-0.5">
                            ± {Math.round((hover.hi - hover.lo) / 2)}
                        </div>
                    )}
                </div>
            )}

            {/* Legend */}
            <div
                className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] tabular"
                style={{ color: "var(--ink-2)", letterSpacing: "0.06em" }}
            >
                <span className="inline-flex items-center gap-2">
                    <span
                        className="inline-block w-6 h-[2px]"
                        style={{ background: "var(--brand)" }}
                    />
                    OBSERVED · LAST 30 DAYS
                </span>
                <span className="inline-flex items-center gap-2">
                    <span
                        className="inline-block w-6 h-[2px]"
                        style={{
                            background:
                                "repeating-linear-gradient(90deg, var(--gold) 0 4px, transparent 4px 8px)",
                        }}
                    />
                    FORECAST · NEXT 14 DAYS
                </span>
                <span className="inline-flex items-center gap-2">
                    <span
                        className="inline-block w-6 h-2"
                        style={{
                            background: "var(--gold)",
                            opacity: 0.22,
                        }}
                    />
                    95% CONFIDENCE BAND (RMSE)
                </span>
            </div>
        </div>
    );
}
