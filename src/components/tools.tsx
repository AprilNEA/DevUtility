import { Trans } from "@lingui/react/macro";
import {
  ClipboardIcon,
  CopyIcon,
  FileTextIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, readFromClipboard } from "@/lib/copyboard";
import { cn } from "@/lib/utils";

const ContinuousModeTool: React.FC<{
  button?: React.ComponentProps<"button">;
}> = ({ button }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          {...button}
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8",
            button?.className,
          )}
          // disabled={continuousMode}
        >
          <ZapIcon size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-popover text-popover-foreground border"
      >
        <Trans>Continuous Mode</Trans>
      </TooltipContent>
    </Tooltip>
  );
};

const PasteTool: React.FC<{
  button?: React.ComponentProps<"button">;
  onPaste?: (text: string) => void;
}> = ({ button, onPaste }) => {
  const handlePasteFromClipboard = useCallback(async () => {
    const clipboardContent = await readFromClipboard();
    onPaste?.(clipboardContent);
  }, [onPaste]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePasteFromClipboard}
          {...button}
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8",
            button?.className,
          )}
        >
          <ClipboardIcon size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-popover text-popover-foreground border"
      >
        <Trans>Paste from Clipboard</Trans>
      </TooltipContent>
    </Tooltip>
  );
};

const LoadFileTool: React.FC<{
  button?: React.ComponentProps<"button">;
}> = ({ button }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          {...button}
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8",
            button?.className,
          )}
        >
          <FileTextIcon size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-popover text-popover-foreground border"
      >
        <Trans>Load Sample JSON</Trans>
      </TooltipContent>
    </Tooltip>
  );
};

const CopyTool: React.FC<{
  content: string;
  button?: React.ComponentProps<"button">;
}> = ({ content, button }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(content)}
          {...button}
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8",
            button?.className,
          )}
        >
          <CopyIcon size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-popover text-popover-foreground border"
      >
        <Trans>Copy Output</Trans>
      </TooltipContent>
    </Tooltip>
  );
};

const ClearTool: React.FC<{
  button?: React.ComponentProps<"button">;
}> = ({ button }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          {...button}
          className={cn(
            "text-muted-foreground hover:text-foreground h-8 w-8",
            button?.className,
          )}
        >
          <Trash2Icon size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-popover text-popover-foreground border"
      >
        <Trans>Clear Input</Trans>
      </TooltipContent>
    </Tooltip>
  );
};

export { ContinuousModeTool, CopyTool, PasteTool, LoadFileTool, ClearTool };
