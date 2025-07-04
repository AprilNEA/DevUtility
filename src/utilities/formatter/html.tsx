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

import {
  ArrowUpFromLine,
  Clipboard,
  Copy,
  FileText,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Basic HTML entity maps
const encodeMap: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  // Add more entities as needed
};

const decodeMap: { [key: string]: string } = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  // Add more entities as needed
};

const sampleHtml = '<h1>Hello & Welcome!</h1>\n<p>This is a "sample" text.</p>';

export default function HtmlEncoderDecoderPage() {
  const [inputHtml, setInputHtml] = useState(sampleHtml);
  const [outputHtml, setOutputHtml] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [continuousMode, setContinuousMode] = useState(true);

  const processHtml = (html: string, currentMode: "encode" | "decode") => {
    if (currentMode === "encode") {
      return html.replace(/[&<>"']/g, (match) => encodeMap[match] || match);
    } else {
      // A more robust decoder would handle numeric entities etc.
      // This is a simplified version.
      let decoded = html;
      for (const key in decodeMap) {
        const regex = new RegExp(key, "g");
        decoded = decoded.replace(regex, decodeMap[key]);
      }
      return decoded;
    }
  };

  useEffect(() => {
    if (continuousMode) {
      setOutputHtml(processHtml(inputHtml, mode));
    }
  }, [inputHtml, mode, continuousMode]);

  const handleProcessButtonClick = () => {
    setOutputHtml(processHtml(inputHtml, mode));
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Consider adding a toast notification for success
      console.log("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputHtml(text);
    } catch (err) {
      console.error("Failed to paste: ", err);
    }
  };

  const handleLoadSample = () => {
    setInputHtml(sampleHtml);
  };

  const handleClearInput = () => {
    setInputHtml("");
    setOutputHtml("");
  };

  const handleUseOutputAsInput = () => {
    setInputHtml(outputHtml);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-4 gap-4 bg-background text-foreground">
        {/* Input Section */}
        <div className="flex flex-col gap-2 bg-card p-3 rounded-lg flex-1 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Label
              htmlFor="input-html"
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
                    disabled={continuousMode}
                  >
                    <Zap size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Process HTML</p>
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
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                      >
                        <Settings size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuCheckboxItem
                    checked={continuousMode}
                    onCheckedChange={setContinuousMode}
                  >
                    Continuous Mode
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    More settings soon...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <RadioGroup
              defaultValue="encode"
              onValueChange={(value: "encode" | "decode") => setMode(value)}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="encode" id="r-encode" />
                <Label htmlFor="r-encode" className="text-sm">
                  Encode
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="decode" id="r-decode" />
                <Label htmlFor="r-decode" className="text-sm">
                  Decode
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Textarea
            id="input-html"
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            placeholder="Paste your HTML here"
            className="flex-grow bg-input border-border text-sm font-mono resize-none focus-visible:ring-ring"
            spellCheck="false"
          />
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-2 bg-card p-3 rounded-lg flex-1 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Label
              htmlFor="output-html"
              className="text-sm font-medium text-muted-foreground"
            >
              Output
            </Label>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleCopyToClipboard(outputHtml)}
                  >
                    <Copy size={14} className="mr-1.5" /> Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Copy Output</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleUseOutputAsInput}
                  >
                    Use as input{" "}
                    <ArrowUpFromLine size={14} className="ml-1.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Use Output as Input</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Textarea
            id="output-html"
            value={outputHtml}
            readOnly
            placeholder="Processed HTML will appear here"
            className="flex-grow bg-input border-border text-sm font-mono resize-none focus-visible:ring-ring"
            spellCheck="false"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
