/**
 * Copyright (c) 2023-2025, ApriilNEA LLC.
 *
 * Dual licensed under:
 * - GPL-3.0 (open source)
 * - Commercial license (contact us)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for details or contact admin@aprilnea.com
 */

import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ClipboardIcon,
  CopyIcon,
  FileTextIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, readFromClipboard } from "@/lib/copyboard";
import { cn } from "@/lib/utils";

declare const ORIENTATIONS: readonly ["horizontal", "vertical"];
type Orientation = (typeof ORIENTATIONS)[number];

export type InputOutputLayoutProps = {
  orientation?: Orientation;

  inputLabel?: MessageDescriptor;
  inputToolbar?: React.ReactNode;
  inputBottombar?: React.ReactNode;
  inputProps?: React.ComponentProps<"textarea">;

  outputLabel?: MessageDescriptor;
  outputToolbar?: React.ReactNode;
  outputBottomBar?: React.ReactNode;
  outputProps?: React.ComponentProps<"textarea">;
};

const InputOutputLayout = ({
  orientation = "vertical",

  inputLabel = msg`Input`,
  inputToolbar,
  inputBottombar,
  inputProps,
  outputLabel = msg`Output`,
  outputToolbar,
  outputBottomBar,
  outputProps,
}: InputOutputLayoutProps) => {
  const { t } = useLingui();
  return (
    <div className="flex flex-col h-full gap-4">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 flex-grow",
          orientation !== "horizontal" && "md:grid-cols-2",
        )}
      >
        {/* Input Section */}
        <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Label className="text-sm font-medium text-foreground/80">
              {t(inputLabel)}
            </Label>
            <div className="flex items-center gap-1">{inputToolbar}</div>
          </div>
          <Textarea
            {...inputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              inputProps?.className,
            )}
            spellCheck="false"
          />
          {inputBottombar}
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Label className="text-sm font-medium text-foreground/80">
              {t(outputLabel)}
            </Label>
            <div className="flex items-center gap-1">{outputToolbar}</div>
          </div>
          <Textarea
            {...outputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              outputProps?.className,
            )}
            spellCheck="false"
          />
          {outputBottomBar}
        </div>
      </div>
    </div>
  );
};

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
export default InputOutputLayout;
