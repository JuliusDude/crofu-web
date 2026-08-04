import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("FETCHING MARKET DATA...");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.floor(Math.random() * 8) + 5;
                if (next >= 25 && next < 55) {
                    setStatusText("RUNNING TIME-SERIES FORECAST ENGINE...");
                } else if (next >= 55 && next < 78) {
                    setStatusText("SYNCING WHOLESALE MANDI ARRIVALS...");
                } else if (next >= 78) {
                    setStatusText("COMPILING NEURAL PREDICTIONS...");
                }
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete && onComplete();
                    }, 400);
                    return 100;
                }
                return next;
            });
        }, 80);

        return () => clearInterval(interval);
    }, [onComplete]);

    // Calculate scale factor as progress nears 100%
    // At 0-45%: scale = 1.0
    // At 45-80%: scale increases 1.0 -> 2.2
    // At 80-100%: scale zooms exponentially 2.2 -> 9.0 to transition to dashboard
    const logoScale =
        progress < 45
            ? 1.0
            : progress < 80
            ? 1.0 + ((progress - 45) / 35) * 1.2
            : 2.2 + Math.pow((progress - 80) / 20, 2) * 7.0;

    const logoOpacity = progress > 94 ? (100 - progress) / 6 : 1.0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 96 ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 select-none font-mono overflow-hidden"
            style={{
                background: "var(--bg, #0f1613)",
                color: "var(--ink, #ece7d9)",
            }}
        >
            {/* Background Ambient Radial Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[var(--gold)] opacity-[0.08] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--brand)] opacity-[0.15] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-10 text-center">
                {/* Main CroFu Logo - Grows LARGER and LARGER near the end */}
                <motion.div
                    style={{
                        scale: logoScale,
                        opacity: logoOpacity,
                    }}
                    className="origin-center transition-transform ease-out"
                >
                    <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight text-[var(--ink)] drop-shadow-2xl">
                        CroFu<span className="text-[var(--gold)]">.</span>
                    </h1>
                </motion.div>

                {/* Minimalist Pulsing Dynamic Telemetry Text (No logo icon, no cards, no boxes!) */}
                {progress < 85 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 flex flex-col items-center"
                    >
                        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[var(--gold)] font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
                            <span>{statusText}</span>
                        </div>

                        {/* Minimalist Thin 2px Line Progress Indicator */}
                        <div
                            className="w-48 h-[2px] overflow-hidden rounded-full relative"
                            style={{ background: "var(--border)" }}
                        >
                            <motion.div
                                className="h-full bg-gradient-to-r from-[var(--positive)] to-[var(--gold)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="text-[10px] tracking-widest text-[var(--ink-2)] font-mono opacity-80">
                            {progress}%
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
