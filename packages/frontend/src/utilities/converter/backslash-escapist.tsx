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
import { FlaskConicalIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CodecModeRadio, { CodecMode } from "@/components/codec-mode";
import { Callout } from "@/components/derived-ui/callout";
import InputOutputLayout from "@/components/layout/input-output";
import {
  ClearTool,
  ContinuousModeTool,
  CopyTool,
  LoadFileTool,
  PasteTool,
} from "@/components/tools";
import { Button } from "@/components/ui/button";

// Sample text with various escape sequences
const sampleText = `Hello "World"!
This is a test with:
- New lines
- Tabs\tlike this
- Special chars: \\, ', "
- Unicode: \u4e2d\u6587
- Path: C:\\Users\\Test\\file.txt`;

export default function BackslashEscapistPage() {
  const [mode, setMode] = useState<CodecMode>(CodecMode.Encode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [continuousMode, setContinuousMode] = useState(true);

  // Escape string by adding backslashes
  const escapeString = useCallback((str: string): string => {
    try {
      const escapeMap: { [key: string]: string } = {
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\b": "\\b",
        "\f": "\\f",
        "\v": "\\v",
        "\0": "\\0",
        "\\": "\\\\",
        '"': '\\"',
        "'": "\\'",
      };

      let result = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (escapeMap[char]) {
          result += escapeMap[char];
        } else {
          const code = char.charCodeAt(0);
          // Escape non-printable ASCII characters and Unicode characters
          if (code < 32 || code > 126) {
            if (code <= 0xff) {
              // Use \xHH for extended ASCII
              result += `\\x${code.toString(16).padStart(2, "0")}`;
            } else {
              // Use \uHHHH for Unicode
              result += `\\u${code.toString(16).padStart(4, "0")}`;
            }
          } else {
            result += char;
          }
        }
      }
      return result;
    } catch (e) {
      throw new Error("Failed to escape string");
    }
  }, []);

  // Unescape string by interpreting escape sequences
  const unescapeString = useCallback((str: string): string => {
    try {
      let result = "";
      let i = 0;

      while (i < str.length) {
        if (str[i] === "\\" && i + 1 < str.length) {
          const nextChar = str[i + 1];
          switch (nextChar) {
            case "n":
              result += "\n";
              i += 2;
              break;
            case "r":
              result += "\r";
              i += 2;
              break;
            case "t":
              result += "\t";
              i += 2;
              break;
            case "b":
              result += "\b";
              i += 2;
              break;
            case "f":
              result += "\f";
              i += 2;
              break;
            case "v":
              result += "\v";
              i += 2;
              break;
            case "0":
              result += "\0";
              i += 2;
              break;
            case "\\":
              result += "\\";
              i += 2;
              break;
            case '"':
              result += '"';
              i += 2;
              break;
            case "'":
              result += "'";
              i += 2;
              break;
            case "x": {
              // Handle \xHH
              if (i + 3 < str.length) {
                const hex = str.substring(i + 2, i + 4);
                const code = parseInt(hex, 16);
                if (!isNaN(code)) {
                  result += String.fromCharCode(code);
                  i += 4;
                } else {
                  result += str[i];
                  i++;
                }
              } else {
                result += str[i];
                i++;
              }
              break;
            }
            case "u": {
              // Handle \uHHHH
              if (i + 5 < str.length) {
                const hex = str.substring(i + 2, i + 6);
                const code = parseInt(hex, 16);
                if (!isNaN(code)) {
                  result += String.fromCharCode(code);
                  i += 6;
                } else {
                  result += str[i];
                  i++;
                }
              } else {
                result += str[i];
                i++;
              }
              break;
            }
            default:
              // If not a recognized escape sequence, keep the backslash
              result += str[i];
              i++;
          }
        } else {
          result += str[i];
          i++;
        }
      }
      return result;
    } catch (e) {
      throw new Error("Failed to unescape string");
    }
  }, []);

  const handleConvert = useCallback(
    (text: string, convertMode: CodecMode) => {
      if (!text) {
        setOutput("");
        setError("");
        return;
      }

              try {
          setError("");
          const result =
            convertMode === CodecMode.Encode
              ? escapeString(text)
              : unescapeString(text);
          setOutput(result);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Conversion failed");
          setOutput("");
        }
    },
    [escapeString, unescapeString],
  );

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const debouncedInput = useDebouncedValue(input, 100, true);

  useEffect(() => {
    if (continuousMode && debouncedInput) {
      handleConvert(debouncedInput, mode);
    }
  }, [continuousMode, debouncedInput, mode, handleConvert]);

    const inputToolbar = (
    <>
      <CodecModeRadio mode={mode} setMode={setMode} />
      <ContinuousModeTool />
      <PasteTool onPaste={(text) => setInput(text)} />
      <LoadFileTool />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setInput(sampleText);
          if (!continuousMode) {
            handleConvert(sampleText, mode);
          }
        }}
        className="text-muted-foreground hover:text-foreground h-8 w-8"
      >
        <FlaskConicalIcon size={18} />
      </Button>
      <ClearTool button={{ onClick: handleClear }} />
    </>
  );

  const inputBottombar = error && (
    <Callout variant="error" className="w-full">
      {error}
    </Callout>
  );

  const outputToolbar = (
    <>
      <Button variant="outline" size="sm" className="h-8 min-w-8">
        {mode === CodecMode.Encode ? "Escaped" : "Unescaped"}
      </Button>
      <CopyTool content={output} />
    </>
  );

  return (
    <InputOutputLayout
      inputToolbar={inputToolbar}
      inputBottombar={inputBottombar}
      inputProps={{
        value: input,
        onChange: (e) => {
          setInput(e.target.value);
          if (!continuousMode) {
            setOutput("");
            setError("");
          }
        },
        onKeyDown: (e) => {
          if (
            !continuousMode &&
            e.key === "Enter" &&
            (e.ctrlKey || e.metaKey)
          ) {
            e.preventDefault();
            handleConvert(input, mode);
          }
        },
                  placeholder:
            mode === CodecMode.Encode
              ? "Enter text to escape special characters..."
              : "Enter escaped text to unescape...",
      }}
      outputToolbar={outputToolbar}
      outputProps={{
        value: output,
        readOnly: true,
                  placeholder:
            mode === CodecMode.Encode
              ? "Escaped text will appear here..."
              : "Unescaped text will appear here...",
      }}
    />
  );
}
