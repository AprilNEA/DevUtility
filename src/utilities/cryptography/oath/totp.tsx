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

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Copy,
	Clock,
	Shield,
	Key,
	CheckCircle,
	XCircle,
	QrCode,
	Smartphone,
} from "lucide-react";
import { useUtilityInvoke } from "@/utilities/invoke";
import {
	InvokeFunction,
	TotpHashAlgorithm,
	type TotpSecret,
	type TotpResult,
	type TotpValidationResult,
} from "@/utilities/types";

export default function TotpDebugger() {
	// Tab management
	const [activeTab, setActiveTab] = useState("create");

	// Step 1: Create TOTP Secret
	const [label, setLabel] = useState("");
	const [issuer, setIssuer] = useState("");
	const [image, setImage] = useState("");
	const [addIssuerPrefix, setAddIssuerPrefix] = useState(true);
	const [period, setPeriod] = useState(30);
	const [algorithm, setAlgorithm] = useState<TotpHashAlgorithm>(
		TotpHashAlgorithm.SHA1,
	);
	const [digits, setDigits] = useState(6);

	// Step 2 & 3: Generate and Validate
	const [secret, setSecret] = useState("");
	const [generatedCode, setGeneratedCode] = useState("");
	const [codeToValidate, setCodeToValidate] = useState("");
	const [validationWindow, setValidationWindow] = useState(1);

	// Results
	const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
	const [totpResult, setTotpResult] = useState<TotpResult | null>(null);
	const [validationResult, setValidationResult] =
		useState<TotpValidationResult | null>(null);

	// Hooks for backend calls
	const { trigger: generateSecret, isMutating: generatingSecret } =
		useUtilityInvoke(InvokeFunction.GenerateTotpSecret);
	const { trigger: generateCode, isMutating: generatingCode } =
		useUtilityInvoke(InvokeFunction.GenerateTotpCode);
	const { trigger: validateCode, isMutating: validatingCode } =
		useUtilityInvoke(InvokeFunction.ValidateTotpCode);

	// Real-time code generation
	useEffect(() => {
		if (secret && activeTab === "generate") {
			const interval = setInterval(async () => {
				try {
					const result = await generateCode({
						secret,
						algorithm,
						digits,
						period,
					});
					setTotpResult(result);
				} catch (error) {
					console.error("Failed to generate code:", error);
				}
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [secret, algorithm, digits, period, activeTab, generateCode]);

	// Handlers
	const handleCreateSecret = async () => {
		try {
			const result = await generateSecret({
				issuer,
				account: label,
				algorithm,
				digits,
				period,
				label: undefined,
				image: image || undefined,
				addIssuerPrefix,
			});
			setTotpSecret(result);
			setSecret(result.secret);
		} catch (error) {
			console.error("Failed to create secret:", error);
		}
	};

	const handleGenerateCode = async () => {
		try {
			const result = await generateCode({
				secret,
				algorithm,
				digits,
				period,
			});
			setTotpResult(result);
			setGeneratedCode(result.code);
		} catch (error) {
			console.error("Failed to generate code:", error);
		}
	};

	const handleValidateCode = async () => {
		try {
			const result = await validateCode({
				secret,
				code: codeToValidate,
				algorithm,
				digits,
				period,
				window: validationWindow,
			});
			setValidationResult(result);
		} catch (error) {
			console.error("Failed to validate code:", error);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const formatTimeRemaining = (seconds: number) => {
		return `${seconds}s`;
	};

	return (
		<div className="h-full overflow-hidden">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="h-full flex flex-col"
			>
				{/* Tab Navigation */}
				<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="px-6 py-4">
						<h1 className="text-2xl font-semibold tracking-tight mb-4">
							TOTP Debugger
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
									Create Secret
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
									Generate Code
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
									Check Code
								</div>
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

				{/* Tab Content */}
				<div className="flex-1 p-6 overflow-auto">
					{/* Step 1: Create TOTP Secret */}
					<TabsContent value="create" className="space-y-6 mt-0">
						<div className="grid lg:grid-cols-2 gap-6 h-full">
							{/* Configuration */}
							<Card className="h-fit">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Key className="w-5 h-5 text-blue-600" />
										Create TOTP Secret
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="label">Set a label</Label>
										<Input
											id="label"
											placeholder="Label, e.g email address of user ..."
											value={label}
											onChange={(e) => setLabel(e.target.value)}
										/>
										<p className="text-xs text-muted-foreground">
											For e.g the users email address. You must set label before
											to generate ProvisioningURI/QR code
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="issuer">Set an issuer</Label>
										<Input
											id="issuer"
											placeholder="Issuer, e.g your service name ..."
											value={issuer}
											onChange={(e) => setIssuer(e.target.value)}
										/>
										<p className="text-xs text-muted-foreground">
											By default and to be compatible with Google Authenticator,
											the issuer is set in the query parameters and as the label
											prefix.
										</p>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="add-issuer-prefix"
											checked={addIssuerPrefix}
											onCheckedChange={(checked) =>
												setAddIssuerPrefix(!!checked)
											}
										/>
										<Label htmlFor="add-issuer-prefix" className="text-sm">
											Additionally add issuer as query parameter?
										</Label>
									</div>

									<div className="space-y-2">
										<Label htmlFor="image">Image</Label>
										<Input
											id="image"
											placeholder="Image URL, e.g 'https://foo.bar/otp.png ..."
											value={image}
											onChange={(e) => setImage(e.target.value)}
										/>
										<p className="text-xs text-muted-foreground">
											Some applications such as FreeOTP can load images from an
											URI (image parameter). It need to be a valid URL to an
											image.
										</p>
									</div>

									<Separator />

									<div className="bg-muted/50 rounded-lg p-4">
										<p className="text-sm font-medium mb-2">
											💡 The most common parameters used by services is a{" "}
											<strong>period of 30 seconds</strong>,{" "}
											<strong>sha1 algorithm</strong> and{" "}
											<strong>6 Digits</strong> for your OTP code. If you are
											not sure what parameters are used by your service, always
											use this as default.
										</p>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label htmlFor="period">Period in seconds</Label>
											<Input
												id="period"
												type="number"
												value={period}
												onChange={(e) => setPeriod(Number(e.target.value))}
												min={1}
												max={300}
											/>
											<p className="text-xs text-muted-foreground">
												Set the period how long the OTP is valid, recommend is
												30 seconds
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="algorithm">Algorithm</Label>
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
													<SelectItem value={TotpHashAlgorithm.SHA1}>
														sha1
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA256}>
														sha256
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA512}>
														sha512
													</SelectItem>
												</SelectContent>
											</Select>
											<p className="text-xs text-muted-foreground">
												You must verify that the algorithm you want to use is
												supported by the application your clients might be
												using.
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="digits">Digits</Label>
											<Input
												id="digits"
												type="number"
												value={digits}
												onChange={(e) => setDigits(Number(e.target.value))}
												min={4}
												max={8}
											/>
											<p className="text-xs text-muted-foreground">
												How much digits should the OTP have
											</p>
										</div>
									</div>

									<Button
										onClick={handleCreateSecret}
										className="w-full"
										disabled={!label || !issuer || generatingSecret}
									>
										{generatingSecret ? "Creating..." : "CREATE TOTP SECRET"}
									</Button>
								</CardContent>
							</Card>

							{/* Result */}
							{totpSecret && (
								<Card className="h-fit">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<QrCode className="w-5 h-5 text-green-600" />
											Generated Secret
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label>Secret (Base32)</Label>
											<div className="flex gap-2">
												<Input
													value={totpSecret.secret}
													readOnly
													className="font-mono text-sm"
												/>
												<Button
													size="icon"
													variant="outline"
													onClick={() => copyToClipboard(totpSecret.secret)}
												>
													<Copy className="w-4 h-4" />
												</Button>
											</div>
										</div>

										<div className="space-y-2">
											<Label>Provisioning URI</Label>
											<div className="flex gap-2">
												<Input
													value={totpSecret.provisioningUri}
													readOnly
													className="font-mono text-xs"
												/>
												<Button
													size="icon"
													variant="outline"
													onClick={() =>
														copyToClipboard(totpSecret.provisioningUri)
													}
												>
													<Copy className="w-4 h-4" />
												</Button>
											</div>
										</div>

										<div className="space-y-2">
											<Label>QR Code</Label>
											<div className="flex justify-center">
												<img
													src={totpSecret.qrCodeUrl}
													alt="TOTP QR Code"
													className="w-48 h-48 border rounded-lg"
												/>
											</div>
											<p className="text-xs text-muted-foreground text-center">
												Scan this QR code with your authenticator app
											</p>
										</div>

										<Button
											onClick={() => setActiveTab("generate")}
											className="w-full"
											variant="outline"
										>
											<Smartphone className="w-4 h-4 mr-2" />
											Continue to Generate Code
										</Button>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>

					{/* Step 2: Generate TOTP Code */}
					<TabsContent value="generate" className="space-y-6 mt-0">
						<div className="grid lg:grid-cols-2 gap-6 h-full">
							{/* Input */}
							<Card className="h-fit">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Clock className="w-5 h-5 text-purple-600" />
										Generate TOTP Code
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="secret-generate">
											Enter a generated TOTP (Time based) secret
										</Label>
										<Input
											id="secret-generate"
											placeholder="Based on a TOTP Secret ..."
											value={secret}
											onChange={(e) => setSecret(e.target.value)}
											className="font-mono"
										/>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label>Period in seconds</Label>
											<Input
												type="number"
												value={period}
												onChange={(e) => setPeriod(Number(e.target.value))}
												min={1}
												max={300}
											/>
											<p className="text-xs text-muted-foreground">
												What period used for the secret
											</p>
										</div>

										<div className="space-y-2">
											<Label>Algorithm</Label>
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
													<SelectItem value={TotpHashAlgorithm.SHA1}>
														sha1
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA256}>
														sha256
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA512}>
														sha512
													</SelectItem>
												</SelectContent>
											</Select>
											<p className="text-xs text-muted-foreground">
												What algorithm was used for the secret
											</p>
										</div>

										<div className="space-y-2">
											<Label>Digits</Label>
											<Input
												type="number"
												value={digits}
												onChange={(e) => setDigits(Number(e.target.value))}
												min={4}
												max={8}
											/>
											<p className="text-xs text-muted-foreground">
												How much digits set for your created secrete
											</p>
										</div>
									</div>

									<Button
										onClick={handleGenerateCode}
										className="w-full"
										disabled={!secret || generatingCode}
									>
										{generatingCode ? "Generating..." : "GENERATE TOTP CODE"}
									</Button>
								</CardContent>
							</Card>

							{/* Result */}
							{totpResult && (
								<Card className="h-fit">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Shield className="w-5 h-5 text-purple-600" />
											Current TOTP Code
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="text-center space-y-4">
											<div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border">
												<div className="text-4xl font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 mb-2">
													{totpResult.code}
												</div>
												<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
													<Clock className="w-4 h-4" />
													{formatTimeRemaining(totpResult.timeRemaining)}{" "}
													remaining
												</div>
											</div>

											<Button
												onClick={() => copyToClipboard(totpResult.code)}
												variant="outline"
												className="w-full"
											>
												<Copy className="w-4 h-4 mr-2" />
												Copy Code
											</Button>
										</div>

										<Separator />

										<div className="space-y-3 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Algorithm:
												</span>
												<Badge variant="outline">{totpResult.algorithm}</Badge>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Digits:</span>
												<span>{totpResult.digits}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Period:</span>
												<span>{totpResult.period}s</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Time Window:
												</span>
												<span>{totpResult.timeUsed}</span>
											</div>
										</div>

										<Button
											onClick={() => setActiveTab("validate")}
											className="w-full"
											variant="outline"
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											Continue to Validate Code
										</Button>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>

					{/* Step 3: Check TOTP Code */}
					<TabsContent value="validate" className="space-y-6 mt-0">
						<div className="grid lg:grid-cols-2 gap-6 h-full">
							{/* Input */}
							<Card className="h-fit">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="w-5 h-5 text-green-600" />
										Check TOTP Code
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="secret-validate">Secret</Label>
										<Input
											id="secret-validate"
											placeholder="Secret ..."
											value={secret}
											onChange={(e) => setSecret(e.target.value)}
											className="font-mono"
										/>
										<p className="text-xs text-muted-foreground">
											Normally the secret is securely saved on server-side DB,
											however on test you have to enter manually
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="code-validate">
											Generated TOTP Code to auth
										</Label>
										<Input
											id="code-validate"
											placeholder="Code ..."
											value={codeToValidate}
											onChange={(e) => setCodeToValidate(e.target.value)}
											className="font-mono text-center text-lg"
										/>
										<p className="text-xs text-muted-foreground">
											Based on your secret
										</p>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label>Period in seconds</Label>
											<Input
												type="number"
												value={period}
												onChange={(e) => setPeriod(Number(e.target.value))}
												min={1}
												max={300}
											/>
											<p className="text-xs text-muted-foreground">
												What period used for the secret
											</p>
										</div>

										<div className="space-y-2">
											<Label>Algorithm</Label>
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
													<SelectItem value={TotpHashAlgorithm.SHA1}>
														sha1
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA256}>
														sha256
													</SelectItem>
													<SelectItem value={TotpHashAlgorithm.SHA512}>
														sha512
													</SelectItem>
												</SelectContent>
											</Select>
											<p className="text-xs text-muted-foreground">
												What algorithm used for the secret
											</p>
										</div>

										<div className="space-y-2">
											<Label>Digits</Label>
											<Input
												type="number"
												value={digits}
												onChange={(e) => setDigits(Number(e.target.value))}
												min={4}
												max={8}
											/>
											<p className="text-xs text-muted-foreground">
												How much digits set for your created secrete
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Validation Window</Label>
										<Input
											type="number"
											value={validationWindow}
											onChange={(e) =>
												setValidationWindow(Number(e.target.value))
											}
											min={0}
											max={10}
										/>
										<p className="text-xs text-muted-foreground">
											Number of time windows to check before and after current
											time (0 = only current window)
										</p>
									</div>

									<Button
										onClick={handleValidateCode}
										className="w-full"
										disabled={!secret || !codeToValidate || validatingCode}
									>
										{validatingCode ? "Checking..." : "CHECK TOTP CODE"}
									</Button>
								</CardContent>
							</Card>

							{/* Result */}
							{validationResult && (
								<Card className="h-fit">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											{validationResult.isValid ? (
												<CheckCircle className="w-5 h-5 text-green-600" />
											) : (
												<XCircle className="w-5 h-5 text-red-600" />
											)}
											Validation Result
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="text-center">
											<div
												className={`rounded-xl p-6 border ${
													validationResult.isValid
														? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
														: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800"
												}`}
											>
												{validationResult.isValid ? (
													<div className="space-y-2">
														<CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
														<div className="text-lg font-semibold text-green-700 dark:text-green-400">
															Code is Valid! ✅
														</div>
													</div>
												) : (
													<div className="space-y-2">
														<XCircle className="w-12 h-12 text-red-600 mx-auto" />
														<div className="text-lg font-semibold text-red-700 dark:text-red-400">
															Code is Invalid! ❌
														</div>
													</div>
												)}
											</div>
										</div>

										<Separator />

										<div className="space-y-3 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Status:</span>
												<Badge
													variant={
														validationResult.isValid ? "default" : "destructive"
													}
												>
													{validationResult.isValid ? "Valid" : "Invalid"}
												</Badge>
											</div>
											{validationResult.timeOffset !== 0 && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Time Offset:
													</span>
													<span
														className={
															validationResult.timeOffset > 0
																? "text-blue-600"
																: "text-orange-600"
														}
													>
														{validationResult.timeOffset > 0 ? "+" : ""}
														{validationResult.timeOffset} windows
													</span>
												</div>
											)}
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Current Window:
												</span>
												<span>{validationResult.currentTimeWindow}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Used Window:
												</span>
												<span>{validationResult.usedTimeWindow}</span>
											</div>
										</div>

										<div className="p-3 bg-muted/50 rounded-lg">
											<p className="text-xs text-muted-foreground">
												<strong>Message:</strong> {validationResult.message}
											</p>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
