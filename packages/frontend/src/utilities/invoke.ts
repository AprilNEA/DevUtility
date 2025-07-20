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

// #v-ifdef WASM
import wasmFunctions from "./invoke-wasm";
// #v-endif

import { type InvokeOptions, invoke as invokeCore } from "@tauri-apps/api/core";
import useSWRMutation, {
  type SWRMutationConfiguration,
  type SWRMutationResponse,
} from "swr/mutation";
import type {
  TotpCodeResult,
  TotpGenerateCodeParams,
  TotpGenerateSecretParams,
  TotpSecretResult,
  TotpValidateCodeParams,
  TotpValidationResult,
} from "./cryptography/oath/types";
import {
  type Base64Engine,
  type HashResult,
  type HidDeviceInfo,
  type IndentStyle,
  InvokeFunction,
  type JwtAlgorithm,
  type JwtDecodeResult,
  type RsaKeyAnalysis,
  type RsaKeyPair,
} from "./types";

export const IS_TAURI = "__TAURI__" in window;

export interface UtilitiesArgs {
  [InvokeFunction.GenerateUlid]: { count: number };
  [InvokeFunction.GenerateNanoid]: { count: number };
  [InvokeFunction.GenerateUuidV4]: { count: number };
  [InvokeFunction.GenerateUuidV7]: { count: number; timestamp?: number };
  [InvokeFunction.FormatJson]: { input: string; style: IndentStyle };
  [InvokeFunction.FormatCss]: { input: string };
  [InvokeFunction.GenerateHashes]: { input: string };
  [InvokeFunction.EncodeBase64]: { input: string };
  [InvokeFunction.DecodeBase64]: { input: string; engine: Base64Engine };
  [InvokeFunction.DecodeJwt]: {
    input: string;
    algorithm: JwtAlgorithm;
    secret?: string;
  };
  [InvokeFunction.GenerateRsaKey]: { bits: number };
  [InvokeFunction.AnalyzeRsaKey]: { key: string };
  [InvokeFunction.GenerateTotpSecret]: TotpGenerateSecretParams;
  [InvokeFunction.GenerateTotpCode]: TotpGenerateCodeParams;
  [InvokeFunction.ValidateTotpCode]: TotpValidateCodeParams;
  [InvokeFunction.ListHidDevices]: undefined;
}

export interface UtilitiesReturns {
  [InvokeFunction.GenerateUlid]: string;
  [InvokeFunction.GenerateNanoid]: string;
  [InvokeFunction.GenerateUuidV4]: string;
  [InvokeFunction.GenerateUuidV7]: string;
  [InvokeFunction.FormatJson]: string;
  [InvokeFunction.FormatCss]: string;
  [InvokeFunction.GenerateHashes]: HashResult;
  [InvokeFunction.EncodeBase64]: string;
  [InvokeFunction.DecodeBase64]: string;
  [InvokeFunction.DecodeJwt]: JwtDecodeResult;
  [InvokeFunction.GenerateRsaKey]: RsaKeyPair;
  [InvokeFunction.AnalyzeRsaKey]: RsaKeyAnalysis;
  [InvokeFunction.GenerateTotpSecret]: TotpSecretResult;
  [InvokeFunction.GenerateTotpCode]: TotpCodeResult;
  [InvokeFunction.ValidateTotpCode]: TotpValidationResult;
  [InvokeFunction.ListHidDevices]: HidDeviceInfo[];
}

export async function utilityInvoke<T extends InvokeFunction>(
  cmd: T,
  args: UtilitiesArgs[T],
  options?: InvokeOptions
): Promise<UtilitiesReturns[T]> {
  if (IS_TAURI) {
    return invokeCore(cmd, args, options);
  }
  // #v-ifdef WASM
  else if (cmd in wasmFunctions) {
    const result = wasmFunctions[cmd]?.(args);
    if (!result) {
      throw new Error(`Function ${cmd} not found in wasm`);
    }
    return result;
  }
  // #v-endif
  throw new Error(`Function ${cmd} not found`);
}

export type UtilityInvokeError = string;
export function useUtilityInvoke<T extends InvokeFunction>(
  cmd: T,
  options?: SWRMutationConfiguration<
    UtilitiesReturns[T],
    UtilityInvokeError,
    T,
    UtilitiesArgs[T],
    UtilitiesReturns[T]
  >
): SWRMutationResponse<
  UtilitiesReturns[T],
  UtilityInvokeError,
  T,
  UtilitiesArgs[T]
> {
  return useSWRMutation<
    UtilitiesReturns[T],
    UtilityInvokeError,
    T,
    UtilitiesArgs[T]
  >(
    cmd,
    // @ts-expect-error
    (_, { arg }) => utilityInvoke(cmd, arg),
    options
  );
}
