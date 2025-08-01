/**
 * Copyright (c) 2023-2025, AprilNEA LLC.
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

import { useDebouncedValue } from "foxact/use-debounced-value";
import {
  ChevronDown,
  ChevronDownIcon,
  HelpCircleIcon,
  SettingsIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Callout } from "@/components/derived-ui/callout";
import InputOutputLayout from "@/components/layout/input-output";
import {
  ClearTool,
  ContinuousModeTool,
  CopyTool,
  LoadFileTool,
  PasteTool,
} from "@/components/tools";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUtilityInvoke } from "@/utilities/invoke";
import { type IndentStyle, IndentStyleEnum, InvokeFunction } from "../types";

const jsonExampleInput = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`;

export default function JsonFormatterPage() {
  const { trigger, error } = useUtilityInvoke(InvokeFunction.FormatJson);
  const [input, setInput] = useState(jsonExampleInput);
  const [output, setOutput] = useState("");

  const [style, setStyle] = useState<IndentStyle>({
    [IndentStyleEnum.Spaces]: 2,
  }); // "2", "4", "tab"

  // Settings states
  const [autoDetect, setAutoDetect] = useState(true);
  const [allowTrailingCommas, setAllowTrailingCommas] = useState(false);
  const [autoRepair, setAutoRepair] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true);
  const [sortKeys, setSortKeys] = useState(true);

  const debouncedInput = useDebouncedValue(input, 100, false);

  const handleFormat = useCallback(
    async (input: string, style: IndentStyle) => {
      const result = await trigger({
        input,
        style,
      });
      setOutput(result);
    },
    [trigger],
  );

  useEffect(() => {
    handleFormat(debouncedInput, style);
  }, [handleFormat, debouncedInput, style]);

  const handleResetSettings = () => {
    setAutoDetect(true);
    setAllowTrailingCommas(false);
    setAutoRepair(true);
    setContinuousMode(true);
    setSortKeys(true);
  };

  const inputToolbar = (
    <>
      <ContinuousModeTool />
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />
      <LoadFileTool button={{}} />
      <ClearTool
        button={{
          onClick: () => {
            setInput("");
            setOutput("");
          },
        }}
      />

      <DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <SettingsIcon size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-2 min-w-96 p-1">
            <div className="flex gap-2">
              <Checkbox
                id="auto-detect"
                checked={autoDetect}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    setAutoDetect(false);
                  } else {
                    setAutoDetect(checked);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor="auto-detect"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Auto detect when input is a valid JSON
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="allow-trailing"
                checked={allowTrailingCommas}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    setAllowTrailingCommas(false);
                  } else {
                    setAllowTrailingCommas(checked);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor="allow-trailing"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Allow trailing commas and comments in JSON
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="auto-repair"
                checked={autoRepair}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    setAutoRepair(false);
                  } else {
                    setAutoRepair(checked);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor="auto-repair"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                <div>
                  Auto repair invalid JSON if possible
                  <div className="text-xs text-muted-foreground font-normal">
                    Fix missing quotes, replace Python constants, strip trailing
                    commas, etc.
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="continuous-mode"
                checked={continuousMode}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    setContinuousMode(false);
                  } else {
                    setContinuousMode(checked);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor="continuous-mode"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Continuous Mode: format the input continuously as you type
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="sort-keys"
                checked={sortKeys}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    setSortKeys(false);
                  } else {
                    setSortKeys(checked);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor="sort-keys"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Sort keys in output
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="preserve-encoded"
                checked={false}
                disabled
                className="mt-1"
              />
              <Label
                htmlFor="preserve-encoded"
                className="text-sm font-medium text-foreground/70 cursor-not-allowed"
              >
                Preserves encoded strings (like {'"\\u00e2"'} ) and big numbers
                <div className="text-xs text-muted-foreground font-normal">
                  Only works when "Sort keys" and "Auto repair" options are off.
                </div>
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              onClick={handleResetSettings}
            >
              Reset to Defaults
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* </TooltipContent>
      </Tooltip> */}
        <DropdownMenuContent
          align="end"
          className="w-64 bg-popover text-popover-foreground border"
        >
          <DropdownMenuCheckboxItem
            checked={autoDetect}
            onCheckedChange={setAutoDetect}
            className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            Auto detect when input is valid JSON
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={allowTrailingCommas}
            onCheckedChange={setAllowTrailingCommas}
            className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            Allow trailing commas and comments
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={autoRepair}
            onCheckedChange={setAutoRepair}
            className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            <div>
              Auto repair invalid JSON if possible
              <p className="text-xs text-muted-foreground">
                Fix missing quotes, strip commas, etc.
              </p>
            </div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={continuousMode}
            onCheckedChange={setContinuousMode}
            className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            Continuous Mode: format as you type
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortKeys}
            onCheckedChange={setSortKeys}
            className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            Sort keys in output
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            onSelect={handleResetSettings}
            className="focus:bg-accent"
          >
            Reset to Defaults
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-background border-input hover:bg-accent text-foreground hover:text-accent-foreground"
          >
            JSON <ChevronDownIcon size={14} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-popover text-popover-foreground border"
        >
          <DropdownMenuRadioGroup value="json">
            <DropdownMenuRadioItem
              value="json"
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              JSON
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="xml"
              disabled
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              XML (soon)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="yaml"
              disabled
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              YAML (soon)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const inputBottombar = error ? (
    <div className="flex items-center gap-2 mt-2">
      <Callout variant="error" className="w-full">
        {String(error)}
      </Callout>
    </div>
  ) : null;

  const outputToolbar = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-input hover:bg-accent text-foreground hover:text-accent-foreground"
          >
            {typeof style === "object"
              ? String(style[IndentStyleEnum.Spaces])
              : style}
            <ChevronDown size={14} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-popover text-popover-foreground border"
        >
          <DropdownMenuRadioGroup
            value={
              typeof style === "object"
                ? String(style[IndentStyleEnum.Spaces])
                : style
            }
            onValueChange={(value) => {
              if (value === IndentStyleEnum.Tabs) {
                setStyle(IndentStyleEnum.Tabs);
              } else if (value === IndentStyleEnum.Minified) {
                setStyle(IndentStyleEnum.Minified);
              } else {
                setStyle({ [IndentStyleEnum.Spaces]: Number(value) });
              }
            }}
          >
            <DropdownMenuRadioItem
              value="2"
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              2 spaces
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="4"
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              4 spaces
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value={IndentStyleEnum.Tabs}
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              Tabs
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value={IndentStyleEnum.Minified}
              className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            >
              Minified
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <CopyTool content={output} />
    </>
  );

  const outputBottomBar = (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="JSON Path (e.g., $.store.book[*].author)"
        className="bg-background border-input text-foreground placeholder:text-muted-foreground text-xs h-8 focus:ring-ring focus:border-ring"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <HelpCircleIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover text-popover-foreground border"
        >
          <p>JSONPath Help</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <InputOutputLayout
      inputToolbar={inputToolbar}
      inputBottombar={inputBottombar}
      inputProps={{
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: "Paste your JSON here",
      }}
      outputToolbar={outputToolbar}
      outputBottomBar={outputBottomBar}
      outputProps={{
        value: output,
        readOnly: true,
        placeholder: "Formatted JSON will appear here",
      }}
      language="json"
      // (3+1)rem is the height of the header and bottom margin
      // 2rem is the height of the toolbar
      // 2rem is the padding between the toolbar and the content
      // 2rem is the height of the bottom bar
      // 0.5rem is the padding between the content and the bottom bar
      classNames={{
        outputLanguageContainer: "h-[calc(100vh-4rem-2rem-2rem-2rem-0.5rem)]",
      }}
    />
  );
}
