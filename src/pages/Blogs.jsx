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
      const tags = Array.isArray(b.tags) ? b.tags : [];
      const matchesQ =
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        (b.excerpt || "").toLowerCase().includes(q.toLowerCase()) ||
        (b.category || "").toLowerCase().includes(q.toLowerCase());

        const matchesTag = !tag || b.category === tag;
      return matchesQ && matchesTag;
    });
  }, [posts, q, tag]);

  const totalReads = posts ? posts.reduce((acc, b) => acc + (b.views || 0), 0) : 0;

  return (
    <PageWrapper testId="blogs-page">
      <header className="mb-6">
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

      {/* Stats strip */}
      <section className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 stagger" data-testid="blog-stats">
        {[
          { v: posts?.length ?? 0, l: "blogs" },
          { v: allCategories.length, l: "categories" },
            { v: "∞", l: "ideas explored" },
        ].map(({ v, l }, i) => (
          <div key={i} className="sketch-card p-4 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[hsl(var(--accent))]" style={{ fontFamily: "Patrick Hand, cursive" }}>
              {v}
            </div>
            <div className="text-sm text-[hsl(var(--ink-soft))] mt-1" style={{ fontFamily: "Caveat, cursive" }}>{l}</div>
          </div>
        ))}
      </section>

      {/* Search + tag filter */}
      <section className="mb-6 flex flex-col gap-3" data-testid="blog-filters">
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger" data-testid="blog-list">
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
            className="sketch-card overflow-hidden group"
          >
            <div className="relative h-44 overflow-hidden border-b-2 border-[hsl(var(--ink))]">
                <img
                    src={b.cover}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                <div className="absolute top-3 right-3 chip !bg-[hsl(var(--paper))] !text-[hsl(var(--ink))]">
                    <Clock size={12} /> {b.readTime} min
                </div>
                </div>
            <div className="p-5">
              <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: "Patrick Hand, cursive" }}>
                {b.title}
              </h2>
              <p className="text-sm text-[hsl(var(--ink-soft))] mt-2 line-clamp-2" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                {b.excerpt}
              </p>
              <div className="mt-3">
                <span className="chip text-xs">
                    {b.category}
                </span>
                </div>
              <div className="flex items-center justify-between mt-4 text-xs text-[hsl(var(--ink-soft))]">
                <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {fmtDate(b.date)}
                </span>

                <span style={{ fontFamily: "Caveat, cursive" }}>
                    {b.readTime} min read
                </span>
                </div>
            </div>
          </Link>
        ))}
      </section>
    </PageWrapper>
  );
}
