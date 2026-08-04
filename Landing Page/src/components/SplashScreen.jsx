import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, CheckCircle2, Zap } from "lucide-react";

export default function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Initializing Agmarknet Mandi Data Pipeline...");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.floor(Math.random() * 12) + 8;
                if (next >= 30 && next < 65) {
                    setStatusText("Loading XGBoost V3 Time-Series Neural Weights...");
                } else if (next >= 65 && next < 95) {
                    setStatusText("Syncing Real-Time Market Volatility & Price Signals...");
                } else if (next >= 95) {
                    setStatusText("Engine Loaded. Launching Desktop Analytics...");
                }
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete && onComplete();
                    }, 300);
                    return 100;
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.15, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 select-none font-mono text-xs overflow-hidden"
            style={{
                background: "var(--bg, #0f1613)",
                color: "var(--ink, #ece7d9)",
            }}
        >
            {/* Background Ambient Radial Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)] opacity-[0.06] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--brand)] opacity-[0.12] rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-md w-full space-y-8 text-center flex flex-col items-center">
                {/* Brand Logo & Pulsing Icon Ring */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--gold)] opacity-40 absolute"
                    />
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shadow-2xl"
                    >
                        <Activity className="w-9 h-9 text-[var(--gold)]" />
                    </motion.div>
                </div>

                {/* Main Headline */}
                <div className="space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="font-serif text-4xl font-bold tracking-tight"
                    >
                        CroFu<span className="text-[var(--gold)]">.</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[11px] uppercase tracking-widest text-[var(--ink-2)]"
                    >
                        Neural Agricultural Price Forecasting Engine
                    </motion.div>
                </div>

                {/* Status Telemetry Box */}
                <div className="w-full space-y-3 p-4 border rounded bg-[var(--surface)] shadow-lg" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--ink-2)] flex items-center gap-1.5">
                            <Cpu size={13} className="text-[var(--gold)] animate-pulse" />
                            <span>System Pipeline Status</span>
                        </span>
                        <span className="font-bold text-[var(--gold)]">{progress}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-1.5 border rounded-full overflow-hidden p-0.5" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] via-[var(--positive)] to-[var(--gold)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut", duration: 0.2 }}
                        />
                    </div>

                    {/* Dynamic Step Label */}
                    <div className="flex items-center justify-between text-[10px] text-[var(--ink-2)] pt-1">
                        <span className="truncate pr-2">{statusText}</span>
                        {progress >= 100 ? (
                            <span className="text-[var(--positive)] font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> READY
                            </span>
                        ) : (
                            <Zap size={12} className="text-[var(--gold)] animate-bounce" />
                        )}
                    </div>
                </div>

                {/* Footer Telemetry Stamp */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-[9px] uppercase tracking-widest text-[var(--ink-2)] opacity-60 space-x-3"
                >
                    <span>[AGMARKNET: SYNCED]</span>
                    <span>[MODEL: XGBOOST-V3]</span>
                    <span>[LATENCY: 8ms]</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
