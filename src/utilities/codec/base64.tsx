import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/copyboard";
import { utilityInvoke } from "../invoke";
import { InvokeFunction } from "../types"; 

const MODES = [
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
];

export default function Base64CodecPage() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleProcess = async () => {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(await utilityInvoke(InvokeFunction.EncodeBase64, { input }));
      } else {
        setOutput(await utilityInvoke(InvokeFunction.DecodeBase64, { input }));
      }
    } catch (e) {
      setError("Invalid input for this operation.");
      setOutput("");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleCopy = async () => {
    if (output) await copyToClipboard(output);
  };

  React.useEffect(() => {
    if (input) handleProcess();
    else setOutput("");
    // eslint-disable-next-line
  }, [input, mode]);

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Base64 Encode / Decode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          {MODES.map((m) => (
            <Button
              key={m.value}
              variant={mode === m.value ? "default" : "outline"}
              onClick={() => setMode(m.value)}
              type="button"
            >
              {m.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="input-text">Input</Label>
            <Textarea
              id="input-text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Enter base64 to decode..."
              }
              className="min-h-32 mt-2"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="output-text">Output</Label>
            <Textarea
              id="output-text"
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="min-h-32 mt-2"
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleCopy} disabled={!output} type="button">
                Copy
              </Button>
              <Button onClick={handleClear} variant="outline" type="button">
                Clear
              </Button>
            </div>
            {error && (
              <div className="text-destructive mt-2 text-sm">{error}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};