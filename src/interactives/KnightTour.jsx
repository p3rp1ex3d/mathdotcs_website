import { useMemo, useState } from "react";

const BOARD_SIZE = 8;
const KNIGHT_MOVES = [
  [2, 1],
  [1, 2],
  [-1, 2],
  [-2, 1],
  [-2, -1],
  [-1, -2],
  [1, -2],
  [2, -1],
];

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function algebraic(row, col) {
  return `${String.fromCharCode(97 + col)}${BOARD_SIZE - row}`;
}

function isKnightMove(from, to) {
  if (!from || !to) return false;
  return KNIGHT_MOVES.some(
    ([dr, dc]) => from[0] + dr === to[0] && from[1] + dc === to[1],
  );
}

function getMoves(position, visited) {
  if (!position) return [];

  return KNIGHT_MOVES.map(([dr, dc]) => [position[0] + dr, position[1] + dc]).filter(
    ([row, col]) => inBounds(row, col) && !visited[row][col],
  );
}

function getDegree(position, visited) {
  return getMoves(position, visited).length;
}

function buildVisited(path) {
  const grid = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => false),
  );
  path.forEach(([row, col]) => {
    grid[row][col] = true;
  });
  return grid;
}

function findWarnsdorffTour(start, closed = false) {
  const visited = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => false),
  );
  const path = [start];
  visited[start[0]][start[1]] = true;
  const origin = start;

  function search(current) {
    if (path.length === BOARD_SIZE * BOARD_SIZE) {
      return !closed || isKnightMove(current, origin);
    }

    const moves = KNIGHT_MOVES.map(([dr, dc]) => [current[0] + dr, current[1] + dc]).filter(
      ([row, col]) => inBounds(row, col) && !visited[row][col],
    );

    const sorted = moves
      .map((move) => ({ move, degree: getDegree(move, visited) }))
      .sort((a, b) => a.degree - b.degree)
      .map((entry) => entry.move);

    if (closed && path.length === BOARD_SIZE * BOARD_SIZE - 1) {
      const closing = sorted.filter((move) => isKnightMove(move, origin));
      if (closing.length > 0) {
        sorted.splice(0, sorted.length, ...closing);
      }
    }

    for (const next of sorted) {
      visited[next[0]][next[1]] = true;
      path.push(next);

      if (search(next)) {
        return true;
      }

      visited[next[0]][next[1]] = false;
      path.pop();
    }

    return false;
  }

  return search(start) ? path : null;
}

