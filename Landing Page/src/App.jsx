import React, { useState, useEffect } from "react";
import Crofu from "./pages/Crofu";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState(() => {
    return window.location.hash === "#dashboard" ? "dashboard" : "landing";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#dashboard") {
        setPage("dashboard");
      } else if (
        window.location.hash === "#landing" ||
        window.location.hash === "" ||
        window.location.hash === "#top"
      ) {
        setPage("landing");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (targetPage) => {
    setPage(targetPage);
    if (targetPage === "dashboard") {
      window.location.hash = "#dashboard";
    } else {
      window.location.hash = "#landing";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {page === "dashboard" ? (
        <Dashboard onNavigate={navigateTo} />
      ) : (
        <Crofu onNavigate={navigateTo} />
      )}
    </>
  );
}

export default App;
