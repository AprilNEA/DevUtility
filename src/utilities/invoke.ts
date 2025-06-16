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

import { invoke as invokeCore, InvokeOptions } from "@tauri-apps/api/core";
import { InvokeFunction, IndentStyle, HashResult } from "./types";

export const IS_TAURI = "__TAURI__" in window;

interface UtilitiesArgs {
  [InvokeFunction.GenerateUlid]: { count: number };
  [InvokeFunction.GenerateNanoid]: { count: number };
  [InvokeFunction.GenerateUuidV4]: { count: number };
  [InvokeFunction.GenerateUuidV7]: { count: number; timestamp?: number };
  [InvokeFunction.FormatJson]: { input: string; style: IndentStyle };
  [InvokeFunction.GenerateHashes]: { input: string };
  [InvokeFunction.EncodeBase64]: { input: string };
  [InvokeFunction.DecodeBase64]: { input: string };
}

interface UtilitiesReturns {
  [InvokeFunction.GenerateUlid]: string;
  [InvokeFunction.GenerateNanoid]: string;
  [InvokeFunction.GenerateUuidV4]: string;
  [InvokeFunction.GenerateUuidV7]: string;
  [InvokeFunction.FormatJson]: string;
  [InvokeFunction.GenerateHashes]: HashResult;
  [InvokeFunction.EncodeBase64]: string;
  [InvokeFunction.DecodeBase64]: string;
}

export function utilityInvoke<T extends InvokeFunction>(
  cmd: T,
  args: UtilitiesArgs[T],
  options?: InvokeOptions
): Promise<UtilitiesReturns[T]> {
  return invokeCore(cmd, args, options);
}