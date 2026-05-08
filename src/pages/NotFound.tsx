import { Link } from "react-router-dom";
import { PageWrapper } from "../components/PageWrapper";

export default function NotFound() {
  return (
    <PageWrapper testId="not-found-page">
      <div className="text-center py-16">
        <p className="text-7xl mb-4" style={{ fontFamily: "Caveat, cursive", color: "hsl(var(--accent))" }}>
          ¯\_(ツ)_/¯
        </p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Patrick Hand, cursive" }}>
          This page was erased.
        </h1>
        <p className="text-lg mt-3 text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          Or maybe it was never written. Either way — let's flip back.
        </p>
        <Link to="/" className="sketch-btn sketch-btn-primary mt-6 inline-flex" data-testid="not-found-home">
          ← Back to the cover
        </Link>
      </div>
    </PageWrapper>
  );
}