import { useEffect } from "react";
import Lenis from "lenis";

export function useLenis() {
    useEffect(() => {
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (reduced) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
        });

        window.lenis = lenis;

        let raf;
        function loop(time) {
            lenis.raf(time);
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
            window.lenis = null;
        };
    }, []);
}

export function scrollToSection(e, targetId) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    if (window.lenis) {
        window.lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
    } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
    }
}

export function useTheme() {
    useEffect(() => {
        const stored = localStorage.getItem("crofu-theme");
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const initial = stored || (prefersDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", initial === "dark");
    }, []);
}

export function toggleTheme() {
    const el = document.documentElement;
    const next = el.classList.contains("dark") ? "light" : "dark";
    el.classList.toggle("dark", next === "dark");
    localStorage.setItem("crofu-theme", next);
}
