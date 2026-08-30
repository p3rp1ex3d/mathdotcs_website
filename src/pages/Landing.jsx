import { useEffect, useRef, useState, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FileText,
  Compass,
  Dices,
} from "lucide-react";

import { FaYoutube } from "react-icons/fa";

import { fetchBlogPosts, fetchYouTubeVideos } from "../lib/github";

function resolveCoverUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith(".") || !trimmed.includes("/")) return null;
  return trimmed;
}

function initialsFor(title = "") {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
}

function hueFor(title = "") {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360;
  return h;
}

function CoverImage({ src, title, className = "" }) {
  const resolved = resolveCoverUrl(src);
  const [broken, setBroken] = useState(!resolved);
  const hue = hueFor(title);

  if (broken || !resolved) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-white font-bold ${className}`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 55% 30%))`,
          fontFamily: "Patrick Hand, cursive",
        }}
        aria-hidden="true"
      >
        {initialsFor(title)}
      </div>
    );
  }

  return <img src={resolved} alt={title} className={className} loading="lazy" onError={() => setBroken(true)} />;
}

function useStopFlipPropagation(onActivate) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const stopOnly = (e) => e.stopPropagation();
    const handleClick = (e) => {
      e.stopPropagation();
      onActivate?.();
    };

    const dragEvents = ["pointerdown", "mousedown", "touchstart"];
    dragEvents.forEach((evt) => node.addEventListener(evt, stopOnly, { capture: true }));
    node.addEventListener("click", handleClick, { capture: true });

    return () => {
      dragEvents.forEach((evt) => node.removeEventListener(evt, stopOnly, { capture: true }));
      node.removeEventListener("click", handleClick, { capture: true });
    };
  }, [onActivate]);

  return ref;
}

