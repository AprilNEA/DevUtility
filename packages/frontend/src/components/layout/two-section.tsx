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

import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

declare const ORIENTATIONS: readonly ["horizontal", "vertical"];
export type Orientation = (typeof ORIENTATIONS)[number];

export type TwoSectionLayoutProps = {
  orientation?: Orientation;

  firstLabel?: MessageDescriptor;
  firstToolbar?: React.ReactNode;
  firstContent?: React.ReactNode;

  secondLabel?: MessageDescriptor;
  secondToolbar?: React.ReactNode;
  secondContent?: React.ReactNode;

  classNames?: {
    container?: string;
    firstSection?: string;
    firstSectionToolbar?: string;
    secondSection?: string;
    secondSectionToolbar?: string;
  };
};

const TwoSectionLayout = ({
  orientation = "vertical",
  firstLabel,
  firstToolbar,
  firstContent,
  secondLabel,
  secondToolbar,
  secondContent,
  classNames,
}: TwoSectionLayoutProps) => {
  const { t } = useLingui();
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 h-[calc(100vh-3rem-1rem)]",
        orientation === "vertical" && "md:grid-cols-2",
        orientation === "horizontal" && "grid-rows-2",
        classNames?.container,
      )}
    >
      {/* Input Section */}
      <div
        className={cn(
          "flex flex-col gap-2 bg-background/95 p-3 rounded-lg",
          classNames?.firstSection,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 mb-2",
            classNames?.firstSectionToolbar,
          )}
        >
          {firstLabel && (
            <Label className="text-sm font-medium text-foreground/80">
              {t(firstLabel)}
            </Label>
          )}
          <div className="flex items-center gap-1">{firstToolbar}</div>
        </div>
        {firstContent}
      </div>

      {/* Output Section */}
      <div
        className={cn(
          "flex flex-col gap-2 bg-background/95 p-3 rounded-lg",
          classNames?.secondSection,
        )}
      >
        {secondToolbar && (
          <div
            className={cn(
              "flex items-center justify-between gap-2 mb-2",
              classNames?.secondSectionToolbar,
            )}
          >
            {secondLabel && (
              <Label className="text-sm font-medium text-foreground/80">
                {t(secondLabel)}
              </Label>
            )}
            <div className="flex items-center gap-1">{secondToolbar}</div>
          </div>
        )}
        {secondContent}
      </div>
    </div>
  );
};

export default TwoSectionLayout;
