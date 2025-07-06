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
  CheckCircleIcon,
  ClockIcon,
  Copy,
  HelpCircleIcon,
  KeyIcon,
  QrCodeIcon,
  ShieldIcon,
  XCircleIcon,
} from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useState } from "react";
import LabelWithTooltip from "@/components/derived-ui/label-with-tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from "@/lib/copyboard";
import { useUtilityInvoke } from "@/utilities/invoke";
import { InvokeFunction } from "@/utilities/types";
import { TotpHashAlgorithm } from "./types";

enum TotpDebuggerTab {
  Create = "create",
  Generate = "generate",
  Validate = "validate",
}

const useTotp = () => {
  const [activeTab, setActiveTab] = useQueryState(
    TotpDebuggerTab.Create,
    parseAsStringEnum<TotpDebuggerTab>(
      Object.values(TotpDebuggerTab),
    ).withDefault(TotpDebuggerTab.Generate),
  );

  const [secret, setSecret] = useQueryState("secret");
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsInteger.withDefault(30),
  );
  const [algorithm, setAlgorithm] = useQueryState(
    "algorithm",
    parseAsStringEnum<TotpHashAlgorithm>(
      Object.values(TotpHashAlgorithm),
    ).withDefault(TotpHashAlgorithm.SHA1),
  );
  const [digits, setDigits] = useQueryState(
    "digits",
    parseAsInteger.withDefault(6),
  );
  return {
    activeTab,
    setActiveTab,
    secret,
    period,
    algorithm,
    digits,
    setSecret,
    setPeriod,
    setAlgorithm,
    setDigits,
  };
};

