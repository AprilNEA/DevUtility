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
import {
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  GlobeIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ClearTool, PasteTool } from "@/components/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard, readFromClipboard } from "@/lib/copyboard";
import { cn } from "@/lib/utils";

type TimeFormat = "seconds" | "milliseconds" | "iso8601" | "relative";

interface TimeData {
  unix: number;
  local: string;
  utc: string;
  relative: string;
  dayOfYear: number;
  weekOfYear: number;
  isLeapYear: boolean;
  localFormats: {
    date: string;
    time: string;
    full: string;
  };
}

interface Timezone {
  id: string;
  name: string;
  offset: string;
  time: string;
}

// Get all available timezones
const getAllTimezones = () => {
  const timezones: string[] = [];
  const regions = [
    "Africa",
    "America",
    "Antarctica",
    "Arctic",
    "Asia",
    "Atlantic",
    "Australia",
    "Europe",
    "Indian",
    "Pacific",
  ];

  // Common timezone identifiers
  const commonZones = ["UTC", "GMT"];

  timezones.push(...commonZones);

  // Generate timezone list based on common patterns
  regions.forEach((region) => {
    // Add some common cities for each region
    const cities = {
      Africa: [
        "Cairo",
        "Lagos",
        "Nairobi",
        "Johannesburg",
        "Algiers",
        "Accra",
        "Addis_Ababa",
        "Casablanca",
      ],
      America: [
        "New_York",
        "Chicago",
        "Denver",
        "Los_Angeles",
        "Toronto",
        "Mexico_City",
        "Sao_Paulo",
        "Buenos_Aires",
      ],
      Asia: [
        "Shanghai",
        "Tokyo",
        "Hong_Kong",
        "Singapore",
        "Dubai",
        "Kolkata",
        "Bangkok",
        "Seoul",
      ],
      Europe: [
        "London",
        "Paris",
        "Berlin",
        "Madrid",
        "Rome",
        "Moscow",
        "Istanbul",
        "Athens",
      ],
      Australia: ["Sydney", "Melbourne", "Perth", "Brisbane"],
      Pacific: ["Auckland", "Fiji", "Guam", "Honolulu"],
      Atlantic: ["Azores", "Bermuda", "Canary", "Cape_Verde"],
      Indian: ["Maldives", "Mauritius", "Reunion"],
      Antarctica: ["Casey", "Davis", "Mawson"],
      Arctic: ["Longyearbyen"],
    };

    const cityList = cities[region as keyof typeof cities] || [];
    cityList.forEach((city) => {
      timezones.push(`${region}/${city}`);
    });
  });

  return timezones.sort();
};

