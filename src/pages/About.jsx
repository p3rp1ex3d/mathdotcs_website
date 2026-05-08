import { Link } from "react-router-dom";
import { Mail, BookOpen} from "lucide-react";
import {
  FaGithub,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import { PageWrapper } from "../components/PageWrapper";

export default function About() {
  return (
    <PageWrapper testId="about-page">
      <div className="max-w-3xl mx-auto">
        <p className="text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
          ✎ A short note from the author
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mt-1" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <span className="hand-underline">About this notebook</span>
        </h1>

        <article className="ruled-bg sketch-card p-6 sm:p-10 mt-8 notebook-content" data-testid="about-content">
          <p>
            <strong>MathDotCS</strong> began as a stack of margin scribbles,
            the kind you make when an idea won't sit still. It grew into a
            place to share those scribbles with anyone curious enough to read
            them.
          </p>
          <p>
            Here you'll find <span className="marker">blogs on mathematics</span>,
            videos that animate ideas, and the occasional rabbit-hole into
            computer science, complexity, and the surprising places those
            three subjects collide.
          </p>
          <h2>What you'll find</h2>
          <ul>
            <li className="ml-6 list-disc">Long-form blog posts that prefer intuition over proof-walls.</li>
            <li className="ml-6 list-disc">Animated videos that prefer pictures over equations (until the equations are needed).</li>
            <li className="ml-6 list-disc">Sketches, doodles, and analogies because the best teachers often draw.</li>
          </ul>
          <blockquote>
            "Mathematics is the music of reason. Computer science is its dance."
          </blockquote>
          <h2>Get in touch</h2>
          <p>
            If something here sparks a thought, an objection, or a better
            sketch, write back. Email is the slowest, kindest channel.
          </p>
        </article>

        <div className="flex flex-wrap gap-3 mt-8" data-testid="about-cta">
          <Link to="/blogs" className="sketch-btn sketch-btn-primary">
            <BookOpen size={16} /> Read the blogs
          </Link>
          <Link to="/videos" className="sketch-btn">
            <FaYoutube size={16} /> Watch the videos
          </Link>
          <a href="mailto:hello@mathdotcs.io" className="sketch-btn">
            <Mail size={16} /> Say hello
          </a>
        </div>
      </div>
    </PageWrapper>
  );
}
