import { Label } from "@radix-ui/react-label";
import { HelpCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LabelWithTooltip: React.FC<{
  htmlFor?: string;
  children: React.ReactNode;
  tooltip: string;
}> = ({ htmlFor, children, tooltip }) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircleIcon className="h-4 w-3 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default LabelWithTooltip;
