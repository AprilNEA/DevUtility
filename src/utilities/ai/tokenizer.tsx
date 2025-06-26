/**
 * Copyright (c) 2023-2025, ApriilNEA LLC.
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

import cl100k_base from "gpt-tokenizer/encoding/cl100k_base";
import p50k_base from "gpt-tokenizer/encoding/p50k_base";
import p50k_edit from "gpt-tokenizer/encoding/p50k_edit";
import r50k_base from "gpt-tokenizer/encoding/r50k_base";
import { useMemo, useState } from "react";
import InputOutputLayout from "@/components/layout/input-output";
import { ClearTool, CopyTool, PasteTool } from "@/components/tools";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Encoding = "cl100k_base" | "p50k_base" | "p50k_edit" | "r50k_base";

const tokenizers = {
  cl100k_base,
  p50k_base,
  r50k_base,
  p50k_edit,
};

const MODEL: Record<string, Record<string, string>> = {
  chat: {
    "gpt-4-32k": "cl100k_base",
    "gpt-4-0314": "cl100k_base",
    "gpt-4-32k-0314": "cl100k_base",
    "gpt-3.5-turbo": "cl100k_base",
    "gpt-3.5-turbo-0301": "cl100k_base",
  },
  text_only: {
    "text-davinci-003": "p50k_base",
    "text-davinci-002": "p50k_base",
    "text-davinci-001": "r50k_base",
    "text-curie-001": "r50k_base",
    "text-babbage-001": "r50k_base",
    "text-ada-001": "r50k_base",
    davinci: "r50k_base",
    curie: "r50k_base",
    babbage: "r50k_base",
    ada: "r50k_base",
  },
  code: {
    "code-davinci-002": "p50k_base",
    "code-davinci-001": "p50k_base",
    "code-cushman-002": "p50k_base",
    "code-cushman-001": "p50k_base",
    "davinci-codex": "p50k_base",
    "cushman-codex": "p50k_base",
  },
  edit: {
    "text-davinci-edit-001": "p50k_edit",
    "code-davinci-edit-001": "p50k_edit",
  },
  embeddings: {
    "text-embedding-ada-002": "cl100k_base",
  },
  old_embeddings: {
    "text-similarity-davinci-001": "r50k_base",
    "text-similarity-curie-001": "r50k_base",
    "text-similarity-babbage-001": "r50k_base",
    "text-similarity-ada-001": "r50k_base",
    "text-search-davinci-doc-001": "r50k_base",
    "text-search-curie-doc-001": "r50k_base",
    "text-search-babbage-doc-001": "r50k_base",
    "text-search-ada-doc-001": "r50k_base",
    "code-search-babbage-code-001": "r50k_base",
    "code-search-ada-code-001": "r50k_base",
  },
} as const;

const getEncoding = (key: string): Encoding => {
  for (const category in MODEL) {
    if (MODEL[category][key]) {
      return MODEL[category][key] as Encoding;
    }
  }
  return "cl100k_base";
};

const SelectModel: React.FC<{
  value: string;
  setValue: (v: string) => void;
}> = (props) => {
  return (
    <Select value={props.value} onValueChange={(v) => props.setValue(v)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MODEL).map(([category, items], index) => (
          <div key={category}>
            <SelectGroup>
              <SelectLabel>{category}</SelectLabel>
              {Object.entries(items).map(([model, value]) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
            {index + 1 !== Object.keys(MODEL).length && <SelectSeparator />}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};

const monospace = `"Roboto Mono",sfmono-regular,consolas,liberation mono,menlo,courier,monospace`;
const pastelColors = [
  "rgba(107,64,216,.3)",
  "rgba(104,222,122,.4)",
  "rgba(244,172,54,.4)",
  "rgba(239,65,70,.4)",
  "rgba(39,181,234,.4)",
];

const TokenizedText = ({ tokens }: { tokens: (string | number)[] }) => (
  <div
    className="flex flex-wrap w-full h-full overflow-y-auto p-2 border border-border bg-muted leading-relaxed content-start rounded-md"
    style={{
      fontFamily: monospace,
    }}
  >
    {tokens.map((token, index) => (
      <span
        key={`token-${index}-${String(token).slice(0, 10)}`}
        className="inline-block h-6 px-0.5 mr-0.5 mb-1 rounded-sm"
        style={{
          backgroundColor: pastelColors[index % pastelColors.length],
        }}
      >
        <pre className="m-0 text-xs">
          {String(token).replace(/ /g, "\u00A0").replace(/\n/g, "<newline>")}
        </pre>
      </span>
    ))}
  </div>
);

export default function GptTokenizerPage() {
  const [input, setInput] = useState("");

  const [selectedModel, setSelectedModel] = useState<string>("gpt-4-32k");

  const api = useMemo(
    () => tokenizers[getEncoding(selectedModel)],
    [selectedModel],
  );
  const encodedTokens = api.encode(input);
  const decodedTokens = useMemo(() => {
    const tokens = [];
    for (const token of api.decodeGenerator(encodedTokens)) {
      tokens.push(token);
    }
    return tokens;
  }, [encodedTokens, api]);

  const inputToolbar = (
    <>
      <SelectModel value={selectedModel} setValue={setSelectedModel} />
      <PasteTool
        onPaste={(text) => {
          setInput(text);
        }}
      />
      <ClearTool
        button={{
          onClick: () => setInput(""),
        }}
      />
    </>
  );

  const outputToolbar = (
    <>
      <Button variant="outline" size="sm" className="h-8 min-w-8">
        Tokens: {encodedTokens.length}
      </Button>
      <CopyTool content={input} />
    </>
  );

  return (
    <InputOutputLayout
      inputToolbar={inputToolbar}
      inputProps={{
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: "Enter text to tokenize",
      }}
      outputToolbar={outputToolbar}
      outputProps={{
        value: "", // We'll override this with custom render below
        readOnly: true,
        style: { display: "none" }, // Hide default textarea
      }}
      outputBottomBar={
        <div className="flex-grow w-full min-h-[200px]">
          <TokenizedText tokens={decodedTokens} />
        </div>
      }
    />
  );
}
