import { snapshot } from "./sortingUtils";

export function traceBubbleSort(start) {
  const arr = [...start];

  const n = arr.length;

  const steps = [];

  const code = [
    "bubbleSort(arr, n):",
    "  for pass = 0 .. n-2",
    "    for j = 0 .. n-2-pass",
    "      if arr[j] > arr[j+1]:",
    "        swap(arr[j], arr[j+1])",
  ];

  steps.push(
    snapshot(
      arr,
      "Start bubble sort.",
      [1],
    ),
  );

  for (let pass = 0; pass < n - 1; pass++) {
    steps.push(
      snapshot(
        arr,
        `Start pass ${pass}.`,
        [2],
        {
          vars: {
            pass,
          },
        },
      ),
    );

    for (
      let j = 0;
      j < n - 1 - pass;
      j++
    ) {
      steps.push(
        snapshot(
          arr,
          `Compare index ${j} and ${
            j + 1
          }.`,
          [3],
          {
            accent: [j, j + 1],

            vars: {
              pass,
              j,
            },
          },
        ),
      );

      steps.push(
        snapshot(
          arr,
          `Check if swap is needed.`,
          [4],
          {
            accent: [j, j + 1],

            vars: {
              pass,
              j,
            },
          },
        ),
      );

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];

        arr[j] = arr[j + 1];

        arr[j + 1] = temp;

        steps.push(
          snapshot(
            arr,
            `Swap values.`,
            [5],
            {
              accent: [j, j + 1],

              vars: {
                pass,
                j,
                temp,
              },
            },
          ),
        );
      }
    }
  }

  steps.push(
    snapshot(
      arr,
      "Array sorted.",
      [1],
      {
        done: true,
      },
    ),
  );

  return {
    id: "bubble-sort",

    title: "Bubble sort",

    code,
    steps,
  };
}