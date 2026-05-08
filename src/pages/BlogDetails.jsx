import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { fetchBlogPosts } from "../lib/github";
import { PageWrapper } from "../components/PageWrapper";

const fmtDate = (s) =>
  new Date(s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BlogDetail() {
  const { slug } = useParams();

const [posts, setPosts] = useState([]);
const [blog, setBlog] = useState(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadBlog() {
    setLoading(true);

    const remote = await fetchBlogPosts();

    setPosts(remote || []);

    const found = remote.find(
      (item) => item.slug === slug
    );

    setBlog(found || null);

    setLoading(false);
  }

  loadBlog();
}, [slug]);

  if (loading) {
    return (
  <PageWrapper testId="blog-loading">
    <div className="text-center py-24 flex flex-col items-center">
      <div className="scribble-loader mb-6" />

      <p
        className="text-3xl"
        style={{
          fontFamily: "Patrick Hand, cursive",
        }}
      >
        Fetching the scribble for you...
      </p>

      <p
        className="text-lg text-[hsl(var(--ink-soft))] mt-2"
        style={{
          fontFamily: "Caveat, cursive",
        }}
      >
        turning dusty notebook pages...
      </p>
    </div>
  </PageWrapper>
);

if (!blog) {
  return (
    <PageWrapper testId="blog-not-found">
      <div className="text-center py-24">
        <p
          className="text-3xl"
          style={{
            fontFamily: "Patrick Hand, cursive",
          }}
        >
          This scribble seems missing.
        </p>

        <Link
          to="/blogs"
          className="sketch-btn mt-6 inline-flex"
        >
          <ArrowLeft size={16} />
          Back to notebook
        </Link>
      </div>
    </PageWrapper>
  );
}
  }

  // Find prev/next
  const idx = posts.findIndex((b) => b.slug === slug);

  const prev = idx > 0 ? posts[idx - 1] : null;

  const next =
    idx < posts.length - 1
      ? posts[idx + 1]
      : null;

  return (
    <PageWrapper testId="blog-detail-page">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/blogs"
          data-testid="back-to-blogs"
          className="sketch-btn mb-6 !text-sm"
        >
          <ArrowLeft size={14} />
          back to the index
        </Link>

        {/* Header */}
        <header className="mb-6">
          <p
            className="text-sm text-[hsl(var(--ink-soft))] mb-2"
            style={{ fontFamily: "Caveat, cursive" }}
          >
            ✎ {fmtDate(blog.date)} · {blog.readTime}
          </p>

          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            {blog.title}
          </h1>

          <p
            className="text-lg mt-3 text-[hsl(var(--ink-soft))]"
            style={{ fontFamily: "Caveat, cursive" }}
          >
            {blog.excerpt}
          </p>

          {/* Category */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="chip">
              {blog.category}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-4 text-sm text-[hsl(var(--ink-soft))]">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {blog.readTime}
            </span>

            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {fmtDate(blog.date)}
            </span>
          </div>
        </header>

        {/* Cover */}
        {blog.cover && (
          <div className="relative mb-8 sketch-card overflow-hidden tape">
            <img
              src={blog.cover}
              alt={blog.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article
          className="ruled-bg p-6 sm:p-10 sketch-card notebook-content mathcs-prose"
          data-testid="blog-content"
        >
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {blog.content}
          </ReactMarkdown>
        </article>

        {/* Prev / Next */}
        <nav
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-testid="blog-nav"
        >
          {prev ? (
            <Link
              to={`/blogs/${prev.slug}`}
              className="sketch-card p-4"
            >
              <p
                className="text-xs text-[hsl(var(--ink-soft))]"
                style={{ fontFamily: "Caveat, cursive" }}
              >
                ← previous page
              </p>

              <p
                className="font-bold mt-1"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              to={`/blogs/${next.slug}`}
              className="sketch-card p-4 text-right"
            >
              <p
                className="text-xs text-[hsl(var(--ink-soft))]"
                style={{ fontFamily: "Caveat, cursive" }}
              >
                next page →
              </p>

              <p
                className="font-bold mt-1"
                style={{ fontFamily: "Patrick Hand, cursive" }}
              >
                {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </PageWrapper>
  );
}