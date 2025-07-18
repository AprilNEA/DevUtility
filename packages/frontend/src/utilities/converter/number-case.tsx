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
import { ClipboardIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyToClipboard, readFromClipboard } from "@/lib/copyboard";
import { cn } from "@/lib/utils";

type NumberBase = {
  base: number;
  label: string;
  value: string;
};

export default function NumberCasePage() {
  const { t } = useLingui();

  const [bases, setBases] = useState<NumberBase[]>([
    { base: 2, label: t(msg`Base 2 (Binary)`), value: "" },
    { base: 8, label: t(msg`Base 8 (Octal)`), value: "" },
    { base: 10, label: t(msg`Base 10 (Decimal)`), value: "" },
    { base: 16, label: t(msg`Base 16 (Hex)`), value: "" },
  ]);

  const [customBase, setCustomBase] = useState(36);
  const [customValue, setCustomValue] = useState("");
  const [sampleValue, setSampleValue] = useState("");

  const convertToBase = useCallback(
    (value: string, fromBase: number, toBase: number): string => {
      if (!value || value.trim() === "") return "";

      try {
        // Convert to decimal first
        const decimal = parseInt(value, fromBase);
        if (isNaN(decimal)) return "";

        // Then convert to target base
        return decimal.toString(toBase).toUpperCase();
      } catch {
        return "";
      }
    },
    [],
  );

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      const currentBase = bases[index].base;

      // Validate input for the specific base
      const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(
        0,
        currentBase,
      );
      const regex = new RegExp(`^[${validChars}]*$`, "i");

      if (!regex.test(value)) return;

      // Update all bases
      const newBases = bases.map((base, i) => {
        if (i === index) {
          return { ...base, value: value.toUpperCase() };
        } else {
          const converted = convertToBase(value, currentBase, base.base);
          return { ...base, value: converted };
        }
      });

      setBases(newBases);

      // Also update custom base value
      if (value) {
        const customConverted = convertToBase(value, currentBase, customBase);
        setCustomValue(customConverted);
      } else {
        setCustomValue("");
      }
    },
    [bases, customBase, convertToBase],
  );

  const handleCustomInputChange = useCallback(
    (value: string) => {
      // Validate input for the custom base
      const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(
        0,
        customBase,
      );
      const regex = new RegExp(`^[${validChars}]*$`, "i");

      if (!regex.test(value)) return;

      setCustomValue(value.toUpperCase());

      // Update all standard bases
      if (value) {
        const newBases = bases.map((base) => {
          const converted = convertToBase(value, customBase, base.base);
          return { ...base, value: converted };
        });
        setBases(newBases);
      } else {
        const newBases = bases.map((base) => ({ ...base, value: "" }));
        setBases(newBases);
      }
    },
    [bases, customBase, convertToBase],
  );

  const handleClear = useCallback(
    (index?: number) => {
      if (index !== undefined) {
        // Clear specific base
        const newBases = bases.map((base, i) => ({
          ...base,
          value: i === index ? "" : base.value,
        }));
        setBases(newBases);
      } else {
        // Clear all
        const newBases = bases.map((base) => ({ ...base, value: "" }));
        setBases(newBases);
        setCustomValue("");
      }
    },
    [bases],
  );

  const handlePaste = useCallback(
    async (index?: number) => {
      const text = await readFromClipboard();
      if (!text) return;

      if (index !== undefined && index < bases.length) {
        handleInputChange(index, text);
      } else if (index === undefined) {
        // For custom base
        handleCustomInputChange(text);
      }
    },
    [bases.length, handleInputChange, handleCustomInputChange],
  );

  const handleSample = useCallback(() => {
    // Generate a sample number
    const sample = Math.floor(Math.random() * 1000000).toString();
    handleInputChange(2, sample); // Set it in decimal (index 2)
  }, [handleInputChange]);

  const handleCustomBaseChange = useCallback(
    (value: string) => {
      const newBase = parseInt(value);
      if (newBase >= 2 && newBase <= 36) {
        setCustomBase(newBase);

        // Re-convert existing values if any
        const decimalValue = bases[2].value; // Get decimal value
        if (decimalValue) {
          const converted = convertToBase(decimalValue, 10, newBase);
          setCustomValue(converted);
        }
      }
    },
    [bases, convertToBase],
  );

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Enter your number in any of the text field. The other text fields will
          automatically calculated.
        </Trans>
      </p>

      <div className="flex flex-col gap-4">
        {bases.map((base, index) => (
          <div key={base.base} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">{base.label}</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handlePaste(index)}
                >
                  <Trans>Clipboard</Trans>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleClear(index)}
                >
                  <Trans>Clear</Trans>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={base.value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={t(msg`Enter ${base.label.toLowerCase()}`)}
                className="flex-1 font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 gap-2"
                onClick={() => copyToClipboard(base.value)}
              >
                <CopyIcon className="h-4 w-4" />
                <Trans>Copy</Trans>
              </Button>
            </div>
          </div>
        ))}

        {/* Custom Base Section */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              <Trans>Select base:</Trans>
            </Label>
            <Select
              value={customBase.toString()}
              onValueChange={handleCustomBaseChange}
            >
              <SelectTrigger className="w-20 h-7" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 35 }, (_, i) => i + 2).map((base) => (
                  <SelectItem key={base} value={base.toString()}>
                    {base}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handlePaste()}
              >
                <Trans>Clipboard</Trans>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleSample}
              >
                <Trans>Sample</Trans>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setCustomValue("");
                  handleClear();
                }}
              >
                <Trans>Clear</Trans>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={customValue}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              placeholder={t(msg`Enter base ${customBase} number`)}
              className="flex-1 font-mono"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-2"
              onClick={() => copyToClipboard(customValue)}
            >
              <CopyIcon className="h-4 w-4" />
              <Trans>Copy</Trans>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
