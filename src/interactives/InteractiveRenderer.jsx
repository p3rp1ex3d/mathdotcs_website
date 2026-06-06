import MontyHallInteractive
from "./MontyHall";

import CakeConjectureInteractive
from "./CakeConjecture";

import SortingInteractive from "./Sorting/SortingInteractive";

export default function InteractiveRenderer({
  type,
}) {
  switch (type) {
    case "monty-hall":
      return <MontyHallInteractive />;

    case "cake-conjecture":
      return <CakeConjectureInteractive />;

    case "bubble-sort":
      return <SortingInteractive />;

    default:
      return (
        <div className="sketch-card p-8">
          Interactive not found.
        </div>
      );
  }
}