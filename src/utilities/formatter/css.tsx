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

import { useDebouncedValue } from "foxact/use-debounced-value";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import InputOutputLayout from "@/components/layout/input-output";
import {
  ClearTool,
  ContinuousModeTool,
  CopyTool,
  LoadFileTool,
  PasteTool,
} from "@/components/tools";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUtilityInvoke } from "../invoke";
import { type IndentStyle, IndentStyleEnum, InvokeFunction } from "../types";

const sampleCssMinified = `@font-face{font-family:Chunkfive;src:url('Chunkfive.otf');}body,.usertext{color:#F0F0F0;background:#600;font-family:Chunkfive,sans;--heading-1:30px / 32px Helvetica,sans-serif;}@import url('print.css');@media print{a[href^=http]::after{content:attr(href)x;}}`;

export default function CssBeautifyMinifyTool() {
  const { trigger, error } = useUtilityInvoke(InvokeFunction.FormatCss);
  const [input, setInput] = useState(sampleCssMinified);
  const [output, setOutput] = useState("");

  const [style, setStyle] = useState<IndentStyle>({
    [IndentStyleEnum.Spaces]: 2,
  });

  const debouncedInput = useDebouncedValue(input, 100, false);

  const handleFormat = useCallback(
    async (input: string, style: IndentStyle) => {
      const result = await trigger({
        input,
      });
      setOutput(result);
    },
    [trigger],
  );

  useEffect(() => {
    handleFormat(debouncedInput, style);
  }, [handleFormat, debouncedInput, style]);

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
    </>
  );

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
              ? `${style[IndentStyleEnum.Spaces]} spaces`
              : style === IndentStyleEnum.Tabs
                ? "Tabs"
                : "Minified"}
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

  return (
    <InputOutputLayout
      inputToolbar={inputToolbar}
      inputProps={{
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: "Paste your CSS here",
      }}
      outputToolbar={outputToolbar}
      outputProps={{
        value: output,
        readOnly: true,
        placeholder: "Processed CSS will appear here",
      }}
    />
  );
}
