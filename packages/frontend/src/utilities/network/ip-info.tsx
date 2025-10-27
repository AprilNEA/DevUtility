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
import {
  Building,
  ClipboardIcon,
  Copy,
  FileText,
  Globe,
  MapPin,
  Network,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/copyboard";

// Mock data for demonstration
const mockIpInfo = {
  ip: "8.8.8.8",
  type: "IPv4",
  hostname: "dns.google",
  asn: {
    number: "AS15169",
    name: "Google LLC",
    type: "Content Provider",
    range: "8.8.8.0/24",
  },
  geo: {
    country: "United States",
    countryCode: "US",
    region: "California",
    city: "Mountain View",
    timezone: "America/Los_Angeles",
    latitude: 37.4056,
    longitude: -122.0775,
  },
  company: {
    name: "Google LLC",
    domain: "google.com",
    type: "hosting",
  },
  security: {
    isProxy: false,
    isVpn: false,
    isTor: false,
    isRelay: false,
    isHosting: true,
    threatLevel: "low",
  },
  abuse: {
    address: "1600 Amphitheatre Parkway, Mountain View, CA 94043, US",
    email: "network-abuse@google.com",
    phone: "+1-650-253-0000",
  },
  anycast: true,
  privacy: {
    vpn: false,
    proxy: false,
    tor: false,
    relay: false,
  },
};

const sampleIps = [
  "8.8.8.8",
  "1.1.1.1",
  "208.67.222.222",
  "185.228.168.9",
  "76.76.19.19",
  "94.140.14.14",
];

export default function IpInfoPage() {
  return (
    <div className="grid md:grid-cols-2 gap-4 h-full">
      <IpInfoAnalyzer />
      <IpInfoDetails />
    </div>
  );
}

interface FieldWithCopyProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const FieldWithCopy: React.FC<FieldWithCopyProps> = ({
  label,
  value,
  icon,
}) => {
  const { t } = useLingui();
  const valueStr = String(value || "N/A");

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={valueStr}
          readOnly
          className="bg-input border-border text-foreground h-9"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => copyToClipboard(valueStr)}
            >
              <Copy size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t(msg`Copy`)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const BadgeField: React.FC<{
  label: string;
  value: boolean | string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}> = ({ label, value, variant = "default" }) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  const badgeVariant =
    typeof value === "boolean"
      ? value
        ? "destructive"
        : "secondary"
      : variant;

  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Badge variant={badgeVariant}>{displayValue}</Badge>
    </div>
  );
};

