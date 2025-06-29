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

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  User, 
  Maximize, 
  Link, 
  Keyboard, 
  Image, 
  MoreHorizontal,
  Bell,
  Shield,
  Download,
  Palette,
  Monitor,
  Zap
} from "lucide-react";

interface SettingItemProps {
  title: string;
  description?: string;
  settingKey: string;
  badge?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SettingItem = ({ 
  title, 
  description, 
  settingKey, 
  badge,
  checked,
  onCheckedChange
}: SettingItemProps) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={settingKey} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {title}
        </Label>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch
      id={settingKey}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoUpdate: false,
    warnBeforeQuit: true,
    notifications: true,
    analytics: false,
    darkMode: true,
    autoSave: true,
    showTips: true,
    compactMode: false,
    soundEffects: true,
    autoBackup: true
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and account settings.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="max" className="flex items-center gap-2">
              <Maximize className="h-4 w-4" />
              Max
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="icon" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Icon
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Application Settings
                </CardTitle>
                <CardDescription>
                  Configure general application behavior and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  title="Automatically update my app"
                  description="Keep your application up to date with the latest features and security improvements"
                  settingKey="autoUpdate"
                  checked={settings.autoUpdate}
                  onCheckedChange={(checked) => updateSetting("autoUpdate", checked)}
                />
                <Separator />
                <SettingItem
                  title="Warn before quitting"
                  description="Show a confirmation dialog when closing the application"
                  settingKey="warnBeforeQuit"
                  checked={settings.warnBeforeQuit}
                  onCheckedChange={(checked) => updateSetting("warnBeforeQuit", checked)}
                />
                <Separator />
                <SettingItem
                  title="Enable notifications"
                  description="Receive notifications about important events and updates"
                  settingKey="notifications"
                  badge="New"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting("notifications", checked)}
                />
                <Separator />
                <SettingItem
                  title="Auto-save changes"
                  description="Automatically save your work as you make changes"
                  settingKey="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  title="Dark mode"
                  description="Use dark theme for better viewing in low light"
                  settingKey="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                />
                <Separator />
                <SettingItem
                  title="Compact mode"
                  description="Use a more compact interface to fit more content"
                  settingKey="compactMode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Previews</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your default search engine, Auto-Archive, and downloads in Preview Settings.
                    </p>
                  </div>
                  <Button variant="outline">
                    Previews Settings...
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Profile Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Configure user profiles and account preferences.
                    </p>
                  </div>
                  <Button variant="outline">
                    Profile Settings...
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profiles
                </CardTitle>
                <CardDescription>
                  Manage user accounts and profile settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter your username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" placeholder="Enter your display name" />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">Upload a custom profile picture</p>
                  </div>
                  <Button variant="outline">Upload Image</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="max" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Maximize className="h-5 w-5" />
                  Window & Display
                </CardTitle>
                <CardDescription>
                  Configure window behavior and display settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="window-size">Default Window Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select window size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (800x600)</SelectItem>
                      <SelectItem value="medium">Medium (1200x800)</SelectItem>
                      <SelectItem value="large">Large (1600x1000)</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <SettingItem
                  title="Show tips and tricks"
                  description="Display helpful tips and shortcuts in the interface"
                  settingKey="showTips"
                  checked={settings.showTips}
                  onCheckedChange={(checked) => updateSetting("showTips", checked)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Link Handling
                </CardTitle>
                <CardDescription>
                  Configure how external links are handled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-browser">Default Browser</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default browser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="chrome">Google Chrome</SelectItem>
                      <SelectItem value="firefox">Mozilla Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Microsoft Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Customize keyboard shortcuts for common actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">New Document</span>
                    <Badge variant="outline">Ctrl+N</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Save</span>
                    <Badge variant="outline">Ctrl+S</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Search</span>
                    <Badge variant="outline">Ctrl+F</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Settings</span>
                    <Badge variant="outline">Ctrl+,</Badge>
                  </div>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Customize Shortcuts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="icon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Application Icon
                </CardTitle>
                <CardDescription>
                  Customize the application icon and appearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {['Default', 'Dark', 'Minimal', 'Colorful'].map((theme) => (
                    <div key={theme} className="text-center space-y-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto"></div>
                      <p className="text-sm font-medium">{theme}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Upload Custom Icon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MoreHorizontal className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Advanced configuration options for power users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  title="Enable analytics"
                  description="Help improve the application by sharing anonymous usage data"
                  settingKey="analytics"
                />
                <Separator />
                <SettingItem
                  title="Sound effects"
                  description="Play sound effects for user interface interactions"
                  settingKey="soundEffects"
                />
                <Separator />
                <SettingItem
                  title="Automatic backup"
                  description="Automatically backup your data and settings"
                  settingKey="autoBackup"
                />
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea 
                    id="custom-css" 
                    placeholder="/* Add your custom CSS here */"
                    className="font-mono"
                  />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm">
                    Reset All Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    Import Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}