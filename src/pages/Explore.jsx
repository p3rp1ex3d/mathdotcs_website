import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, PenTool, Pin, Sparkles } from "lucide-react";

const NOTE_PALETTE = {
  amber: { light: "hsl(48 90% 86%)", dark: "hsl(42 45% 24%)" },
  sky: { light: "hsl(199 85% 84%)", dark: "hsl(205 45% 22%)" },
  rose: { light: "hsl(335 76% 86%)", dark: "hsl(340 42% 24%)" },
  mint: { light: "hsl(132 42% 84%)", dark: "hsl(150 32% 20%)" },
  peach: { light: "hsl(24 82% 83%)", dark: "hsl(22 45% 24%)" },
};

const notes = [
  {
    id: "blackbox",
    title: "Function Unknown",
    eyebrow: "Arithmetic",
    description: "Interrogate a hidden function until it confesses its rule.",
    to: "https://blackbox.mathdotcs.com/",
    width: "clamp(190px, 22vw, 230px)",
    height: "clamp(160px, 19vw, 200px)",
    rotation: -6,
    color: "amber",
    pinned: "tape",
  },
  // {
  //   id: "monty",
  //   title: "Monty Hall",
  //   eyebrow: "Probability",
  //   description: "A playful take on conditional chance and intuition.",
  //   to: "https://example.com/interactive/monty-hall",
  //   width: "clamp(190px, 22vw, 230px)",
  //   height: "clamp(160px, 19vw, 200px)",
  //   rotation: 8,
  //   color: "sky",
  //   pinned: "pin",
  // },
  // {
  //   id: "knight",
  //   title: "Knight's Tour",
  //   eyebrow: "Graph Theory",
  //   description: "Hop through a chessboard like a wandering path.",
  //   to: "https://example.com/interactive/knight-tour",
  //   width: "clamp(190px, 22vw, 230px)",
  //   height: "clamp(160px, 19vw, 200px)",
  //   rotation: -5,
  //   color: "rose",
  //   pinned: "tape",
  // },
  // {
  //   id: "cake",
  //   title: "Cake Conjecture",
  //   eyebrow: "Discrete Math",
  //   description: "Cutting proofs into elegant, bite-sized ideas.",
  //   to: "https://example.com/interactive/cake-conjecture",
  //   width: "clamp(190px, 22vw, 230px)",
  //   height: "clamp(160px, 19vw, 200px)",
  //   rotation: 6,
  //   color: "mint",
  //   pinned: "pin",
  // },
  // {
  //   id: "drawer",
  //   title: "Dark Drawer",
  //   eyebrow: "Logic",
  //   description: "A puzzle box of hidden rules and clever patterns.",
  //   to: "https://example.com/interactive/dark-drawer",
  //   width: "clamp(190px, 22vw, 230px)",
  //   height: "clamp(160px, 19vw, 200px)",
  //   rotation: -7,
  //   color: "peach",
  //   pinned: "tape",
  // },
];

// Clean, self-contained hook — no reference to component state that lives elsewhere.
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}

// A little visual glue that makes a card feel physically stuck to the page —
// alternates between a strip of washi tape and a corkboard pin per note.
// Always reads the resolved --note-active custom property, so it follows
// whichever theme (light/dark) is active without needing its own color prop.
function Fastener({ kind }) {
  if (kind === "pin") {
    return (
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-full border-2 border-[hsl(var(--ink))] bg-[hsl(var(--paper))] p-[3px] shadow-[2px_3px_0px_hsl(var(--shadow))]"
        aria-hidden
      >
        <Pin size={14} className="text-[hsl(var(--ink))]" fill="currentColor" fillOpacity={0.15} />
      </div>
    );
  }
  return (
    <div
      className="absolute -top-3 left-1/2 h-6 w-14 -translate-x-1/2 rotate-[-3deg] border border-[hsl(var(--ink))]/25 opacity-90"
      style={{
        background:
          "repeating-linear-gradient(115deg, var(--note-active), var(--note-active) 6px, hsl(var(--paper)/0.35) 6px, hsl(var(--paper)/0.35) 8px)",
        clipPath: "polygon(4% 10%, 96% 0%, 100% 90%, 0% 100%)",
      }}
      aria-hidden
    />
  );
}

