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

import { Trans } from "@lingui/react/macro";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import {
  DownloadIcon,
  InfoIcon,
  Loader2Icon,
  MinusIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import useSWRSubscription, {
  type SWRSubscriptionOptions,
} from "swr/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SettingItemProps {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

const SettingItem = ({ title, description, children }: SettingItemProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-normal">{title}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  </div>
);

const UpdateItem = () => {
  const { data: update, isLoading } = useSWR("updater_check", check);

  const [isUpdating, setIsUpdating] = useState(false);
  const { data: process } = useSWRSubscription(
    isUpdating ? "updater_download" : null,
    (
      _,
      {
        next,
      }: SWRSubscriptionOptions<
        {
          status: "pending" | "started" | "progress" | "finished";
          downloaded?: number;
          contentLength?: number;
        },
        Error
      >,
    ) => {
      next(null, {
        status: "pending",
      });
      update?.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started": {
            const contentLength = event.data.contentLength;
            if (contentLength) {
              next(null, (prev) => ({
                ...prev,
                status: "started",
                contentLength: (prev?.contentLength ?? 0) + contentLength,
              }));
            }
            console.log(
              `started downloading ${event.data.contentLength} bytes`,
            );
            break;
          }
          case "Progress": {
            const chunkLength = event.data.chunkLength;
            if (chunkLength) {
              next(null, (prev) => ({
                ...prev,
                status: "progress",
                downloaded: (prev?.downloaded ?? 0) + chunkLength,
              }));
            }
            console.log(`downloaded ${chunkLength}`);
            break;
          }
          case "Finished": {
            next(null, (prev) => ({
              ...prev,
              status: "finished",
            }));
            console.log("download finished");
            break;
          }
        }
      });
      return () => {
        setIsUpdating(false);
        // update?.close();
      };
    },
    {
      onSuccess(data) {
        console.log(data);
        if (data.status === "finished") {
          relaunch();
        }
      },
      fallbackData: {
        status: "pending",
      },
    },
  );

  return (
    <SettingItem title={<Trans>Update</Trans>}>
      <div className="flex items-center gap-3">
        {isUpdating ? (
          <Badge variant="secondary" className="text-xs">
            <Trans>Updating</Trans>
            <Loader2Icon className="h-3 w-3 animate-spin" />
          </Badge>
        ) : isLoading ? (
          <Badge variant="secondary" className="text-xs">
            <Trans>Checking for updates</Trans>
            <Loader2Icon className="h-3 w-3 animate-spin" />
          </Badge>
        ) : update === null ? (
          <Badge variant="secondary" className="text-xs">
            <Trans>Up to date</Trans>
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsUpdating(true);
            }}
          >
            <Trans>Update Now</Trans>
          </Button>
        )}
      </div>
    </SettingItem>
  );
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "system",
    language: "zh-CN",
    zoom: 100,
    editorFont: "JetBrainsMono",
    fontSize: 13,
    lineHeight: 22,
    wordWrap: true,
    formatNumbers: true,
    byteDisplay: "bytes",
    autoUpdate: true,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollArea>
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        {/* 通用设置 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              <Trans>General</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingItem title={<Trans>Appearance</Trans>}>
              <div className="flex items-center gap-1 rounded-lg border p-1">
                <Button
                  variant={settings.theme === "system" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => updateSetting("theme", "system")}
                >
                  <MonitorIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={settings.theme === "light" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => updateSetting("theme", "light")}
                >
                  <SunIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={settings.theme === "dark" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => updateSetting("theme", "dark")}
                >
                  <MoonIcon className="h-4 w-4" />
                </Button>
              </div>
            </SettingItem>

            <SettingItem title={<Trans>Display Language</Trans>}>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingItem title={<Trans>Zoom</Trans>}>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    updateSetting("zoom", Math.max(50, settings.zoom - 10))
                  }
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <div className="w-16 text-center text-sm">{settings.zoom}%</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    updateSetting("zoom", Math.min(200, settings.zoom + 10))
                  }
                >
                  <PlusIcon className="h-3 w-3" />
                </Button>
              </div>
            </SettingItem>
          </CardContent>
        </Card>

        {/* 文本编辑器 */}
        {/* <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">文本编辑器</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingItem title="字体">
              <Select
                value={settings.editorFont}
                onValueChange={(value) => updateSetting("editorFont", value)}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JetBrainsMono">JetBrains Mono</SelectItem>
                  <SelectItem value="FiraCode">Fira Code</SelectItem>
                  <SelectItem value="Consolas">Consolas</SelectItem>
                  <SelectItem value="Monaco">Monaco</SelectItem>
                  <SelectItem value="CourierNew">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingItem title="字体大小">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSetting("fontSize", parseInt(e.target.value) || 13)
                  }
                  className="w-16 h-8 px-2 text-sm border rounded-md text-center"
                  min="10"
                  max="24"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </SettingItem>

            <SettingItem title="行高">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.lineHeight}
                  onChange={(e) =>
                    updateSetting("lineHeight", parseInt(e.target.value) || 22)
                  }
                  className="w-16 h-8 px-2 text-sm border rounded-md text-center"
                  min="16"
                  max="40"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </SettingItem>

            <SettingItem title="自动换行">
              <Select
                value={settings.wordWrap ? "on" : "off"}
                onValueChange={(value) =>
                  updateSetting("wordWrap", value === "on")
                }
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">开</SelectItem>
                  <SelectItem value="off">关</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>
          </CardContent>
        </Card> */}

        {/* 表格 */}
        {/* <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">表格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingItem title="格式化数字">
              <Select
                value={settings.formatNumbers ? "on" : "off"}
                onValueChange={(value) =>
                  updateSetting("formatNumbers", value === "on")
                }
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">开</SelectItem>
                  <SelectItem value="off">关</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingItem title="显示字节为">
              <Select
                value={settings.byteDisplay}
                onValueChange={(value) => updateSetting("byteDisplay", value)}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bytes">Bytes size</SelectItem>
                  <SelectItem value="kb">KB</SelectItem>
                  <SelectItem value="mb">MB</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>
          </CardContent>
        </Card> */}

        {/* 关于 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              <Trans>About</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <UpdateItem />

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      "https://github.com/aprilnea/devutility/releases",
                      "_blank",
                    );
                  }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  <Trans>Change Log</Trans>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      "https://github.com/aprilnea/devutility/issues",
                      "_blank",
                    );
                  }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <InfoIcon className="h-3.5 w-3.5" />
                  <Trans>Bug Reports and Feature Requests</Trans>
                </button>
                {/* <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Hash className="h-3.5 w-3.5" />
                  许可证管理器
                </button> */}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-6">
                <span>
                  <Trans>Follow DevUtility</Trans>
                </span>
                {/* <span>隐私政策</span> */}
              </div>
              <div className="flex items-center gap-4">
                {/* <span>DevUtility v2.1.0</span> */}
                <span>2025/06/22</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
