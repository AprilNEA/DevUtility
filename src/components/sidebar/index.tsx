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
} from "lucide-react";
import { SearchForm } from "./search-form";
import { useState } from "react";
import { Button } from "../ui/button";

// This is sample data.
const navMain = [
  {
    title: "Format / Validate / Minify",
    url: "formatter",
    items: [
      {
        title: "JSON Format/Validate",
        url: "json",
        icon: FileJsonIcon,
      },
      {
        title: "HTML Beautify/Minify",
        url: "html",
        icon: FileCodeIcon,
      },
      {
        title: "CSS Beautify/Minify",
        url: "css",
        icon: FileIcon,
      },
      {
        title: "JS Beautify/Minify",
        url: "js",
        icon: FileCode2Icon,
      },
      {
        title: "ERB Beautify/Minify",
        url: "erb",
        icon: FileTypeIcon,
      },
      {
        title: "LESS Beautify/Minify",
        url: "less",
        icon: FileIcon,
      },
      {
        title: "SCSS Beautify/Minify",
        url: "scss",
        icon: FileIcon,
      },
      {
        title: "XML Beautify/Minify",
        url: "xml",
        icon: FileCodeIcon,
      },
      {
        title: "SQL Formatter",
        url: "sql",
        icon: FileIcon,
      },
      {
        title: "Line Sort/Dedupe",
        url: "lines",
        icon: ListOrderedIcon,
      },
    ],
  },
  {
    title: "Data Converter",
    url: "#",
    items: [
      {
        title: "URL Parser",
        url: "url-parser",
        icon: LinkIcon,
      },
      {
        title: "YAML to JSON",
        url: "yaml-to-json",
        icon: FileIcon,
      },
      {
        title: "JSON to YAML",
        url: "json-to-yaml",
        icon: FileJsonIcon,
      },
      {
        title: "Number Base Converter",
        url: "number-base-converter",
        icon: BinaryIcon,
      },
      {
        title: "JSON to CSV",
        url: "json-to-csv",
        icon: TableIcon,
      },
      {
        title: "CSV to JSON",
        url: "csv-to-json",
        icon: TableIcon,
      },
      {
        title: "HTML to JSX",
        url: "html-to-jsx",
        icon: Code2Icon,
      },
      {
        title: "String Case Converter",
        url: "string-case-converter",
        icon: TypeIcon,
      },
      {
        title: "PHP to JSON",
        url: "php-to-json",
        icon: FileCodeIcon,
      },
      {
        title: "JSON to PHP",
        url: "json-to-php",
        icon: FileJsonIcon,
      },
      {
        title: "PHP Serializer",
        url: "php-serializer",
        icon: FileArchiveIcon,
      },
      {
        title: "PHP Unserializer",
        url: "php-unserializer",
        icon: FileArchiveIcon,
      },
      {
        title: "SVG to CSS",
        url: "svg-to-css",
        icon: FileIcon,
      },
      {
        title: "cURL to Code",
        url: "curl-to-code",
        icon: TerminalIcon,
      },
      {
        title: "JSON to Code",
        url: "json-to-code",
        icon: CodeIcon,
      },
      {
        title: "Hex to ASCII",
        url: "hex-to-ascii",
        icon: HashIcon,
      },
      {
        title: "ASCII to Hex",
        url: "ascii-to-hex",
        icon: TextIcon,
      },
    ],
  },
  {
    title: "Inspect, Preview, Debug",
    items: [
      {
        title: "Unix Time Converter",
        url: "unix-time-converter",
        icon: ClockIcon,
      },
      {
        title: "JWT Debugger",
        url: "jwt-debugger",
        icon: KeyIcon,
      },
      {
        title: "RegExp Tester",
        url: "regexp-tester",
        icon: RegexIcon,
      },
      {
        title: "HTML Preview",
        url: "html-preview",
        icon: FileCodeIcon,
      },
      {
        title: "Text Diff Checker",
        url: "text-diff-checker",
        icon: DiffIcon,
      },
      {
        title: "String Inspector",
        url: "string-inspector",
        icon: SearchIcon,
      },
      {
        title: "Markdown Preview",
        url: "markdown-preview",
        icon: FileTextIcon,
      },
      {
        title: "Cron Job Parser",
        url: "cron-job-parser",
        icon: CalendarIcon,
      },
      {
        title: "Color Converter",
        url: "color-converter",
        icon: PaletteIcon,
      },
    ],
  },
  {
    title: "Generators",
    url: "generators",
    items: [
      {
        title: "UUID/ULID Generate/Decode",
        url: "id",
        icon: HashIcon,
      },
      {
        title: "Lorem Ipsum Generator",
        url: "lorem-ipsum-generator",
        icon: TextIcon,
      },
      {
        title: "QR Code Reader/Generator",
        url: "qr-code-generator",
        icon: QrCodeIcon,
      },
      {
        title: "Hash Generator",
        url: "hash-generator",
        icon: HashIcon,
      },
      {
        title: "Random String Generator",
        url: "random-string-generator",
        icon: TextIcon,
      },
    ],
  },
  {
    title: "Encoder, Decoder",
    items: [
      {
        title: "Base64 String Encode/Decode",
        url: "base64-string",
        icon: FileTextIcon,
      },
      {
        title: "Base64 Image Encode/Decode",
        url: "base64-image",
        icon: ImageIcon,
      },
      {
        title: "URL Encode/Decode",
        url: "url-encoder",
        icon: LinkIcon,
      },
      {
        title: "HTML Entity Encode/Decode",
        url: "html-entity",
        icon: FileCodeIcon,
      },
      {
        title: "Backslash Escape/Unescape",
        url: "backslash-escape",
        icon: TextIcon,
      },
      {
        title: "Certificate Decoder (X.509)",
        url: "certificate-decoder",
        icon: FileTextIcon,
      },
    ],
  },
];

export default function AppSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [pathname] = useLocation();
  const [title, setTitle] = useState("Developer Utility");
  const [isOnTop, setIsOnTop] = useState(false);

  const setOnTop = async () => {
    await getCurrentWindow().setAlwaysOnTop(!isOnTop);
    setIsOnTop(!isOnTop);
  };

  return (
    <SidebarProvider>
      <Sidebar {...props}>
        <SidebarHeader data-tauri-drag-region className="pt-12">
          <SearchForm />
        </SidebarHeader>
        <SidebarContent className="scrollbar">
          {/* We create a SidebarGroup for each parent. */}
          {navMain.map((category) => (
            <SidebarGroup key={category.title}>
              <SidebarGroupLabel>{category.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.items.map((util) => {
                    const href = `/${category.url}/${util.url}`;
                    return (
                      <SidebarMenuItem key={util.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === href}
                        >
                          <Link
                            href={href}
                            className="flex items-center gap-2 truncate"
                            onClick={() => setTitle(util.title)}
                          >
                            <util.icon className="h-4 w-4" />
                            {util.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header
          data-tauri-drag-region
          className="flex h-12 shrink-0 items-center gap-2 px-4"
        >
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 flex justify-center items-center">
            <div className="w-full max-w-xs">
              <div className="bg-muted rounded px-2 py-1 text-xs text-center text-muted-foreground font-normal tracking-tight select-none">
                {title}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={setOnTop}
          >
            {isOnTop ? <PinOffIcon /> : <PinIcon />}
          </Button>
        </header>
        <main className="flex-1 max-h-[calc(100vh-3rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
