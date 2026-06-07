import MontyHallInteractive from "./MontyHall";
import CakeConjectureInteractive from "./CakeConjecture";
import DinnerTableInteractive from "./DarkDrawer";
import SortingInteractive from "./Sorting/SortingInteractive";
import { useEffect } from "react";
import { trackInteractiveLaunch } from "../lib/analytics";

export default function InteractiveRenderer({ type }) {
  const renderContent = () => {
    switch (type) {
      case "monty-hall":
        return <MontyHallInteractive />;
      case "cake-conjecture":
        return <CakeConjectureInteractive />;
      case "dark-drawer":
        return <DinnerTableInteractive />;
      case "bubble-sort":
        return <SortingInteractive />;
      default:
        return (
          <div className="sketch-card p-8 text-center">
            <p className="text-[hsl(var(--ink-soft))]" style={{ fontFamily: "Caveat, cursive" }}>
              Interactive not found. ✎
            </p>
          </div>
        );
    }
  };

  useEffect(() => {
    if (type) {
      try { trackInteractiveLaunch(type); } catch (e) {}
    }
  }, [type]);

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <div className="min-w-0 w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}