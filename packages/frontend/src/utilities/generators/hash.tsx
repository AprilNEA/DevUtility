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
import { useLingui } from "@lingui/react/macro";
import { useDebouncedValue } from "foxact/use-debounced-value";
import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { HashAlgorithm, type HashResult, InvokeFunction } from "../types";

export default function HashGeneratorPage() {
  const { t } = useLingui();
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
    <Textarea
      className="h-64 grow resize-none font-mono text-xs rounded-md"
      placeholder={t(msg`- Enter Your Text
- Drag/Drop Files
- Right Click • Load from File...
- ⌘ + F to Search
- ⌘ + ⌥ + F to Replace`)}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );

  const outputToolbar = (
    <div className="flex items-center gap-4 h-8">
      <span className="text-xs text-muted-foreground">
        {t(msg`Length: ${input.length}`)}
      </span>
      <div className="flex items-center gap-1">
        <Checkbox
          id="lowercased"
          checked={lowercased}
          onCheckedChange={(v) => setLowercased(!!v)}
        />
        <Label htmlFor="lowercased" className="text-xs">
          {t(msg`lowercased`)}
        </Label>
      </div>
    </div>
  );

  const outputContent = (
    <div className="flex flex-col gap-2">
      {Object.values(HashAlgorithm).map((algo) => (
        <div key={algo} className="flex flex-col items-start gap-1">
          <Label
            htmlFor={`hash-${algo}`}
            className="text-sm text-muted-foreground"
          >
            {algo}
          </Label>
          <div className="w-full flex flex-row gap-2 items-center">
            <Input
              id={`hash-${algo}`}
              className="flex-1"
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
    </div>
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
