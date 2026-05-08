// Floating math doodle decorations
const symbols = [
  { char: "π", top: "8%", left: "5%", size: "5rem", delay: "0s" },
  { char: "∑", top: "18%", right: "8%", size: "4rem", delay: "1.2s" },
  { char: "∫", top: "55%", left: "3%", size: "5rem", delay: "0.5s" },
  { char: "∞", top: "70%", right: "6%", size: "4rem", delay: "2s" },
  { char: "λ", top: "32%", left: "10%", size: "3.5rem", delay: "0.8s" },
  { char: "∂", top: "85%", left: "45%", size: "3rem", delay: "1.6s" },
  { char: "≠", top: "12%", left: "48%", size: "3rem", delay: "2.4s" },
  { char: "√", top: "45%", right: "12%", size: "4rem", delay: "1s" },
];

export const Doodles = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {symbols.map((s, i) => (
        <span
          key={i}
          className="doodle"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            fontSize: s.size,
            animationDelay: s.delay,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
};
