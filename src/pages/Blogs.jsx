import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Clock, Heart, Calendar, Tag } from "lucide-react";
import { fetchBlogPosts } from "../lib/github";
import { PageWrapper } from "../components/PageWrapper";

const fmtDate = (s) =>
  new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function Blogs() {
  const [posts, setPosts] = useState(null);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts()
      .then((remote) => {
        setPosts(remote || []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const allCategories = useMemo(
    () =>
      posts
        ? Array.from(new Set(posts.map((b) => b.category))).sort()
        : [],
    [posts],
  );

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

  return (
    <PageWrapper testId="blogs-page">
      <header className="mb-6 px-2 sm:px-0">
        <p className="text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          Page 01 — The Blogs
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mt-1" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <span className="hand-underline">Long-form scribbles</span>
        </h1>
        <p className="text-base mt-3 text-[hsl(var(--ink-soft))] max-w-2xl" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Blogs, deep dives, and the occasional whimsical tangent. Brewed slowly,
          with diagrams in the margins.
        </p>
      </header>

      {/* Stats strip - Equal width cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 stagger" data-testid="blog-stats">
        {[
          { v: posts?.length ?? 0, l: "blogs" },
          { v: allCategories.length, l: "categories" },
          { v: "∞", l: "ideas explored" },
        ].map(({ v, l }, i) => (
          <div key={i} className="sketch-card p-2 sm:p-4 text-center w-full">
            <div className="text-xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--accent))] whitespace-nowrap" style={{ fontFamily: "Patrick Hand, cursive" }}>
              {v}
            </div>
            <div className="text-xs sm:text-base text-[hsl(var(--ink-soft))] mt-0.5 sm:mt-1 whitespace-nowrap" style={{ fontFamily: "Caveat, cursive" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Search + tag filter */}
      <section className="mb-6 flex flex-col gap-3 px-2 sm:px-0" data-testid="blog-filters">
        <div className="relative max-w-xl">
          <Search size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ink-soft))]" />
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
        </div>
      </section>

      {/* List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 stagger px-2 sm:px-0" data-testid="blog-list">
        {loading && (
          <div className="col-span-full text-center py-16 text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}>
            Fetching scribbles for you…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive", fontSize: "1.4rem" }}>
            No scribbles match your search. Try erasing some words ✎
          </div>
        )}
        {filtered.map((b, i) => (
          <Link
            key={b.slug}
            to={`/blogs/${b.slug}`}
            data-testid={`blog-card-${b.slug}`}
            className="sketch-card overflow-hidden group h-full flex flex-col"
          >
            <div className="relative overflow-hidden border-b-2 border-[hsl(var(--ink))]">
              <div className="w-full bg-[hsl(var(--paper))]">
                {b.cover ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight line-clamp-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
                {b.title}
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--ink-soft))] mt-2 line-clamp-2 flex-1" style={{ fontFamily: "Comic Neue, sans-serif" }}>
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
                <span style={{ fontFamily: "Caveat, cursive" }} className="text-xs">{b.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </PageWrapper>
  );
}