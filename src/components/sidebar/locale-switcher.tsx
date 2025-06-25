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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales, dynamicActivate } from "@/i18n";
import { i18n } from "@lingui/core";
import { useState, useEffect } from "react";

export function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);

  useEffect(() => {
    const handleLocaleChange = () => {
      setCurrentLocale(i18n.locale);
    };

    // Listen for locale changes
    i18n.on("change", handleLocaleChange);

    return () => {
      i18n.removeListener("change", handleLocaleChange);
    };
  }, []);

  const handleLocaleChange = async (locale: string) => {
    await dynamicActivate(locale);
    setCurrentLocale(locale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        {Object.entries(locales).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code)}
            className={currentLocale === code ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
