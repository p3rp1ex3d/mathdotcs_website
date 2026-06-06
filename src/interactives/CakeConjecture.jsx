import React, { useState } from "react";

const SIZE = 420;
const CENTER = SIZE / 2;
const RADIUS = 170;

function circleLineEndpoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return null;
  }

  const fx = x1 - CENTER;
  const fy = y1 - CENTER;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - RADIUS * RADIUS;

  const disc = b * b - 4 * a * c;

  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);

  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  return {
    x1: x1 + dx * t1,
    y1: y1 + dy * t1,
    x2: x1 + dx * t2,
    y2: y1 + dy * t2,
  };
}

function intersection(lineA, lineB) {
  const { x1, y1, x2, y2 } = lineA;
  const {
    x1: x3,
    y1: y3,
    x2: x4,
    y2: y4,
  } = lineB;

  const den =
    (x1 - x2) * (y3 - y4) -
    (y1 - y2) * (x3 - x4);

  if (Math.abs(den) < 0.00001) return null;

  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) -
      (x1 - x2) * (x3 * y4 - y3 * x4)) /
    den;

  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) -
      (y1 - y2) * (x3 * y4 - y3 * x4)) /
    den;

  const dist = Math.hypot(
    px - CENTER,
    py - CENTER
  );

  if (dist > RADIUS + 1) return null;

  return { x: px, y: py };
}

function dedupe(points) {
  const result = [];

  for (const p of points) {
    const exists = result.some(
      (q) =>
        Math.hypot(
          p.x - q.x,
          p.y - q.y
        ) < 0.5
    );

    if (!exists) {
      result.push(p);
    }
  }

  return result;
}

export default function CakeConjectureInteractive() {
  const [cuts, setCuts] = useState([]);
  const [regions, setRegions] = useState(1);

  const [drawing, setDrawing] =
    useState(false);

  const [start, setStart] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  function mousePos(e) {
    const rect =
      e.currentTarget.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handleDown(e) {
    const p = mousePos(e);

    const d = Math.hypot(
      p.x - CENTER,
      p.y - CENTER
    );

    if (d > RADIUS) return;

    setDrawing(true);
    setStart(p);
    setPreview(p);
  }

  function handleMove(e) {
    if (!drawing) return;
    setPreview(mousePos(e));
  }

  function handleUp(e) {
    if (!drawing || !start) return;

    const end = mousePos(e);

    if (
      Math.hypot(
        end.x - start.x,
        end.y - start.y
      ) < 10
    ) {
      setDrawing(false);
      setStart(null);
      setPreview(null);
      return;
    }

    const fullCut =
      circleLineEndpoints(
        start.x,
        start.y,
        end.x,
        end.y
      );

    const intersections = [];

    cuts.forEach((cut) => {
      const p = intersection(
        fullCut,
        cut
      );

      if (p) intersections.push(p);
    });

    const unique =
      dedupe(intersections);

    const crossesAllPrevious =
  unique.length === cuts.length;

    const newRegions =
      unique.length + 1;

    setRegions(
      (r) => r + newRegions
    );

    setCuts((prev) => [
      ...prev,
      fullCut,
    ]);

    setDrawing(false);
    setStart(null);
    setPreview(null);
  }

  function resetCake() {
    setCuts([]);
    setRegions(1);
  }

  const previewLine =
    drawing &&
    start &&
    preview &&
    circleLineEndpoints(
      start.x,
      start.y,
      preview.x,
      preview.y
    );

  const points = [];

  cuts.forEach((cutA, i) => {
    cuts
      .slice(i + 1)
      .forEach((cutB) => {
        const p = intersection(
          cutA,
          cutB
        );

        if (p) points.push(p);
      });
  });

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
          Draw cuts across the cake
          and discover how the number
          of regions grows.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="sketch-card ruled-bg p-6 flex flex-col items-center justify-center">
          <svg
            width={SIZE}
            height={SIZE}
            className="max-w-full cursor-crosshair"
            onMouseDown={handleDown}
            onMouseMove={handleMove}
            onMouseUp={handleUp}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="hsl(var(--accent) / 0.06)"
              stroke="hsl(var(--ink))"
              strokeWidth="4"
            />

            {cuts.map((cut, i) => (
              <line
                key={i}
                x1={cut.x1}
                y1={cut.y1}
                x2={cut.x2}
                y2={cut.y2}
                stroke="hsl(var(--ink))"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}

            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="hsl(var(--ink))"
              />
            ))}

            {previewLine && (
              <line
                x1={previewLine.x1}
                y1={previewLine.y1}
                x2={previewLine.x2}
                y2={previewLine.y2}
                stroke="hsl(var(--ink))"
                strokeWidth="3"
                strokeDasharray="10 8"
                opacity="0.6"
                strokeLinecap="round"
              />
            )}
          </svg>
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
              Puzzle
            </h2>

            <p
              className="leading-relaxed text-[hsl(var(--ink-soft))]"
              style={{
                fontFamily:
                  "Comic Neue, sans-serif",
              }}
            >
              Imagine you're cutting a perfectly
              round cake. Each new cut should cross
              as many previous cuts as possible.
            </p>

            <p
              className="mt-4 italic text-[hsl(var(--ink-soft))]"
              style={{
                fontFamily:
                  "Comic Neue, sans-serif",
              }}
            >
              With 10 straight cuts, what is the maximum number of pieces you can obtain?
            </p>
          </div>

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
                <strong>{cuts.length}</strong>
              </div>

              <div className="flex justify-between">
                <span>Regions</span>
                <strong>{regions}</strong>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={resetCake}
                className="sketch-btn sketch-btn-primary"
              >
                Reset Cake
              </button>
            </div>
          </div>
        </div>          
        </div>
      </div>
  );
}