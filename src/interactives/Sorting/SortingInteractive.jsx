import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  RotateCcw,
  Shuffle,
} from "lucide-react";

import { useParams } from "react-router-dom";

import {
  shuffledSubset,
} from "./sortingUtils";

import {
  sortingAlgorithms,
} from "./algorithmRegistry";

import MemoryPanel from "./components/MemoryPanel";

import CodePanel from "./components/CodePanel";

export default function SortingInteractive() {
  const [seed, setSeed] =
    useState(() =>
      shuffledSubset(),
    );

  const { type } =
    useParams();

  const algo =
    useMemo(() => {
      const traceFn =
        sortingAlgorithms[type];

      return traceFn
        ? traceFn(seed)
        : sortingAlgorithms[
            "bubble-sort"
          ](seed);
    }, [type, seed]);

  const [
    stepIdx,
    setStepIdx,
  ] = useState(0);

  useEffect(() => {
    setStepIdx(0);
  }, [type, seed]);

  const lastStep =
    algo.steps.length - 1;

  const k = Math.min(
    stepIdx,
    lastStep,
  );

  const hop =
    algo.steps[k];

  const regen = () => {
    setSeed(
      shuffledSubset(),
    );

    setStepIdx(0);
  };

  const onward = () =>
    setStepIdx((prev) =>
      Math.min(
        prev + 1,
        lastStep,
      ),
    );

  const rewind =
    useCallback(() => {
      setStepIdx(0);
    }, []);

  const viz = hop.viz;

  const accents =
    new Set(
      viz.accent ?? [],
    );

  const tailFrom =
    typeof viz.tailAnchoredFrom ===
    "number"
      ? viz.tailAnchoredFrom
      : null;

  let prefixThru =
    typeof viz.prefixAnchoredUntil ===
    "number"
      ? viz.prefixAnchoredUntil
      : null;

  if (prefixThru === -1) {
    prefixThru = null;
  }

  const done = Boolean(
    viz.done,
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center">
        <h1
          className="text-4xl sm:text-5xl"
          style={{
            fontFamily:
              "Patrick Hand, cursive",
          }}
        >
          {algo.title}
        </h1>

        <p
          className="mt-3 max-w-2xl mx-auto text-[hsl(var(--ink-soft))]"
          style={{
            fontFamily:
              "Comic Neue, sans-serif",
          }}
        >
          Step through the algorithm like a notebook debugger.
        </p>
      </div>

      {algo.subtitle && (
        <p
          className="text-center text-sm text-[hsl(var(--ink-soft))]"
          style={{
            fontFamily:
              "Caveat, cursive",
          }}
        >
          {algo.subtitle}
        </p>
      )}

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* LEFT PANEL */}
        <div className="sketch-card ruled-bg p-5 overflow-hidden">
          {/* CONTROLS */}
          <div className="flex flex-wrap gap-3 mb-5">
            <button
              type="button"
              onClick={onward}
              disabled={
                k >= lastStep
              }
              className="sketch-btn sketch-btn-primary disabled:opacity-40"
            >
              next step

              <ArrowRight
                size={18}
                className="ml-1"
              />
            </button>

            <button
              type="button"
              onClick={rewind}
              className="sketch-btn"
            >
              rewind

              <RotateCcw
                size={16}
                className="ml-1"
              />
            </button>

            <button
              type="button"
              onClick={regen}
              className="sketch-btn"
            >
              reshuffle

              <Shuffle
                size={16}
                className="ml-1"
              />
            </button>
          </div>

          {/* STEP CARD */}
          <div
            className="
              mb-5
              rounded-2xl
              bg-[hsl(var(--paper-2))]
              px-5
              py-4
              border
              border-[hsl(var(--ink)/0.18)]
            "
            style={{
              fontFamily:
                "Comic Neue, sans-serif",
            }}
          >
            <p className="text-sm opacity-60 mb-1">
              Step {k + 1} of{" "}
              {algo.steps.length}
            </p>

            <p className="text-base leading-relaxed">
              {hop.caption}
            </p>
          </div>

          {/* CODE BLOCK */}
          <div className="w-full">
            <div
              className="
                rounded-xl
                overflow-hidden
                border
                border-[hsl(var(--ink)/0.12)]
              "
            >
              <CodePanel
                code={algo.code}
                highlightLines={
                  hop.highlightLines
                }
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="sketch-card ruled-bg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xl"
              style={{
                fontFamily:
                  "Patrick Hand, cursive",
              }}
            >
              Memory
            </h2>

            <span className="text-[10px] opacity-55">
              array + vars
            </span>
          </div>

          {/* MEMORY VARIABLES */}
          <div className="mb-5">
            <MemoryPanel
              vars={viz.vars}
            />
          </div>

          {/* ARRAY CELLS */}
          <div className="flex flex-wrap justify-center gap-2">
            {hop.values.map(
              (val, i) => {
                const accent =
                  accents.has(i);

                const anchoredLeft =
                  prefixThru !=
                    null &&
                  i <=
                    prefixThru;

                const anchoredRight =
                  tailFrom !=
                    null &&
                  i >=
                    tailFrom;

                const locked =
                  done ||
                  anchoredLeft ||
                  anchoredRight;

                const isI =
                  viz.vars?.i === i;

                const isJ =
                  viz.vars?.j === i;

                const isMin =
                  viz.vars?.minIdx ===
                  i;

                const labels = [];

                if (isI)
                  labels.push("i");

                if (isJ)
                  labels.push("j");

                if (isMin)
                  labels.push("min");

                return (
                  <div
                    key={`${i}-${val}`}
                    className="flex flex-col items-center"
                  >
                    {/* POINTERS */}
                    <div className="h-5 flex items-center gap-1 mb-1">
                      {labels.map(
                        (
                          label,
                        ) => (
                          <span
                            key={label}
                            className="
                              text-[9px]
                              px-1.5
                              py-[1px]
                              rounded-full
                              bg-[hsl(var(--accent)/0.22)]
                              border
                              border-[hsl(var(--ink)/0.08)]
                            "
                          >
                            {label}
                          </span>
                        ),
                      )}
                    </div>

                    {/* INDEX */}
                    <span className="text-[9px] opacity-45 mb-1">
                      [{i}]
                    </span>

                    {/* MEMORY CELL */}
                    <div
                      className={`
                        relative
                        w-12
                        h-12
                        rounded-lg
                        border-2
                        flex
                        items-center
                        justify-center
                        text-base
                        transition-all
                        duration-300
                        font-bold

                        ${
                          accent
                            ? `
                              border-[hsl(var(--ink))]
                              bg-[hsl(var(--accent)/0.32)]
                              scale-105
                              shadow-md
                            `
                            : `
                              border-[hsl(var(--ink)/0.16)]
                              bg-[hsl(var(--paper-2))]
                            `
                        }

                        ${
                          locked
                            ? ""
                            : "opacity-55"
                        }
                      `}
                      style={{
                        fontFamily:
                          "Patrick Hand, cursive",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* LEGEND */}
          <div className="mt-5 pt-4 border-t border-[hsl(var(--ink)/0.08)]">
            <div className="flex flex-wrap gap-3 text-[10px] opacity-60">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[hsl(var(--accent)/0.35)] border border-[hsl(var(--ink)/0.2)]" />

                active
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[hsl(var(--paper-2))] border border-[hsl(var(--ink)/0.18)] opacity-55" />

                unsorted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}