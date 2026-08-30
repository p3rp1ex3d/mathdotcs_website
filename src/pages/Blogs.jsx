import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Calendar, Tag, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { fetchBlogPosts, resolveCoversForPosts } from "../lib/github";
import { PageWrapper } from "../components/PageWrapper";

const PAGE_SIZE = 8;

const fmtDate = (s) =>
  new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function Cover({ src, alt, className }) {
  return src ? (
    <img src={src} alt={alt} className={className} loading="lazy" />
  ) : (
    <div className={`${className} ruled-bg flex flex-col items-center justify-center text-[hsl(var(--ink-soft))]`}>
      <span className="text-2xl opacity-80">✎</span>
    </div>
  );
}

export default function Blogs() {
  const [posts, setPosts] = useState(null);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [pagePosts, setPagePosts] = useState([]);

  const [spotlight, setSpotlight] = useState([]);
  const [spotlightLoading, setSpotlightLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts()
      .then((remote) => setPosts(remote || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!posts || posts.length === 0) {
      setSpotlightLoading(false);
      return;
    }
    let cancelled = false;
    setSpotlightLoading(true);

    resolveCoversForPosts(posts.slice(0, 3))
      .then((resolved) => {
        if (!cancelled) setSpotlight(resolved);
      })
      .finally(() => {
        if (!cancelled) setSpotlightLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [posts]);

  const allCategories = useMemo(
    () => (posts ? Array.from(new Set(posts.map((b) => b.category))).sort() : []),
    [posts],
  );

  const isFiltering = q.trim().length > 0 || tag !== null;
  const spotlightSlugs = useMemo(() => new Set(spotlight.map((s) => s.slug)), [spotlight]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((b) => {
      const matchesQ =
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        (b.excerpt || "").toLowerCase().includes(q.toLowerCase()) ||
        (b.category || "").toLowerCase().includes(q.toLowerCase());
      const matchesTag = !tag || b.category === tag;
      return matchesQ && matchesTag;
    });
  }, [posts, q, tag]);

  useEffect(() => {
    setPage(1);
  }, [q, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageSlice = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    let cancelled = false;
    if (pageSlice.length === 0) {
      setPagePosts([]);
      return;
    }
    setPageLoading(true);
    resolveCoversForPosts(pageSlice)
      .then((resolved) => {
        if (!cancelled) setPagePosts(resolved);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageSlice]);

  const goToPage = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [lead, ...runnersUp] = spotlight;
  const showSpotlight = !loading && !isFiltering && (spotlightLoading || lead);
  const restPosts = pagePosts.filter((b) => isFiltering || !spotlightSlugs.has(b.slug));

  return (
    <PageWrapper testId="blogs-page">
      <header className="mb-8 px-2 sm:px-0 text-center sm:text-left">
        <p className="text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          Page 01 — The Blogs
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold mt-1" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <span className="hand-underline">Long-form scribbles</span>
        </h1>
        <p
          className="text-base mt-3 text-[hsl(var(--ink-soft))] max-w-2xl mx-auto sm:mx-0"
          style={{ fontFamily: "Comic Neue, sans-serif" }}
        >
          Blogs, deep dives, and the occasional whimsical tangent. Brewed slowly, with diagrams in the margins.
        </p>
      </header>

      {/* ---- Front page: lead story + runners-up ---- */}
      {showSpotlight && (
        <section className="mb-10 px-2 sm:px-0" data-testid="blog-spotlight">
          {spotlightLoading ? (
            <div
              className="sketch-card p-8 text-center text-[hsl(var(--ink-soft))]"
              style={{ fontFamily: "Caveat, cursive", fontSize: "1.3rem" }}
            >
              Unrolling the front page…
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              <Link
                to={`/blogs/${lead.slug}`}
                data-testid={`blog-hero-${lead.slug}`}
                className="lg:col-span-2 sketch-card overflow-hidden grid sm:grid-cols-2 group"
              >
                <div className="relative border-b-2 sm:border-b-0 sm:border-r-2 border-[hsl(var(--ink))] overflow-hidden">
                  <Cover src={lead.cover} alt={lead.title} className="w-full h-44 sm:h-full object-cover" />
                  <span className="absolute top-3 left-3 chip !bg-[hsl(var(--accent))]/90 !text-[hsl(var(--paper))]">
                    fresh ink
                  </span>
                </div>
                <div className="p-4 sm:p-6 flex flex-col justify-center">
                  <span className="chip self-start mb-3 text-xs">{lead.category}</span>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight" style={{ fontFamily: "Patrick Hand, cursive" }}>
                    {lead.title}
                  </h2>
                  <p
                    className="text-sm text-[hsl(var(--ink-soft))] mt-3 line-clamp-3"
                    style={{ fontFamily: "Comic Neue, sans-serif" }}
                  >
                    {lead.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-[hsl(var(--ink-soft))]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {fmtDate(lead.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {lead.readTime}
                    </span>
                  </div>
                  <span
                    className="sketch-btn sketch-btn-primary self-start mt-5 text-sm group-hover:translate-x-0.5 transition-transform"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    Start reading <ArrowRight size={14} />
                  </span>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-6">
                {runnersUp.map((b) => (
                  <Link
                    key={b.slug}
                    to={`/blogs/${b.slug}`}
                    data-testid={`blog-runner-${b.slug}`}
                    className="sketch-card overflow-hidden flex flex-col sm:flex-row gap-2 sm:gap-3 p-2.5 sm:p-3 flex-1"
                  >
                    <Cover
                      src={b.cover}
                      alt={b.title}
                      className="w-full h-24 sm:w-24 sm:h-full sm:min-h-[80px] rounded-lg object-cover border-2 border-[hsl(var(--ink))] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-start sm:justify-center">
                      <span className="chip text-xs self-start mb-1">{b.category}</span>
                      <h3
                        className="text-sm font-bold line-clamp-2"
                        style={{ fontFamily: "Patrick Hand, cursive" }}
                      >
                        {b.title}
                      </h3>
                      <span className="text-xs text-[hsl(var(--ink-soft))] mt-1 flex items-center gap-1">
                        <Clock size={11} /> {b.readTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 stagger" data-testid="blog-stats">
        {[
          { v: posts?.length ?? 0, l: "blogs" },
          { v: allCategories.length, l: "categories" },
          { v: "∞", l: "ideas explored" },
        ].map(({ v, l }, i) => (
          <div key={i} className="sketch-card p-2 sm:p-4 text-center w-full">
            <div
              className="text-xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--accent))] whitespace-nowrap"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              {v}
            </div>
            <div
              className="text-xs sm:text-base text-[hsl(var(--ink-soft))] mt-0.5 sm:mt-1 whitespace-nowrap"
              style={{ fontFamily: "Caveat, cursive" }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Search + tag filter */}
      <section className="mb-6 flex flex-col gap-3 px-2 sm:px-0" data-testid="blog-filters">
        <div className="relative max-w-xl">
          <Search
            size={18}
            strokeWidth={2.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ink-soft))]"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search the notebook..."
            data-testid="blog-search-input"
            className="sketch-input"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTag(null)}
            data-testid="tag-all"
            className={`chip ${!tag ? "!bg-[hsl(var(--accent))/0.4]" : ""}`}
          >
            <Tag size={12} /> all
          </button>
          {allCategories.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              data-testid={`tag-${t}`}
              className={`chip ${tag === t ? "!bg-[hsl(var(--accent))/0.4]" : ""}`}
            >
              #{t}
            </button>
          ))}
          {isFiltering && !loading && (
            <span
              className="text-sm ml-1 text-[hsl(var(--ink-soft))]"
              style={{ fontFamily: "Caveat, cursive" }}
              data-testid="blog-result-count"
            >
              {filtered.length} {filtered.length === 1 ? "scribble" : "scribbles"} found
            </span>
          )}
        </div>
      </section>

      {!loading && !isFiltering && spotlight.length > 0 && (
        <h3
          className="text-lg mb-3 px-2 sm:px-0 text-[hsl(var(--ink-soft))]"
          style={{ fontFamily: "Caveat, cursive" }}
        >
          more from the notebook
        </h3>
      )}

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 stagger px-2 sm:px-0" data-testid="blog-list">
        {loading && (
          <div
            className="col-span-full text-center py-16 text-[hsl(var(--ink-soft))]"
            style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}
          >
            Fetching scribbles for you…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 text-center py-14 text-[hsl(var(--ink-soft))]">
            <span className="text-4xl opacity-70">✎</span>
            <p style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}>
              No scribbles match "{q || tag}". Try erasing a word or two.
            </p>
            <button
              onClick={() => {
                setQ("");
                setTag(null);
              }}
              className="sketch-btn mt-1"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              Clear the page
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && pageLoading && (
          <div
            className="col-span-full text-center py-8 text-[hsl(var(--ink-soft))]"
            style={{ fontFamily: "Caveat, cursive", fontSize: "1.2rem" }}
          >
            Loading this page's doodles…
          </div>
        )}

        {!loading &&
          !pageLoading &&
          restPosts.map((b) => (
            <Link
              key={b.slug}
              to={`/blogs/${b.slug}`}
              data-testid={`blog-card-${b.slug}`}
              className="sketch-card overflow-hidden group h-full flex flex-col"
            >
              <div className="relative overflow-hidden border-b-2 border-[hsl(var(--ink))]">
                <div className="w-full bg-[hsl(var(--paper))]">
                  {b.cover ? (
                    <div className="relative w-full" style={{ paddingBottom: "30%" }}>
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="absolute inset-0 w-full h-full object-contain sm:object-cover bg-[hsl(var(--paper))]"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 sm:h-44 md:h-48 ruled-bg flex flex-col items-center justify-center text-[hsl(var(--ink-soft))]">
                      <span className="text-2xl opacity-80">✎</span>
                      <span className="text-xs sm:text-sm mt-2">margin doodle</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 chip !bg-[hsl(var(--paper))] !text-[hsl(var(--ink))] text-xs sm:text-sm">
                  <Clock size={12} /> {b.readTime}
                </div>
              </div>

              <div className="p-3 sm:p-5 flex-1 flex flex-col">
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold leading-tight line-clamp-2"
                  style={{ fontFamily: "Patrick Hand, cursive" }}
                >
                  {b.title}
                </h2>
                <p
                  className="text-xs sm:text-sm text-[hsl(var(--ink-soft))] mt-2 line-clamp-2 flex-1"
                  style={{ fontFamily: "Comic Neue, sans-serif" }}
                >
                  {b.excerpt}
                </p>
                <div className="mt-2 sm:mt-3">
                  <span className="chip text-xs">{b.category}</span>
                </div>
                <div className="flex items-center justify-between mt-3 sm:mt-4 text-xs text-[hsl(var(--ink-soft))]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {fmtDate(b.date)}
                  </span>
                  <span style={{ fontFamily: "Caveat, cursive" }} className="text-xs">
                    {b.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
      </section>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <nav className="flex items-center justify-center gap-2 mt-8 px-2 sm:px-0" data-testid="blog-pagination">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            data-testid="pagination-prev"
            className="chip disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> prev
          </button>
          <span
            className="text-sm px-2 text-[hsl(var(--ink-soft))]"
            style={{ fontFamily: "Caveat, cursive" }}
            data-testid="pagination-status"
          >
            page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            data-testid="pagination-next"
            className="chip disabled:opacity-40 disabled:cursor-not-allowed"
          >
            next <ChevronRight size={14} />
          </button>
        </nav>
      )}
    </PageWrapper>
  );
}