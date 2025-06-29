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

import init, * as wasm from "@dev-utility/core";
import { type InvokeOptions, invoke as invokeCore } from "@tauri-apps/api/core";
import useSWRMutation, {
  type SWRMutationConfiguration,
  type SWRMutationResponse,
} from "swr/mutation";
import {
  type HashResult,
  type IndentStyle,
  InvokeFunction,
  type RsaKeyAnalysis,
  type RsaKeyPair,
  type TotpHashAlgorithm,
  type TotpResult,
  type TotpSecret,
  type TotpValidationResult,
} from "./types";
export const IS_TAURI = "__TAURI__" in window;

interface UtilitiesArgs {
  [InvokeFunction.GenerateUlid]: { count: number };
  [InvokeFunction.GenerateNanoid]: { count: number };
  [InvokeFunction.GenerateUuidV4]: { count: number };
  [InvokeFunction.GenerateUuidV7]: { count: number; timestamp?: number };
  [InvokeFunction.FormatJson]: { input: string; style: IndentStyle };
  [InvokeFunction.FormatCss]: { input: string };
  [InvokeFunction.GenerateHashes]: { input: string };
  [InvokeFunction.EncodeBase64]: { input: string };
  [InvokeFunction.DecodeBase64]: { input: string };
  [InvokeFunction.GenerateRsaKey]: { bits: number };
  [InvokeFunction.AnalyzeRsaKey]: { key: string };
  [InvokeFunction.GenerateTotpSecret]: {
    issuer: string;
    account: string;
    algorithm: TotpHashAlgorithm;
    digits: number;
    period: number;
    label?: string;
    image?: string;
    addIssuerPrefix: boolean;
  };
  [InvokeFunction.GenerateTotpCode]: {
    secret: string;
    algorithm: TotpHashAlgorithm;
    digits: number;
    period: number;
  };
  [InvokeFunction.ValidateTotpCode]: {
    secret: string;
    code: string;
    algorithm: TotpHashAlgorithm;
    digits: number;
    period: number;
    window: number;
  };
}

interface UtilitiesReturns {
  [InvokeFunction.GenerateUlid]: string;
  [InvokeFunction.GenerateNanoid]: string;
  [InvokeFunction.GenerateUuidV4]: string;
  [InvokeFunction.GenerateUuidV7]: string;
  [InvokeFunction.FormatJson]: string;
  [InvokeFunction.FormatCss]: string;
  [InvokeFunction.GenerateHashes]: HashResult;
  [InvokeFunction.EncodeBase64]: string;
  [InvokeFunction.DecodeBase64]: string;
  [InvokeFunction.GenerateRsaKey]: RsaKeyPair;
  [InvokeFunction.AnalyzeRsaKey]: RsaKeyAnalysis;
  [InvokeFunction.GenerateTotpSecret]: TotpSecret;
  [InvokeFunction.GenerateTotpCode]: TotpResult;
  [InvokeFunction.ValidateTotpCode]: TotpValidationResult;
}

type WasmFunctions = {
  [K in keyof UtilitiesArgs]: (args: UtilitiesArgs[K]) => UtilitiesReturns[K];
};
const wasmFunctions: Partial<WasmFunctions> = {
  [InvokeFunction.GenerateUlid]: (args) => wasm.generate_ulid(args.count),
  // [InvokeFunction.GenerateNanoid]: (args) => wasm.generate_nanoid(args.count),
  [InvokeFunction.GenerateUuidV4]: (args) => wasm.generate_uuid_v4(args.count),
  [InvokeFunction.GenerateUuidV7]: (args) => wasm.generate_uuid_v7(args.count),
  // [InvokeFunction.FormatJson]: (args) => wasm.format_json(args.input, args.style),
  [InvokeFunction.FormatCss]: (args) => wasm.format_css(args.input),
  // [InvokeFunction.GenerateHashes]: (args) => wasm.generate_hashes(args.input),
  [InvokeFunction.EncodeBase64]: (args) => wasm.encode_base64(args.input),
  [InvokeFunction.DecodeBase64]: (args) => wasm.decode_base64(args.input),
};

export async function utilityInvoke<T extends InvokeFunction>(
  cmd: T,
  args: UtilitiesArgs[T],
  options?: InvokeOptions
): Promise<UtilitiesReturns[T]> {
  if (IS_TAURI) {
    return invokeCore(cmd, args, options);
  } else if (cmd in wasmFunctions) {
    return wasmFunctions[cmd]!(args);
  }
  throw new Error(`Function ${cmd} not found`);
}

export function useUtilityInvoke<T extends InvokeFunction>(
  cmd: T,
  options?: SWRMutationConfiguration<
    UtilitiesReturns[T],
    Error,
    T,
    UtilitiesArgs[T],
    UtilitiesReturns[T]
  >
): SWRMutationResponse<UtilitiesReturns[T], Error, T, UtilitiesArgs[T]> {
  return useSWRMutation<UtilitiesReturns[T], Error, T, UtilitiesArgs[T]>(
    cmd,
    // @ts-expect-error
    (_, { arg }) => utilityInvoke(cmd, arg),
    options
  );
}
