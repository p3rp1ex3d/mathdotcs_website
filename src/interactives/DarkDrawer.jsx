import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { trackInteractiveLaunch, trackInteractiveComplete } from "../lib/analytics";

const SIZE = 500;
const CENTER = SIZE / 2;
const TABLE_RADIUS = 180;

export default function DinnerTableInteractive() {
  const [people, setPeople] = useState(12);
  const [skip, setSkip] = useState(1);
  const [edges, setEdges] = useState([]);
  const [visitedCount, setVisitedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const intervalRef = useRef(null);

  const positions = useMemo(() => {
    return Array.from({ length: people }, (_, i) => {
      const angle = (2 * Math.PI * i) / people - Math.PI / 2;
      return {
        x: CENTER + TABLE_RADIUS * Math.cos(angle),
        y: CENTER + TABLE_RADIUS * Math.sin(angle),
      };
    });
  }, [people]);

  function buildPath() {
    const seen = new Set();
    const path = [];
    let current = 0;

    while (!seen.has(current)) {
      seen.add(current);
      const next = (current + skip + 1) % people;
      path.push({ from: current, to: next });
      current = next;
    }

    return { path, visited: seen.size };
  }

  function simulate() {
    if (isRunning) return;
    const result = buildPath();

    setEdges([]);
    setVisitedCount(0);
    setActiveNode(0);
    setIsRunning(true);

    try { trackInteractiveLaunch('dark-drawer'); } catch (e) {}

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      const currentEdges = result.path.slice(0, i);
      setEdges(currentEdges);
      
      const visited = new Set();
      currentEdges.forEach((edge) => visited.add(edge.from));
      setVisitedCount(visited.size);
      
      if (currentEdges.length > 0) {
        setActiveNode(currentEdges[currentEdges.length - 1].to);
      }
      
      if (i >= result.path.length) {
        clearInterval(intervalRef.current);
        setVisitedCount(result.visited);
        setIsRunning(false);
        try { trackInteractiveComplete('dark-drawer'); } catch (e) {}
      }
    }, 450);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEdges([]);
    setVisitedCount(0);
    setActiveNode(0);
    setIsRunning(false);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const reachedEveryone = visitedCount === people && visitedCount > 0 && !isRunning;
  const visitedNodes = new Set();
  edges.forEach((edge) => visitedNodes.add(edge.from));

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="text-center px-2">
        <h1 className="text-2xl sm:text-3xl md:text-5xl" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Dinner Table Explorer
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Explore how a simple passing rule can either visit everyone or become trapped in a loop.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 sketch-card ruled-bg p-3 sm:p-4 md:p-6">
          <div className="w-full flex justify-center overflow-x-auto">
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="max-w-full h-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              <circle
                cx={CENTER}
                cy={CENTER}
                r={TABLE_RADIUS + 25}
                fill="transparent"
                stroke="hsl(var(--ink))"
                strokeWidth="2"
                opacity="0.15"
              />

              {edges.map((edge, i) => {
                const from = positions[edge.from];
                const to = positions[edge.to];
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="hsl(var(--ink))"
                    strokeWidth="2.5"
                    opacity="0.8"
                  />
                );
              })}

              {positions[activeNode] && (
                <text x={positions[activeNode].x} y={positions[activeNode].y + 7} textAnchor="middle" fontSize="24">
                  🥣
                </text>
              )}

              {positions.map((p, i) => {
                const visited = visitedNodes.has(i);
                return (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="18"
                      fill={visited ? "hsl(var(--accent) / 0.4)" : "white"}
                      stroke="hsl(var(--ink))"
                      strokeWidth={visited ? 3 : 2}
                    />
                    <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="12" fill="hsl(var(--ink))">
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={simulate} disabled={isRunning} className="sketch-btn sketch-btn-primary">
                {isRunning ? "Passing..." : "Simulate"}
              </button>
              <button onClick={reset} disabled={isRunning} className="sketch-btn">
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="sketch-card ruled-bg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-4" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Puzzle
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
              Friends sit around a circular table. A bowl of snacks is passed by skipping the same number of people each time.
            </p>
            <p className="mt-3 sm:mt-4 italic text-sm sm:text-base text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
              Which skip values eventually reach everyone, and which become trapped in a repeating cycle?
            </p>
          </div>

          <div className="sketch-card ruled-bg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Current State
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-2">
                <label className="flex flex-col text-sm sm:text-base" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                  <span className="mb-1">People: {people}</span>
                  <input
                    type="range"
                    min="4"
                    max="15"
                    value={people}
                    disabled={isRunning}
                    onChange={(e) => {
                      setPeople(Number(e.target.value));
                      reset();
                    }}
                    className="w-full"
                  />
                </label>

                <label className="flex flex-col text-sm sm:text-base" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                  <span className="mb-1">Skip: {skip}</span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(people - 2, 0)}
                    value={skip}
                    disabled={isRunning}
                    onChange={(e) => {
                      setSkip(Number(e.target.value));
                      reset();
                    }}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="space-y-2 sm:space-y-3 text-base sm:text-lg pt-2">
                <div className="flex justify-between items-center">
                  <span>People</span>
                  <strong className="text-lg sm:text-xl">{people}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Skip</span>
                  <strong className="text-lg sm:text-xl">{skip}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Visited</span>
                  <strong className="text-lg sm:text-xl">{visitedCount}/{people}</strong>
                </div>
              </div>

              {!isRunning && edges.length > 0 && (
                <div className={`mt-3 sm:mt-4 text-sm sm:text-base p-2 sm:p-3 rounded text-center ${reachedEveryone ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} style={{ fontFamily: "Comic Neue, sans-serif" }}>
                  {reachedEveryone ? "✓ Reached everyone!" : "✗ Trapped in a loop"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}