export default function KnightTourInteractive() {
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState(
    "Click a square to place the knight and begin the tour.",
  );
  const [solutionType, setSolutionType] = useState("user");

  const visited = useMemo(() => buildVisited(path), [path]);
  const knightPosition = path[path.length - 1] ?? null;
  const origin = path[0] ?? null;
  const movesLeft = BOARD_SIZE * BOARD_SIZE - path.length;
  const availableMoves = useMemo(
    () => (knightPosition ? getMoves(knightPosition, visited) : []),
    [knightPosition, visited],
  );
  const isComplete = path.length === BOARD_SIZE * BOARD_SIZE;
  const isClosed = isComplete && origin && isKnightMove(knightPosition, origin);

  function resetBoard() {
    setPath([]);
    setStatus("Click any square to place the knight and start the tour.");
    setSolutionType("user");
  }

  function handleSquareClick(row, col) {
    if (isComplete) {
      setStatus("Tour is complete. Reset to start again.");
      return;
    }

    if (!knightPosition) {
      setPath([[row, col]]);
      setStatus(
        `Knight placed at ${algebraic(row, col)}. Choose a legal knight move next.`,
      );
      setSolutionType("user");
      return;
    }

    const target = [row, col];
    const valid = availableMoves.some(
      (move) => move[0] === target[0] && move[1] === target[1],
    );

    if (valid) {
      const nextPath = [...path, target];
      setPath(nextPath);
      setSolutionType("user");
      if (nextPath.length === BOARD_SIZE * BOARD_SIZE) {
        setStatus(
          isKnightMove(target, origin)
            ? "Nice! You've completed a closed knight tour."
            : "Nice! You've completed an open knight tour.",
        );
      } else {
        setStatus(
          `Moved to ${algebraic(row, col)}. ${movesLeft - 1} squares remaining.`,
        );
      }
      return;
    }

    const squareName = algebraic(row, col);
    if (visited[row][col]) {
      setStatus(`Square ${squareName} is already occupied. Choose an open knight move.`);
    } else {
      setStatus(`Move to ${squareName} is not a legal knight move from ${algebraic(...knightPosition)}.`);
    }
  }

  function solveTour(closed = false) {
    const start = origin ?? [0, 0];
    const result = findWarnsdorffTour(start, closed);

    if (!result) {
      setStatus(
        closed
          ? "Unable to find a closed Warnsdorff tour from this starting square."
          : "Unable to find a Warnsdorff tour from this starting square.",
      );
      return;
    }

    setPath(result);
    setSolutionType(closed ? "closed" : "warnsdorff");
    setStatus(
      closed
        ? `Closed tour solved from ${algebraic(...start)} and returns to ${algebraic(...start)}.`
        : `Warnsdorff tour solved from ${algebraic(...start)}.`,
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 bg-[hsl(var(--bg))]">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        <div className="text-center px-1 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: "Patrick Hand, cursive" }}>
            Knight Tour Puzzle
          </h1>
          <p className="mt-1 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
            Move the knight so it visits every square exactly once. Use the solver buttons for a Warnsdorff tour or a closed tour that returns to the starting square.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="sketch-card ruled-bg p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden pb-5">
            <div className="flex items-center justify-center">
              <div
                className="grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 md:gap-2"
                style={{ 
                  width: 'min(500px, calc(100vw - 24px))', 
                  height: 'min(500px, calc(100vw - 24px))',
                  maxWidth: '100%'
                }}
              >
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const visitedSquare = visited[row][col];
                    const isKnight = !!knightPosition && knightPosition[0] === row && knightPosition[1] === col;
                    const isOrigin = !!origin && origin[0] === row && origin[1] === col;
                    const moveIndex = path.findIndex(entry => entry[0] === row && entry[1] === col);
                    const isAvailable = availableMoves.some(move => move[0] === row && move[1] === col);

                    const base = "border border-[hsl(var(--ink-soft))]/20 text-center font-medium transition-all rounded-lg";
                    const activeClasses = isKnight
                      ? "bg-[hsl(var(--accent))] text-white shadow-lg scale-95"
                      : isAvailable
                        ? "bg-[hsl(var(--accent-soft))] ring-2 ring-[hsl(var(--accent))]/50 text-[hsl(var(--ink))] cursor-pointer hover:bg-[hsl(var(--accent-soft))]/80 active:scale-95"
                        : visitedSquare
                          ? "bg-[hsl(var(--ink-soft))]/10 text-[hsl(var(--ink))]"
                          : "bg-white text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--accent-soft))]/30 cursor-pointer active:scale-95";
                    const ringClasses = isOrigin ? "ring ring-[hsl(var(--accent))] ring-offset-2" : "";

                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        onClick={() => handleSquareClick(row, col)}
                        className={`${base} ${activeClasses} ${ringClasses} w-full h-full min-w-0 flex items-center justify-center flex-col p-1 sm:p-1.5 md:p-1.5 lg:p-2 box-border touch-manipulation`}
                        style={{ aspectRatio: '1' }}
                      >
                        <span className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs uppercase tracking-[0.06em] sm:tracking-[0.08em] text-[hsl(var(--ink-soft))] leading-none select-none">
                          {String.fromCharCode(65 + col)}{BOARD_SIZE - row}
                        </span>
                        {isKnight ? (
                          <span className="text-base sm:text-lg md:text-2xl lg:text-3xl leading-none select-none">♞</span>
                        ) : moveIndex >= 0 ? (
                          <span className="text-[8px] sm:text-[10px] md:text-sm lg:text-base leading-none select-none font-bold">{moveIndex + 1}</span>
                        ) : (
                          <span className="h-2 sm:h-3 md:h-4 lg:h-5" />
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="sketch-card p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3 md:space-y-4">
              <div>
                <p className="text-sm sm:text-base md:text-lg font-bold text-[hsl(var(--ink-soft))]">Status</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[hsl(var(--ink))] leading-relaxed">{status}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs md:text-sm text-[hsl(var(--ink-soft))]">
                <div>
                  <strong>Start:</strong>{" "}
                  {origin ? algebraic(...origin) : "None"}
                </div>
                <div>
                  <strong>Current:</strong>{" "}
                  {knightPosition ? algebraic(...knightPosition) : "None"}
                </div>
                <div>
                  <strong>Visited:</strong>{" "}
                  {path.length} / 64
                </div>
                <div>
                  <strong>Available:</strong>{" "}
                  {availableMoves.length}
                </div>
                <div className="col-span-2">
                  <strong>Tour type:</strong>{" "}
                  {solutionType === "user"
                    ? "Manual"
                    : solutionType === "warnsdorff"
                      ? "Warnsdorff"
                      : "Closed tour"}
                </div>
              </div>
              {isClosed && (
                <div className="rounded-lg border border-green-400 bg-green-50 p-1.5 sm:p-2 md:p-3 text-[10px] sm:text-xs md:text-sm text-green-900">
                  ✓ Closed tour - can return to start
                </div>
              )}
            </div>

            <div className="sketch-card p-3 sm:p-4 md:p-5 lg:p-6 space-y-1.5 sm:space-y-2 md:space-y-3">
              <button
                type="button"
                onClick={() => resetBoard()}
                className="sketch-btn w-full text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3 touch-manipulation"
              >
                Reset board
              </button>
              <button
                type="button"
                onClick={() => solveTour(false)}
                className="sketch-btn sketch-btn-primary w-full text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3 touch-manipulation"
              >
                Solve with Warnsdorff
              </button>
              <button
                type="button"
                onClick={() => solveTour(true)}
                className="sketch-btn sketch-btn-secondary w-full text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3 touch-manipulation"
              >
                Show closed tour
              </button>
            </div>

            <div className="sketch-card p-3 sm:p-4 md:p-5 lg:p-6 space-y-1 sm:space-y-2">
              <p className="font-semibold text-xs sm:text-sm md:text-base">💡 Puzzle</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-[hsl(var(--ink-soft))]">
                Can you move the knight to visit all 64 squares exactly once?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}