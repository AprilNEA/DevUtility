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
import { useState } from "react";
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

export default function HtmlToolPage() {
  const [inputHtml, setInputHtml] = useState("<h1>Hello</h1>");
  const [outputHtml, _setOutputHtml] = useState("&lt;h1&gt;Hello&lt;/h1&gt;");
  const [mode, setMode] = useState("encode"); // "encode" or "decode"

  // Placeholder states for settings - adapt as needed
  const [_indentSize, _setIndentSize] = useState(2);
  const [wrapLines, setWrapLines] = useState(true);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
        {/* Input Section */}
        <div className="flex flex-col gap-2 bg-card p-3 rounded-lg flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-card-foreground mr-2">
                Input
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Zap size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Beautify/Minify</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Clipboard size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Paste from Clipboard</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <FileText size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Load Sample HTML</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Trash2 size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Clear Input</p>
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
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={wrapLines}
                    onCheckedChange={setWrapLines}
                  >
                    Wrap lines
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Indent with 2 spaces</DropdownMenuItem>
                  <DropdownMenuItem>Indent with 4 spaces</DropdownMenuItem>
                  <DropdownMenuItem>Indent with tabs</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <RadioGroup
              value={mode}
              onValueChange={setMode}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="encode" id="encode" />
                <Label htmlFor="encode" className="text-sm font-medium">
                  Encode
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="decode" id="decode" />
                <Label htmlFor="decode" className="text-sm font-medium">
                  Decode
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Textarea
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            placeholder="Paste your HTML here"
            className="flex-grow bg-input border-border text-foreground font-mono text-sm resize-none focus:ring-primary focus:border-primary"
            spellCheck="false"
          />
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-2 bg-card p-3 rounded-lg flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-card-foreground">
              Output
            </span>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Copy size={14} className="mr-1.5" />
                    Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Copy Output</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Use as input
                    <ArrowUpFromLine size={14} className="ml-1.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Use Output as New Input</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Textarea
            value={outputHtml}
            readOnly
            placeholder="Processed HTML will appear here"
            className="flex-grow bg-input border-border text-foreground font-mono text-sm resize-none focus:ring-primary focus:border-primary"
            spellCheck="false"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
