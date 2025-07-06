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

import { useFastClick } from "foxact/use-fast-click";
import {
  ClipboardIcon,
  Copy,
  FileText,
  RefreshCw,
  Settings,
  Trash2,
  XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { utilityInvoke } from "@/utilities/invoke";
import { InvokeFunction } from "../types";

const sampleUuid = "f469e069-221e-401e-b495-646a773b055f";
const sampleRawContents = "f4:69:e0:69:22:1e:40:1e:b4:95:64:6a:77:3b:05:5f";
const sampleVersion = "4 (random)";
const sampleVariant = "Standard (DCE 1.1, ISO/IEC 11578:1996)";

const sampleGeneratedIds = [
  "R6JIB99DISW4PYWAWD0UU",
  "CZCQICQKLQWRDNSIJUGS",
  "88_Z~WVFIHEOSZ6EPHWQ6",
  "PZ_IAM4IEKHPDXUFTNJGR",
  "~Z3YKKNF4WXJ8YBL93N~C",
  "QQTUCSFL04INTQKNZACBB",
  "XFK0MXJZWKQJRZX2G0QIP",
  "TSKHQDHTUB0OBNYJTSNSM",
  "SK0QDGRYDXXAKARNT_0ZD",
  "DYBNGWZNZB5VFARGXPZ~D",
  "9SNXDHBMK2VT8YEJ9Q04X",
  "8WF5TKWQQPRLHX_GPD~2G",
  "KRDPNTRCALJLQGV0ZEVWD",
  "DIRCIMLG7QFYPQ0QDR0PJE",
  "R83KBRR0GRFW0CQJGCQZQ",
  "CLVFYJC0M~6MBGANZCVYN",
  "VX9QF7ZRAE009DCBJCVZPZ",
  "PRBZF03ZP7M~ONZ72D9GP",
  "SEE40CV001A8REEI4YPW1",
  "SBCBFEALEI7YAF8BBE8AE",
  "LV7DKSVVMQVWVCRV804GZ",
  "KDEHC868SZDTLFU2JTQB6",
  "BEVDPW9XL6CXJ0JTONCRG",
].join("\n");

enum IdType {
  NANOID = "nanoid",
  ULID = "ulid",
  UUID_V4 = "uuidv4",
  UUID_V1 = "uuidv1",
  UUID_V3 = "uuidv3",
  UUID_V5 = "uuidv5",
  UUID_V6 = "uuidv6",
  UUID_V7 = "uuidv7",
  UUID_V8 = "uuidv8",
}
export default function IdGeneratorPage() {
  const [idType, setIdType] = useState<IdType>(IdType.NANOID);
  const [generatedIds, setGeneratedIds] = useState(sampleGeneratedIds);
  const [generateCount, setGenerateCount] = useState(100);

  const [inputValue, setInputValue] = useState(sampleUuid);
  const [standardFormat, _setStandardFormat] = useState(sampleUuid);
  const [rawContents, _setRawContents] = useState(sampleRawContents);
  const [version, _setVersion] = useState(sampleVersion);
  const [variant, _setVariant] = useState(sampleVariant);

  const [isLowercase, setIsLowercase] = useState(false);

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      // Add toast notification for success if desired
      console.log("Copied:", textToCopy);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateIds = useCallback(async (idType: IdType, count: number) => {
    switch (idType) {
      case IdType.NANOID: {
        const result = await utilityInvoke(InvokeFunction.GenerateNanoid, {
          count,
        });
        setGeneratedIds(result);
        break;
      }
      case IdType.ULID: {
        const result = await utilityInvoke(InvokeFunction.GenerateUlid, {
          count,
        });
        setGeneratedIds(result);
        break;
      }
      case IdType.UUID_V7: {
        const result = await utilityInvoke(InvokeFunction.GenerateUuidV7, {
          count,
          // timestamp: 0,
        });
        setGeneratedIds(result);
        break;
      }
      default: {
        const result = await utilityInvoke(InvokeFunction.GenerateUuidV4, {
          count,
        });
        setGeneratedIds(result);
        break;
      }
    }
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4 h-full">
      {/* Left Panel: Input & Details */}
      <div className="flex flex-col gap-4 bg-card p-3 rounded-lg">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-sm font-medium text-card-foreground mr-2">
            Input:
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <ClipboardIcon size={14} className="mr-1.5" /> Clipboard
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Paste from Clipboard</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <FileText size={14} className="mr-1.5" /> Sample
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Load Sample ID</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <Trash2 size={14} className="mr-1.5" /> Clear
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
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 ml-auto"
                  >
                    <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>UUID Settings...</DropdownMenuItem>
              <DropdownMenuItem>NanoID Settings...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter UUID or trigger generation"
          className="bg-background border-input text-foreground"
        />

        <div className="space-y-3 mt-2">
          <FieldWithCopy
            label="Standard String Format"
            value={standardFormat}
            onCopy={handleCopy}
          />
          <FieldWithCopy
            label="Raw Contents"
            value={rawContents}
            onCopy={handleCopy}
          />
          <FieldWithCopy label="Version" value={version} onCopy={handleCopy} />
          <FieldWithCopy label="Variant" value={variant} onCopy={handleCopy} />
        </div>
      </div>

      {/* Right Panel: Generate New IDs */}
      <div className="flex flex-col gap-3 bg-card p-3 rounded-lg">
        <h2 className="text-md font-semibold text-card-foreground">
          Generate new IDs
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => generateIds(idType, generateCount)}>
            <RefreshCw size={16} className="mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="sm">
            <Copy size={16} className="mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            {...useFastClick(
              useCallback(() => {
                setGeneratedIds("");
              }, []),
            )}
          >
            <XIcon size={16} className="mr-2" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={idType}
            onValueChange={(value: string) => setIdType(value as IdType)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IdType.NANOID}>Nano ID</SelectItem>
              <SelectItem value={IdType.ULID}>ULID</SelectItem>
              <SelectItem value={IdType.UUID_V4}>UUID v4</SelectItem>
              <SelectItem value={IdType.UUID_V1}>UUID v1</SelectItem>
              <SelectItem value={IdType.UUID_V3}>UUID v3</SelectItem>
              <SelectItem value={IdType.UUID_V5}>UUID v5</SelectItem>
              <SelectItem value={IdType.UUID_V6}>UUID v6</SelectItem>
              <SelectItem value={IdType.UUID_V7}>UUID v7</SelectItem>
              <SelectItem value={IdType.UUID_V8}>UUID v8</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">x</span>
          <Input
            type="number"
            value={generateCount}
            onChange={(e) => {
              setGenerateCount(Number.parseInt(e.target.value, 10) || 1);
            }}
            className="w-20 h-9 bg-input border-border"
            min="1"
          />
          <div className="flex items-center space-x-2 ml-auto">
            <Checkbox
              id="lowercase"
              checked={isLowercase}
              onCheckedChange={(checked) => setIsLowercase(checked as boolean)}
            />
            <Label htmlFor="lowercase" className="text-sm font-medium">
              lowercased
            </Label>
          </div>
        </div>
        <Textarea
          value={generatedIds}
          readOnly
          placeholder="Generated IDs will appear here"
          className="flex-grow bg-background border-input text-foreground font-mono text-sm resize-none"
          spellCheck="false"
        />
      </div>
    </div>
  );
}

interface FieldWithCopyProps {
  label: string;
  value: string;
  onCopy: (value: string) => void;
}

function FieldWithCopy({ label, value, onCopy }: FieldWithCopyProps) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          readOnly
          className="bg-input border-border text-foreground h-9"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onCopy(value)}
            >
              <Copy size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