export default function UnixTimePage() {
  const { t } = useLingui();
  const [input, setInput] = useState("");
  const [inputFormat, setInputFormat] = useState<TimeFormat>("seconds");
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [timezoneToAdd, setTimezoneToAdd] = useState("");

  const debouncedInput = useDebouncedValue(input, 300, false);

  // Calculate time data based on input
  const timeData: TimeData | null = useCallback(() => {
    if (!debouncedInput || debouncedInput.trim() === "") return null;

    try {
      let unix: number;

      // Parse input based on format
      if (inputFormat === "iso8601") {
        unix = new Date(debouncedInput).getTime();
        if (isNaN(unix)) return null;
      } else if (inputFormat === "relative") {
        // Parse relative time like "2 hours ago", "in 3 days"
        const now = Date.now();
        const parts = debouncedInput
          .toLowerCase()
          .match(
            /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*(ago|from now)?/,
          );
        if (!parts) return null;

        const value = parseInt(parts[1]);
        const unit = parts[2];
        const direction = parts[3] === "ago" ? -1 : 1;

        const multipliers: Record<string, number> = {
          second: 1000,
          minute: 60 * 1000,
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        };

        unix = now + value * multipliers[unit] * direction;
      } else {
        // Handle mathematical expressions
        const evaluated = eval(debouncedInput);
        unix = inputFormat === "milliseconds" ? evaluated : evaluated * 1000;
        if (isNaN(unix)) return null;
      }

      const date = new Date(unix);
      if (isNaN(date.getTime())) return null;

      // Calculate relative time
      const now = Date.now();
      const diff = unix - now;
      const absDiff = Math.abs(diff);
      const minutes = Math.floor(absDiff / (60 * 1000));
      const hours = Math.floor(absDiff / (60 * 60 * 1000));
      const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));

      let relative: string;
      if (absDiff < 60 * 1000) {
        relative = diff < 0 ? t(msg`Just now`) : t(msg`In a moment`);
      } else if (minutes < 60) {
        relative =
          diff < 0
            ? t(msg`${minutes} minute(s) ago`)
            : t(msg`In ${minutes} minute(s)`);
      } else if (hours < 24) {
        relative =
          diff < 0 ? t(msg`${hours} hour(s) ago`) : t(msg`In ${hours} hour(s)`);
      } else {
        relative =
          diff < 0 ? t(msg`${days} day(s) ago`) : t(msg`In ${days} day(s)`);
      }

      // Calculate day of year
      const start = new Date(date.getFullYear(), 0, 0);
      const dayOfYear = Math.floor(
        (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
      );

      // Calculate week of year
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const weekOfYear = Math.ceil(
        ((date.getTime() - firstDay.getTime()) / 86400000 +
          firstDay.getDay() +
          1) /
          7,
      );

      // Check if leap year
      const year = date.getFullYear();
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

      return {
        unix: Math.floor(unix / 1000),
        local: date.toLocaleString(),
        utc: date.toISOString(),
        relative,
        dayOfYear,
        weekOfYear,
        isLeapYear,
        localFormats: {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          full: date.toString(),
        },
      };
    } catch (error) {
      return null;
    }
  }, [debouncedInput, inputFormat, t])();

  // Calculate timezone data
  const timezoneData: Timezone[] = selectedTimezones.map((tz) => {
    if (!timeData) return { id: tz, name: tz, offset: "", time: "" };

    try {
      const date = new Date(timeData.unix * 1000);
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "short",
      });

      const parts = formatter.formatToParts(date);
      const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";

      return {
        id: tz,
        name: tz.split("/").pop()?.replace(/_/g, " ") || tz,
        offset,
        time: formatter.format(date).replace(/,/g, ""),
      };
    } catch {
      return { id: tz, name: tz, offset: "", time: "" };
    }
  });

  const handleNow = () => {
    const now = Date.now();
    setInput(
      inputFormat === "milliseconds"
        ? now.toString()
        : Math.floor(now / 1000).toString(),
    );
  };

  const handlePaste = async () => {
    const text = await readFromClipboard();
    if (text) setInput(text);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleAddTimezone = () => {
    if (timezoneToAdd && !selectedTimezones.includes(timezoneToAdd)) {
      setSelectedTimezones([...selectedTimezones, timezoneToAdd]);
      setTimezoneToAdd("");
    }
  };

  const handleRemoveTimezone = (tz: string) => {
    setSelectedTimezones(selectedTimezones.filter((t) => t !== tz));
  };

  const OutputRow = ({
    label,
    value,
    className,
  }: {
    label: string;
    value: string | number | boolean;
    className?: string;
  }) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-1">
        <span className={cn("text-sm font-mono", className)}>
          {typeof value === "boolean"
            ? value
              ? t(msg`Yes`)
              : t(msg`No`)
            : value || "-"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => copyToClipboard(value.toString())}
          disabled={!value}
        >
          <CopyIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  const allTimezones = getAllTimezones();

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Input Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">
                <Trans>Input</Trans>:
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleNow}
                >
                  <Trans>Now</Trans>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={handlePaste}
                >
                  <Trans>Clipboard</Trans>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleClear}
                >
                  <Trans>Clear</Trans>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(msg`Enter unix timestamp or expression...`)}
                className="flex-1 font-mono"
              />
              <Select
                value={inputFormat}
                onValueChange={(v) => setInputFormat(v as TimeFormat)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">
                    <Trans>Unix time (seconds since epoch)</Trans>
                  </SelectItem>
                  <SelectItem value="milliseconds">
                    <Trans>Unix time (milliseconds)</Trans>
                  </SelectItem>
                  <SelectItem value="iso8601">
                    <Trans>ISO 8601 format</Trans>
                  </SelectItem>
                  <SelectItem value="relative">
                    <Trans>Relative time</Trans>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              <Trans>Tips: Mathematical operators + - * / are supported</Trans>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Time outputs */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <OutputRow label={t(msg`Local`)} value={timeData?.local || ""} />
              <Separator />
              <OutputRow
                label={t(msg`UTC (ISO 8601)`)}
                value={timeData?.utc || ""}
              />
              <Separator />
              <OutputRow
                label={t(msg`Relative`)}
                value={timeData?.relative || ""}
              />
              <Separator />
              <OutputRow
                label={t(msg`Unix time`)}
                value={timeData?.unix || ""}
              />
            </CardContent>
          </Card>

          {/* Other timezones */}
          {selectedTimezones.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">
                  <Trans>Other timezones</Trans>:
                </Label>
                <div className="space-y-2">
                  {timezoneData.map((tz) => (
                    <div
                      key={tz.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{tz.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({tz.offset})
                          </span>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {tz.time}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleRemoveTimezone(tz.id)}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <OutputRow
                label={t(msg`Day of year`)}
                value={timeData?.dayOfYear || ""}
              />
              <Separator />
              <OutputRow
                label={t(msg`Week of year`)}
                value={timeData?.weekOfYear || ""}
              />
              <Separator />
              <OutputRow
                label={t(msg`Is leap year?`)}
                value={timeData?.isLeapYear || false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">
                <Trans>Other formats (local)</Trans>
              </Label>
              <div className="space-y-2">
                <OutputRow
                  label={t(msg`Date`)}
                  value={timeData?.localFormats.date || ""}
                />
                <OutputRow
                  label={t(msg`Time`)}
                  value={timeData?.localFormats.time || ""}
                />
                <OutputRow
                  label={t(msg`Full`)}
                  value={timeData?.localFormats.full || ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add timezone */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">
                <Trans>Other timezones</Trans>:
              </Label>
              <div className="flex items-center gap-2">
                <Select value={timezoneToAdd} onValueChange={setTimezoneToAdd}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t(msg`Add timezone...`)} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {allTimezones
                        .filter((tz) => !selectedTimezones.includes(tz))
                        .map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3"
                  onClick={handleAddTimezone}
                  disabled={!timezoneToAdd}
                >
                  <Trans>Add</Trans>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
