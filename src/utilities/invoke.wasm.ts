// @ts-nocheck
// #v-ifdef WASM
import * as wasm from "@dev-utility/core";
// #v-endif

import type { UtilitiesArgs, UtilitiesReturns } from "./invoke";
import { InvokeFunction } from "./types";

type WasmFunctions = {
  [K in keyof UtilitiesArgs]: (args: UtilitiesArgs[K]) => UtilitiesReturns[K];
};
const wasmFunctions: Partial<WasmFunctions> = {
  [InvokeFunction.GenerateUlid]: (args) => wasm.generate_ulid(args.count),
  // [InvokeFunction.GenerateNanoid]: (args) => wasm.generate_nanoid(args.count),
  [InvokeFunction.GenerateUuidV4]: (args) => wasm.generate_uuid_v4(args.count),
  [InvokeFunction.GenerateUuidV7]: (args) => wasm.generate_uuid_v7(args.count),
  [InvokeFunction.FormatJson]: (args) =>
    wasm.format_json(args.input, args.style),
  [InvokeFunction.FormatCss]: (args) => wasm.format_css(args.input),
  // [InvokeFunction.GenerateHashes]: (args) => wasm.generate_hashes(args.input),
  [InvokeFunction.EncodeBase64]: (args) => wasm.encode_base64(args.input),
  [InvokeFunction.DecodeBase64]: (args) => wasm.decode_base64(args.input),
  [InvokeFunction.GenerateTotpSecret]: (args) =>
    wasm.generate_totp_secret(args.issuer, args.account, args.algorithm, args.digits, args.period, args.image, args.add_issuer_prefix),
  [InvokeFunction.GenerateTotpCode]: (args) =>
    wasm.generate_totp_code(args.secret, args.algorithm, args.digits, args.period),
  [InvokeFunction.ValidateTotpCode]: (args) =>
    wasm.validate_totp_code(args.secret, args.code, args.algorithm, args.digits, args.period, args.window),
};

export default wasmFunctions;
