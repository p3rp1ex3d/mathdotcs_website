import { useMemo, useState } from "react";

function getMaxPieces(n) {
  return 1 + (n * (n + 1)) / 2;
}

export default function CakeConjectureInteractive() {
  const [cuts, setCuts] = useState(0);

  const pieces = useMemo(
    () => getMaxPieces(cuts),
    [cuts],
  );

  const lines = useMemo(() => {
    return Array.from({ length: cuts }).map(
      (_, i) => {
        const angle =
          (180 / Math.max(cuts, 1)) * i +
          (i % 2 === 0 ? -12 : 12);

        return {
          id: i,
          angle,
        };
      },
    );
  }, [cuts]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1
          className="text-5xl"
          style={{
            fontFamily:
              "Patrick Hand, cursive",
          }}
        >
          Cake Slice Simulator
        </h1>

        <p
          className="mt-3 text-lg text-[hsl(var(--ink-soft))]"
          style={{
            fontFamily:
              "Comic Neue, sans-serif",
          }}
        >
          Explore how the number of
          regions grows as every new
          cut intersects all previous
          cuts.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="sketch-card ruled-bg p-6 flex flex-col items-center justify-center">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]">
            <div
              className="absolute inset-0 rounded-full border-[4px] border-[hsl(var(--ink))] bg-[hsl(var(--accent))/0.06] overflow-hidden"
              style={{
                boxShadow:
                  "inset 0 0 40px rgba(0,0,0,0.06)",
              }}
            >
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="absolute top-1/2 left-1/2 w-[170%] h-[3px] bg-[hsl(var(--ink))] origin-center"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${line.angle}deg)`,
                    borderRadius: "999px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="sketch-card ruled-bg p-6">
            <h2
              className="text-3xl mb-4"
              style={{
                fontFamily:
                  "Patrick Hand, cursive",
              }}
            >
              Current State
            </h2>

            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>Cuts</span>
                <strong>{cuts}</strong>
              </div>

              <div className="flex justify-between">
                <span>Maximum Pieces</span>
                <strong>{pieces}</strong>
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button
                onClick={() =>
                  setCuts((c) =>
                    Math.max(0, c - 1),
                  )
                }
                className="sketch-btn"
              >
                Remove Cut
              </button>

              <button
                onClick={() =>
                  setCuts((c) =>
                    Math.min(10, c + 1),
                  )
                }
                className="sketch-btn sketch-btn-primary"
              >
                Add Cut
              </button>
            </div>
          </div>

          <div className="sketch-card ruled-bg p-6">
            <h2
              className="text-3xl mb-4"
              style={{
                fontFamily:
                  "Patrick Hand, cursive",
              }}
            >
              Pattern
            </h2>

            <p
              className="leading-relaxed text-[hsl(var(--ink-soft))]"
              style={{
                fontFamily:
                  "Comic Neue, sans-serif",
              }}
            >
              Every new cut intersects
              all previous cuts,
              splitting itself into more
              segments and creating one
              additional region per
              segment.
            </p>

            <div className="mt-5 text-xl">
              <span
                style={{
                  fontFamily:
                    "Patrick Hand, cursive",
                }}
              >
                P(n) = 1 + n(n+1)/2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}