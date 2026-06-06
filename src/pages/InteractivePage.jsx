import {
  Link,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { PageWrapper } from "../components/PageWrapper";

import InteractiveRenderer from "../interactives/InteractiveRenderer";

export default function InteractivePage() {
  const { type } =
    useParams();

  const location =
    useLocation();

  const fromBlog =
    location.state?.fromBlog;

  return (
    <PageWrapper testId="interactive-page">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            to={
              fromBlog
                ? `/blogs/${fromBlog}`
                : "/blogs"
            }
            className="sketch-btn"
          >
            <ArrowLeft size={16} />
            back to notebook
          </Link>

          <div className="chip flex items-center gap-2">
            <Sparkles size={14} />
            Interactive
            Exploration
          </div>
        </div>

        <InteractiveRenderer
          type={type}
        />
      </div>
    </PageWrapper>
  );
}