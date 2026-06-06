export function snapshot(
  values,
  caption,
  highlightLines,
  viz = {},
) {
  return {
    values: [...values],
    caption,

    highlightLines:
      Array.isArray(highlightLines)
        ? highlightLines
        : [highlightLines],

    viz,
  };
}

export function shuffledSubset(
  n = 6,
  lo = 6,
  hi = 58,
) {
  const nums = Array.from(
    { length: hi - lo + 1 },
    (_, k) => lo + k,
  );

  for (
    let i = nums.length - 1;
    i > 0;
    i--
  ) {
    const r = Math.floor(
      Math.random() * (i + 1),
    );

    [nums[i], nums[r]] = [
      nums[r],
      nums[i],
    ];
  }

  return nums.slice(0, n);
}