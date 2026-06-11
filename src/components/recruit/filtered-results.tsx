import { OperatorCombination } from "@/components/recruit/operator-combination";
import type { DisplayMode } from "@/components/recruit/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Operator } from "@/types/recruit";

interface FilteredResultsProps {
  filteredOperators: { [key: string]: Operator[] };
  displayMode: DisplayMode;
}

export function FilteredResults({
  filteredOperators,
  displayMode,
}: FilteredResultsProps) {
  return (
    <div className="mt-8 grid gap-8">
      <TooltipProvider delayDuration={260}>
        {Object.entries(filteredOperators).map(([combination, operators]) => (
          <OperatorCombination
            key={combination}
            combination={combination}
            operators={operators}
            displayMode={displayMode}
          />
        ))}
      </TooltipProvider>
    </div>
  );
}