function pickRandom(list, count, avoid = []) {
  if (!list?.length) return [];
  const pool = list.filter((item) => !avoid.includes(item));
  const source = pool.length >= count ? pool : list;
  const copy = [...source];
  const out = [];
  while (copy.length && out.length < count) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function MarginNote({ children, corner = "bottom-right", rotate = -3 }) {
  const pos =
    corner === "bottom-right"
      ? "bottom-3 right-4 text-right"
      : corner === "bottom-left"
      ? "bottom-3 left-4 text-left"
      : corner === "top-right"
      ? "top-3 right-4 text-right"
      : "top-3 left-4 text-left";
  return (
    <span
      className={`absolute ${pos} text-xs text-[hsl(var(--ink-soft))] opacity-80 pointer-events-none max-w-[9rem]`}
      style={{ fontFamily: "Caveat, cursive", transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

const Page = forwardRef(function Page({ side = "right", number, children, isMobile = false, style }, ref) {
  return (
    <div
      ref={ref}
      className="book-page grain corner-fold"
      style={{
        background: document.documentElement.classList.contains("dark")
          ? "linear-gradient(135deg, #18181b 0%, #111114 100%)"
          : "linear-gradient(135deg, hsl(var(--paper)) 0%, hsl(var(--paper-2)) 100%)",
        boxShadow: document.documentElement.classList.contains("dark")
          ? "0 12px 40px rgba(0,0,0,0.45)"
          : "0 10px 30px rgba(0,0,0,0.12)",
        border: document.documentElement.classList.contains("dark")
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.08)",
        borderRadius: isMobile ? "18px" : "10px",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div className={`book-page-inner ${isMobile ? "px-4 py-5" : ""}`}>{children}</div>
      {number != null && (
        <span className={`page-number ${side === "left" ? "page-number-left" : "page-number-right"}`}>— {number} —</span>
      )}
    </div>
  );
});

const CoverPage = forwardRef(function CoverPage({ isMobile, latestTitle }, ref) {
  return (
    <div
      ref={ref}
      className="book-page grain cursor-pointer"
      style={{
        background: "linear-gradient(135deg, hsl(var(--paper)) 0%, hsl(var(--paper-2)) 100%)",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    >
      <div className="book-page-inner items-center justify-center text-center relative">
        <div className="absolute top-6 left-6 sketch-circle text-base">★</div>
        <div className="absolute top-6 right-6 chip">Vol. I</div>

        <BookOpen size={68} strokeWidth={2} className="mb-4 text-[hsl(var(--accent))] wobble" />

        <h1 className="text-5xl sm:text-6xl font-bold leading-none" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <span className="hand-underline">MathDotCS</span>
        </h1>

        <p className="mt-4 text-xl sm:text-2xl text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          Decoding the universe,
          <br />
          one scribble at a time.
        </p>

        <div className="squiggle w-40 mt-6" />

        {latestTitle ? (
          <p className="mt-8 text-sm text-[hsl(var(--ink-soft))] max-w-xs">
            Freshly scribbled:{" "}
            <span className="text-[hsl(var(--accent))]" style={{ fontFamily: "Patrick Hand, cursive" }}>
              "{latestTitle}"
            </span>
          </p>
        ) : (
          <p className="mt-8 text-sm text-[hsl(var(--ink-soft))] max-w-xs">
            Math. Science. Code.
            <br />
            Whatever wouldn't fit in the margins elsewhere.
          </p>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs flex items-center gap-1 text-[hsl(var(--ink-soft))] flip-hint">
          <span style={{ fontFamily: "Caveat, cursive" }}>tap to open</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
});

const AboutPageOne = forwardRef(function AboutPageOne({ isMobile }, ref) {
  return (
    <Page ref={ref} isMobile={isMobile} number={1} side="left">
      <span className="chip self-start mb-4">The margin</span>
      <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Patrick Hand, cursive" }}>
        This started as a <span className="marker">doodle.</span>
      </h2>
      <div className="text-base leading-relaxed space-y-4" style={{ fontFamily: "Comic Neue, sans-serif" }}>
        <p>
          Somewhere between a lecture and a bug report, there's a version of an idea nobody writes down — the one
          that's just a diagram in the margin and a "wait, that can't be right."
        </p>
        <p>
          That's what this is. Not a course, not a wiki — a running notebook of the math, science, and code that made
          someone stop and go back a page.
        </p>
        <p style={{ fontFamily: "Caveat, cursive" }} className="text-2xl text-[hsl(var(--accent))]">
          If it's not a little unfinished, it's not honest.
        </p>
      </div>
      <MarginNote corner="bottom-right" rotate={-4}>
        (rewritten this intro four times — this is the honest one)
      </MarginNote>
    </Page>
  );
});

const AboutPageTwo = forwardRef(function AboutPageTwo({ isMobile, blogCount, videoCount }, ref) {
  return (
    <Page ref={ref} isMobile={isMobile} number={2} side="right">
      <span className="chip self-start mb-4">The map</span>
      <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Patrick Hand, cursive" }}>
        Three doors, <span className="hand-underline">one notebook</span>
      </h2>
      <ul className="space-y-4 text-base" style={{ fontFamily: "Comic Neue, sans-serif" }}>
        <li className="flex items-start gap-3">
          <FileText size={22} className="text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
          <span>
            <strong>Blogs</strong> — the write-it-out kind of thinking. {blogCount ? `${blogCount} posts and counting.` : "Proofs, breakdowns, and slow arguments."}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <FaYoutube size={22} className="text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
          <span>
            <strong>Videos</strong> — for the ideas that only make sense in motion. {videoCount ? `${videoCount} up so far.` : "Watch it unfold instead of reading about it."}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Compass size={22} className="text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
          <span>
            <strong>Explore</strong> — the loose ends. Tools, puzzles, and things worth poking at that didn't fit
            the other two shelves.
          </span>
        </li>
      </ul>
      <p className="mt-6 text-sm text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
        No wrong door. Or roll the dice a couple pages over.
      </p>
    </Page>
  );
});

const FeaturedBlogsPage = forwardRef(function FeaturedBlogsPage({ blogs = [], isMobile, picks, onShuffle }, ref) {
  const shuffleRef = useStopFlipPropagation(onShuffle);

  return (
    <Page ref={ref} isMobile={isMobile} number={3} side="left">
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="chip self-start mb-2 inline-block">Paper trail</span>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
            Worth <span className="hand-underline">reading</span>
          </h2>
        </div>
        <button
          ref={shuffleRef}
          disabled={blogs.length <= 2}
          aria-label="Show a different pair of posts"
          title="Surprise me"
          className="shuffle-glyph"
        >
          <Dices size={22} />
        </button>
      </div>
      <p className="text-xs text-[hsl(var(--ink-soft))] mb-4" style={{ fontFamily: "Comic Neue, sans-serif" }}>
        Two picks, reshuffled every visit if you shake the dice.
      </p>

      {picks.length === 0 ? (
        <p className="text-sm text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Nothing scribbled here yet — check back soon.
        </p>
      ) : (
        <ul className="space-y-4 flex-1">
          {picks.map((b) => (
            <li key={b.slug}>
              <Link
                to={`/blogs/${b.slug}`}
                className="flex gap-3 p-2 border-2 border-[hsl(var(--ink))/0.4] hover:border-[hsl(var(--ink))] transition-all"
                style={{ borderRadius: "22px 14px 24px 16px / 14px 22px 16px 24px" }}
              >
                <div className="relative w-28 h-24 flex-shrink-0 overflow-hidden border-2 border-[hsl(var(--ink))] rounded-xl">
                  <CoverImage src={b.cover} title={b.title} className="w-full h-full object-cover" />
                  {b.readTime && (
                    <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-1 rounded">
                      {b.readTime}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold line-clamp-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
                    {b.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--ink-soft))] line-clamp-3 mt-1" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                    {b.excerpt}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/blogs" className="sketch-btn self-start mt-4">
        All the blogs <ArrowRight size={16} />
      </Link>
    </Page>
  );
});

const FeaturedVideosPage = forwardRef(function FeaturedVideosPage({ videos = [], isMobile, picks, onShuffle }, ref) {
  const shuffleRef = useStopFlipPropagation(onShuffle);

  return (
    <Page ref={ref} isMobile={isMobile} number={4} side="right">
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="chip self-start mb-2 inline-block">Moving pictures</span>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
            Worth <span className="marker">watching</span>
          </h2>
        </div>
        <button
          ref={shuffleRef}
          disabled={videos.length <= 2}
          aria-label="Show a different pair of videos"
          title="Surprise me"
          className="shuffle-glyph"
        >
          <Dices size={22} />
        </button>
      </div>
      <p className="text-xs text-[hsl(var(--ink-soft))] mb-4" style={{ fontFamily: "Comic Neue, sans-serif" }}>
        Same dice as the last page — try it here too.
      </p>

      {picks.length === 0 ? (
        <p className="text-sm text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          No videos posted yet — the camera is still warming up.
        </p>
      ) : (
        <ul className="space-y-4 flex-1">
          {picks.map((v) => (
            <li key={v.id}>
              <Link
                to="/videos"
                className="flex gap-3 p-2 border-2 border-[hsl(var(--ink))/0.4] hover:border-[hsl(var(--ink))] transition-all"
                style={{ borderRadius: "22px 14px 24px 16px / 14px 22px 16px 24px" }}
              >
                <div className="relative w-28 h-24 flex-shrink-0 overflow-hidden border-2 border-[hsl(var(--ink))] rounded-xl">
                  <CoverImage
                    src={v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : null}
                    title={v.title}
                    className="w-full h-full object-cover"
                  />
                  {v.duration && (
                    <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-1 rounded">
                      {v.duration}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold line-clamp-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
                    {v.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--ink-soft))] line-clamp-3 mt-1" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                    {v.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/videos" className="sketch-btn self-start mt-4">
        All the videos <ArrowRight size={16} />
      </Link>
    </Page>
  );
});

const ExplorePage = forwardRef(function ExplorePage({ isMobile }, ref) {
  return (
    <Page ref={ref} isMobile={isMobile} number={5} side="left">
      <span className="chip self-start mb-2 inline-block">The playpen</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
        Everything else <span className="hand-underline">lives here</span>
      </h2>
      <p className="text-sm text-[hsl(var(--ink-soft))] mb-6" style={{ fontFamily: "Comic Neue, sans-serif" }}>
        Not every idea wants to be read or watched — some want to be dragged around until they make sense. That's
        what this shelf is for.
      </p>
      <div className="sketch-card p-4">
        <p className="text-sm" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Little games built to make a rule click. Visualizations you can nudge and break. Explorers you steer
          yourself instead of scrolling past. If it's interactive and it didn't fit a page or a video, it ends up
          here.
        </p>
      </div>
      <Link to="/explore" className="sketch-btn self-start mt-4">
        Go play <ArrowRight size={16} />
      </Link>
      <MarginNote corner="top-right" rotate={3}>
        this shelf grows the fastest — check back often
      </MarginNote>
    </Page>
  );
});

const NavigatePage = forwardRef(function NavigatePage({ isMobile }, ref) {
  return (
    <Page ref={ref} isMobile={isMobile} number={6} side="right">
      <span className="chip self-start mb-4">All roads</span>
      <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Patrick Hand, cursive" }}>
        Or just <span className="hand-underline">pick one</span>
      </h2>
      <div className="grid gap-3">
        <Link to="/blogs" className="sketch-card p-4 flex items-center gap-4">
          <FileText size={28} className="text-[hsl(var(--accent))]" />
          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Blogs
            </h3>
            <p className="text-sm text-[hsl(var(--ink-soft))]">Long-form, written out.</p>
          </div>
          <ArrowRight />
        </Link>
        <Link to="/videos" className="sketch-card p-4 flex items-center gap-4">
          <FaYoutube size={28} className="text-[hsl(var(--accent))]" />
          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Videos
            </h3>
            <p className="text-sm text-[hsl(var(--ink-soft))]">Watch it unfold.</p>
          </div>
          <ArrowRight />
        </Link>
        <Link to="/explore" className="sketch-card p-4 flex items-center gap-4">
          <Compass size={28} className="text-[hsl(var(--accent))]" />
          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Explore
            </h3>
            <p className="text-sm text-[hsl(var(--ink-soft))]">Click around and see.</p>
          </div>
          <ArrowRight />
        </Link>
      </div>
    </Page>
  );
});

const ClosingPage = forwardRef(function ClosingPage({ isMobile }, ref) {
  return (
    <Page ref={ref} isMobile={isMobile} number={7} side="left">
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <h2 className="text-5xl mt-4 leading-tight" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Back page,
          <br />
          <span className="marker">for now.</span>
        </h2>
        <div className="squiggle w-32 mt-8 mb-8" />
        <p className="max-w-sm text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          There's always another page taped in eventually. Come back and see what got added.
        </p>
        <div className="mt-10 text-sm opacity-70">✦</div>
      </div>
    </Page>
  );
});

const TABS = [
  { label: "Cover", page: 0, color: "#f3d3a3" },
  { label: "About", page: 1, color: "#c9e3c1" },
  { label: "Blogs", page: 3, color: "#bcd8ee" },
  { label: "Videos", page: 4, color: "#e6c2d8" },
  { label: "Explore", page: 5, color: "#d8c9ee" },
];

function NotebookTabs({ goToPage, isMobile }) {
  return (
    <div className={`notebook-tabs ${isMobile ? "notebook-tabs-mobile" : ""}`}>
      {TABS.map((t) => (
        <button
          key={t.label}
          onClick={() => goToPage(t.page)}
          className="notebook-tab"
          style={{ background: t.color }}
          title={`Jump to ${t.label}`}
        >
          <span style={{ fontFamily: "Patrick Hand, cursive" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Landing() {
  const bookRef = useRef(null);
  const [size, setSize] = useState({ w: 480, h: 640 });
  const [isMobile, setIsMobile] = useState(false);
  const [remoteBlogs, setRemoteBlogs] = useState([]);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const [blogPicks, setBlogPicks] = useState([]);
  const [videoPicks, setVideoPicks] = useState([]);

  useEffect(() => {
    fetchBlogPosts().then((data) => {
      if (data?.length) {
        setRemoteBlogs(data);
        setBlogPicks(pickRandom(data, 2));
      }
    });
    fetchYouTubeVideos().then((data) => {
      if (data?.length) {
        setRemoteVideos(data);
        setVideoPicks(pickRandom(data, 2));
      }
    });

    const update = () => {
      const w = window.innerWidth;
      const mobile = w < 900;
      setIsMobile(mobile);
      if (mobile) {
        const pageW = Math.min(w - 24, 420);
        setSize({ w: pageW, h: Math.round(pageW * 1.35) });
      } else {
        const pageW = Math.min(Math.floor((w - 160) / 2), 480);
        setSize({ w: pageW, h: Math.round(pageW * 1.32) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goToPage = (n) => bookRef.current?.pageFlip()?.turnToPage(n);
  const next = () => bookRef.current?.pageFlip()?.flipNext();
  const prev = () => bookRef.current?.pageFlip()?.flipPrev();

  const latestTitle = remoteBlogs[0]?.title;

  return (
    <div className="relative z-10 flex flex-col items-center px-2 sm:px-4 pt-2 pb-8 min-h-[80vh] overflow-x-hidden">
      <p className="text-base text-[hsl(var(--ink-soft))] mb-3" style={{ fontFamily: "Caveat, cursive" }}>
        ↓ click or drag a page corner to flip ↓
      </p>

      <div
        className={`book-shell w-full flex ${
          isMobile ? "flex-col items-center" : "justify-center"
        } overflow-visible px-2 sm:px-0 relative`}
      >
        <NotebookTabs goToPage={goToPage} isMobile={isMobile} />

        <HTMLFlipBook
          key={isMobile ? "mobile" : "desktop"}
          ref={bookRef}
          width={size.w}
          height={size.h}
          size="fixed"
          maxShadowOpacity={0.3}
          showCover={true}
          mobileScrollSupport={true}
          drawShadow={!isMobile}
          flippingTime={650}
          usePortrait={isMobile}
          className={`book-flip ${isMobile ? "mobile-book" : ""}`}
        >
          <CoverPage isMobile={isMobile} latestTitle={latestTitle} />
          <AboutPageOne isMobile={isMobile} />
          <AboutPageTwo isMobile={isMobile} blogCount={remoteBlogs.length} videoCount={remoteVideos.length} />
          <FeaturedBlogsPage
            blogs={remoteBlogs}
            picks={blogPicks}
            isMobile={isMobile}
            onShuffle={() => setBlogPicks(pickRandom(remoteBlogs, 2, blogPicks))}
          />
          <FeaturedVideosPage
            videos={remoteVideos}
            picks={videoPicks}
            isMobile={isMobile}
            onShuffle={() => setVideoPicks(pickRandom(remoteVideos, 2, videoPicks))}
          />
          <ExplorePage isMobile={isMobile} />
          <NavigatePage isMobile={isMobile} />
          <ClosingPage isMobile={isMobile} />
        </HTMLFlipBook>
      </div>

      <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
        <button onClick={prev} className="sketch-btn">
          <ArrowLeft size={16} /> Prev
        </button>
        <span className="text-sm text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          a small notebook of big ideas
        </span>
        <button onClick={next} className="sketch-btn sketch-btn-primary">
          Next <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        .shuffle-glyph {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: hsl(var(--ink-soft));
          transition: transform 0.25s ease, color 0.25s ease;
          transform: rotate(-6deg);
        }
        .shuffle-glyph:hover { transform: rotate(6deg) scale(1.15); color: hsl(var(--accent)); }
        .shuffle-glyph:disabled { opacity: 0.3; cursor: default; }
        .shuffle-glyph:disabled:hover { transform: rotate(-6deg) scale(1); color: hsl(var(--ink-soft)); }

        .notebook-tabs {
          position: absolute;
          top: 14%;
          right: -2px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 5;
        }
        .notebook-tab {
          border: 1px solid rgba(0,0,0,0.15);
          border-right: none;
          padding: 0.35rem 0.5rem 0.35rem 0.7rem;
          font-size: 0.75rem;
          line-height: 1;
          cursor: pointer;
          box-shadow: -2px 2px 6px rgba(0,0,0,0.25);
          border-radius: 6px 0 0 6px;
          color: #2b2418;
          writing-mode: vertical-rl;
          transition: transform 0.2s ease, padding-right 0.2s ease;
        }
        .notebook-tab:hover { transform: translateX(-4px); padding-right: 0.8rem; }

        .notebook-tabs-mobile {
          position: static;
          width: 100%;
          max-width: 420px;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          margin: 0 0 0.85rem;
          gap: 8px;
          z-index: auto;
        }
        .notebook-tabs-mobile .notebook-tab {
          writing-mode: horizontal-tb;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 999px;
          padding: 0.45rem 1rem;
          font-size: 0.8rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          min-height: 34px;
        }
        .notebook-tabs-mobile .notebook-tab:hover,
        .notebook-tabs-mobile .notebook-tab:active {
          transform: translateY(-2px);
          padding-right: 1rem;
        }
      `}</style>
    </div>
  );
}