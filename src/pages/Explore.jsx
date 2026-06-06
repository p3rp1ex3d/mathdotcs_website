import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  FlaskConical,
  FolderLock,
  Map as MapIcon,
  Compass,
  Lamp,
  Sparkles,
  Eye,
} from "lucide-react";
import { PageWrapper } from "../components/PageWrapper";

const locations= [
  { title: "The Ink District",  subtitle: "Interactive Cyber Comic", icon: BookOpen,     href: "https://comic.mathdotcs.com",   x: 22, y: 28, hint: "Where panels bleed into reality." },
  { title: "Arcade Ruins",      subtitle: "3JS Cyber Game",          icon: Gamepad2,     href: "https://game.mathdotcs.com",    x: 74, y: 38, hint: "Cabinets still humming after the blackout." },
  { title: "Cipher Forest",     subtitle: "Puzzle Trails",           icon: MapIcon,      href: "https://puzzles.mathdotcs.com", x: 36, y: 68, hint: "Trees grow in prime-number spirals." },
  { title: "Forbidden Vault",   subtitle: "ARG + Hidden Files",      icon: FolderLock,   href: "https://vault.mathdotcs.com",   x: 78, y: 74, hint: "Knock three times. Then once more." },
  { title: "Experiment Valley", subtitle: "Visual Labs",             icon: FlaskConical, href: "https://labs.mathdotcs.com",    x: 54, y: 52, hint: "Beakers of light, equations as weather." },
  { title: "The Margin",        subtitle: "??? — proof not yet found", icon: Sparkles,    href: "https://margin.mathdotcs.com",  x: 12, y: 86, hint: "Fermat slept here.", secret: true },
];

