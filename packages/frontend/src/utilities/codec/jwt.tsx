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
import { ChevronDown, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Callout } from "@/components/derived-ui/callout";
import TwoSectionLayout from "@/components/layout/two-section";
import {
  ClearTool,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/copyboard";
import { cn } from "@/lib/utils";
import { useUtilityInvoke } from "../invoke";
import { InvokeFunction, JwtAlgorithm } from "../types";

// JWT算法枚举

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderPage() {
  const { t } = useLingui();
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>(JwtAlgorithm.HS256);
  const [secretKey, setSecretKey] = useState("");

  const debouncedInput = useDebouncedValue(input, 100, true);
  const { data, error, trigger } = useUtilityInvoke(InvokeFunction.DecodeJwt);

  useEffect(() => {
    if (debouncedInput) {
      trigger({
        input: debouncedInput,
        algorithm,
        secret: secretKey || undefined,
      });
    }
  }, [debouncedInput, algorithm, secretKey, trigger]);

  const inputToolbar = (
    <>
      {/* Algorithm Selector */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-input hover:bg-accent text-foreground hover:text-accent-foreground"
            >
              {algorithm} <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-popover text-popover-foreground border"
          >
            <DropdownMenuRadioGroup
              value={algorithm}
              onValueChange={(v) => setAlgorithm(v as JwtAlgorithm)}
            >
              {Object.values(JwtAlgorithm).map((alg) => (
                <DropdownMenuRadioItem
                  key={alg}
                  value={alg}
                  className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  {alg}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3"
        onClick={() => setInput(sampleJwt)}
      >
        <Trans>Sample</Trans>
      </Button>
      <ClearTool
        button={{
          onClick: () => {
            setInput("");
            setSecretKey("");
          },
        }}
      />
    </>
  );

  const inputContent = (
    <div className="flex flex-col gap-2 flex-grow">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t(msg`Enter Your JWT Token
Drag/Drop Files
Right Click → Load from File...
⌘ + F to Search
⌘ + ⌥ + F to Replace`)}
        className="flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring"
        spellCheck="false"
      />
      {error && (
        <Callout variant="error" className="w-full">
          {error}
        </Callout>
      )}
    </div>
  );

  const outputContent = (
    <div className="flex flex-col gap-2 h-full">
      {/* Output Sections */}
      <div className="flex flex-col gap-2 flex-grow overflow-hidden">
        {/* Header */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Header:</Label>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                if (data?.header) {
                  copyToClipboard(data.header);
                }
              }}
            >
              <Copy size={14} />
            </Button>
          </div>
          <Textarea
            value={data?.header || "{}"}
            readOnly
            className="grow resize-none font-mono text-xs border-input"
            spellCheck="false"
          />
        </div>

        {/* Payload */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Payload:</Label>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                if (data?.payload) {
                  copyToClipboard(data.payload);
                }
              }}
            >
              <Copy size={14} />
            </Button>
          </div>
          <Textarea
            value={data?.payload || "{}"}
            readOnly
            className="grow resize-none font-mono text-xs border-input"
            spellCheck="false"
          />
        </div>

        {/* Signature */}
        <div className="shrink-0 flex flex-col gap-2">
          <Label className="text-sm font-medium">Signature:</Label>
          <div className="p-3 bg-muted/50 rounded-md">
            <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
              <span className="text-blue-500">HMACSHA256(</span>
              <br />
              {"  "}base64UrlEncode(header) + "." +
              <br />
              {"  "}base64UrlEncode(payload),
              <br />
              {"  "}
              <Input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="your-secret"
                className="inline-block w-40 h-6 px-2 py-1 text-xs font-mono bg-background"
              />
              <br />
              <span className="text-blue-500">)</span>
            </pre>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div
        className={cn(
          "shrink-0 p-3 rounded-md text-sm font-medium text-center",
          !data && "bg-muted text-muted-foreground",
          data?.verified === "invalid" && "bg-destructive/10 text-destructive",
          data?.verified === "valid" &&
            "bg-green-500/10 text-green-600 dark:text-green-400",
          data?.verified === "unverified" &&
            "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        )}
      >
        {!data && t(msg`Verification Status: No Input`)}
        {data?.verified === "invalid" &&
          t(msg`Verification Status: Invalid JWT Format`)}
        {data?.verified === "valid" &&
          t(msg`Verification Status: Signature Verified`)}
        {data?.verified === "unverified" &&
          t(msg`Verification Status: Signature Not Verified`)}
      </div>
    </div>
  );

  return (
    <TwoSectionLayout
      firstLabel={msg`Input`}
      firstToolbar={inputToolbar}
      firstContent={inputContent}
      secondLabel={msg`Output`}
      secondContent={outputContent}
    />
  );
}
