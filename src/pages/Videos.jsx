import { useEffect, useMemo, useState } from "react";
import { Search, Play, Eye, Calendar, X } from "lucide-react";
import { fetchYouTubeVideos } from "../lib/github";
import { PageWrapper } from "../components/PageWrapper";

const fmtDate = (s) =>
  new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function Videos() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoList, setVideoList] = useState([]);

  useEffect(() => {
    fetchYouTubeVideos()
      .then((remote) => {
        if (remote.length > 0) {
          setVideoList(remote);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const allCategories = useMemo(
    () => Array.from(new Set(videoList.map((v) => v.category))).sort(),
    [videoList],
  );

  const filtered = useMemo(() => {
    return videoList.filter((v) => {
      const m1 =
        !q ||
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.description.toLowerCase().includes(q.toLowerCase());
      const m2 = !tag || v.category === tag;
      return m1 && m2;
    });
  }, [videoList, q, tag]);

  return (
    <PageWrapper testId="videos-page">
      <header className="mb-6">
        <p className="text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          Page 02 — The Videos
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mt-1" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <span className="hand-underline">Animated explanations</span>
        </h1>
        <p className="text-base mt-3 text-[hsl(var(--ink-soft))] max-w-2xl" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Bite-sized videos for ideas that beg to be moved, drawn, and animated.
        </p>
      </header>

      {/* Stats - Fixed even sizes for all screen sizes */}
      <section className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 stagger" data-testid="video-stats">
        {[
          { v: videoList.length, l: "videos" },
          { v: allCategories.length, l: "categories" },
          { v: "∞", l: "minutes bored" },
        ].map(({ v, l }, i) => (
          <div key={i} className="sketch-card p-2 sm:p-4 text-center w-full">
            <div className="text-xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--accent))] whitespace-nowrap" style={{ fontFamily: "Patrick Hand, cursive" }}>
              {v}
            </div>
            <div className="text-xs sm:text-base text-[hsl(var(--ink-soft))] mt-0.5 sm:mt-1 whitespace-nowrap" style={{ fontFamily: "Caveat, cursive" }}>{l}</div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="mb-6 flex flex-col gap-3" data-testid="video-filters">
        <div className="relative max-w-xl">
          <Search size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ink-soft))]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search the videos..."
            data-testid="video-search-input"
            className="sketch-input"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTag(null)}
            data-testid="video-tag-all"
            className={`chip ${!tag ? "!bg-[hsl(var(--accent))/0.4]" : ""}`}
          >
            all
          </button>
          {allCategories.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              data-testid={`video-tag-${t}`}
              className={`chip ${tag === t ? "!bg-[hsl(var(--accent))/0.4]" : ""}`}
            >
              #{t}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger" data-testid="video-list">
        {loading && (
          <div className="col-span-full text-center py-16 text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}>
            Fetching videos for you ...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}>
            No videos here yet — flip another page ✎
          </div>
        )}
        {filtered.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            data-testid={`video-card-${v.id}`}
            className="sketch-card overflow-hidden text-left group"
          >
            <div className="relative overflow-hidden border-b-2 border-[hsl(var(--ink))]">
              {/* Fixed responsive thumbnail container */}
              <div className="relative w-full pt-[56.25%] bg-[hsl(var(--paper))]">
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                  alt={v.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--ink))/0] group-hover:bg-[hsl(var(--ink))/0.25] transition-colors">
                <span className="sketch-circle bg-[hsl(var(--paper))] !w-14 !h-14 opacity-0 group-hover:opacity-100 transition-opacity" style={{ minWidth: "3.5rem" }}>
                  <Play size={22} strokeWidth={2.5} fill="currentColor" />
                </span>
              </div>
              <span className="absolute bottom-2 right-2 chip !bg-[hsl(var(--ink))] !text-[hsl(var(--paper))] !border-[hsl(var(--ink))]">
                {v.duration}
              </span>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: "Patrick Hand, cursive" }}>
                {v.title}
              </h2>
              <p className="text-sm text-[hsl(var(--ink-soft))] mt-2 line-clamp-2" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                {v.description}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-[hsl(var(--ink-soft))]">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {fmtDate(v.publishedAt)}
                </span>
                <span className="chip text-xs">
                  {v.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-[hsl(var(--ink))/0.7] flex items-center justify-center p-4 page-enter"
          onClick={() => setActive(null)}
          data-testid="video-modal"
        >
          <div
            className="sketch-card max-w-3xl w-full bg-[hsl(var(--card))] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-4 border-b-2 border-[hsl(var(--ink))]">
              <h3 className="text-2xl font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>{active.title}</h3>
              <button
                onClick={() => setActive(null)}
                data-testid="close-video-modal"
                className="sketch-btn !p-2"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                title={active.title}
                src={`https://www.youtube.com/embed/${active.youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-5">
              <p className="text-sm text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                {active.description}
              </p>
              <div className="mt-3">
                <span className="chip text-xs">
                  {active.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}