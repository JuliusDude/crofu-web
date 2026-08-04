import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Crofu from "./pages/Crofu";
import Dashboard from "./pages/Dashboard";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [page, setPage] = useState(() => {
    return window.location.hash === "#dashboard" ? "dashboard" : "landing";
  });
  const [isSplashing, setIsSplashing] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hashPage = window.location.hash === "#dashboard" ? "dashboard" : "landing";
      if (hashPage !== page) {
        triggerNavigation(hashPage);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [page]);

  const triggerNavigation = (targetPage) => {
    if (targetPage === "dashboard") {
      setPendingPage("dashboard");
      setIsSplashing(true);
    } else {
      setPage("landing");
      window.location.hash = "#landing";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSplashComplete = () => {
    setIsSplashing(false);
    if (pendingPage) {
      setPage(pendingPage);
      window.location.hash = `#${pendingPage}`;
      setPendingPage(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isSplashing && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {page === "dashboard" ? (
        <Dashboard onNavigate={triggerNavigation} />
      ) : (
        <Crofu onNavigate={triggerNavigation} />
      )}
    </>
  );
}

export default App;
