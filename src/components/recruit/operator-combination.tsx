import { OperatorItem } from "@/components/recruit/operator-item";
import type { DisplayMode } from "@/components/recruit/types";
import type { Operator } from "@/types/recruit";

interface OperatorCombinationProps {
  combination: string;
  operators: Operator[];
  displayMode: DisplayMode;
}

export function OperatorCombination({
  combination,
  operators,
  displayMode,
}: OperatorCombinationProps) {
  return (
    <div className="relative rounded-md border-2 p-4">
      <h3 className="absolute -top-[0.92rem] left-[0.55rem] inline-block bg-background px-2 text-lg font-bold">
        {combination}
      </h3>
      <ul className={`mt-2 flex flex-wrap ${displayMode === "icon" ? "gap-2" : "gap-3"}`}>
        {operators.map((operator) => (
          <OperatorItem
            key={operator.id}
            operator={operator}
            displayMode={displayMode}
          />
        ))}
      </ul>
    </div>
  );
}
