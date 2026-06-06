export default function MemoryPanel({
  vars,
}) {
  if (!vars) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
      {Object.entries(vars).map(
        ([key, value]) => (
          <div
            key={key}
            className="
              rounded-xl
              border
              border-[hsl(var(--ink)/0.2)]
              bg-[hsl(var(--paper))]
              px-3
              py-2
            "
          >
            <p className="text-[10px] uppercase opacity-60 tracking-wide">
              {key}
            </p>

            <p
              className="text-lg"
              style={{
                fontFamily:
                  "Patrick Hand, cursive",
              }}
            >
              {String(value)}
            </p>
          </div>
        ),
      )}
    </div>
  );
}