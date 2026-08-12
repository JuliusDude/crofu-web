import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Crofu from "./pages/Crofu";
import Dashboard from "./pages/Dashboard";
import ErrorScreen from "./pages/ErrorScreen";
import SplashScreen from "./components/SplashScreen";

function resolveRouteInfo() {
  const pathname = window.location.pathname;
  const hash = window.location.hash;

  // Registered valid root paths
  const isRoot = pathname === "/" || pathname === "/index.html" || pathname.toLowerCase() === "/landing";

  if (!isRoot) {
    // ANY route searched in the URL path (e.g. /price, /about, /contact, /billing, etc.)
    return { page: "error", path: window.location.pathname };
  }

  // Registered hash routes
  const cleanHash = hash.toLowerCase();
  if (cleanHash === "#dashboard" || cleanHash === "#/dashboard") {
    return { page: "dashboard", path: "/dashboard" };
  }

  const validHashes = [
    "",
    "#",
    "#top",
    "#landing",
    "#coverage",
    "#pipeline",
    "#accuracy",
    "#api",
    "#app"
  ];

  if (cleanHash && !validHashes.includes(cleanHash)) {
    // ANY unknown hash searched in the URL (e.g. #price, #pricing, #/xyz)
    const displayPath = cleanHash.startsWith("#/")
      ? cleanHash.replace("#", "")
      : "/" + cleanHash.replace("#", "");
    return { page: "error", path: displayPath };
  }

  return { page: "landing", path: "/" };
}

function App() {
  const [routeInfo, setRouteInfo] = useState(() => resolveRouteInfo());
  const [isInitialSplash, setIsInitialSplash] = useState(true);
  const [isSplashing, setIsSplashing] = useState(false);

  useEffect(() => {
    const handleUrlChange = () => {
      if (isSplashing || isInitialSplash) return;
      const current = resolveRouteInfo();
      if (current.page !== routeInfo.page || current.path !== routeInfo.path) {
        if (current.page === "dashboard") {
          setIsSplashing(true);
        } else {
          setRouteInfo(current);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);
    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [routeInfo, isSplashing, isInitialSplash]);

  const triggerNavigation = (targetPage) => {
    if (isSplashing) return;

    if (targetPage === "dashboard") {
      window.history.pushState({}, "", "/#dashboard");
      window.location.hash = "#dashboard";
      setIsSplashing(true);
    } else if (targetPage === "landing") {
      window.history.pushState({}, "", "/");
      window.location.hash = "";
      setRouteInfo({ page: "landing", path: "/" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (targetPage === "price" || targetPage === "error") {
      window.history.pushState({}, "", "/price");
      setRouteInfo({ page: "error", path: "/price" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const cleanPath = targetPage.startsWith("/") ? targetPage : "/" + targetPage;
      window.history.pushState({}, "", cleanPath);
      setRouteInfo({ page: "error", path: cleanPath });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrepareUnderneath = useCallback(() => {
    setRouteInfo(prev => {
      if (prev.page === "dashboard") return prev;
      return { page: "dashboard", path: "/dashboard" };
    });
  }, []);

  const handleSplashComplete = useCallback(() => {
    setIsSplashing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleInitialSplashComplete = useCallback(() => {
    setIsInitialSplash(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg,#0f1613)]">
      {/* Active Page Component - Pre-rendered underneath splash overlay */}
      <AnimatePresence>
        {routeInfo.page === "dashboard" ? (
          <Dashboard key="dashboard" onNavigate={triggerNavigation} />
        ) : routeInfo.page === "error" ? (
          <ErrorScreen
            key="error-screen"
            requestedPath={routeInfo.path || "/price"}
            onNavigate={triggerNavigation}
          />
        ) : (
          <Crofu key="landing" onNavigate={triggerNavigation} />
        )}
      </AnimatePresence>

      {/* Splash Overlays - Layered on top at 100% initial opacity */}
      <AnimatePresence>
        {isInitialSplash && (
          <SplashScreen
            key="initial-splash"
            showText={false}
            onComplete={handleInitialSplashComplete}
          />
        )}
        {isSplashing && (
          <SplashScreen
            key="dashboard-splash"
            showText={true}
            onPrepareUnderneath={handlePrepareUnderneath}
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
