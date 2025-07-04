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

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HashAlgorithm, HashResult, InvokeFunction } from "../types";
import { utilityInvoke } from "@/utilities/invoke";
import { useDebouncedValue } from "foxact/use-debounced-value";
import { CopyIcon } from "lucide-react";

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const debouncedInput = useDebouncedValue(input, 100, false);

  const [hashResult, setHashResult] = useState<Partial<HashResult>>({});
  const [lowercased, setLowercased] = useState(false);

  const handleGenerateHashes = async () => {
    const result = await utilityInvoke(InvokeFunction.GenerateHashes, {
      input: debouncedInput,
    });
    console.log(result);
    setHashResult(result);
  };

  useEffect(() => {
    handleGenerateHashes();
  }, [debouncedInput]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left: Input Area */}
      <Card className="flex-1 flex flex-col min-w-[260px] max-w-lg h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Input:</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 flex-1">
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="outline" type="button">
              Clipboard
            </Button>
            <Button size="sm" variant="outline" type="button">
              Sample
            </Button>
            <Button size="sm" variant="outline" type="button">
              Load file...
            </Button>
            <Button size="sm" variant="outline" type="button">
              Clear
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-[300px]">
            <Textarea
              className="h-[300px] resize-none font-mono text-xs"
              placeholder={`- Enter Your Text\n- Drag/Drop Files\n- Right Click • Load from File...\n- ⌘ + F to Search\n- ⌘ + ⌥ + F to Replace`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right: Hash Results */}
      <Card className="flex-1 min-w-[320px] max-w-xl h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Length: {input.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Checkbox
              id="lowercased"
              checked={lowercased}
              onCheckedChange={(v) => setLowercased(!!v)}
            />
            <Label htmlFor="lowercased" className="text-xs">
              lowercased
            </Label>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Object.values(HashAlgorithm).map((algo) => (
            <div key={algo} className="flex flex-col items-start gap-2">
              <Label
                htmlFor={`hash-${algo}`}
                className="text-xs text-muted-foreground"
              >
                {algo}:
              </Label>
              <div className="w-full flex flex-row gap-2">
                <Input
                  id={`hash-${algo}`}
                  className="flex-1 text-xs"
                  value={hashResult[algo as keyof HashResult] || ""}
                  readOnly
                  placeholder=""
                />
                <Button size="icon" variant="outline" type="button">
                  <CopyIcon />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
