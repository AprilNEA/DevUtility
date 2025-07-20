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
import { useUtilityInvoke } from "../invoke";
import { Base64Engine, InvokeFunction } from "../types";

export default function Base64CodecPage() {
  const [mode, setMode] = useState<CodecMode>(CodecMode.Encode);
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
      setError(error.toString());
    },
  });

  const handleCodec = useCallback(
    (input: string, mode: CodecMode) => {
      setError("");
      if (mode === CodecMode.Decode) {
        decode.trigger({ input, engine: Base64Engine.Standard });
      } else {
        encode.trigger({ input });
      }
    },
    [encode.trigger, decode.trigger],
  );

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const debouncedInput = useDebouncedValue(input, 100, true);

  useEffect(() => {
    if (debouncedInput) {
      handleCodec(debouncedInput, mode);
    }
  }, [handleCodec, debouncedInput, mode]);

  const inputToolbar = (
    <>
      <CodecModeRadio mode={mode} setMode={setMode} />
      <ContinuousModeTool />
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />
      <LoadFileTool />
      <ClearTool
        button={{
          onClick: handleClear,
        }}
      />
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
        {mode === CodecMode.Encode ? "Base64" : "Text"}
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
        onChange: (e) => setInput(e.target.value),
      }}
      outputToolbar={outputToolbar}
      outputProps={{
        value: output,
        readOnly: true,
      }}
    />
  );
}
