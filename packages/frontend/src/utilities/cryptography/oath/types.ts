// TOTP Types
export enum TotpHashAlgorithm {
  SHA1 = "sha1",
  SHA256 = "sha256",
  SHA512 = "sha512",
}

export type TotpGenerateSecretParams = {
  issuer: string;
  account: string;
  algorithm: TotpHashAlgorithm;
  digits: number;
  period: number;
  image?: string;
  addIssuerPrefix: boolean;
};

export type TotpSecretResult = {
  secret: string;
  qrCodeUrl: string;
  provisioningUri: string;
};

export type TotpGenerateCodeParams = {
  secret: string;
  algorithm: TotpHashAlgorithm;
  digits: number;
  period: number;
};

export type TotpCodeResult = {
  code: string;
  timeRemaining: number;
  timeUsed: number;
  algorithm: TotpHashAlgorithm;
  digits: number;
  period: number;
};

export type TotpValidateCodeParams = {
  secret: string;
  code: string;
  algorithm: TotpHashAlgorithm;
  digits: number;
  period: number;
  window: number;
};

export type TotpValidationResult = {
  isValid: boolean;
  timeOffset: number;
  usedTimeWindow: number;
  currentTimeWindow: number;
  message: string;
};
