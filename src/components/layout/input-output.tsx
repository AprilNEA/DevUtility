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

import { cn } from "@/lib/utils";
import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import ShikiHighlighter, {
  createHighlighterCore, // re-exported from shiki/engine/javascript
  createOnigurumaEngine,
} from "react-shiki/core";
import { useTheme } from "../sidebar/theme-switcher";
import { Textarea } from "../ui/textarea";
import TwoSectionLayout, { type Orientation } from "./two-section";

const highlighter = await createHighlighterCore({
  themes: [
    import("@shikijs/themes/light-plus"),
    import("@shikijs/themes/dark-plus"),
  ],
  langs: [import("@shikijs/langs/json")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export type InputOutputLayoutProps = {
  orientation?: Orientation;

  inputLabel?: MessageDescriptor;
  inputToolbar?: React.ReactNode;
  inputBottombar?: React.ReactNode;
  inputProps?: React.ComponentProps<"textarea">;

  outputLabel?: MessageDescriptor;
  outputToolbar?: React.ReactNode;
  outputBottomBar?: React.ReactNode;
  outputProps?: React.ComponentProps<"textarea">;
  language?: string;
};

const InputOutputLayout = ({
  orientation = "vertical",

  inputLabel = msg`Input`,
  inputToolbar,
  inputBottombar,
  inputProps,
  outputLabel = msg`Output`,
  outputToolbar,
  outputBottomBar,
  outputProps,
  language,
}: InputOutputLayoutProps) => {
  const { t } = useLingui();
  const { theme } = useTheme();
  return (
    <TwoSectionLayout
      orientation={orientation}
      firstLabel={inputLabel}
      firstToolbar={inputToolbar}
      firstContent={
        <div className="flex flex-col gap-2 flex-grow">
          <Textarea
            {...inputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              inputProps?.className,
            )}
            spellCheck="false"
          />
          {inputBottombar}
        </div>
      }
      secondLabel={outputLabel}
      secondToolbar={outputToolbar}
      secondContent={
        <div className="flex flex-col gap-2 flex-grow">
          {language ? (
            <div className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-md border flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring">
              <ShikiHighlighter
                highlighter={highlighter}
                language={language}
                theme={theme === "dark" ? "dark-plus" : "light-plus"}
                className="px-3 py-2 select-text"
                addDefaultStyles={false}
                showLanguage={false}
                // biome-ignore lint/correctness/noChildrenProp: string
                children={outputProps?.value as string}
              />
            </div>
          ) : (
            <Textarea
              {...outputProps}
              className={cn(
                "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
                outputProps?.className,
              )}
              spellCheck="false"
            />
          )}

          {outputBottomBar}
        </div>
      }
    />
  );
};

export default InputOutputLayout;
