import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Operator } from "@/types/recruit";
import type { DisplayMode } from "@/components/recruit/types";

const rarityTextColors: { [key: number]: string } = {
  1: "text-gray-400",
  2: "text-green-400",
  3: "text-blue-400",
  4: "text-purple-400",
  5: "text-orange-400",
  6: "text-red-400",
};

interface OperatorItemProps {
  operator: Operator;
  displayMode: DisplayMode;
}

export function OperatorItem({ operator, displayMode }: OperatorItemProps) {
  if (displayMode === "card") {
    return (
      <li>
        <a
          className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md"
          href={operator.wiki}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Avatar rarity={operator.rarity} className="h-10 w-10">
            <AvatarImage alt={operator.name} src={operator.imgPath} />
            <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm leading-tight font-semibold">{operator.name}</p>
            <p className="text-xs leading-tight text-muted-foreground">
              {operator.type}
            </p>
            <p className={`text-xs leading-tight ${rarityTextColors[operator.rarity]}`}>
              {"★".repeat(operator.rarity)}
            </p>
          </div>
        </a>
      </li>
    );
  }

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            className="transition-transform hover:scale-105"
            href={operator.wiki}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Avatar rarity={operator.rarity}>
              <AvatarImage alt={operator.name} src={operator.imgPath} />
              <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{operator.name}</p>
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
