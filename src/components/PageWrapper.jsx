import { useEffect } from "react";

// Smooth fade/translate page entrance for non-book routes
export const PageWrapper = ({ children, testId }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return (
    <main
      data-testid={testId || "page-wrapper"}
      className="relative z-10 page-enter px-5 sm:px-10 pt-2 pb-10 max-w-6xl mx-auto w-full"
    >
      {children}
    </main>
  );
};
