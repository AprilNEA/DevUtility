import { Channel } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { useUtilityInvoke } from "../invoke";
import { InvokeFunction } from "../types";

export enum Fido2FrontendEvent {
  Fido2RegisterPinNeeded = "fido2_register_pin_enter",
}
export enum Fido2TauriEvent {
  Fido2RegisterPinNeeded = "fido2_register_pin_needed",
  Fido2RegisterTouchNeeded = "fido2_register_touch_needed",
  Fido2RegisterFinished = "fido2_register_finished",
}

export type Fido2Credential = {
  id: string;
  publicKey: Fido2PublicKey;
};

export type Fido2PublicKey = {
  keyType: string;
  pem: string;
  derHex: string;
};

export type Fido2UserEntity = {
  userId: string;
  userName: string;
  userDisplayName: string;
};

export type Fido2RegisterParams = {
  rpid: string;
  user?: Fido2UserEntity;
};

export type AlgorithmInfo = {
  type: string;
  alg: number;
};

export type UserVerificationMethod = {
  presence: boolean;
  fingerprint: boolean;
  passcode: boolean;
  voiceprint: boolean;
  faceprint: boolean;
  location: boolean;
  eyeprint: boolean;
  pattern: boolean;
  handprint: boolean;
  none: boolean;
  all: boolean;
};

export type Fido2DeviceInfo = {
  // CTAP 2.0
  supportedVersions: string[];
  availableExtensions: string[];
  deviceGuid: string;
  deviceCapabilities: Record<string, boolean>;
  maxMessageSizeBytes: number;
  pinAuthProtocols: number[];

  // CTAP 2.1
  maxCredentialsPerList: number;
  maxCredentialIdSize: number;
  communicationMethods: string[];
  supportedAlgorithms: AlgorithmInfo[];
  maxLargeBlobSize: number;
  requiresPinChange: boolean;
  minimumPinLength: number;
  firmwareVersionString: string;
  maxCredentialBlobSize: number;
  maxRpIdsForMinPin: number;
  preferredUvAttempts: number;
  userVerificationMethod: UserVerificationMethod;
  remainingResidentKeys: number;
};

type Fido2RegisterEvent =
  | {
      event: Fido2TauriEvent.Fido2RegisterPinNeeded;
      data: {
        challenge: string;
      };
    }
  | {
      event: Fido2TauriEvent.Fido2RegisterTouchNeeded;
      data: {
        challenge: string;
      };
    }
  | {
      event: Fido2TauriEvent.Fido2RegisterFinished;
      data: {
        credential: Fido2Credential;
      };
    };

export const useFido2Register = () => {
  const invoke = useUtilityInvoke(InvokeFunction.Fido2Register);
  const enterPin = (pin: string) => {
    emit(Fido2FrontendEvent.Fido2RegisterPinNeeded, pin);
  };
  const onEvent = new Channel<Fido2RegisterEvent>();
  onEvent.onmessage = (message) => {
    console.log(message);
    switch (message.event) {
      case Fido2TauriEvent.Fido2RegisterPinNeeded:
        enterPin("040618");
        break;
    }
  };

  return {
    ...invoke,
    trigger: (params: Fido2RegisterParams) =>
      invoke.trigger({ params, onEvent }),
    onEvent,
    enterPin,
  };
};
