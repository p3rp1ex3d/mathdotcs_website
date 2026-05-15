
import { useMemo, useState } from "react";

function randomDoor() {
  return Math.floor(Math.random() * 3);
}

export default function MontyHallInteractive() {
  const [selected, setSelected] =
    useState(null);

  const [revealed, setRevealed] =
    useState(null);

  const [carDoor, setCarDoor] =
    useState(randomDoor());

  const [result, setResult] =
    useState(null);

  const [stats, setStats] =
    useState({
      stayWins: 0,
      switchWins: 0,
      total: 0,
    });

  const canReveal =
    selected !== null &&
    revealed === null;

  const doors = useMemo(
    () => [0, 1, 2],
    [],
  );

  function revealGoat() {
    const options = doors.filter(
      (d) =>
        d !== selected &&
        d !== carDoor,
    );

    const goatDoor =
      options[
        Math.floor(
          Math.random() * options.length,
        )
      ];

    setRevealed(goatDoor);
  }

  function choose(strategy) {
    let finalChoice = selected;

    if (strategy === "switch") {
      finalChoice = doors.find(
        (d) =>
          d !== selected &&
          d !== revealed,
      );
    }

    const won =
      finalChoice === carDoor;

    setResult({
      won,
      strategy,
      finalChoice,
    });

    setStats((s) => ({
      total: s.total + 1,
      stayWins:
        strategy === "stay" && won
          ? s.stayWins + 1
          : s.stayWins,
      switchWins:
        strategy === "switch" && won
          ? s.switchWins + 1
          : s.switchWins,
    }));
  }

  function reset() {
    setSelected(null);
    setRevealed(null);
    setResult(null);
    setCarDoor(randomDoor());
  }

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
          Monty Hall Experiment
        </h1>

        <p
          className="mt-3 text-lg text-[hsl(var(--ink-soft))]"
          style={{
            fontFamily:
              "Comic Neue, sans-serif",
          }}
        >
          Pick a door. One goat gets
          revealed. Should you stay or
          switch?
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="sketch-card ruled-bg p-8">
          <div className="grid grid-cols-3 gap-4">
            {doors.map((door) => {
              const isSelected =
                selected === door;

              const isRevealed =
                revealed === door;

              const showCar =
                result && carDoor === door;

              return (
                <button
                  key={door}
                  disabled={selected !== null}
                  onClick={() =>
                    setSelected(door)
                  }
                  className="aspect-[0.7] sketch-card flex flex-col items-center justify-center text-center p-3 transition-all hover:-rotate-1"
                >
                  <span
                    className="text-5xl"
                    style={{
                      fontFamily:
                        "Patrick Hand, cursive",
                    }}
                  >
                    {door + 1}
                  </span>

                  <div className="mt-4 text-sm">
                    {showCar
                      ? "🚗 Car"
                      : isRevealed
                      ? "🐐 Goat"
                      : isSelected
                      ? "Selected"
                      : "Closed"}
                  </div>
                </button>
              );
            })}
          </div>

          {canReveal && (
            <div className="mt-6 text-center">
              <button
                onClick={revealGoat}
                className="sketch-btn sketch-btn-primary"
              >
                Reveal a Goat
              </button>
            </div>
          )}

          {revealed !== null &&
            !result && (
              <div className="mt-6 flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() =>
                    choose("stay")
                  }
                  className="sketch-btn"
                >
                  Stay
                </button>

                <button
                  onClick={() =>
                    choose("switch")
                  }
                  className="sketch-btn sketch-btn-primary"
                >
                  Switch
                </button>
              </div>
            )}

          {result && (
            <div className="mt-6 text-center">
              <p
                className="text-2xl"
                style={{
                  fontFamily:
                    "Patrick Hand, cursive",
                }}
              >
                {result.won
                  ? "You won the car!"
                  : "Goat this time."}
              </p>

              <button
                onClick={reset}
                className="sketch-btn mt-4"
              >
                Play Again
              </button>
            </div>
          )}
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
              Experiment Stats
            </h2>

            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>Total Trials</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="flex justify-between">
                <span>Stay Wins</span>
                <strong>
                  {stats.stayWins}
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Switch Wins</span>
                <strong>
                  {stats.switchWins}
                </strong>
              </div>
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
              Insight
            </h2>

            <p
              className="leading-relaxed text-[hsl(var(--ink-soft))]"
              style={{
                fontFamily:
                  "Comic Neue, sans-serif",
              }}
            >
              Switching works more often
              because your first choice
              had only a 1/3 chance of
              being correct. The host's
              reveal transfers the other
              probability mass onto the
              remaining unopened door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
