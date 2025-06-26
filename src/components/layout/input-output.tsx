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

import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import TwoSectionLayout, { type Orientation } from "./two-section";

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
}: InputOutputLayoutProps) => {
  const { t } = useLingui();
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
          <Textarea
            {...outputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              outputProps?.className,
            )}
            spellCheck="false"
          />
          {outputBottomBar}
        </div>
      }
    />
  );
};

export default InputOutputLayout;
