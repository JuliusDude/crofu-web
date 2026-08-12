import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// Touch-aware & Mouse Magnetic Physics Component
function MagneticWrapper({ children, className = "", strength = 30 }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect if device supports coarse touch (mobiles/tablets)
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (clientX - centerX) / (width / 2);
    const distanceY = (clientY - centerY) / (height / 2);

    setPosition({
      x: distanceX * strength,
      y: distanceY * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.12 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ErrorScreen({ requestedPath = "/price", onNavigate }) {
  const displayPath = requestedPath || "/price";

  return (
    <div
      className="h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-full overflow-hidden flex flex-col justify-between relative font-sans select-none px-4 sm:px-6 md:px-12"
      style={{
        backgroundColor: "var(--bg, #0f1613)",
        color: "var(--ink, #ece7d9)"
      }}
      data-testid="error-screen-container"
    >
      {/* Ambient Breathing Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] sm:w-[36rem] h-[22rem] sm:h-[36rem] rounded-full blur-[90px] sm:blur-[120px]"
          style={{ background: "var(--gold, #e0ac4c)" }}
        />
      </div>

      {/* Top Header - Logo Only */}
      <header className="relative z-20 w-full max-w-7xl mx-auto pt-5 sm:pt-8 flex items-center justify-start">
        <button
          onClick={() => onNavigate && onNavigate("landing")}
          className="font-serif text-xl sm:text-3xl tracking-tight font-bold hover:opacity-80 transition-opacity cursor-pointer touch-manipulation"
          style={{ color: "var(--ink, #ece7d9)" }}
          data-testid="error-brand-logo"
        >
          CroFu<span style={{ color: "var(--gold, #e0ac4c)" }}>.</span>
        </button>
      </header>

      {/* Centered Hero Content - Mobile Optimized 1-Viewport Layout */}
      <main className="relative z-20 max-w-2xl w-full mx-auto text-center my-auto flex flex-col items-center justify-center gap-4 sm:gap-8 py-2">
        
        {/* 404 Code with Responsive Scaling + Magnetic Physics */}
        <div className="relative inline-flex items-center justify-center gap-1 sm:gap-3 max-w-full select-none" data-testid="error-code-404">
          
          {/* Digit '4' - First */}
          <MagneticWrapper strength={25}>
            <motion.span
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.05, 1],
                rotate: [0, -2, 0],
                filter: [
                  "drop-shadow(0 0 15px rgba(224,172,76,0.3))",
                  "drop-shadow(0 0 35px rgba(224,172,76,0.7))",
                  "drop-shadow(0 0 15px rgba(224,172,76,0.3))"
                ]
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-[20vw] min-[420px]:text-[90px] sm:text-[160px] md:text-[190px] font-serif font-black tracking-tighter leading-none bg-gradient-to-b from-[#fcd34d] via-[#e0ac4c] to-[#b8872e] bg-clip-text text-transparent inline-block cursor-grab active:cursor-grabbing"
            >
              4
            </motion.span>
          </MagneticWrapper>

          {/* Digit '0' - Middle */}
          <MagneticWrapper strength={35}>
            <motion.span
              animate={{
                y: [0, 8, 0],
                scale: [1.03, 0.95, 1.03],
                rotate: [0, 3, 0],
                filter: [
                  "drop-shadow(0 0 20px rgba(224,172,76,0.4))",
                  "drop-shadow(0 0 40px rgba(255,215,0,0.8))",
                  "drop-shadow(0 0 20px rgba(224,172,76,0.4))"
                ]
              }}
              transition={{
                duration: 4.2,
                delay: 0.4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-[20vw] min-[420px]:text-[90px] sm:text-[160px] md:text-[190px] font-serif font-black tracking-tighter leading-none bg-gradient-to-b from-[#ffe082] via-[#e0ac4c] to-[#996d1b] bg-clip-text text-transparent inline-block cursor-grab active:cursor-grabbing"
            >
              0
            </motion.span>
          </MagneticWrapper>

          {/* Digit '4' - Last */}
          <MagneticWrapper strength={25}>
            <motion.span
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.06, 1],
                rotate: [0, -1.5, 0],
                filter: [
                  "drop-shadow(0 0 15px rgba(224,172,76,0.3))",
                  "drop-shadow(0 0 35px rgba(224,172,76,0.7))",
                  "drop-shadow(0 0 15px rgba(224,172,76,0.3))"
                ]
              }}
              transition={{
                duration: 3.8,
                delay: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-[20vw] min-[420px]:text-[90px] sm:text-[160px] md:text-[190px] font-serif font-black tracking-tighter leading-none bg-gradient-to-b from-[#fcd34d] via-[#e0ac4c] to-[#b8872e] bg-clip-text text-transparent inline-block cursor-grab active:cursor-grabbing"
            >
              4
            </motion.span>
          </MagneticWrapper>
        </div>

        {/* Title & Description with Mobile Text Wrap */}
        <div className="space-y-2 sm:space-y-3 px-2">
          <h2
            className="text-2xl min-[420px]:text-3xl sm:text-5xl font-serif font-bold tracking-tight"
            style={{ color: "var(--ink, #ece7d9)" }}
          >
            Page Not Found
          </h2>
          <p
            className="text-xs min-[420px]:text-sm sm:text-lg max-w-lg mx-auto leading-relaxed opacity-90 break-words"
            style={{ color: "var(--ink-2, #93a090)" }}
          >
            The route <code className="break-all px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm border" style={{ backgroundColor: "rgba(23, 31, 26, 0.8)", borderColor: "var(--border, #2a342d)", color: "var(--gold, #e0ac4c)" }}>{displayPath}</code> does not exist.
          </p>
        </div>

        {/* Action Button: Return Home Only */}
        <div className="pt-2 w-full sm:w-auto flex justify-center">
          <MagneticWrapper strength={20}>
            <button
              onClick={() => onNavigate && onNavigate("landing")}
              className="w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer touch-manipulation"
              style={{
                backgroundColor: "var(--brand, #3e8b63)",
                color: "#ffffff"
              }}
              data-testid="return-home-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Return Home
            </button>
          </MagneticWrapper>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer
        className="relative z-20 w-full max-w-7xl mx-auto pb-4 text-center text-[10px] sm:text-xs font-mono opacity-40"
        style={{ color: "var(--ink-2, #93a090)" }}
      >
        <span>CroFu AI Telemetry • HTTP 404</span>
      </footer>
    </div>
  );
}
