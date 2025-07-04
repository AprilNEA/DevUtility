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
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FingerprintIcon,
  Info,
  Key,
  Lock,
  QrCode,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldIcon,
  SmartphoneIcon,
  Unlock,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/copyboard";
import { useUtilityInvoke } from "@/utilities/invoke";
import { InvokeFunction } from "@/utilities/types";

enum Fido2Tab {
  Authenticator = "authenticator",
  Registration = "registration",
  Authentication = "authentication",
  Credentials = "credentials",
  Settings = "settings",
}

// FIDO2 Authenticator Simulator
function AuthenticatorSimulator() {
  const { t } = useLingui();
  const [isAuthenticatorActive, setIsAuthenticatorActive] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [authenticatorStatus, setAuthenticatorStatus] = useState<
    "idle" | "busy" | "error"
  >("idle");

  const handleToggleAuthenticator = async () => {
    setAuthenticatorStatus("busy");
    // TODO: Implement FIDO2 authenticator toggle
    // await invoke(InvokeFunction.ToggleFido2Authenticator, { enabled: !isAuthenticatorActive });

    setTimeout(() => {
      setIsAuthenticatorActive(!isAuthenticatorActive);
      setAuthenticatorStatus("idle");
    }, 1000);
  };

  const handleSetPin = async () => {
    if (!pin) return;
    setAuthenticatorStatus("busy");
    // TODO: Implement PIN setting
    // await invoke(InvokeFunction.SetFido2Pin, { pin });

    setTimeout(() => {
      setAuthenticatorStatus("idle");
      setPin("");
    }, 1000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Authenticator Status */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SmartphoneIcon className="w-5 h-5 text-blue-600" />
            {t(msg`Authenticator Status`)}
          </CardTitle>
          <CardDescription>
            {t(msg`Manage your FIDO2 authenticator device`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isAuthenticatorActive ? "bg-green-500" : "bg-gray-300"}`}
              />
              <span className="text-sm font-medium">
                {isAuthenticatorActive ? t(msg`Active`) : t(msg`Inactive`)}
              </span>
            </div>
            <Button
              onClick={handleToggleAuthenticator}
              disabled={authenticatorStatus === "busy"}
              variant={isAuthenticatorActive ? "destructive" : "default"}
              size="sm"
            >
              {authenticatorStatus === "busy" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isAuthenticatorActive ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isAuthenticatorActive ? t(msg`Deactivate`) : t(msg`Activate`)}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="pin">{t(msg`Set PIN`)}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder={t(msg`Enter PIN (4-8 digits)`)}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleSetPin}
                disabled={
                  !pin || pin.length < 4 || authenticatorStatus === "busy"
                }
                size="sm"
              >
                {t(msg`Set`)}
              </Button>
            </div>
          </div>

          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              {t(
                msg`PIN is required for resident keys and user verification. Minimum 4 digits, maximum 8 digits.`,
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-green-600" />
            {t(msg`Device Information`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t(msg`AAGUID`)}</span>
              <p className="font-mono text-xs mt-1">
                550e8400-e29b-41d4-a716-446655440000
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t(msg`Protocol Version`)}
              </span>
              <p className="font-mono text-xs mt-1">FIDO_2_0</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t(msg`User Verification`)}
              </span>
              <Badge variant="secondary">Supported</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t(msg`Resident Keys`)}
              </span>
              <Badge variant="secondary">Supported</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t(msg`Supported Algorithms`)}
            </Label>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">ES256</Badge>
              <Badge variant="outline">RS256</Badge>
              <Badge variant="outline">PS256</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// FIDO2 Registration
function Registration() {
  const { t } = useLingui();
  const [relyingPartyId, setRelyingPartyId] = useState("example.com");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [algorithm, setAlgorithm] = useState("ES256");
  const [residentKey, setResidentKey] = useState(false);
  const [userVerification, setUserVerification] = useState("preferred");
  const [attestation, setAttestation] = useState("none");

  const handleRegistration = async () => {
    // TODO: Implement FIDO2 registration
    // await invoke(InvokeFunction.Fido2Registration, {
    //   relyingPartyId,
    //   userId,
    //   userName,
    //   userDisplayName,
    //   algorithm,
    //   residentKey,
    //   userVerification,
    //   attestation,
    // });
    console.log("FIDO2 Registration:", {
      relyingPartyId,
      userId,
      userName,
      userDisplayName,
      algorithm,
      residentKey,
      userVerification,
      attestation,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Registration Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            {t(msg`Registration Parameters`)}
          </CardTitle>
          <CardDescription>
            {t(msg`Configure FIDO2 registration options`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="relyingPartyId">{t(msg`Relying Party ID`)}</Label>
            <Input
              id="relyingPartyId"
              placeholder="example.com"
              value={relyingPartyId}
              onChange={(e) => setRelyingPartyId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">{t(msg`User ID`)}</Label>
            <Input
              id="userId"
              placeholder="user@example.com"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">{t(msg`User Name`)}</Label>
            <Input
              id="userName"
              placeholder="john.doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userDisplayName">{t(msg`Display Name`)}</Label>
            <Input
              id="userDisplayName"
              placeholder="John Doe"
              value={userDisplayName}
              onChange={(e) => setUserDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="algorithm">{t(msg`Algorithm`)}</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ES256">ES256 (ECDSA with P-256)</SelectItem>
                <SelectItem value="RS256">RS256 (RSASSA-PKCS1-v1_5)</SelectItem>
                <SelectItem value="PS256">PS256 (RSASSA-PSS)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userVerification">
              {t(msg`User Verification`)}
            </Label>
            <Select
              value={userVerification}
              onValueChange={setUserVerification}
            >
              <SelectTrigger id="userVerification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="required">Required</SelectItem>
                <SelectItem value="preferred">Preferred</SelectItem>
                <SelectItem value="discouraged">Discouraged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attestation">{t(msg`Attestation`)}</Label>
            <Select value={attestation} onValueChange={setAttestation}>
              <SelectTrigger id="attestation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="indirect">Indirect</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="residentKey"
              checked={residentKey}
              onCheckedChange={setResidentKey}
            />
            <Label htmlFor="residentKey">{t(msg`Resident Key`)}</Label>
          </div>

          <Button onClick={handleRegistration} className="w-full">
            <ShieldIcon className="mr-2 h-4 w-4" />
            {t(msg`Start Registration`)}
          </Button>
        </CardContent>
      </Card>

      {/* Registration Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {t(msg`Registration Result`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t(msg`Credential ID`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`Credential ID will appear here after registration`,
                )}
                rows={3}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`Public Key`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`Public key will appear here after registration`,
                )}
                rows={6}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`Attestation Object`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`Attestation object will appear here after registration`,
                )}
                rows={8}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// FIDO2 Authentication
function Authentication() {
  const { t } = useLingui();
  const [relyingPartyId, setRelyingPartyId] = useState("example.com");
  const [credentialId, setCredentialId] = useState("");
  const [userVerification, setUserVerification] = useState("preferred");
  const [challenge, setChallenge] = useState("");

  const handleAuthentication = async () => {
    // TODO: Implement FIDO2 authentication
    // await invoke(InvokeFunction.Fido2Authentication, {
    //   relyingPartyId,
    //   credentialId,
    //   userVerification,
    //   challenge,
    // });
    console.log("FIDO2 Authentication:", {
      relyingPartyId,
      credentialId,
      userVerification,
      challenge,
    });
  };

  const generateChallenge = () => {
    const randomChallenge = Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setChallenge(randomChallenge);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Authentication Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FingerprintIcon className="w-5 h-5 text-orange-600" />
            {t(msg`Authentication Parameters`)}
          </CardTitle>
          <CardDescription>
            {t(msg`Configure FIDO2 authentication options`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authRelyingPartyId">
              {t(msg`Relying Party ID`)}
            </Label>
            <Input
              id="authRelyingPartyId"
              placeholder="example.com"
              value={relyingPartyId}
              onChange={(e) => setRelyingPartyId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentialId">{t(msg`Credential ID`)}</Label>
            <Textarea
              id="credentialId"
              placeholder={t(msg`Enter the credential ID from registration`)}
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authUserVerification">
              {t(msg`User Verification`)}
            </Label>
            <Select
              value={userVerification}
              onValueChange={setUserVerification}
            >
              <SelectTrigger id="authUserVerification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="required">Required</SelectItem>
                <SelectItem value="preferred">Preferred</SelectItem>
                <SelectItem value="discouraged">Discouraged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge">{t(msg`Challenge`)}</Label>
            <div className="flex gap-2">
              <Input
                id="challenge"
                placeholder={t(msg`Authentication challenge`)}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                className="font-mono text-xs"
              />
              <Button onClick={generateChallenge} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button onClick={handleAuthentication} className="w-full">
            <Unlock className="mr-2 h-4 w-4" />
            {t(msg`Start Authentication`)}
          </Button>
        </CardContent>
      </Card>

      {/* Authentication Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {t(msg`Authentication Result`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t(msg`Authenticator Data`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`Authenticator data will appear here after authentication`,
                )}
                rows={4}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`Signature`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`Signature will appear here after authentication`,
                )}
                rows={4}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t(msg`User Handle`)}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t(
                  msg`User handle will appear here after authentication`,
                )}
                rows={2}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" className="h-fit">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              {t(
                msg`Authentication successful! The signature can be verified using the public key from registration.`,
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Credentials Management
function CredentialsManagement() {
  const { t } = useLingui();
  const [credentials, setCredentials] = useState([
    {
      id: "credential-1",
      relyingPartyId: "example.com",
      userName: "john.doe",
      userDisplayName: "John Doe",
      createdAt: "2024-01-15T10:30:00Z",
      lastUsed: "2024-01-20T14:22:00Z",
      algorithm: "ES256",
    },
    {
      id: "credential-2",
      relyingPartyId: "github.com",
      userName: "johndoe",
      userDisplayName: "John Doe",
      createdAt: "2024-01-10T09:15:00Z",
      lastUsed: "2024-01-19T16:45:00Z",
      algorithm: "RS256",
    },
  ]);

  const handleDeleteCredential = async (credentialId: string) => {
    // TODO: Implement credential deletion
    // await invoke(InvokeFunction.DeleteFido2Credential, { credentialId });
    setCredentials((creds) => creds.filter((c) => c.id !== credentialId));
  };

  const handleExportCredentials = async () => {
    // TODO: Implement credentials export
    // await invoke(InvokeFunction.ExportFido2Credentials);
    console.log("Exporting credentials...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600" />
          {t(msg`Stored Credentials`)}
        </CardTitle>
        <CardDescription>
          {t(msg`Manage your FIDO2 credentials`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">
            {credentials.length} {t(msg`credentials`)}
          </Badge>
          <Button onClick={handleExportCredentials} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t(msg`Export All`)}
          </Button>
        </div>

        <div className="space-y-3">
          {credentials.map((credential) => (
            <Card key={credential.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {credential.relyingPartyId}
                    </span>
                    <Badge variant="outline">{credential.algorithm}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {t(msg`User`)}: {credential.userDisplayName} (
                      {credential.userName})
                    </p>
                    <p>
                      {t(msg`Created`)}:{" "}
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      {t(msg`Last Used`)}:{" "}
                      {new Date(credential.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteCredential(credential.id)}
                  variant="destructive"
                  size="sm"
                >
                  {t(msg`Delete`)}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {credentials.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t(msg`No credentials stored`)}</p>
            <p className="text-sm">
              {t(msg`Register with a service to see credentials here`)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Settings
function Settings() {
  const { t } = useLingui();
  const [enableDebugMode, setEnableDebugMode] = useState(false);
  const [enableResidentKeys, setEnableResidentKeys] = useState(true);
  const [enableUserVerification, setEnableUserVerification] = useState(true);
  const [maxCredentials, setMaxCredentials] = useState("25");

  const handleSaveSettings = async () => {
    // TODO: Implement settings save
    // await invoke(InvokeFunction.SaveFido2Settings, {
    //   enableDebugMode,
    //   enableResidentKeys,
    //   enableUserVerification,
    //   maxCredentials: parseInt(maxCredentials),
    // });
    console.log("Saving FIDO2 settings...");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
            {t(msg`Authenticator Settings`)}
          </CardTitle>
          <CardDescription>
            {t(msg`Configure FIDO2 authenticator behavior`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t(msg`Debug Mode`)}</Label>
              <p className="text-sm text-muted-foreground">
                {t(msg`Enable detailed logging for development`)}
              </p>
            </div>
            <Switch
              checked={enableDebugMode}
              onCheckedChange={setEnableDebugMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t(msg`Resident Keys`)}</Label>
              <p className="text-sm text-muted-foreground">
                {t(msg`Allow storing credentials on device`)}
              </p>
            </div>
            <Switch
              checked={enableResidentKeys}
              onCheckedChange={setEnableResidentKeys}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t(msg`User Verification`)}</Label>
              <p className="text-sm text-muted-foreground">
                {t(msg`Require PIN/biometric for operations`)}
              </p>
            </div>
            <Switch
              checked={enableUserVerification}
              onCheckedChange={setEnableUserVerification}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCredentials">
              {t(msg`Maximum Credentials`)}
            </Label>
            <Select value={maxCredentials} onValueChange={setMaxCredentials}>
              <SelectTrigger id="maxCredentials">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t(msg`Save Settings`)}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            {t(msg`About FIDO2`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <ShieldIcon className="w-4 h-4" />
            <AlertDescription>
              {t(
                msg`FIDO2 is a standard for passwordless authentication using public-key cryptography.`,
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">{t(msg`Key Features`)}</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>{t(msg`Passwordless authentication`)}</li>
                <li>{t(msg`Phishing-resistant`)}</li>
                <li>{t(msg`Multi-factor authentication`)}</li>
                <li>{t(msg`Cross-platform compatibility`)}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">{t(msg`Supported Algorithms`)}</h4>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline">ES256</Badge>
                <Badge variant="outline">RS256</Badge>
                <Badge variant="outline">PS256</Badge>
                <Badge variant="outline">EdDSA</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Fido2Page() {
  const { t } = useLingui();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t(msg`FIDO2 Authenticator`)}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t(
            msg`Test and manage FIDO2 WebAuthn operations with a beautiful, Apple-inspired interface.`,
          )}
        </p>
      </div>

      <Tabs defaultValue={Fido2Tab.Authenticator} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value={Fido2Tab.Authenticator}>
            <SmartphoneIcon className="mr-2 h-4 w-4" />
            {t(msg`Authenticator`)}
          </TabsTrigger>
          <TabsTrigger value={Fido2Tab.Registration}>
            <Key className="mr-2 h-4 w-4" />
            {t(msg`Registration`)}
          </TabsTrigger>
          <TabsTrigger value={Fido2Tab.Authentication}>
            <FingerprintIcon className="mr-2 h-4 w-4" />
            {t(msg`Authentication`)}
          </TabsTrigger>
          <TabsTrigger value={Fido2Tab.Credentials}>
            <ShieldIcon className="mr-2 h-4 w-4" />
            {t(msg`Credentials`)}
          </TabsTrigger>
          <TabsTrigger value={Fido2Tab.Settings}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t(msg`Settings`)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={Fido2Tab.Authenticator}>
          <AuthenticatorSimulator />
        </TabsContent>

        <TabsContent value={Fido2Tab.Registration}>
          <Registration />
        </TabsContent>

        <TabsContent value={Fido2Tab.Authentication}>
          <Authentication />
        </TabsContent>

        <TabsContent value={Fido2Tab.Credentials}>
          <CredentialsManagement />
        </TabsContent>

        <TabsContent value={Fido2Tab.Settings}>
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
