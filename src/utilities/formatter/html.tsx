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

import { useDebouncedValue } from "foxact/use-debounced-value";
import { useCallback, useEffect, useState } from "react";
import CodecModeRadio, { CodecMode } from "@/components/codec-mode";
import InputOutputLayout from "@/components/layout/input-output";
import {
  ClearTool,
  CopyTool,
  LoadFileTool,
  PasteTool,
} from "@/components/tools";

// Basic HTML entity maps
const encodeMap: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  // Add more entities as needed
};

const decodeMap: { [key: string]: string } = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  // Add more entities as needed
};

const sampleHtml = '<h1>Hello & Welcome!</h1>\n<p>This is a "sample" text.</p>';

export default function HtmlEncoderDecoderPage() {
  const [mode, setMode] = useState<CodecMode>(CodecMode.Encode);

  const [input, setInput] = useState(sampleHtml);
  const [outputHtml, setOutputHtml] = useState("");

  // const [continuousMode, setContinuousMode] = useState(true);

  const processHtml = useCallback(
    (html: string, currentMode: "encode" | "decode") => {
      if (currentMode === "encode") {
        return html.replace(/[&<>"']/g, (match) => encodeMap[match] || match);
      } else {
        // A more robust decoder would handle numeric entities etc.
        // This is a simplified version.
        let decoded = html;
        for (const key in decodeMap) {
          const regex = new RegExp(key, "g");
          decoded = decoded.replace(regex, decodeMap[key]);
        }
        return decoded;
      }
    },
    [],
  );

  const debouncedInput = useDebouncedValue(input, 100, true);
  useEffect(() => {
    if (debouncedInput) {
      setOutputHtml(processHtml(debouncedInput, mode));
    }
  }, [debouncedInput, mode, processHtml]);

  const inputToolbar = (
    <>
      {/* <ContinuousModeTool /> */}
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />
      <LoadFileTool />
      <ClearTool
        button={{
          onClick: () => {
            setInput("");
            setOutputHtml("");
          },
        }}
      />
      <CodecModeRadio mode={mode} setMode={setMode} />
    </>
  );

  const outputToolbar = (
    <>
      <CopyTool content={outputHtml} />
    </>
  );

  return (
    <InputOutputLayout
      orientation="horizontal"
      inputToolbar={inputToolbar}
      inputProps={{
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: "Paste your HTML here",
      }}
      outputToolbar={outputToolbar}
      outputProps={{
        value: outputHtml,
        readOnly: true,
        placeholder: "Processed HTML will appear here",
      }}
      language="html"
    />
  );
}
