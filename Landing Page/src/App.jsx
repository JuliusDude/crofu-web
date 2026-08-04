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
      // Guard against hashchange triggering duplicate splash screens
      if (isSplashing || isInitialSplash) return;
      const target = window.location.hash === "#dashboard" ? "dashboard" : "landing";
      if (target !== page) {
        if (target === "dashboard") {
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
      setIsSplashing(true);
    } else {
      window.location.hash = "#landing";
      setPage("landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSplashComplete = () => {
    setPage("dashboard");
    setIsSplashing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence mode="wait">
      {isInitialSplash ? (
        <SplashScreen
          key="initial-splash"
          showText={false}
          onComplete={() => setIsInitialSplash(false)}
        />
      ) : isSplashing ? (
        <SplashScreen
          key="dashboard-splash"
          showText={true}
          onComplete={handleSplashComplete}
        />
      ) : page === "dashboard" ? (
        <Dashboard key="dashboard" onNavigate={triggerNavigation} />
      ) : (
        <Crofu key="landing" onNavigate={triggerNavigation} />
      )}
    </AnimatePresence>
  );
}

export default App;