function NoteCard({ note, index, isActive, tilt, onEnter, onMove, onLeave, onFocus, onBlur, isMobile }) {
  const angleX = isActive ? tilt.rotateX : 0;
  const angleY = isActive ? tilt.rotateY : 0;
  // Gentle stagger so the board doesn't look like a rigid grid.
  const stagger = isMobile ? 0 : (index % 2 === 0 ? -10 : 14);
  const palette = NOTE_PALETTE[note.color] ?? NOTE_PALETTE.amber;

  return (
    <motion.a
      href={note.to}
      target="_blank"
      rel="noopener noreferrer"
      className="notebook-focus relative shrink-0 text-left"
      style={{
        width: isMobile ? "100%" : note.width,
        height: isMobile ? undefined : note.height,
        minHeight: isMobile ? note.height : undefined,
        marginTop: stagger,
        transformOrigin: "center center",
        // Both tones live here as custom properties; the .notebook-focus /
        // .dark .notebook-focus rule below picks which one --note-active resolves to.
        "--note-light": palette.light,
        "--note-dark": palette.dark,
      }}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      whileHover={{
        y: -10,
        scale: 1.03,
        rotate: note.rotation + 2,
        boxShadow: "6px 8px 0px hsl(var(--shadow))",
      }}
      whileTap={{ scale: 0.97, rotate: note.rotation + 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <motion.div
        className="note-float relative h-full w-full rounded-[18px] border-2 border-[hsl(var(--ink))] p-3 sm:p-4"
        style={{
          backgroundColor: "var(--note-active)",
          boxShadow: isActive ? "8px 10px 0px hsl(var(--shadow))" : "4px 6px 0px hsl(var(--shadow))",
          transform: `perspective(900px) rotateX(${angleX}deg) rotateY(${angleY}deg) rotate(${note.rotation}deg)`,
          transformStyle: "preserve-3d",
          animationDelay: `${index * 0.4}s`,
        }}
        animate={{
          rotate: isActive ? note.rotation + 1 : note.rotation,
          scale: isActive ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <Fastener kind={note.pinned ?? "tape"} />

        {/* folded corner */}
        <div
          className="absolute bottom-0 right-0 h-5 w-5 rounded-bl-[6px]"
          style={{
            background: "hsl(var(--paper))",
            clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)",
            boxShadow: "-2px -2px 3px rgba(0,0,0,0.12) inset",
          }}
          aria-hidden
        />
        <div className="absolute top-2 right-2 text-[hsl(var(--ink-soft))]/70">
          <ArrowUpRight size={14} />
        </div>
        <div className="absolute left-2 top-2 text-[hsl(var(--ink-soft))]/70">
          <PenTool size={12} />
        </div>

        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--ink-soft))]"
              style={{ fontFamily: "Comic Neue, sans-serif" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ink))]/40" />
              {note.eyebrow}
            </p>
            <h3
              className="mt-1 text-[1.15rem] leading-tight sm:text-[1.3rem] font-bold text-[hsl(var(--ink))]"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              {note.title}
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.p
                key="description"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-2 text-sm leading-snug text-[hsl(var(--ink-soft))]"
                style={{ fontFamily: "Caveat, cursive", fontSize: "1.05rem" }}
              >
                {note.description}
              </motion.p>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--ink-soft))]/70"
                style={{ fontFamily: "Comic Neue, sans-serif" }}
              >
                tap to open
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.a>
  );
}

// Fills empty board space on purpose instead of leaving dead paper —
// signals more is coming rather than looking unfinished.
function ComingSoonCard({ isMobile }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[hsl(var(--ink))]/30 p-4 text-center opacity-70"
      style={{
        width: isMobile ? "100%" : "clamp(190px, 22vw, 230px)",
        height: isMobile ? "clamp(150px, 20vw, 190px)" : "clamp(160px, 19vw, 200px)",
        rotate: "3deg",
      }}
    >
      <Sparkles size={18} className="text-[hsl(var(--ink-soft))]" />
      <p className="text-sm leading-snug text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive", fontSize: "1.15rem" }}>
        More trails are being sketched out.
      </p>
    </div>
  );
}

export default function Explore() {
  const isMobile = useIsMobile();
  const [hoveredNote, setHoveredNote] = useState(null);
  const [tilt, setTilt] = useState({ id: null, rotateX: 0, rotateY: 0 });

  const handleTilt = (event, noteId) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateY = ((x / bounds.width) - 0.5) * 6;
    const rotateX = ((0.5 - y / bounds.height) * 6).toFixed(2);

    setTilt({ id: noteId, rotateX: Number(rotateX), rotateY });
  };

  const clearTilt = () => {
    setHoveredNote(null);
    setTilt({ id: null, rotateX: 0, rotateY: 0 });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[hsl(var(--paper))]">
      <header
        className={
          isMobile
            ? "relative z-30 px-4 pt-6 pb-4 text-center"
            : "relative z-30 pointer-events-none text-center py-6 sm:py-8"
        }
      >
        <div className="pointer-events-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none" style={{ fontFamily: "Patrick Hand, cursive" }}>
            <span className="hand-underline">Explore</span>
          </h1>
          <p className="text-base sm:text-lg mt-3 text-[hsl(var(--ink-soft))] max-w-2xl mx-auto" style={{ fontFamily: "Comic Neue, sans-serif" }}>
            A trail of projects to spark curiosity, ignite creativity, and illuminate the beauty of mathematics and computer science.
          </p>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-0 paper-bg grain" />

      {/* Toned-down margin doodle */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-10 right-12 h-9 w-16 rotate-6 rounded-full border border-dashed border-[hsl(var(--ink))]/20" />
      </div>

      {/* Corkboard: centered flex-wrap so it looks intentional whether there's 1 note or 10 */}
      <div
        className={
          isMobile
            ? "relative z-20 grid grid-cols-1 gap-4 px-4 pb-10 pt-2 sm:grid-cols-2"
            : "relative z-20 flex flex-wrap items-start justify-center gap-x-12 gap-y-16 px-10 pb-24 pt-10"
        }
      >
        {notes.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            index={index}
            isMobile={isMobile}
            isActive={hoveredNote === note.id}
            tilt={tilt}
            onEnter={() => setHoveredNote(note.id)}
            onMove={(event) => handleTilt(event, note.id)}
            onLeave={clearTilt}
            onFocus={() => setHoveredNote(note.id)}
            onBlur={clearTilt}
          />
        ))}
        <ComingSoonCard isMobile={isMobile} />
      </div>

      <style>{`
        .note-float { animation: note-bob 5.5s ease-in-out infinite; }
        @keyframes note-bob {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -4px; }
        }
        .notebook-focus:focus-visible { outline: 2px solid hsl(var(--accent)); outline-offset: 4px; border-radius: 18px; }

        /* Theme-aware note surface: resolves to the light pastel by default,
           and swaps to the muted dark tone whenever a ".dark" ancestor is present.
           If this app toggles themes a different way (e.g. [data-theme="dark"]
           or a media query), change the selector below to match. */
        .notebook-focus { --note-active: var(--note-light); }
        .dark .notebook-focus { --note-active: var(--note-dark); }

        @media (prefers-reduced-motion: reduce) {
          .note-float { animation: none; }
        }
      `}</style>
    </div>
  );
}