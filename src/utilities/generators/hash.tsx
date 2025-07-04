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

import TwoSectionLayout from "@/components/layout/two-section";
import { ClearTool, LoadFileTool, PasteTool } from "@/components/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/copyboard";
import { useUtilityInvoke } from "@/utilities/invoke";
import { msg } from "@lingui/core/macro";
import { useDebouncedValue } from "foxact/use-debounced-value";
import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HashAlgorithm, type HashResult, InvokeFunction } from "../types";

export default function HashGeneratorPage() {
  const { data: hashResult, trigger } = useUtilityInvoke(
    InvokeFunction.GenerateHashes,
  );
  const [input, setInput] = useState("");
  const debouncedInput = useDebouncedValue(input, 100, false);

  const [lowercased, setLowercased] = useState(false);

  const getResult = useCallback(
    (algo: HashAlgorithm) => {
      const result = hashResult?.[algo as keyof HashResult];
      if (result) {
        return lowercased ? result : result.toUpperCase();
      }
      return "";
    },
    [hashResult, lowercased],
  );

  useEffect(() => {
    trigger({
      input: debouncedInput,
    });
  }, [debouncedInput, trigger]);

  const inputToolbar = (
    <>
      <PasteTool />
      <LoadFileTool />
      <ClearTool />
    </>
  );

  const inputContent = (
    <ScrollArea className="flex-1 min-h-[300px]">
      <Textarea
        className="h-[300px] resize-none font-mono text-xs rounded-md"
        placeholder={`- Enter Your Text\n- Drag/Drop Files\n- Right Click • Load from File...\n- ⌘ + F to Search\n- ⌘ + ⌥ + F to Replace`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </ScrollArea>
  );

  const outputToolbar = (
    <div className="flex items-center gap-4 h-8">
      <span className="text-xs text-muted-foreground">
        Length: {input.length}
      </span>
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
    </div>
  );

  const outputContent = (
    <Card className="p-0 rounded-md">
      <CardContent className="px-4 py-2 space-y-2">
        {Object.values(HashAlgorithm).map((algo) => (
          <div key={algo} className="flex flex-col items-start gap-0.5">
            <Label
              htmlFor={`hash-${algo}`}
              className="text-sm text-muted-foreground"
            >
              {algo}:
            </Label>
            <div className="w-full flex flex-row gap-2 items-center">
              <Input
                id={`hash-${algo}`}
                className="flex-1 text-xs px-2 py-0.5 h-7"
                value={getResult(algo)}
                readOnly
                placeholder=""
              />
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => {
                  copyToClipboard(getResult(algo));
                }}
              >
                <CopyIcon />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <TwoSectionLayout
      firstLabel={msg`Input`}
      firstToolbar={inputToolbar}
      firstContent={inputContent}
      secondLabel={msg`Output`}
      secondToolbar={outputToolbar}
      secondContent={outputContent}
    />
  );
}
