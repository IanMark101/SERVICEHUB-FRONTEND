"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParticleInstance {
  pJS: {
    canvas: { el: HTMLCanvasElement; pxratio: number };
    particles: { array: unknown[] };
    interactivity: { mouse: { pos_x: number | null; pos_y: number | null }; status: string };
    fn: { drawAnimFrame?: number; checkAnimFrame?: number; modes: { pushParticles: (count: number, position: { pos_x: number; pos_y: number }) => void } };
    tmp: { checkAnimFrame?: number };
  };
}
interface ParticleWindow extends Window {
  particlesJS?: (id: string, config: Record<string, unknown>) => void;
  pJSDom?: ParticleInstance[];
}
let runtimeLoading: Promise<void> | undefined;

function loadRuntime() {
  const runtime = window as ParticleWindow;
  if (runtime.particlesJS) return Promise.resolve();
  if (!runtimeLoading) {
    runtimeLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/vendor/particles.js/particles.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        runtimeLoading = undefined;
        reject(new Error("Particle background runtime unavailable"));
      };
      document.head.appendChild(script);
    });
  }
  return runtimeLoading;
}

export interface ParticlesComponentProps {
  isDark?: boolean;
  variant?: "blue" | "brand";
  className?: string;
}

/** Adapted from the installed 21st.dev component; runtime MIT license in public/vendor. */
export default function ParticlesComponent({ isDark, variant = "blue", className }: ParticlesComponentProps) {
  const reactId = useId();
  const id = `particles-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const runtime = window as ParticleWindow;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const surface = host.parentElement ?? host;
    let disposed = false;
    let ready = false;
    let inView = true;
    let instance: ParticleInstance | undefined;
    let resizeFrame = 0;
    let dimensions = "";
    let dark = isDark ?? (html.classList.contains("dark") || html.dataset.theme === "dark");

    const destroy = () => {
      if (!instance) return;
      for (const frame of [instance.pJS.fn.drawAnimFrame, instance.pJS.fn.checkAnimFrame, instance.pJS.tmp.checkAnimFrame]) {
        if (frame !== undefined) window.cancelAnimationFrame(frame);
      }
      instance.pJS.canvas.el.remove();
      runtime.pJSDom = runtime.pJSDom?.filter((entry) => entry !== instance);
      instance = undefined;
    };

    const initParticles = () => {
      destroy();
      if (disposed || !ready || !inView || document.hidden || !host.clientWidth || !host.clientHeight) return;
      const mobile = host.clientWidth < 768;
      const animate = !motion.matches;
      // Canvas libraries need resolved color values, rather than CSS var() strings.
      const themeColors = getComputedStyle(host);
      const brand = themeColors.getPropertyValue('--color-brand').trim();
      const brandOnDark = themeColors.getPropertyValue('--color-brand-on-dark').trim();
      const colors = variant === "brand"
        ? { particles: dark ? brandOnDark : brand, lines: dark ? brandOnDark : brand, accent: themeColors.getPropertyValue('--color-orange-400').trim() }
        : dark
          ? { particles: "#00f5ff", lines: "#00d9ff", accent: "#0096c7" }
          : { particles: "#0277bd", lines: "#0288d1", accent: "#039be5" };

      runtime.particlesJS?.(id, {
        particles: {
          number: { value: variant === "brand" ? (mobile ? 40 : 80) : 140, density: { enable: true, value_area: 800 } },
          color: { value: colors.particles },
          shape: { type: "circle", stroke: { width: 0.5, color: colors.accent } },
          opacity: { value: variant === "brand" ? 0.35 : 0.7, random: true, anim: { enable: animate, speed: 1, opacity_min: 0.1 } },
          size: { value: variant === "brand" ? 2.5 : 3, random: true, anim: { enable: animate, speed: 2, size_min: 1 } },
          line_linked: { enable: true, distance: 160, color: colors.lines, opacity: variant === "brand" ? 0.13 : 0.4, width: 1 },
          move: { enable: animate, speed: variant === "brand" ? 0.6 : 2, random: true, out_mode: "bounce" },
        },
        // Surface listeners below feed canvas-local coordinates without blocking controls.
        // ResizeObserver replaces the library's unremovable window resize listener.
        interactivity: {
          detect_on: "canvas",
          events: { onhover: { enable: animate, mode: "grab" }, onclick: { enable: animate, mode: "push" }, resize: false },
          modes: { grab: { distance: 220, line_linked: { opacity: 0.8 } }, push: { particles_nb: 4 } },
        },
        retina_detect: true,
      });
      instance = runtime.pJSDom?.find((entry) => entry.pJS.canvas.el.parentElement === host);
    };

    const pointAt = (event: MouseEvent) => {
      if (!instance || motion.matches) return;
      const bounds = host.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || y < 0 || x > host.clientWidth || y > host.clientHeight) return;
      const point = { pos_x: x * instance.pJS.canvas.pxratio, pos_y: y * instance.pJS.canvas.pxratio };
      Object.assign(instance.pJS.interactivity.mouse, point);
      instance.pJS.interactivity.status = "mousemove";
      return point;
    };
    const leave = () => {
      if (!instance) return;
      Object.assign(instance.pJS.interactivity.mouse, { pos_x: null, pos_y: null });
      instance.pJS.interactivity.status = "mouseleave";
    };
    const push = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea, label, summary, [role="button"]')) return;
      const point = pointAt(event);
      if (!point || !instance) return;
      // Bound repeated clicks so the decorative effect cannot grow indefinitely.
      const count = Math.min(4, Math.max(0, 240 - instance.pJS.particles.array.length));
      if (count) instance.pJS.fn.modes.pushParticles(count, point);
    };
    surface.addEventListener("mousemove", pointAt, { passive: true });
    surface.addEventListener("mouseleave", leave);
    surface.addEventListener("click", push);

    const resize = new ResizeObserver(() => {
      const nextDimensions = `${host.clientWidth}:${host.clientHeight}`;
      if (nextDimensions === dimensions) return;
      dimensions = nextDimensions;
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(initParticles);
    });
    resize.observe(host);
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry || inView === entry.isIntersecting) return;
      inView = entry.isIntersecting;
      initParticles();
    });
    visibility.observe(host);
    const theme = new MutationObserver(() => {
      const nextDark = html.classList.contains("dark") || html.dataset.theme === "dark";
      if (dark === nextDark) return;
      dark = nextDark;
      initParticles();
    });
    if (isDark === undefined) theme.observe(html, { attributes: true, attributeFilter: ["class", "data-theme"] });
    motion.addEventListener("change", initParticles);
    document.addEventListener("visibilitychange", initParticles);
    void loadRuntime().then(() => {
      if (disposed) return;
      ready = true;
      initParticles();
    }).catch(() => { /* Failed decoration leaves all landing content usable. */ });

    return () => {
      disposed = true;
      resize.disconnect();
      visibility.disconnect();
      theme.disconnect();
      motion.removeEventListener("change", initParticles);
      document.removeEventListener("visibilitychange", initParticles);
      window.cancelAnimationFrame(resizeFrame);
      surface.removeEventListener("mousemove", pointAt);
      surface.removeEventListener("mouseleave", leave);
      surface.removeEventListener("click", push);
      destroy();
    };
  }, [id, isDark, variant]);

  return <div ref={hostRef} id={id} aria-hidden="true" data-particles-background={variant} className={cn(
    "pointer-events-none absolute inset-0 h-full w-full overflow-hidden [&_canvas]:block",
    variant === "blue" && "bg-gradient-to-tr from-[#e3f2fd] via-[#90caf9] to-[#64b5f6] dark:from-[#000814] dark:via-[#003566] dark:to-[#0077b6]",
    className,
  )} />;
}
