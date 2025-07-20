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

import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDebouncedValue } from "foxact/use-debounced-value";
import { FilterIcon, ScanTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import TwoSectionLayout from "@/components/layout/two-section";
import { ClearTool, PasteTool } from "@/components/tools";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Sample text in multiple languages to demonstrate Unicode handling
const sampleText = `Blanditiis aliquam laboriosam eius at illum. Qui cumque et iste perferendis ut nam qui officiis nisi in in iusto reiciendis. A iure id praesentium et sed. Cupiditate illo eius sunt ut. Dolores itaque ut neque ipsam mollitia debitis est explicabo repellendus. Velit velit quaerat incidunt eum tempora dicta quod hic vel et ad. Perferendis aliquid aperiam omnis quisquam ut dolore et earum. Praesentium amet illum ea et odit.`;

interface StringStats {
  characters: number;
  bytes: number;
  words: number;
  lines: number;
  ascii: number;
  unicode: number;
  selection: {
    location: number;
    currentLine: number;
    column: number;
  };
}

interface WordDistribution {
  word: string;
  count: number;
}

export default function StringInspectorPage() {
  const { t } = useLingui();
  const [input, setInput] = useState(sampleText);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [wordFilter, setWordFilter] = useState("");

  const debouncedInput = useDebouncedValue(input, 100, false);

  // Calculate statistics
  const stats: StringStats = useMemo(() => {
    const text = debouncedInput;

    // Basic counts
    const characters = text.length;
    const bytes = new TextEncoder().encode(text).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;

    // ASCII vs Unicode
    let ascii = 0;
    let unicode = 0;
    for (const char of text) {
      if (char.charCodeAt(0) <= 127) {
        ascii++;
      } else {
        unicode++;
      }
    }

    // Selection information
    const beforeSelection = text.substring(0, selectionEnd);
    const linesBeforeSelection = beforeSelection.split("\n");
    const currentLine = linesBeforeSelection.length;
    const column =
      linesBeforeSelection[linesBeforeSelection.length - 1].length + 1;

    return {
      characters,
      bytes,
      words,
      lines,
      ascii,
      unicode,
      selection: {
        location: selectionEnd,
        currentLine,
        column,
      },
    };
  }, [debouncedInput, selectionEnd]);

  // Calculate word distribution
  const wordDistribution: WordDistribution[] = useMemo(() => {
    const text = caseSensitive ? debouncedInput : debouncedInput.toLowerCase();
    const words = text.match(/\b[\w']+\b/g) || [];

    const wordMap = new Map<string, number>();
    for (const word of words) {
      const key = caseSensitive ? word : word.toLowerCase();
      wordMap.set(key, (wordMap.get(key) || 0) + 1);
    }

    // Convert to array and sort by frequency
    const distribution = Array.from(wordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);

    // Apply filter if present
    if (wordFilter) {
      const filterLower = wordFilter.toLowerCase();
      return distribution.filter((item) =>
        item.word.toLowerCase().includes(filterLower),
      );
    }

    return distribution;
  }, [debouncedInput, caseSensitive, wordFilter]);

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setSelectionStart(target.selectionStart);
    setSelectionEnd(target.selectionEnd);
  };

  const handleSampleText = () => {
    setInput(sampleText);
  };

  const inputToolbar = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3"
        onClick={handleSampleText}
      >
        <ScanTextIcon size={14} className="mr-1.5" />
        <Trans>Sample</Trans>
      </Button>
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />

      <ClearTool
        button={{
          onClick: () => {
            setInput("");
          },
        }}
      />
    </>
  );

  const inputContent = (
    <Textarea
      className="h-64 grow resize-none font-mono text-sm rounded-md"
      placeholder={t(msg`Enter or paste your text here...`)}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onSelect={handleTextSelect}
      onClick={handleTextSelect}
      onKeyUp={handleTextSelect}
    />
  );

  const statsContent = (
    <div className="flex flex-col gap-2 flex-1">
      {/* Count Section */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          <Trans>Count</Trans>
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Characters</Trans>
          </span>
          <span className="text-sm font-mono">{stats.characters}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Bytes</Trans>
          </span>
          <span className="text-sm font-mono">{stats.bytes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Words</Trans>
          </span>
          <span className="text-sm font-mono">{stats.words}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Lines</Trans>
          </span>
          <span className="text-sm font-mono">{stats.lines}</span>
        </div>
      </div>
      <Separator />

      {/* Character Section */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          <Trans>Character</Trans>
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">ASCII</span>
          <span className="text-sm font-mono">
            {stats.ascii > 0 ? stats.ascii : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Unicode</span>
          <span className="text-sm font-mono">
            {stats.unicode > 0 ? stats.unicode : "-"}
          </span>
        </div>
      </div>
      <Separator />

      {/* Selection Section */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          <Trans>Selection</Trans>
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Location</Trans>
          </span>
          <span className="text-sm font-mono">{stats.selection.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Current line</Trans>
          </span>
          <span className="text-sm font-mono">
            {stats.selection.currentLine}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            <Trans>Column</Trans>
          </span>
          <span className="text-sm font-mono">{stats.selection.column}</span>
        </div>
      </div>
      <Separator />

      {/* Word Distribution Section */}
      <div className="flex flex-col gap-2 grow">
        <div className="flex overflow-visible justify-between">
          <p className="text-sm font-medium">
            <Trans>Word distribution</Trans>
          </p>
          <Button variant="ghost" size="sm" className="h-5 px-2 text-xs">
            <FilterIcon size={12} className="mr-1" />
            <Trans>Filter</Trans>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="case-sensitive"
            className="size-3.5" // FIX ICON SIZE INSIDE CHECKBOX
            checked={caseSensitive}
            onCheckedChange={(checked) => setCaseSensitive(!!checked)}
          />
          <Label htmlFor="case-sensitive" className="text-xs">
            <Trans>Case sensitive</Trans>
          </Label>
        </div>

        {/* <Input
          type="text"
          placeholder={t(msg`Filter words...`)}
          className="mb-2 h-8 text-xs"
          value={wordFilter}
          onChange={(e) => setWordFilter(e.target.value)}
        /> */}
        <ScrollArea className="h-32 grow border rounded-md">
          <div className="p-2">
            {wordDistribution.map((item, index) => (
              <div
                key={`${item.word}-${index}`}
                className="flex justify-between items-center py-1.5 px-2 rounded-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
              >
                <span className="text-sm font-mono truncate flex-1 text-foreground/90">
                  {item.word}:
                </span>
                <span className="text-sm font-mono ml-3 font-medium bg-secondary/50 px-2 py-0.5 rounded text-secondary-foreground">
                  {item.count}
                </span>
              </div>
            ))}
            {wordDistribution.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <span className="text-sm">No words found</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <TwoSectionLayout
      orientation="vertical"
      firstLabel={msg`Input`}
      firstToolbar={inputToolbar}
      firstContent={inputContent}
      secondContent={statsContent}
      classNames={{
        firstSection: "md:col-span-1",
        secondSection: "md:col-span-1",
      }}
    />
  );
}