export default function Explore() {
    const [hovered, setHovered] = useState(null);
  const [visited, setVisited] = useState(new Set());
  const [night, setNight] = useState(false);
  const [bursts, setBursts] = useState([]);
  const mapRef = useRef(null);
  // Cursor-tracking lantern + parallax tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-4, 4]), { stiffness: 120, damping: 18 });
  const lanternX = useTransform(mx, (v) => `${v * 100}%`);
  const lanternY = useTransform(my, (v) => `${v * 100}%`);

  // Persist discoveries across reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mathcs.visited");
      if (raw) setVisited(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("mathcs.visited", JSON.stringify([...visited])); } catch {}
  }, [visited]);

  // Keyboard shortcuts: 1–6 highlight, L toggles lantern
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "l") setNight((n) => !n);
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= locations.length) {
        const idx = n - 1;
        if (locations[idx].secret && visited.size < 5) return;
        setHovered(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visited]);

  const handleMove = (e) => {
    const r = mapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const splat = (e) => {
    const r = mapRef.current?.getBoundingClientRect();
    if (!r) return;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
  };

  const visit = (i) => setVisited((s) => new Set(s).add(i));
  const discoveries = useMemo(() => `${visited.size} / ${locations.length - 1}`, [visited]);
  const showSecret = visited.size >= 5;

  return (
    <PageWrapper testId="explore-page">
      {/* HEADER */}
      <header className="mb-8 relative z-20 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
            Page 03 — Hidden Atlas
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold mt-1" style={{ fontFamily: "Patrick Hand, cursive" }}>
            <span className="hand-underline">Explore</span>
          </h1>
          <p className="text-base mt-4 text-[hsl(var(--ink-soft))] max-w-2xl" style={{ fontFamily: "Comic Neue, sans-serif" }}>
            Tucked between the notebook pages lies an old hand-drawn atlas — drag the compass, light the lantern
            (<kbd className="px-1 border rounded">L</kbd>), and press <kbd className="px-1 border rounded">1–5</kbd> to fly between markers.
          </p>
        </div>

        {/* HUD */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNight((n) => !n)}
            className="flex items-center gap-2 px-3 py-2 border-2 border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[3px_3px_0_hsl(var(--ink))] hover:translate-y-[-2px] transition"
            style={{ fontFamily: "Patrick Hand, cursive", borderRadius: "12px 16px 10px 14px" }}
          >
            <Lamp size={18} /> {night ? "Daybreak" : "Lantern  Mode"}
          </button>

          <div
            className="px-4 py-2 border-2 border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[3px_3px_0_hsl(var(--ink))]"
            style={{
              fontFamily: "Patrick Hand, cursive",
              borderRadius: "12px 16px 10px 14px",
            }}
          >
            <span className="flex items-center gap-2">
              <Eye size={16} />
              Discoveries: {discoveries}
            </span>
          </div>
        </div>
      </header>

      {/* NOTEBOOK PAGE */}
      <section
        className="
          relative
          min-h-[1200px]
          ruled-bg
          grain
          sketch-border
          overflow-hidden
          p-6
          md:p-10
        "
      >
        {/* notebook fold */}
        <div
          className="
            absolute
            left-1/2
            top-0
            bottom-0
            w-[2px]
            bg-[hsl(var(--ink))/0.08]
            hidden
            md:block
          "
        />

        {/* MAP */}
        <motion.div
          ref={mapRef}
          onMouseMove={handleMove}
          onClick={splat}
          style={{
            rotateX: rx,
            rotateY: ry,
            transformStyle: "preserve-3d",
          }}
          className="
            relative
            w-full
            h-[1050px]
            bg-[hsl(var(--paper-2))]
            border-2
            border-[hsl(var(--ink))]
            overflow-hidden
            shadow-[10px_10px_0px_hsl(var(--ink))]
            cursor-crosshair
          "
        >
          {/* parchment texture */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--ink)) 0.7px, transparent 0.7px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* folds */}
          <div className="absolute left-1/3 top-0 bottom-0 w-[2px] bg-[hsl(var(--ink))/0.06]" />
          <div className="absolute left-2/3 top-0 bottom-0 w-[2px] bg-[hsl(var(--ink))/0.06]" />
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[hsl(var(--ink))/0.06]" />

          {/* lantern mode */}
          <AnimatePresence>
            {night && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                  background:
                    "rgba(0,0,0,0.72)",
                  maskImage: `radial-gradient(circle at ${lanternX.get()} ${lanternY.get()}, transparent 0%, transparent 16%, black 28%)`,
                  WebkitMaskImage: `radial-gradient(circle at ${lanternX.get()} ${lanternY.get()}, transparent 0%, transparent 16%, black 28%)`,
                }}
              />
            )}
          </AnimatePresence>

          {/* ink bursts */}
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{
                scale: 0,
                opacity: 0.4,
              }}
              animate={{
                scale: 6,
                opacity: 0,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
              className="
                absolute
                w-8
                h-8
                rounded-full
                bg-[hsl(var(--accent))/0.15]
                blur-md
                pointer-events-none
              "
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
              }}
            />
          ))}

          {/* compass */}
          <motion.div
            drag
            dragMomentum={false}
            className="
              absolute
              top-10
              right-10
              z-20
              opacity-30
              cursor-grab
            "
            whileTap={{ cursor: "grabbing" }}
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 80,
                ease: "linear",
              }}
            >
              <Compass size={140} />
            </motion.div>
          </motion.div>

          {/* SVG MAP */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1400 1000"
          >
            {/* coast */}
            <path
              d="M80 120 C220 60 420 120 580 200 C760 300 940 240 1120 340 C1260 420 1320 620 1240 820"
              stroke="hsl(var(--ink))"
              strokeWidth="6"
              fill="none"
              opacity="0.12"
              strokeLinecap="round"
            />

            {/* rivers */}
            <path
              d="M180 260 C 360 320, 520 260, 680 420 S 980 580, 1160 700"
              stroke="hsl(var(--accent))"
              strokeWidth="8"
              fill="none"
              opacity="0.22"
              strokeLinecap="round"
            />

            {/* routes */}
            <path
              d="M320 280 C 520 340, 760 300, 1040 420"
              stroke="hsl(var(--accent-2))"
              strokeWidth="4"
              fill="none"
              strokeDasharray="12 12"
              opacity="0.45"
            />

            <path
              d="M520 720 C 720 620, 940 720, 1120 820"
              stroke="hsl(var(--accent))"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10 12"
              opacity="0.4"
            />

            {/* mountains */}
            <g opacity="0.26">
              <path d="M280 540 L360 400 L440 540 Z" fill="hsl(var(--ink))" />
              <path d="M380 540 L500 360 L620 540 Z" fill="hsl(var(--ink))" />
              <path d="M520 540 L660 420 L780 540 Z" fill="hsl(var(--ink))" />
            </g>

            {/* forest */}
            <g opacity="0.2">
              {Array.from({ length: 18 }).map((_, i) => (
                <path
                  key={i}
                  d={`M${200 + i * 26} 760 L${215 + i * 26} 710 L${
                    230 + i * 26
                  } 760 Z`}
                  fill="hsl(var(--ink))"
                />
              ))}
            </g>
          </svg>

          {/* handwritten labels */}
          <div
            className="
              absolute
              top-[16%]
              left-[14%]
              text-4xl
              text-[hsl(var(--ink))/0.14]
              rotate-[-8deg]
            "
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Northern Archives
          </div>

          <div
            className="
              absolute
              bottom-[18%]
              left-[20%]
              text-3xl
              text-[hsl(var(--ink))/0.14]
              rotate-[4deg]
            "
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Cipher Woods
          </div>

          {/* MARKERS */}
          {locations.map((loc, index) => {
            if (loc.secret && !showSecret) return null;

            const Icon = loc.icon;

            return (
              <motion.a
                key={index}
                href={loc.href}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => visit(index)}
                whileHover={{
                  scale: 1.08,
                  y: -6,
                }}
                className="absolute group z-20"
                style={{
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                }}
              >
                {/* pulse */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.18, 0.42, 0.18],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                  }}
                  className="
                    absolute
                    inset-0
                    rounded-full
                    bg-[hsl(var(--accent))/0.25]
                    blur-xl
                  "
                />

                {/* pin */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="
                      w-14
                      h-14
                      rounded-full
                      border-2
                      border-[hsl(var(--ink))]
                      bg-[hsl(var(--paper))]
                      shadow-[4px_4px_0px_hsl(var(--ink))]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Icon
                      size={26}
                      className="text-[hsl(var(--accent))]"
                    />
                  </div>

                  <div
                    className="
                      w-[3px]
                      h-10
                      bg-[hsl(var(--ink))]
                    "
                  />

                  {/* label */}
                  <div
                    className="
                      mt-2
                      px-3
                      py-1
                      bg-[hsl(var(--paper))]
                      border
                      border-[hsl(var(--ink))/0.2]
                      rotate-[-2deg]
                      whitespace-nowrap
                    "
                    style={{
                      borderRadius:
                        "12px 16px 10px 14px / 14px 10px 16px 12px",
                    }}
                  >
                    <p
                      className="text-lg leading-none"
                      style={{
                        fontFamily: "Patrick Hand, cursive",
                      }}
                    >
                      {loc.title}
                    </p>
                  </div>

                  {/* tooltip */}
                  <AnimatePresence>
                    {hovered === index && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: 8,
                        }}
                        className="
                          absolute
                          top-[110px]
                          z-30
                          w-[240px]
                          bg-[hsl(var(--paper))]
                          border-2
                          border-[hsl(var(--ink))]
                          p-4
                          shadow-[5px_5px_0px_hsl(var(--ink))]
                        "
                        style={{
                          borderRadius:
                            "16px 20px 18px 14px / 14px 18px 20px 16px",
                        }}
                      >
                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-[0.18em]
                            text-[hsl(var(--ink-soft))]
                          "
                          style={{
                            fontFamily:
                              "Comic Neue, sans-serif",
                          }}
                        >
                          discovered location
                        </p>

                        <h3
                          className="text-2xl mt-2"
                          style={{
                            fontFamily:
                              "Patrick Hand, cursive",
                          }}
                        >
                          {loc.title}
                        </h3>

                        <p
                          className="
                            mt-2
                            text-[hsl(var(--ink-soft))]
                          "
                          style={{
                            fontFamily:
                              "Comic Neue, sans-serif",
                          }}
                        >
                          {loc.subtitle}
                        </p>

                        <div
                          className="
                            mt-4
                            text-[hsl(var(--accent))]
                          "
                          style={{
                            fontFamily: "Caveat, cursive",
                          }}
                        >
                          ✎ {loc.hint}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </section>
    </PageWrapper>
  );
}