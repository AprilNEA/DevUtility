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

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Zap,
  Clipboard,
  FileText,
  Trash2,
  Copy,
  ChevronDown,
} from "lucide-react";

const sampleCssMinified = `@font-face{font-family:Chunkfive;src:url('Chunkfive.otf');}body,.usertext{color:#F0F0F0;background:#600;font-family:Chunkfive,sans;--heading-1:30px / 32px Helvetica,sans-serif;}@import url('print.css');@media print{a[href^=http]::after{content:attr(href)x;}}`;

const sampleCssBeautified = `
@font-face {
  font-family: Chunkfive;
  src: url('Chunkfive.otf');
}

body,
.usertext {
  color: #F0F0F0;
  background: #600;
  font-family: Chunkfive, sans;
  --heading-1: 30px / 32px Helvetica, sans-serif;
}

@import url('print.css');

@media print {
  a[href^="http"]::after {
    content: attr(href) x;
  }
}
`;

// Very basic CSS beautifier
function beautifyCss(css: string, indent: string): string {
  let beautifiedCss = css
    .replace(/\s*{\s*/g, ` {\n${indent}`)
    .replace(/\s*;\s*/g, `;\n${indent}`)
    .replace(/\s*}\s*/g, `\n}\n`)
    .replace(/^\s*\n/gm, "") // Remove empty lines at the start of blocks
    .replace(/\n\s*\n/g, "\n"); // Reduce multiple newlines to one

  // Indent lines within blocks
  let depth = 0;
  beautifiedCss = beautifiedCss
    .split("\n")
    .map((line) => {
      if (line.includes("}")) depth = Math.max(0, depth - 1);
      const currentIndent = indent.repeat(depth);
      const trimmedLine = line.trim();
      if (trimmedLine === "") return ""; // Keep intentional empty lines if any, or remove
      if (trimmedLine.endsWith("{")) depth++;
      return currentIndent + trimmedLine;
    })
    .join("\n")
    .trim();

  return beautifiedCss;
}

// Very basic CSS minifier
function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "") // Remove comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([{};:,])\s*/g, "$1") // Remove space around delimiters
    .replace(/;\s*}/g, "}") // Remove trailing semicolon in a block
    .trim();
}

export default function CssBeautifyMinifyTool() {
  const [inputCss, setInputCss] = useState(sampleCssMinified);
  const [outputCss, setOutputCss] = useState("");
  const [indentation, setIndentation] = useState("2"); // "2", "4", "tab"
  const [mode, setMode] = useState<"beautify" | "minify">("beautify"); // Added mode state

  useEffect(() => {
    processCss();
  }, [inputCss, indentation, mode]);

  const processCss = () => {
    if (mode === "beautify") {
      const indentChar =
        indentation === "tab" ? "\t" : " ".repeat(Number.parseInt(indentation));
      setOutputCss(beautifyCss(inputCss, indentChar));
    } else {
      setOutputCss(minifyCss(inputCss));
    }
  };

  const handleProcessButtonClick = () => {
    processCss();
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputCss(text);
    } catch (err) {
      console.error("Failed to paste: ", err);
    }
  };

  const handleLoadSample = () => {
    // Load sample based on current mode for better UX
    setInputCss(mode === "beautify" ? sampleCssMinified : sampleCssBeautified);
  };

  const handleClearInput = () => {
    setInputCss("");
    setOutputCss("");
  };

  const getIndentationLabel = (value: string) => {
    if (value === "tab") return "Tabs";
    return `${value} spaces`;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full p-4 gap-4 bg-card text-card-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
          {/* Input Section */}
          <div className="flex flex-col gap-2 bg-background p-3 rounded-lg shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Label
                htmlFor="input-css"
                className="text-sm font-medium text-muted-foreground"
              >
                Input
              </Label>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleProcessButtonClick}
                    >
                      <Zap size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Process CSS</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handlePasteFromClipboard}
                    >
                      <Clipboard size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Paste</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleLoadSample}
                    >
                      <FileText size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Sample</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleClearInput}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Clear</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Textarea
              id="input-css"
              value={inputCss}
              onChange={(e) => setInputCss(e.target.value)}
              placeholder="Paste your CSS here"
              className="flex-grow bg-input border-border text-sm font-mono resize-none focus-visible:ring-ring min-h-[200px] h-full"
              spellCheck="false"
            />
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-2 bg-background p-3 rounded-lg shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Label
                htmlFor="output-css"
                className="text-sm font-medium text-muted-foreground"
              >
                Output
              </Label>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      {mode === "beautify"
                        ? getIndentationLabel(indentation)
                        : "Minified"}{" "}
                      <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={mode}
                      onValueChange={(val) =>
                        setMode(val as "beautify" | "minify")
                      }
                    >
                      <DropdownMenuRadioItem value="beautify">
                        Beautify
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="minify">
                        Minify
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    {mode === "beautify" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={indentation}
                          onValueChange={setIndentation}
                        >
                          <DropdownMenuRadioItem value="2">
                            2 spaces
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="4">
                            4 spaces
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="tab">
                            Tabs
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleCopyToClipboard(outputCss)}
                    >
                      <Copy size={14} className="mr-1.5" /> Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Copy Output</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Textarea
              id="output-css"
              value={outputCss}
              readOnly
              placeholder="Processed CSS will appear here"
              className="flex-grow bg-input border-border text-sm font-mono resize-none focus-visible:ring-ring min-h-[200px] h-full"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
