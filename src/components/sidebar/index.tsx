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

import * as React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Sidebar,
  SidebarContent,
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
import { Separator } from "@radix-ui/react-separator";
import { Link, useLocation } from "wouter";
import {
  FileJsonIcon,
  FileCodeIcon,
  FileTextIcon,
  FileTypeIcon,
  FileCode2Icon,
  FileIcon,
  FileArchiveIcon,
  ListOrderedIcon,
  LinkIcon,
  BinaryIcon,
  TableIcon,
  Code2Icon,
  TypeIcon,
  TerminalIcon,
  CodeIcon,
  HashIcon,
  TextIcon,
  QrCodeIcon,
  PaletteIcon,
  CalendarIcon,
  SearchIcon,
  DiffIcon,
  ClockIcon,
  KeyIcon,
  RegexIcon,
  ImageIcon,
  PinIcon,
  PinOffIcon,
  ChevronRightIcon,
  RadarIcon,
  RotateCcwIcon,
  RotateCcwKeyIcon,
} from "lucide-react";
import { SearchForm } from "./search-form";
import { useState } from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Trans, useLingui } from "@lingui/react/macro";
import { LocaleSwitcher } from "./locale-switcher";
import { msg } from "@lingui/core/macro";
import { MessageDescriptor } from "@lingui/core";
import { ThemeSwitcher } from "./theme-switcher";

type NavItem = {
  title: MessageDescriptor;
  slug: string;
  icon: React.ElementType;
};

type Nav = {
  title: MessageDescriptor;
  slug: string;
  items: (NavItem | (NavItem & { subItems: NavItem[] }))[];
};

