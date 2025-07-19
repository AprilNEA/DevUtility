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

import { Trans, useLingui } from "@lingui/react/macro";
import { Separator } from "@radix-ui/react-separator";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  ChevronRightIcon,
  PinIcon,
  PinOffIcon,
  SettingsIcon,
} from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import utilities, { type UtilityMeta } from "@/utilities/meta";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useSidebar } from "../ui/sidebar";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchForm } from "./search-form";
import { ThemeSwitcher } from "./theme-switcher";

const InsetHeader: React.FC<{ title: string }> = ({ title }) => {
  const { open } = useSidebar();

  const setOnTop = async () => {
    await getCurrentWindow().setAlwaysOnTop(!isOnTop);
    setIsOnTop(!isOnTop);
  };
  const [isOnTop, setIsOnTop] = useState(false);

  return (
    <header
      data-tauri-drag-region
      className="flex h-9 shrink-0 items-center gap-2 px-4"
    >
      <SidebarTrigger className={cn("-ml-1", !open && "ml-16")} />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div
        data-tauri-drag-region
        className="flex-1 flex justify-center items-center"
      >
        <div className="w-full max-w-xs">
          <div className="bg-muted rounded px-2 py-1 text-xs text-center text-muted-foreground font-normal tracking-tight select-none">
            {title}
          </div>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="size-7" onClick={setOnTop}>
        {isOnTop ? <PinOffIcon /> : <PinIcon />}
      </Button>
    </header>
  );
};

export default function AppSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useLingui();

  const [title, setTitle] = useState("Developer Utility");
  const [pathname] = useLocation();
  const [search, setSearch] = useState("");

  // Filter utilities based on search
  const filteredNav = search.trim()
    ? utilities
        .map((category) => {
          if ("items" in category) {
            const filteredItems = category.items.filter((util) => {
              const q = search.toLowerCase();
              return (
                util.title.message?.toLowerCase().includes(q) ||
                category.title.message?.toLowerCase().includes(q)
              );
            });
            return filteredItems.length > 0
              ? { ...category, items: filteredItems }
              : undefined;
          }
          return undefined;
        })
        .filter((cat): cat is UtilityMeta & { items: UtilityMeta[] } =>
          Boolean(cat),
        )
    : utilities.filter(
        (util): util is UtilityMeta & { items: UtilityMeta[] } =>
          "items" in util,
      );

  return (
    <SidebarProvider className="bg-sidebar overflow-hidden">
      <Sidebar {...props}>
        <SidebarHeader data-tauri-drag-region className="pt-12">
          <SearchForm
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent className="mb-2">
          <div className="flex-1 -pr-1 mr-1">
            {filteredNav.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">
                <Trans>No results found.</Trans>
              </div>
            ) : (
              filteredNav.map((category) => (
                <SidebarGroup key={category.key}>
                  <SidebarGroupLabel className="text-sidebar-foreground">
                    {t(category.title)}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {category.items.map((item) => {
                        if ("items" in item) {
                          return (
                            <Collapsible
                              key={item.key}
                              asChild
                              // defaultOpen={item.isActive}
                              className="group/collapsible"
                            >
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon />}
                                    <span>{t(item.title)}</span>
                                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {item.items.map((subItem) => {
                                      const href = `/${category.key}/${item.key}/${subItem.key}`;
                                      return (
                                        <SidebarMenuSubItem key={subItem.key}>
                                          <SidebarMenuSubButton 
                                            asChild
                                            isActive={pathname === href}
                                          >
                                            <Link
                                              href={href}
                                              onClick={() => {
                                                if (item.title.message) {
                                                  setTitle(item.title.message);
                                                }
                                              }}
                                            >
                                              {subItem.icon && (
                                                <subItem.icon className="h-4 w-4" />
                                              )}
                                              <span>{t(subItem.title)}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          );
                        }
                        const href = `/${category.key}/${item.key}`;
                        return (
                          <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === href}
                            >
                              <Link
                                href={href}
                                className="flex items-center gap-2 truncate text-sidebar-foreground"
                                onClick={() => {
                                  if (item.title.message) {
                                    setTitle(item.title.message);
                                  }
                                }}
                              >
                                <item.icon className="h-4 w-4" />
                                {t(item.title)}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))
            )}
          </div>
        </SidebarContent>
        <SidebarFooter className="flex-row justify-start">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <SettingsIcon />
            </Button>
          </Link>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background rounded-lg m-2 overflow-hidden">
        <InsetHeader title={title} />
        <main className="@container/main flex-1 max-h-[calc(100vh-3rem)] px-4 pb-2 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
