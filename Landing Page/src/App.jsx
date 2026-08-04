import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Crofu from "./pages/Crofu";
import Dashboard from "./pages/Dashboard";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [page, setPage] = useState(() => {
    return window.location.hash === "#dashboard" ? "dashboard" : "landing";
  });
  const [isInitialSplash, setIsInitialSplash] = useState(true);
  const [isSplashing, setIsSplashing] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (isSplashing || isInitialSplash) return;
      const target = window.location.hash === "#dashboard" ? "dashboard" : "landing";
      if (target !== page) {
        if (target === "dashboard") {
          setPage("dashboard");
          setIsSplashing(true);
        } else {
          setPage("landing");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [page, isSplashing, isInitialSplash]);

  const triggerNavigation = (targetPage) => {
    if (isSplashing) return;
    if (targetPage === "dashboard") {
      window.location.hash = "#dashboard";
      setPage("dashboard"); // Switch page IMMEDIATELY under the splash cover
      setIsSplashing(true);
    } else {
      window.location.hash = "#landing";
      setPage("landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSplashComplete = () => {
    setIsSplashing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg,#0f1613)]">
      {/* Active Page Component - Pre-rendered underneath splash overlay for seamless reveal */}
      <AnimatePresence mode="popLayout">
        {page === "dashboard" ? (
          <Dashboard key="dashboard" onNavigate={triggerNavigation} />
        ) : (
          <Crofu key="landing" onNavigate={triggerNavigation} />
        )}
      </AnimatePresence>

      {/* Splash Overlays - Layered on top with z-index: 100 */}
      <AnimatePresence>
        {isInitialSplash && (
          <SplashScreen
            key="initial-splash"
            showText={false}
            onComplete={() => setIsInitialSplash(false)}
          />
        )}
        {isSplashing && (
          <SplashScreen
            key="dashboard-splash"
            showText={true}
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
