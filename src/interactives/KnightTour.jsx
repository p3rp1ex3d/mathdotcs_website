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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-5xl" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Knight Tour Puzzle
        </h1>
        <p className="mt-3 text-lg text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Comic Neue, sans-serif" }}>
          Move the knight so it visits every square exactly once. Use the solver buttons for a Warnsdorff tour or a closed tour that returns to the starting square.
        </p>
      </div>

      <div className="grid gap-6 items-center lg:grid-cols-[1.2fr_0.8fr]">
        <div className="sketch-card ruled-bg p-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-8 gap-1 justify-center">
              {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                Array.from({ length: BOARD_SIZE }).map((_, col) => {
                  const visitedSquare = visited[row][col];
                  const isKnight = !!knightPosition && knightPosition[0] === row && knightPosition[1] === col;
                  const isOrigin = !!origin && origin[0] === row && origin[1] === col;
                  const moveIndex = path.findIndex(entry => entry[0] === row && entry[1] === col);
                  const isAvailable = availableMoves.some(move => move[0] === row && move[1] === col);

                  const base = "border border-[hsl(var(--ink-soft))]/20 text-center text-sm font-medium transition-all rounded-lg";
                  const activeClasses = isKnight
                    ? "bg-[hsl(var(--accent))] text-white"
                    : isAvailable
                      ? "bg-[hsl(var(--accent-soft))] ring-2 ring-[hsl(var(--accent))]/50 text-[hsl(var(--ink))] cursor-pointer"
                      : visitedSquare
                        ? "bg-[hsl(var(--ink-soft))]/10 text-[hsl(var(--ink))]"
                        : "bg-white text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--accent-soft))]/50 cursor-pointer";
                  const ringClasses = isOrigin ? "ring ring-[hsl(var(--accent))] ring-offset-2" : "";

                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onClick={() => handleSquareClick(row, col)}
                      className={`${base} ${activeClasses} ${ringClasses} aspect-square flex items-center justify-center flex-col p-2`}
                    >
                      <span className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--ink-soft))]">
                        {String.fromCharCode(65 + col)}{BOARD_SIZE - row}
                      </span>
                      {isKnight ? (
                        <span className="text-2xl">♞</span>
                      ) : moveIndex >= 0 ? (
                        <span className="text-sm">{moveIndex + 1}</span>
                      ) : (
                        <span className="h-5" />
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="sketch-card p-6 space-y-4">
            <div>
              <p className="text-lg font-bold text-[hsl(var(--ink-soft))]">Status</p>
              <p className="mt-2 text-sm font-medium text-[hsl(var(--ink))]">{status}</p>
            </div>
            <div className="grid gap-2 text-sm text-[hsl(var(--ink-soft))]">
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
                <strong>Available moves:</strong>{" "}
                {availableMoves.length}
              </div>
              <div>
                <strong>Tour type:</strong>{" "}
                {solutionType === "user"
                  ? "Manual"
                  : solutionType === "warnsdorff"
                    ? "Warnsdorff"
                    : "Closed tour"}
              </div>
              {isClosed && (
                <div className="rounded-lg border border-green-400 bg-green-50 p-3 text-sm text-green-900">
                  This is a closed tour. The knight can return to the starting square.
                </div>
              )}
            </div>
          </div>

          <div className="sketch-card p-6 space-y-3">
            <button
              type="button"
              onClick={() => resetBoard()}
              className="sketch-btn w-full"
            >
              Reset board
            </button>
            <button
              type="button"
              onClick={() => solveTour(false)}
              className="sketch-btn sketch-btn-primary w-full"
            >
              Solve with Warnsdorff
            </button>
            <button
              type="button"
              onClick={() => solveTour(true)}
              className="sketch-btn sketch-btn-secondary w-full"
            >
              Show closed tour
            </button>
          </div>

          <div className="sketch-card p-6 space-y-3 text-xs text-[hsl(var(--ink-soft))]">
            <p className="font-semibold">Puzzle</p>
            <p>
              Can you move the knight so that it visits all 64 squares exactly once?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
