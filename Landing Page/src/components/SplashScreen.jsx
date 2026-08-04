import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
    "Fetching market data...",
    "Analyzing time-series models...",
    "Syncing wholesale arrivals...",
    "Preparing your workspace...",
];

export default function SplashScreen({ onComplete }) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isExpanding, setIsExpanding] = useState(false);

    useEffect(() => {
        // Serene, unhurried phrase rotation
        const interval = setInterval(() => {
            setPhraseIndex((prev) => {
                if (prev < PHRASES.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 650);

        // At 2.2s, initiate the smooth Anthropic zoom transition into Dashboard
        const expandTimer = setTimeout(() => {
            setIsExpanding(true);
        }, 2200);

        // Complete transition at 2.9s
        const completeTimer = setTimeout(() => {
            onComplete && onComplete();
        }, 2900);

        return () => {
            clearInterval(interval);
            clearTimeout(expandTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanding ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 select-none overflow-hidden"
            style={{
                background: "var(--bg, #0f1613)",
                color: "var(--ink, #ece7d9)",
            }}
        >
            {/* Soft, Serene Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)] opacity-[0.05] rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 text-center max-w-lg">
                {/* Main CroFu Logo - Anthropic-style smooth organic scaling */}
                <motion.div
                    animate={
                        isExpanding
                            ? { scale: 12, opacity: 0 }
                            : { scale: 1, opacity: 1 }
                    }
                    transition={{
                        duration: 0.85,
                        ease: [0.65, 0, 0.35, 1],
                    }}
                    className="origin-center"
                >
                    <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight text-[var(--ink)]">
                        CroFu<span className="text-[var(--gold)]">.</span>
                    </h1>
                </motion.div>

                {/* Anthropic-style Serene Status Text (No bars, no numbers) */}
                {!isExpanding && (
                    <div className="h-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={phraseIndex}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 0.85, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                className="font-mono text-xs text-[var(--ink-2)] tracking-wide font-normal"
                            >
                                {PHRASES[phraseIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
