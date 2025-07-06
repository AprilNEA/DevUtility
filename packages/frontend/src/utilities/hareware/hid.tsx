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
import { RefreshCwIcon, UsbIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUtilityInvoke } from "@/utilities/invoke";
import { InvokeFunction } from "../types";

export default function HidDevicesPage() {
  const { t } = useLingui();
  const {
    data: devices,
    isMutating,
    trigger,
    error,
  } = useUtilityInvoke(InvokeFunction.ListHidDevices);

  const loadHidDevices = useCallback(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    loadHidDevices();
  }, [loadHidDevices]);

  const formatHex = (value: number) =>
    `0x${value.toString(16).toUpperCase().padStart(4, "0")}`;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsbIcon className="h-4 w-4" />
          <h1 className="text-base font-semibold">
            <Trans>HID Devices</Trans>
          </h1>
          <Badge variant="secondary" className="ml-2">
            {t(msg`${devices?.length || 0} devices`)}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHidDevices}
          disabled={isMutating}
        >
          <RefreshCwIcon
            className={`h-3 w-3 mr-1 ${isMutating ? "animate-spin" : ""}`}
          />
          <Trans>Refresh</Trans>
        </Button>
      </div>
      {error && (
        <div className="text-sm text-red-500 mt-2">
          <Trans>Error: {error.message}</Trans>
        </div>
      )}

      <Separator />
      {/* Device Table */}

      <ScrollArea className="h-[calc(100vh-100px)]">
        {devices?.length === 0 && !isMutating ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <UsbIcon className="h-8 w-8 mb-2" />
            <p>
              <Trans>No HID devices found</Trans>
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Trans>Device Info</Trans>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Trans>VID</Trans>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Trans>PID</Trans>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Trans>Serial Number</Trans>
                </TableHead>
                <TableHead className="w-[60px]">
                  <Trans>Interface</Trans>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Trans>Usage</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Device Path</Trans>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices?.map((device, index) => (
                <TableRow
                  key={`${device.vendorId}-${device.productId}-${device.path}-${index}`}
                >
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <UsbIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm leading-tight mb-1 truncate">
                          {device.productString || t(msg`Unknown Product`)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {device.manufacturerString ||
                            t(msg`Unknown Manufacturer`)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      {formatHex(device.vendorId)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      {formatHex(device.productId)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div
                      className="text-xs font-mono truncate max-w-[140px]"
                      title={device.serialNumber || t(msg`None`)}
                    >
                      {device.serialNumber || t(msg`None`)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{device.interfaceNumber}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono">
                      {formatHex(device.usagePage)}:{formatHex(device.usage)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div
                      className="text-xs font-mono text-muted-foreground truncate max-w-[200px]"
                      title={device.path}
                    >
                      {device.path}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}