const CreateSecret = () => {
  const { t } = useLingui();
  const {
    setSecret,
    period,
    setPeriod,
    algorithm,
    setAlgorithm,
    digits,
    setDigits,
  } = useTotp();

  const {
    data: totpSecret,
    trigger: generateSecret,
    isMutating: generatingSecret,
  } = useUtilityInvoke(InvokeFunction.GenerateTotpSecret, {
    onSuccess: (data) => {
      setSecret(data.secret);
    },
  });

  const [label, setLabel] = useState("");
  const [issuer, setIssuer] = useState("");
  const [image, setImage] = useState("");
  const [addIssuerPrefix, setAddIssuerPrefix] = useState(true);

  const handleCreateSecret = async () => {
    await generateSecret({
      issuer,
      account: label,
      algorithm,
      digits,
      period,
      image: image || undefined,
      addIssuerPrefix,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Configuration */}
      <Card className="h-fit w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-blue-600" />
            {t(msg`Create TOTP Secret`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-6 gap-4">
          <div className="space-y-1 col-span-3">
            <LabelWithTooltip
              htmlFor="label"
              tooltip={t(
                msg`For e.g the users email address. You must set label before to generate ProvisioningURI/QR code`,
              )}
            >
              {t(msg`Set a label`)}
            </LabelWithTooltip>
            <Input
              id="label"
              placeholder={t(msg`Label, e.g email address of user ...`)}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1 col-span-3">
            <LabelWithTooltip
              htmlFor="issuer"
              tooltip={t(
                msg`By default and to be compatible with Google Authenticator, the issuer is set in the query parameters and as the label prefix.`,
              )}
            >
              {t(msg`Set an issuer`)}
            </LabelWithTooltip>
            <Input
              id="issuer"
              placeholder={t(msg`Issuer, e.g your service name ...`)}
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-6">
            <LabelWithTooltip
              htmlFor="image"
              tooltip={t(
                msg`Some applications such as FreeOTP can load images from an URI (image parameter). It need to be a valid URL to an image.`,
              )}
            >
              {t(msg`Image`)}
            </LabelWithTooltip>
            <Input
              id="image"
              placeholder={t(msg`Image URL, e.g 'https://foo.bar/otp.png ...`)}
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 col-span-6">
            <Checkbox
              id="add-issuer-prefix"
              checked={addIssuerPrefix}
              onCheckedChange={(checked) => setAddIssuerPrefix(!!checked)}
            />
            <Label htmlFor="add-issuer-prefix" className="text-sm">
              {t(msg`Additionally add issuer as query parameter?`)}
            </Label>
          </div>

          <Separator className="col-span-6" />

          <div className="bg-muted/50 rounded-lg p-4 col-span-6">
            <p className="text-sm font-medium mb-2">
              <Trans>
                💡 The most common parameters used by services is a{" "}
                <strong>period of 30 seconds</strong>,{" "}
                <strong>sha1 algorithm</strong> and <strong>6 Digits</strong>{" "}
                for your OTP code. If you are not sure what parameters are used
                by your service, always use this as default.
              </Trans>
            </p>
          </div>

          <div className="space-y-2 col-span-2">
            <LabelWithTooltip
              htmlFor="algorithm"
              tooltip={t(
                msg`You must verify that the algorithm you want to use is supported by the application your clients might be using.`,
              )}
            >
              {t(msg`Algorithm`)}
            </LabelWithTooltip>
            <Select
              value={algorithm}
              onValueChange={(value) =>
                setAlgorithm(value as TotpHashAlgorithm)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TotpHashAlgorithm.SHA1}>sha1</SelectItem>
                <SelectItem value={TotpHashAlgorithm.SHA256}>sha256</SelectItem>
                <SelectItem value={TotpHashAlgorithm.SHA512}>sha512</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <LabelWithTooltip
              htmlFor="period"
              tooltip={t(
                msg`Set the period how long the OTP is valid, recommend is 30 seconds`,
              )}
            >
              {t(msg`Period`)}
            </LabelWithTooltip>
            <Input
              id="period"
              type="number"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              min={1}
              max={300}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <LabelWithTooltip
              htmlFor="digits"
              tooltip={t(msg`How much digits should the OTP have`)}
            >
              {t(msg`Digits`)}
            </LabelWithTooltip>
            <Input
              id="digits"
              type="number"
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
              min={4}
              max={8}
            />
          </div>

          <Button
            onClick={handleCreateSecret}
            className="w-full col-span-6"
            disabled={!label || !issuer || generatingSecret}
          >
            {generatingSecret
              ? t(msg`Creating...`)
              : t(msg`CREATE TOTP SECRET`)}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5 text-green-600" />
            {t(msg`Generated Secret`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t(msg`Secret (Base32)`)}</Label>
            <div className="flex gap-2">
              <Input
                value={totpSecret?.secret}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(totpSecret?.secret ?? "")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`Provisioning URI`)}</Label>
            <div className="flex gap-2">
              <Input
                value={totpSecret?.provisioningUri}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  copyToClipboard(totpSecret?.provisioningUri ?? "")
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`QR Code`)}</Label>
            <div className="flex justify-center">
              <img
                src={totpSecret?.qrCodeUrl}
                alt={t(msg`TOTP QR Code`)}
                className="w-48 h-48 border rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t(msg`Scan this QR code with your authenticator app`)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GenerateCode = () => {
  const { t } = useLingui();
  const {
    setActiveTab,
    secret,
    setSecret,
    period,
    setPeriod,
    algorithm,
    setAlgorithm,
    digits,
    setDigits,
  } = useTotp();
  const { data, trigger, isMutating } = useUtilityInvoke(
    InvokeFunction.GenerateTotpCode,
  );

  const handleGenerateCode = async () => {
    if (!secret) return;
    await trigger({
      secret,
      period,
      algorithm,
      digits,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Input */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-purple-600" />
            {t(msg`Generate TOTP Code`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="secret-generate"
              tooltip={t(
                msg`Enter the base32-encoded secret that was generated in step 1`,
              )}
            >
              {t(msg`Enter a generated TOTP (Time based) secret`)}
            </LabelWithTooltip>
            <Input
              id="secret-generate"
              placeholder={t(msg`Based on a TOTP Secret ...`)}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`What period used for the secret`)}
              >
                {t(msg`Period in seconds`)}
              </LabelWithTooltip>
              <Input
                type="number"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                min={1}
                max={300}
              />
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`What algorithm was used for the secret`)}
              >
                {t(msg`Algorithm`)}
              </LabelWithTooltip>
              <Select
                value={algorithm}
                onValueChange={(value) =>
                  setAlgorithm(value as TotpHashAlgorithm)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TotpHashAlgorithm.SHA1}>sha1</SelectItem>
                  <SelectItem value={TotpHashAlgorithm.SHA256}>
                    sha256
                  </SelectItem>
                  <SelectItem value={TotpHashAlgorithm.SHA512}>
                    sha512
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`How much digits set for your created secret`)}
              >
                {t(msg`Digits`)}
              </LabelWithTooltip>
              <Input
                type="number"
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
                min={4}
                max={8}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateCode}
            className="w-full"
            disabled={!secret || isMutating}
          >
            {isMutating ? t(msg`Generating...`) : t(msg`GENERATE TOTP CODE`)}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-purple-600" />
            {t(msg`Current TOTP Code`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border">
              <div className="text-4xl font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                {data?.code}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ClockIcon className="w-4 h-4" />
                {/* {formatTimeRemaining(totpResult.timeRemaining)} remaining */}
              </div>
            </div>

            <Button
              onClick={() => copyToClipboard(data?.code ?? "")}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {t(msg`Copy Code`)}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t(msg`Algorithm:`)}:
              </span>
              <Badge variant="outline">{data?.algorithm}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(msg`Digits:`)}:</span>
              <span>{data?.digits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(msg`Period:`)}:</span>
              <span>{data?.period}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t(msg`Time Window:`)}:
              </span>
              <span>{data?.timeUsed}</span>
            </div>
          </div>

          <Button
            onClick={() => setActiveTab(TotpDebuggerTab.Validate)}
            className="w-full"
            variant="outline"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            {t(msg`Continue to Validate Code`)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const ValidateCode = () => {
  const { t } = useLingui();
  const { data, trigger, isMutating } = useUtilityInvoke(
    InvokeFunction.ValidateTotpCode,
  );

  const [codeToValidate, setCodeToValidate] = useState("");
  const [validationWindow, setValidationWindow] = useState(1);

  // Results
  const {
    secret,
    setSecret,
    period,
    setPeriod,
    algorithm,
    setAlgorithm,
    digits,
    setDigits,
  } = useTotp();

  const handleValidateCode = async () => {
    if (!secret || !codeToValidate) return;
    await trigger({
      secret,
      code: codeToValidate,
      period,
      algorithm,
      digits,
      window: validationWindow,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Input */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-green-600" />
            {t(msg`Check TOTP Code`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="secret-validate"
              tooltip={t(
                msg`Normally the secret is securely saved on server-side DB, however on test you have to enter manually`,
              )}
            >
              {t(msg`Secret`)}
            </LabelWithTooltip>
            <Input
              id="secret-validate"
              placeholder={t(msg`Secret ...`)}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="code-validate"
              tooltip={t(msg`Based on your secret`)}
            >
              {t(msg`Generated TOTP Code to auth`)}
            </LabelWithTooltip>
            <Input
              id="code-validate"
              placeholder={t(msg`Code ...`)}
              value={codeToValidate}
              onChange={(e) => setCodeToValidate(e.target.value)}
              className="font-mono text-center text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`What period used for the secret`)}
              >
                {t(msg`Period in seconds`)}
              </LabelWithTooltip>
              <Input
                type="number"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                min={1}
                max={300}
              />
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`What algorithm used for the secret`)}
              >
                {t(msg`Algorithm`)}
              </LabelWithTooltip>
              <Select
                value={algorithm}
                onValueChange={(value) =>
                  setAlgorithm(value as TotpHashAlgorithm)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TotpHashAlgorithm.SHA1}>sha1</SelectItem>
                  <SelectItem value={TotpHashAlgorithm.SHA256}>
                    sha256
                  </SelectItem>
                  <SelectItem value={TotpHashAlgorithm.SHA512}>
                    sha512
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                tooltip={t(msg`How much digits set for your created secret`)}
              >
                {t(msg`Digits`)}
              </LabelWithTooltip>
              <Input
                type="number"
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
                min={4}
                max={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              tooltip={t(
                msg`Number of time windows to check before and after current time (0 = only current window)`,
              )}
            >
              {t(msg`Validation Window`)}
            </LabelWithTooltip>
            <Input
              type="number"
              value={validationWindow}
              onChange={(e) => setValidationWindow(Number(e.target.value))}
              min={0}
              max={10}
            />
          </div>

          <Button
            onClick={handleValidateCode}
            className="w-full"
            disabled={!secret || !codeToValidate || isMutating}
          >
            {isMutating ? t(msg`Checking...`) : t(msg`CHECK TOTP CODE`)}
          </Button>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data?.isValid === undefined ? (
              <HelpCircleIcon className="w-5 h-5 text-gray-500" />
            ) : data?.isValid ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            {t(msg`Validation Result`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div
              className={`rounded-xl p-6 border ${
                data?.isValid === undefined
                  ? "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800"
                  : data?.isValid
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
                    : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              {data?.isValid === undefined ? (
                <div className="space-y-2">
                  <HelpCircleIcon className="w-12 h-12 text-gray-500 mx-auto" />
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-400">
                    {t(msg`Status Unknown`)} ❓
                  </div>
                </div>
              ) : data?.isValid ? (
                <div className="space-y-2">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto" />
                  <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {t(msg`Code is Valid!`)} ✅
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircleIcon className="w-12 h-12 text-red-600 mx-auto" />
                  <div className="text-lg font-semibold text-red-700 dark:text-red-400">
                    {t(msg`Code is Invalid!`)} ❌
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(msg`Status:`)}:</span>
              <Badge
                variant={
                  data?.isValid === undefined
                    ? "secondary"
                    : data?.isValid
                      ? "default"
                      : "destructive"
                }
              >
                {data?.isValid === undefined
                  ? t(msg`Unknown`)
                  : data?.isValid
                    ? t(msg`Valid`)
                    : t(msg`Invalid`)}
              </Badge>
            </div>
            {data?.timeOffset !== undefined && data?.timeOffset !== 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t(msg`Time Offset:`)}:
                </span>
                <span
                  className={
                    data.timeOffset > 0 ? "text-blue-600" : "text-orange-600"
                  }
                >
                  {data.timeOffset > 0 ? "+" : ""}
                  {data.timeOffset} {t(msg`windows`)}
                </span>
              </div>
            )}
            {data?.currentTimeWindow !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t(msg`Current Window:`)}:
                </span>
                <span>{data.currentTimeWindow}</span>
              </div>
            )}
            {data?.usedTimeWindow !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t(msg`Used Window:`)}:
                </span>
                <span>{data.usedTimeWindow}</span>
              </div>
            )}
          </div>

          {data?.message && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>{t(msg`Message:`)}:</strong> {data.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function TotpDebugger() {
  const { t } = useLingui();
  const { activeTab, setActiveTab } = useTotp();

  return (
    <div className="h-full overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TotpDebuggerTab)}
        className="h-full flex flex-col"
      >
        {/* Tab Navigation */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">
              {t(msg`TOTP Debugger`)}
            </h1>
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-background"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                    1
                  </div>
                  {t(msg`Create Secret`)}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="data-[state=active]:bg-background"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                    2
                  </div>
                  {t(msg`Generate Code`)}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="validate"
                className="data-[state=active]:bg-background"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400">
                    3
                  </div>
                  {t(msg`Check Code`)}
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Step 1: Create TOTP Secret */}
          <TabsContent value="create" className="space-y-6 mt-0">
            <CreateSecret />
          </TabsContent>

          {/* Step 2: Generate TOTP Code */}
          <TabsContent value="generate" className="space-y-6 mt-0">
            <GenerateCode />
          </TabsContent>

          {/* Step 3: Check TOTP Code */}
          <TabsContent value="validate" className="space-y-6 mt-0">
            <ValidateCode />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
