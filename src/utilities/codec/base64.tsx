import React, { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/copyboard";
import { useUtilityInvoke } from "../invoke";
import { InvokeFunction } from "../types";
import { useDebouncedValue } from "foxact/use-debounced-value";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Copy, Zap, FileText, Trash2, Settings } from "lucide-react";

enum Mode {
  Encode = "encode",
  Decode = "decode",
}
const MODES = [
  { label: msg`Encode`, value: Mode.Encode },
  { label: msg`Decode`, value: Mode.Decode },
];

export default function Base64CodecPage() {
  const { t } = useLingui();

  const [mode, setMode] = useState<Mode>(Mode.Encode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useUtilityInvoke(InvokeFunction.EncodeBase64, {
    onSuccess: (data) => {
      setOutput(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  const decode = useUtilityInvoke(InvokeFunction.DecodeBase64, {
    onSuccess: (data) => {
      setOutput(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleCodec = useCallback(
    (input: string, mode: Mode) => {
      setError("");
      if (mode === Mode.Decode) {
        decode.trigger({ input });
      } else {
        encode.trigger({ input });
      }
    },
    [encode, decode],
  );

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleCopy = async () => {
    if (output) {
      await copyToClipboard(output);
    }
  };

  const debouncedInput = useDebouncedValue(input, 100, true);

  useEffect(() => {
    if (debouncedInput) {
      handleCodec(debouncedInput, mode);
    }
  }, [handleCodec, debouncedInput, mode]);

  return (
    <div className="h-full flex flex-col">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Input</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClear}
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigator.clipboard.writeText(input)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setInput("")}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {MODES.map((m) => (
            <Button
              key={m.value}
              variant={mode === m.value ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.value)}
              type="button"
            >
              {t(m.label)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Output</Label>
          <Button variant="outline" size="sm" className="h-8 min-w-8">
            {mode === Mode.Encode ? "Base64" : "Text"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            disabled={!output}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-px bg-border">
        {/* Input Section */}
        <div className="bg-background p-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter text to encode..."
                : "Enter base64 to decode..."
            }
            className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        {/* Output Section */}
        <div className="bg-background p-4">
          <Textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/30"
          />
          {error && (
            <div className="text-destructive mt-2 text-sm bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