const navMain: Nav[] = [
  {
    title: msg`Format / Validate / Minify`,
    slug: "formatter",
    items: [
      {
        title: msg`JSON Format/Validate`,
        slug: "json",
        icon: FileJsonIcon,
      },
      {
        title: msg`HTML Beautify/Minify`,
        slug: "html",
        icon: FileCodeIcon,
      },
      {
        title: msg`CSS Beautify/Minify`,
        slug: "css",
        icon: FileIcon,
      },
      {
        title: msg`JS Beautify/Minify`,
        slug: "js",
        icon: FileCode2Icon,
      },
      // {
      //   title: "ERB Beautify/Minify",
      //   url: "erb",
      //   icon: FileTypeIcon,
      // },
      // {
      //   title: "LESS Beautify/Minify",
      //   url: "less",
      //   icon: FileIcon,
      // },
      // {
      //   title: "SCSS Beautify/Minify",
      //   url: "scss",
      //   icon: FileIcon,
      // },
      // {
      //   title: "XML Beautify/Minify",
      //   url: "xml",
      //   icon: FileCodeIcon,
      // },
      // {
      //   title: "SQL Formatter",
      //   url: "sql",
      //   icon: FileIcon,
      // },
      // {
      //   title: "Line Sort/Dedupe",
      //   url: "lines",
      //   icon: ListOrderedIcon,
      // },
    ],
  },
  {
    title: msg`Data Converter`,
    slug: "#",
    items: [
      {
        title: msg`URL Parser`,
        slug: "url-parser",
        icon: LinkIcon,
      },
      // {
      //   title: "YAML to JSON",
      //   url: "yaml-to-json",
      //   icon: FileIcon,
      // },
      // {
      //   title: "JSON to YAML",
      //   url: "json-to-yaml",
      //   icon: FileJsonIcon,
      // },
      // {
      //   title: "Number Base Converter",
      //   url: "number-base-converter",
      //   icon: BinaryIcon,
      // },
      // {
      //   title: "JSON to CSV",
      //   url: "json-to-csv",
      //   icon: TableIcon,
      // },
      // {
      //   title: "CSV to JSON",
      //   url: "csv-to-json",
      //   icon: TableIcon,
      // },
      // {
      //   title: "HTML to JSX",
      //   url: "html-to-jsx",
      //   icon: Code2Icon,
      // },
      // {
      //   title: "String Case Converter",
      //   url: "string-case-converter",
      //   icon: TypeIcon,
      // },
      // {
      //   title: "PHP to JSON",
      //   url: "php-to-json",
      //   icon: FileCodeIcon,
      // },
      // {
      //   title: "JSON to PHP",
      //   url: "json-to-php",
      //   icon: FileJsonIcon,
      // },
      // {
      //   title: "PHP Serializer",
      //   url: "php-serializer",
      //   icon: FileArchiveIcon,
      // },
      // {
      //   title: "PHP Unserializer",
      //   url: "php-unserializer",
      //   icon: FileArchiveIcon,
      // },
      // {
      //   title: "SVG to CSS",
      //   url: "svg-to-css",
      //   icon: FileIcon,
      // },
      // {
      //   title: "cURL to Code",
      //   url: "curl-to-code",
      //   icon: TerminalIcon,
      // },
      // {
      //   title: "JSON to Code",
      //   url: "json-to-code",
      //   icon: CodeIcon,
      // },
      // {
      //   title: "Hex to ASCII",
      //   url: "hex-to-ascii",
      //   icon: HashIcon,
      // },
      // {
      //   title: "ASCII to Hex",
      //   url: "ascii-to-hex",
      //   icon: TextIcon,
      // },
    ],
  },
  // {
  //   title: "Inspect, Preview, Debug",
  //   items: [
  //     {
  //       title: "Unix Time Converter",
  //       url: "unix-time-converter",
  //       icon: ClockIcon,
  //     },
  //     {
  //       title: "JWT Debugger",
  //       url: "jwt-debugger",
  //       icon: KeyIcon,
  //     },
  //     {
  //       title: "RegExp Tester",
  //       url: "regexp-tester",
  //       icon: RegexIcon,
  //     },
  //     {
  //       title: "HTML Preview",
  //       url: "html-preview",
  //       icon: FileCodeIcon,
  //     },
  //     {
  //       title: "Text Diff Checker",
  //       url: "text-diff-checker",
  //       icon: DiffIcon,
  //     },
  //     {
  //       title: "String Inspector",
  //       url: "string-inspector",
  //       icon: SearchIcon,
  //     },
  //     {
  //       title: "Markdown Preview",
  //       url: "markdown-preview",
  //       icon: FileTextIcon,
  //     },
  //     {
  //       title: "Cron Job Parser",
  //       url: "cron-job-parser",
  //       icon: CalendarIcon,
  //     },
  //     {
  //       title: "Color Converter",
  //       url: "color-converter",
  //       icon: PaletteIcon,
  //     },
  //   ],
  // },
  {
    title: msg`Generators`,
    slug: "generator",
    items: [
      {
        title: msg`UUID/ULID Generate/Decode`,
        slug: "id",
        icon: HashIcon,
      },
      // {
      //   title: "Lorem Ipsum Generator",
      //   url: "lorem-ipsum-generator",
      //   icon: TextIcon,
      // },
      // {
      //   title: "QR Code Reader/Generator",
      //   url: "qr-code-generator",
      //   icon: QrCodeIcon,
      // },
      // {
      //   title: "Hash Generator",
      //   url: "hash",
      //   icon: HashIcon,
      // },
      // {
      //   title: "Random String Generator",
      //   url: "random-string-generator",
      //   icon: TextIcon,
      // },
    ],
  },
  {
    title: msg`Cryptography & Security`,
    slug: "cryptography",
    items: [
      {
        title: msg`OATH Debugger`,
        slug: "oath",
        icon: KeyIcon,
        subItems: [
          {
            title: msg`HOTP Debugger`,
            slug: "hotp",
            icon: KeyIcon,
          },
          {
            title: msg`TOTP Debugger`,
            slug: "totp",
            icon: KeyIcon,
          }
        ]
      },
      {
        title: msg`RSA Debugger`,
        slug: "rsa",
        icon: KeyIcon,
        subItems: [
          {
            title: msg`Key Generator`,
            slug: "generator",
            icon: RotateCcwKeyIcon,
          },
          {
            title: msg`Key Analyzer`,
            slug: "analyzer",
            icon: RadarIcon,
          },
        ],
      },
      {
        title: msg`AES Debugger`,
        slug: "aes-debugger",
        icon: KeyIcon,
      },
    ],
  },
  {
    title: msg`Encoder, Decoder`,
    slug: "codec",
    items: [
      {
        title: msg`Base64 Encode/Decode`,
        slug: "base64",
        icon: FileTextIcon,
      },
      //     {
      //       title: "Base64 Image Encode/Decode",
      //       url: "base64-image",
      //       icon: ImageIcon,
      //     },
      //     {
      //       title: "URL Encode/Decode",
      //       url: "url-encoder",
      //       icon: LinkIcon,
      //     },
      //     {
      //       title: "HTML Entity Encode/Decode",
      //       url: "html-entity",
      //       icon: FileCodeIcon,
      //     },
      //     {
      //       title: "Backslash Escape/Unescape",
      //       url: "backslash-escape",
      //       icon: TextIcon,
      //     },
      //     {
      //       title: "Certificate Decoder (X.509)",
      //       url: "certificate-decoder",
      //       icon: FileTextIcon,
      //     },
    ],
  },
];

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

  // Filter navMain based on search
  const filteredNav = search.trim()
    ? navMain
        .map((category) => {
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
        })
        .filter((cat): cat is (typeof navMain)[number] => Boolean(cat))
    : navMain;

  return (
    <SidebarProvider className="bg-transparent dark:bg-sidebar">
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
                <SidebarGroup key={category.slug}>
                  <SidebarGroupLabel className="text-sidebar-foreground">
                    {t(category.title)}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {category.items.map((item) => {
                        if ("subItems" in item) {
                          return (
                            <Collapsible
                              key={item.slug}
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
                                    {item.subItems.map((subItem) => (
                                      <SidebarMenuSubItem key={subItem.slug}>
                                        <SidebarMenuSubButton asChild>
                                          <Link
                                            href={`/${category.slug}/${item.slug}/${subItem.slug}`}
                                          >
                                            <subItem.icon className="h-4 w-4" />
                                            <span>{t(subItem.title)}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          );
                        }
                        const href = `/${category.slug}/${item.slug}`;
                        return (
                          <SidebarMenuItem key={item.slug}>
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
          <div className="flex justify-start px-2">
            <LocaleSwitcher />
            <ThemeSwitcher />
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background rounded-lg m-2">
        <InsetHeader title={title} />
        <main className="@container/main flex-1 max-h-[calc(100vh-3rem)] px-4 pb-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