// Left Panel: Input & Basic Info
const IpInfoAnalyzer = () => {
  const { t } = useLingui();
  const [input, setInputValue] = useState("8.8.8.8");
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [input]);

  const loadSample = useCallback(() => {
    const randomIp = sampleIps[Math.floor(Math.random() * sampleIps.length)];
    setInputValue(randomIp);
  }, []);

  return (
    <div className="flex flex-col gap-4 bg-card p-3 rounded-lg h-full overflow-hidden">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-medium text-card-foreground mr-2">
          <Trans>IP Address:</Trans>
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={async () => {
                const text = await navigator.clipboard.readText();
                if (text) setInputValue(text.trim());
              }}
            >
              <ClipboardIcon size={14} className="mr-1.5" /> {t(msg`Clipboard`)}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t(msg`Paste from Clipboard`)}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={loadSample}
            >
              <FileText size={14} className="mr-1.5" /> {t(msg`Sample`)}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t(msg`Load Sample IP`)}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => setInputValue("")}
            >
              <Trash2 size={14} className="mr-1.5" /> {t(msg`Clear`)}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t(msg`Clear Input`)}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 ml-auto"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t(msg`Settings`)}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t(msg`API Settings...`)}</DropdownMenuItem>
            <DropdownMenuItem>{t(msg`Display Options...`)}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t(msg`Enter IP address (e.g., 8.8.8.8)`)}
          className="bg-background border-input text-foreground"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLookup();
            }
          }}
        />
        <Button onClick={handleLookup} disabled={isLoading || !input.trim()}>
          <RefreshCw
            size={16}
            className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t(msg`Lookup`)}
        </Button>
      </div>

      <div className="space-y-3 mt-2 flex-grow overflow-y-auto min-h-0">
        <FieldWithCopy
          label={t(msg`IP Address`)}
          value={mockIpInfo.ip}
          icon={<Globe size={12} />}
        />
        <FieldWithCopy label={t(msg`Type`)} value={mockIpInfo.type} />
        <FieldWithCopy
          label={t(msg`Hostname`)}
          value={mockIpInfo.hostname}
          icon={<Server size={12} />}
        />

        <Separator className="my-3" />

        <div>
          <Label className="text-sm font-medium text-card-foreground mb-2 block">
            <Trans>Network Information</Trans>
          </Label>
          <div className="space-y-2">
            <FieldWithCopy
              label={t(msg`ASN`)}
              value={mockIpInfo.asn.number}
              icon={<Network size={12} />}
            />
            <FieldWithCopy
              label={t(msg`ASN Name`)}
              value={mockIpInfo.asn.name}
            />
            <FieldWithCopy
              label={t(msg`IP Range`)}
              value={mockIpInfo.asn.range}
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t(msg`ASN Type`)}
              </Label>
              <Badge variant="outline">{mockIpInfo.asn.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t(msg`Anycast`)}
              </Label>
              <Badge variant={mockIpInfo.anycast ? "default" : "secondary"}>
                {mockIpInfo.anycast ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Right Panel: Detailed Information
const IpInfoDetails = () => {
  const { t } = useLingui();

  const formatInfo = useCallback(() => {
    const sections = [
      `IP Information:`,
      `IP: ${mockIpInfo.ip}`,
      `Type: ${mockIpInfo.type}`,
      `Hostname: ${mockIpInfo.hostname}`,
      ``,
      `Network (ASN):`,
      `ASN: ${mockIpInfo.asn.number}`,
      `Organization: ${mockIpInfo.asn.name}`,
      `Type: ${mockIpInfo.asn.type}`,
      `Range: ${mockIpInfo.asn.range}`,
      `Anycast: ${mockIpInfo.anycast ? "Yes" : "No"}`,
      ``,
      `Geographic Location:`,
      `Country: ${mockIpInfo.geo.country} (${mockIpInfo.geo.countryCode})`,
      `Region: ${mockIpInfo.geo.region}`,
      `City: ${mockIpInfo.geo.city}`,
      `Timezone: ${mockIpInfo.geo.timezone}`,
      `Coordinates: ${mockIpInfo.geo.latitude}, ${mockIpInfo.geo.longitude}`,
      ``,
      `Company Information:`,
      `Name: ${mockIpInfo.company.name}`,
      `Domain: ${mockIpInfo.company.domain}`,
      `Type: ${mockIpInfo.company.type}`,
      ``,
      `Security Analysis:`,
      `Proxy: ${mockIpInfo.security.isProxy ? "Yes" : "No"}`,
      `VPN: ${mockIpInfo.security.isVpn ? "Yes" : "No"}`,
      `Tor: ${mockIpInfo.security.isTor ? "Yes" : "No"}`,
      `Relay: ${mockIpInfo.security.isRelay ? "Yes" : "No"}`,
      `Hosting: ${mockIpInfo.security.isHosting ? "Yes" : "No"}`,
      `Threat Level: ${mockIpInfo.security.threatLevel}`,
      ``,
      `Abuse Contact:`,
      `Address: ${mockIpInfo.abuse.address}`,
      `Email: ${mockIpInfo.abuse.email}`,
      `Phone: ${mockIpInfo.abuse.phone}`,
    ];
    return sections.join("\n");
  }, []);

  return (
    <div className="flex flex-col gap-3 bg-card p-3 rounded-lg h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-card-foreground">
          <Trans>Detailed Information</Trans>
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(formatInfo())}
          >
            <Copy size={16} className="mr-2" />
            {t(msg`Copy All`)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-grow overflow-y-auto min-h-0">
        {/* Geographic Information */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-card-foreground flex items-center gap-1">
            <MapPin size={14} />
            <Trans>Geographic Location</Trans>
          </Label>
          <div className="space-y-2 pl-4">
            <FieldWithCopy
              label={t(msg`Country`)}
              value={`${mockIpInfo.geo.country} (${mockIpInfo.geo.countryCode})`}
            />
            <FieldWithCopy
              label={t(msg`Region`)}
              value={mockIpInfo.geo.region}
            />
            <FieldWithCopy label={t(msg`City`)} value={mockIpInfo.geo.city} />
            <FieldWithCopy
              label={t(msg`Timezone`)}
              value={mockIpInfo.geo.timezone}
            />
            <FieldWithCopy
              label={t(msg`Coordinates`)}
              value={`${mockIpInfo.geo.latitude}, ${mockIpInfo.geo.longitude}`}
            />
          </div>
        </div>

        <Separator />

        {/* Company Information */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-card-foreground flex items-center gap-1">
            <Building size={14} />
            <Trans>Company Information</Trans>
          </Label>
          <div className="space-y-2 pl-4">
            <FieldWithCopy
              label={t(msg`Name`)}
              value={mockIpInfo.company.name}
            />
            <FieldWithCopy
              label={t(msg`Domain`)}
              value={mockIpInfo.company.domain}
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t(msg`Type`)}
              </Label>
              <Badge variant="outline">{mockIpInfo.company.type}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Analysis */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-card-foreground flex items-center gap-1">
            <Shield size={14} />
            <Trans>Security Analysis</Trans>
          </Label>
          <div className="space-y-2 pl-4">
            <BadgeField
              label={t(msg`Proxy`)}
              value={mockIpInfo.security.isProxy}
            />
            <BadgeField label={t(msg`VPN`)} value={mockIpInfo.security.isVpn} />
            <BadgeField label={t(msg`Tor`)} value={mockIpInfo.security.isTor} />
            <BadgeField
              label={t(msg`Relay`)}
              value={mockIpInfo.security.isRelay}
            />
            <BadgeField
              label={t(msg`Hosting`)}
              value={mockIpInfo.security.isHosting}
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t(msg`Threat Level`)}
              </Label>
              <Badge
                variant={
                  mockIpInfo.security.threatLevel === "low"
                    ? "secondary"
                    : "destructive"
                }
              >
                {mockIpInfo.security.threatLevel}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Abuse Contact */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-card-foreground">
            <Trans>Abuse Contact</Trans>
          </Label>
          <div className="space-y-2 pl-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t(msg`Address`)}
              </Label>
              <Textarea
                value={mockIpInfo.abuse.address}
                readOnly
                className="h-16 bg-input border-border text-foreground text-sm resize-none"
              />
            </div>
            <FieldWithCopy
              label={t(msg`Email`)}
              value={mockIpInfo.abuse.email}
            />
            <FieldWithCopy
              label={t(msg`Phone`)}
              value={mockIpInfo.abuse.phone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
