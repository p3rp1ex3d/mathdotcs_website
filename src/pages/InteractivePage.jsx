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
  const { type } = useParams();
  const location = useLocation();
  const fromBlog = location.state?.fromBlog;

  return (
    <PageWrapper testId="interactive-page">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          <Link
            to={fromBlog ? `/blogs/${fromBlog}` : "/blogs"}
            className="sketch-btn inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={16} />
            back to notebook
          </Link>

          <div className="chip flex items-center gap-2 text-xs sm:text-sm">
            <Sparkles size={14} />
            Interactive Exploration
          </div>
        </div>

        <div className="w-full">
          <div className="w-full overflow-x-auto">
            <div className="min-w-0 w-full">
              <InteractiveRenderer type={type} />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}