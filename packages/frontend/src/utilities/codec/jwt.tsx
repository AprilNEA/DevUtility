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
import TwoSectionLayout from "@/components/layout/two-section";
import { ClearTool, LoadFileTool, PasteTool } from "@/components/tools";
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

// JWT算法枚举
enum JwtAlgorithm {
  HS256 = "HS256",
  HS384 = "HS384",
  HS512 = "HS512",
  RS256 = "RS256",
  RS384 = "RS384",
  RS512 = "RS512",
  ES256 = "ES256",
  ES384 = "ES384",
  ES512 = "ES512",
  PS256 = "PS256",
  PS384 = "PS384",
  PS512 = "PS512",
}

interface JwtParts {
  header: string;
  payload: string;
  signature: string;
  headerDecoded?: string;
  payloadDecoded?: string;
}

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Base64 URL 解码
function base64UrlDecode(str: string): string {
  try {
    // 将 base64url 转换为标准 base64
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // 添加填充
    while (base64.length % 4) {
      base64 += "=";
    }
    // 解码
    const decoded = atob(base64);
    // 处理 Unicode
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    return "";
  }
}

// 格式化 JSON
function formatJson(str: string): string {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return str;
  }
}

export default function JwtDecoderPage() {
  const { t } = useLingui();
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>(JwtAlgorithm.HS256);
  const [secretKey, setSecretKey] = useState("");
  const [jwtParts, setJwtParts] = useState<JwtParts>({
    header: "",
    payload: "",
    signature: "",
  });
  const [verificationStatus, setVerificationStatus] = useState<
    "no-input" | "invalid" | "valid" | "unverified"
  >("no-input");

  const debouncedInput = useDebouncedValue(input, 100, true);

  // 解析 JWT
  const parseJwt = useCallback(
    (token: string) => {
      if (!token) {
        setJwtParts({
          header: "",
          payload: "",
          signature: "",
        });
        setVerificationStatus("no-input");
        return;
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        setJwtParts({
          header: "",
          payload: "",
          signature: "",
        });
        setVerificationStatus("invalid");
        return;
      }

      const [header, payload, signature] = parts;

      const headerDecoded = base64UrlDecode(header);
      const payloadDecoded = base64UrlDecode(payload);

      setJwtParts({
        header,
        payload,
        signature,
        headerDecoded: formatJson(headerDecoded),
        payloadDecoded: formatJson(payloadDecoded),
      });

      // 简单的验证状态逻辑
      if (secretKey) {
        // TODO: 实际的签名验证需要使用相应的算法
        setVerificationStatus("unverified");
      } else {
        setVerificationStatus("unverified");
      }
    },
    [secretKey]
  );

  useEffect(() => {
    parseJwt(debouncedInput);
  }, [debouncedInput, parseJwt]);

  const handleCopy = useCallback((content: string) => {
    copyToClipboard(content);
  }, []);

  const inputToolbar = (
    <>
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
    </div>
  );

  const outputContent = (
    <div className="flex flex-col gap-4 h-full">
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
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 ml-auto"
          onClick={() => handleCopy(input)}
        >
          <Copy size={16} />
        </Button>
      </div>

      {/* Output Sections */}
      <div className="flex flex-col gap-4 flex-grow overflow-hidden">
        {/* Header */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Header:</Label>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(jwtParts.headerDecoded || "")}
            >
              <Copy size={14} />
            </Button>
          </div>
          <Textarea
            value={jwtParts.headerDecoded || "{}"}
            readOnly
            className="h-full resize-none font-mono text-xs border-input"
            spellCheck="false"
          />
        </div>

        {/* Payload */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Payload:</Label>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(jwtParts.payloadDecoded || "")}
            >
              <Copy size={14} />
            </Button>
          </div>
          <Textarea
            value={jwtParts.payloadDecoded || "{}"}
            readOnly
            className="h-full resize-none font-mono text-xs border-input"
            spellCheck="false"
          />
        </div>

        {/* Signature */}
        <div className="space-y-2">
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
          "p-3 rounded-md text-sm font-medium text-center",
          verificationStatus === "no-input" && "bg-muted text-muted-foreground",
          verificationStatus === "invalid" &&
            "bg-destructive/10 text-destructive",
          verificationStatus === "valid" &&
            "bg-green-500/10 text-green-600 dark:text-green-400",
          verificationStatus === "unverified" &&
            "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        )}
      >
        {verificationStatus === "no-input" &&
          t(msg`Verification Status: No Input`)}
        {verificationStatus === "invalid" &&
          t(msg`Verification Status: Invalid JWT Format`)}
        {verificationStatus === "valid" &&
          t(msg`Verification Status: Signature Verified`)}
        {verificationStatus === "unverified" &&
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
