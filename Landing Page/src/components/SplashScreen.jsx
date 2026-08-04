import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
    "Fetching market data...",
    "Analyzing time-series models...",
    "Preparing your workspace...",
];

export default function SplashScreen({ onComplete }) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isExpanding, setIsExpanding] = useState(false);

    useEffect(() => {
        // Spacious, unhurried 1.4s phrase rotation
        const interval = setInterval(() => {
            setPhraseIndex((prev) => {
                if (prev < PHRASES.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 1400);

        // At 3.4s, initiate the smooth Anthropic zoom transition into Dashboard
        const expandTimer = setTimeout(() => {
            setIsExpanding(true);
        }, 3400);

        // Complete transition at 4.3s
        const completeTimer = setTimeout(() => {
            onComplete && onComplete();
        }, 4300);

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
            transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 select-none overflow-hidden"
            style={{
                background: "var(--bg, #0f1613)",
                color: "var(--ink, #ece7d9)",
            }}
        >
            {/* Soft, Serene Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)] opacity-[0.05] rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-10 text-center max-w-lg">
                {/* Main CroFu Logo - Ultra smooth organic scaling */}
                <motion.div
                    animate={
                        isExpanding
                            ? { scale: 14, opacity: 0 }
                            : { scale: 1, opacity: 1 }
                    }
                    transition={{
                        duration: 1.1,
                        ease: [0.65, 0, 0.35, 1],
                    }}
                    className="origin-center"
                >
                    <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight text-[var(--ink)]">
                        CroFu<span className="text-[var(--gold)]">.</span>
                    </h1>
                </motion.div>

                {/* Anthropic-style Serene Status Text with Silky 0.9s Dissolve */}
                {!isExpanding && (
                    <div className="h-8 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={phraseIndex}
                                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                                animate={{ opacity: 0.85, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                                transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                                className="font-mono text-xs text-[var(--ink-2)] tracking-widest font-normal"
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
