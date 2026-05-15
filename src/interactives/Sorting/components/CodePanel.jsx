export default function CodePanel({
  code,
  highlightLines,
}) {
  return (
    <div className="sketch-card bg-[hsl(var(--paper-2))] px-4 py-3 overflow-x-auto border border-[hsl(var(--ink)/0.35)]">
      <pre
        className="text-[0.82rem] leading-relaxed whitespace-pre"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
        }}
      >
        {code.map((line, idx) => {
          const idx1 = idx + 1;

          const hot =
            highlightLines.includes(
              idx1,
            );

          return (
            <div
              key={`${idx}-${line.slice(
                0,
                12,
              )}`}
              className={
                hot
                  ? "rounded px-2 py-0.5 bg-[hsl(var(--accent)/0.35)] text-[hsl(var(--ink))]"
                  : "rounded px-2 py-0.5 text-[hsl(var(--ink-soft))]"
              }
            >
              <span className="mr-3 inline-block w-6 text-right opacity-55 select-none">
                {idx1}
              </span>

              {line.replace(
                /·/gu,
                ".",
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}