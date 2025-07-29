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

export enum InvokeFunction {
  GenerateUlid = "generate_ulid",
  GenerateNanoid = "generate_nanoid",
  GenerateUuidV1 = "generate_uuid_v1",
  GenerateUuidV4 = "generate_uuid_v4",
  GenerateUuidV7 = "generate_uuid_v7",
  AnalyzeUuid = "analyze_uuid",
  GenerateHashes = "generate_hashes",
  FormatJson = "format_json",
  FormatCss = "format_css",
  EncodeBase64 = "encode_base64",
  DecodeBase64 = "decode_base64",
  DecodeJwt = "decode_jwt",
  GenerateRsaKey = "generate_rsa_key",
  AnalyzeRsaKey = "analyze_rsa_key",
  // TOTP Functions
  GenerateTotpSecret = "generate_totp_secret",
  GenerateTotpCode = "generate_totp_code",
  ValidateTotpCode = "validate_totp_code",
  // Hardware Functions
  ListHidDevices = "list_hid_devices",
}
export enum Base64Engine {
  Standard = "standard",
  UrlSafe = "url_safe",
}

export enum HashAlgorithm {
  MD2 = "md2",
  MD4 = "md4",
  MD5 = "md5",
  SHA1 = "sha1",
  SHA224 = "sha224",
  SHA256 = "sha256",
  SHA384 = "sha384",
  SHA512 = "sha512",
  SHA3_256 = "sha3_256",
  Keccak256 = "keccak256",
}
export type HashResult = {
  [HashAlgorithm.MD2]: string;
  [HashAlgorithm.MD4]: string;
  [HashAlgorithm.MD5]: string;
  [HashAlgorithm.SHA1]: string;
  [HashAlgorithm.SHA224]: string;
  [HashAlgorithm.SHA256]: string;
  [HashAlgorithm.SHA384]: string;
  [HashAlgorithm.SHA512]: string;
  [HashAlgorithm.SHA3_256]: string;
};
export enum IndentStyleEnum {
  Spaces = "spaces",
  Tabs = "tabs",
  Minified = "minified",
}
export type IndentStyle =
  | { [IndentStyleEnum.Spaces]: number }
  | IndentStyleEnum.Tabs
  | IndentStyleEnum.Minified;
export type RsaKeyPair = {
  privateKey: string;
  publicKey: string;
};

export enum KeyType {
  Public = "Public",
  Private = "Private",
}

export type PublicKeyParams = {
  n: string; // Modulus
  e: string; // Public exponent
  nHex: string; // Modulus in hex
  eHex: string; // Public exponent in hex
  nBits: number; // Modulus bit length
};

export type PrivateKeyParams = {
  n: string; // Modulus
  e: string; // Public exponent
  d: string; // Private exponent
  p: string; // First prime
  q: string; // Second prime
  dp: string; // d mod (p-1)
  dq: string; // d mod (q-1)
  qinv: string; // q^-1 mod p
  // Hex representations
  nHex: string;
  eHex: string;
  dHex: string;
  pHex: string;
  qHex: string;
  dpHex: string;
  dqHex: string;
  qinvHex: string;
};

export type DerivedParams = {
  phiN: string; // Euler's totient φ(n) = (p-1)(q-1)
  lambdaN: string; // Carmichael function λ(n)
  pMinus1: string; // p - 1
  qMinus1: string; // q - 1
  keySizeBits: number; // Actual key size in bits
  keySizeBytes: number; // Key size in bytes
};

export type SecurityInfo = {
  recommendedMinimumBits: number;
  isSecure: boolean;
  securityLevel: string;
  vulnerabilities: string[];
  recommendations: string[];
};

export type KeyFingerprint = {
  sha256: string;
  sha1: string;
  md5: string;
};

export type RsaKeyAnalysis = {
  keyType: KeyType;
  keySize: number;
  publicParams?: PublicKeyParams;
  privateParams?: PrivateKeyParams;
  derivedParams?: DerivedParams;
  // securityInfo?: SecurityInfo;
  // fingerprint?: KeyFingerprint;
};

export type HidDeviceInfo = {
  vendorId: number;
  productId: number;
  manufacturerString: string | null;
  productString: string | null;
  serialNumber: string | null;
  path: string;
  interfaceNumber: number;
  usagePage: number;
  usage: number;
};

export type JwtDecodeResult = {
  header: string;
  payload: string;
  signature: string;
  verified: "invalid" | "valid" | "unverified";
};

export enum JwtAlgorithm {
  HS256 = "HS256",
  // HS384 = "HS384",
  // HS512 = "HS512",
  // RS256 = "RS256",
  // RS384 = "RS384",
  // RS512 = "RS512",
  // ES256 = "ES256",
  // ES384 = "ES384",
  // ES512 = "ES512",
  // PS256 = "PS256",
  // PS384 = "PS384",
  // PS512 = "PS512",
}
