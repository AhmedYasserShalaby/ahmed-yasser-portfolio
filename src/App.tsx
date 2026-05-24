import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { SiteHeader } from "./components/SiteHeader";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";


function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.15);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.15);

      if (dotRef.current) {
        dotRef.current.style.left = `${currentPos.current.x}px`;
        dotRef.current.style.top = `${currentPos.current.y}px`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="custom-cursor-dot"
      style={{
        position: "fixed",
        left: -200,
        top: -200,
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)"
      }}
    />
  );
}

gsap.registerPlugin(ScrollTrigger);

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
const sectionIds = ["hey", "about", "work", "contact"];

function ScrollManager() {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  const getScrollPosition = useCallback(() => (lenisRef.current ? lenisRef.current.scroll : window.scrollY), []);

  const getSectionFromScroll = useCallback(() => {
    const scrollY = getScrollPosition() + window.innerHeight / 3;
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const el = document.getElementById(sectionIds[i]);
      if (el && el.offsetTop <= scrollY) {
        return sectionIds[i];
      }
    }
    return sectionIds[0];
  }, [getScrollPosition]);

  useScrollReveal(`${location.pathname}${location.hash}`);

  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  useLayoutEffect(() => {
    if (location.pathname === "/") {
      const restored = sessionStorage.getItem("scroll:home");
      const storedHash = sessionStorage.getItem("scroll:home-hash");

      if (location.hash) {
        if (restored && storedHash === location.hash) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(Number(restored), { immediate: true });
          } else {
            window.scrollTo({ top: Number(restored), left: 0, behavior: "instant" as ScrollBehavior });
          }
          sessionStorage.removeItem("scroll:home");
          sessionStorage.removeItem("scroll:home-hash");
          return;
        }

        if (restored || storedHash) {
          sessionStorage.removeItem("scroll:home");
          sessionStorage.removeItem("scroll:home-hash");
        }
      } else if (restored) {
        if (storedHash) {
          const nextUrl = `${window.location.pathname}${storedHash}`;
          window.history.replaceState(window.history.state, "", nextUrl);
        }
        if (lenisRef.current) {
          lenisRef.current.scrollTo(Number(restored), { immediate: true });
        } else {
          window.scrollTo({ top: Number(restored), left: 0, behavior: "instant" as ScrollBehavior });
        }
        sessionStorage.removeItem("scroll:home");
        sessionStorage.removeItem("scroll:home-hash");
        return;
      }
    }

    if (location.hash) {
      const id = window.decodeURIComponent(location.hash.slice(1));
      let attempts = 0;
      let timeoutId: number | null = null;

      const scrollToHashTarget = () => {
        const target = document.getElementById(id);

        if (target) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(target, { immediate: true });
          } else {
            target.scrollIntoView({ block: "start" });
          }
          return;
        }

        if (attempts < 8) {
          attempts += 1;
          timeoutId = window.setTimeout(scrollToHashTarget, 40);
        }
      };

      timeoutId = window.setTimeout(scrollToHashTarget, 30);
      return () => {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    // Reset any transition animation leftovers when routes change.
    const header = document.querySelector(".site-header") as HTMLElement | null;
    if (header) {
      gsap.set(header, { clearProps: "opacity,visibility,transform" });
    }

    const dataField = document.querySelector(".data-field") as HTMLElement | null;
    if (dataField) {
      gsap.set(dataField, { clearProps: "opacity,visibility,transform" });
    }

    const sectionHeadings = document.querySelectorAll(".section-heading");
    if (sectionHeadings.length) {
      gsap.set(sectionHeadings, { clearProps: "opacity,visibility,transform" });
    }

    const workList = document.querySelector(".work-list") as HTMLElement | null;
    if (workList) {
      gsap.set(workList, { clearProps: "opacity,visibility,transform" });
    }

    if (location.pathname.startsWith("/projects/")) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
      return;
    }

    if (location.pathname !== "/" || location.hash) {
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    return () => {
      if (location.pathname === "/") {
        sessionStorage.setItem("scroll:home", String(getScrollPosition()));
        const currentHash = window.location.hash;
        const nextHash = currentHash || `#${getSectionFromScroll()}`;
        sessionStorage.setItem("scroll:home-hash", nextHash);
      }
    };
  }, [location.pathname, getScrollPosition, getSectionFromScroll]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<Navigate to={{ pathname: "/", hash: "#work" }} replace />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/projects.html" element={<Navigate to={{ pathname: "/", hash: "#work" }} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <CustomCursor />
      <BackgroundEffects />
      <AppRoutes />
    </BrowserRouter>
  );
}
