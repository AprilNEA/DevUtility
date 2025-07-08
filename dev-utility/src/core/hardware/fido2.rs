use ctap_hid_fido2::{
    fidokey::{GetAssertionArgsBuilder, MakeCredentialArgsBuilder},
    get_fidokey_devices,
    public_key::{PublicKey, PublicKeyType},
    verifier::{self, AttestationVerifyResult},
    Cfg, FidoKeyHid, FidoKeyHidFactory,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tauri::{ipc::Channel, AppHandle, Listener};
use universal_function_macro::universal_function;

use crate::error::UtilityError;

#[derive(Clone)]
pub struct FidokeyDeviceInfo {
    pub pid: u16,
    pub vid: u16,
    pub product_string: String,
    pub info: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Fido2PublicKeyType {
    Unknown = 0,
    Ecdsa256 = 1,
    Ed25519 = 2,
}
impl From<PublicKeyType> for Fido2PublicKeyType {
    fn from(public_key_type: PublicKeyType) -> Self {
        match public_key_type {
            PublicKeyType::Unknown => Fido2PublicKeyType::Unknown,
            PublicKeyType::Ecdsa256 => Fido2PublicKeyType::Ecdsa256,
            PublicKeyType::Ed25519 => Fido2PublicKeyType::Ed25519,
        }
    }
}

impl From<Fido2PublicKeyType> for PublicKeyType {
    fn from(fido2_public_key_type: Fido2PublicKeyType) -> Self {
        match fido2_public_key_type {
            Fido2PublicKeyType::Unknown => PublicKeyType::Unknown,
            Fido2PublicKeyType::Ecdsa256 => PublicKeyType::Ecdsa256,
            Fido2PublicKeyType::Ed25519 => PublicKeyType::Ed25519,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Fido2PublicKey {
    pub key_type: Fido2PublicKeyType,
    pub pem: String,
    pub der_hex: String,
}
impl From<PublicKey> for Fido2PublicKey {
    fn from(public_key: PublicKey) -> Self {
        Fido2PublicKey {
            key_type: Fido2PublicKeyType::from(public_key.key_type),
            pem: public_key.pem,
            der_hex: hex::encode(public_key.der),
        }
    }
}

impl From<Fido2PublicKey> for PublicKey {
    fn from(fido2_public_key: Fido2PublicKey) -> Self {
        PublicKey {
            key_type: PublicKeyType::from(fido2_public_key.key_type),
            pem: fido2_public_key.pem,
            der: hex::decode(fido2_public_key.der_hex).unwrap(),
        }
    }
}

/// Fido2 Credential Data
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Fido2Credential {
    pub id: Vec<u8>,
    pub public_key: Fido2PublicKey,
}
impl From<AttestationVerifyResult> for Fido2Credential {
    fn from(attestation_verify_result: AttestationVerifyResult) -> Self {
        Fido2Credential {
            id: attestation_verify_result.credential_id,
            public_key: attestation_verify_result.credential_public_key.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Fido2UserEntity {
    pub user_id: Option<String>,
    pub user_name: Option<String>,
    pub user_display_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fido2RegisterParams {
    pub rpid: String,
    pub user: Option<Fido2UserEntity>,
}

#[derive(Clone, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum Fido2RegisterEvent {
    Fido2RegisterPinNeeded { challenge: String },
    Fido2RegisterTouchNeeded { challenge: String },
    Fido2RegisterFinished { credential: Fido2Credential },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlgorithmInfo {
    pub r#type: String,
    pub name: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserVerificationMethod {
    None,
    Fingerprint,
    Pin,
    Biometric,
    Voice,
    FaceRecognition,
    Other(String),
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Fido2DeviceInfo {
    // CTAP 2.0
    pub aaguid: String,
    pub capabilities: HashMap<String, bool>,
    pub supported_versions: Vec<String>,
    pub available_extensions: Vec<String>,
    pub max_message_size_bytes: u32,
    pub pin_auth_protocols: Vec<u32>,

    // CTAP 2.1
    pub max_credentials_per_list: u32,
    pub max_credential_id_size: u32,
    pub communication_methods: Vec<String>,
    pub supported_algorithms: Vec<AlgorithmInfo>,
    pub max_large_blob_size: u32,
    pub requires_pin_change: bool,
    pub minimum_pin_length: u32,
    pub firmware_version_string: String,
    pub max_credential_blob_size: u32,
    pub max_rp_ids_for_min_pin: u32,
    pub preferred_uv_attempts: u32,
    pub user_verification_method: UserVerificationMethod,
    pub remaining_resident_keys: u32,
}

pub trait FidoKeyHidExt {
    fn get_human_readable_info(&self) -> Result<Fido2DeviceInfo, Error>;
}
impl FidoKeyHidExt for FidoKeyHid {
    fn get_human_readable_info(&self) -> Result<Fido2DeviceInfo, Error> {
        let info = self.get_info()?;
        Ok(Fido2DeviceInfo {
            supported_versions: info.versions,
            available_extensions: info.extensions,
            aaguid: hex::encode(info.aaguid),
            capabilities: info.options.into_iter().collect(),
            max_message_size_bytes: info.max_msg_size as u32,
            pin_auth_protocols: info.pin_uv_auth_protocols,
            max_credentials_per_list: info.max_credential_count_in_list,
            max_credential_id_size: info.max_credential_id_length,
            communication_methods: info.transports,
            supported_algorithms: {
                let mut algorithms = Vec::new();
                let mut current_alg: Option<String> = None;
                let mut current_type: Option<String> = None;

                for (key, value) in info.algorithms {
                    match key.as_str() {
                        "alg" => {
                            // If there was complete algorithm information before, save it first
                            if let (Some(alg), Some(typ)) =
                                (current_alg.take(), current_type.take())
                            {
                                algorithms.push(AlgorithmInfo {
                                    r#type: typ,
                                    name: alg,
                                });
                            }
                            current_alg = Some(value);
                        }
                        "type" => {
                            current_type = Some(value);
                            // If algorithm ID already exists, construct complete information immediately
                            if let Some(alg) = current_alg.take() {
                                algorithms.push(AlgorithmInfo {
                                    r#type: current_type.take().unwrap(),
                                    name: alg,
                                });
                            }
                        }
                        _ => {} // ignore other keys
                    }
                }

                // Handle the remaining algorithms
                if let (Some(alg), Some(typ)) = (current_alg, current_type) {
                    algorithms.push(AlgorithmInfo {
                        r#type: typ,
                        name: alg,
                    });
                }

                algorithms
            },
            max_large_blob_size: info.max_serialized_large_blob_array,
            requires_pin_change: info.force_pin_change,
            minimum_pin_length: info.min_pin_length,
            firmware_version_string: format!(
                "{}.{}.{}",
                (info.firmware_version >> 16) & 0xFF,
                (info.firmware_version >> 8) & 0xFF,
                info.firmware_version & 0xFF
            ),
            max_credential_blob_size: info.max_cred_blob_length,
            max_rp_ids_for_min_pin: info.max_rpids_for_set_min_pin_length,
            preferred_uv_attempts: info.preferred_platform_uv_attempts,
            user_verification_method: match info.uv_modality {
                1 => UserVerificationMethod::Fingerprint,
                2 => UserVerificationMethod::Pin,
                3 => UserVerificationMethod::Biometric,
                4 => UserVerificationMethod::Voice,
                5 => UserVerificationMethod::FaceRecognition,
                0 => UserVerificationMethod::None,
                _ => UserVerificationMethod::Other(format!("Unknown({})", info.uv_modality)),
            },
            remaining_resident_keys: info.remaining_discoverable_credentials,
        })
    }
}

#[universal_function(desktop_only)]
pub async fn fido2_get_device_info() -> Result<Fido2DeviceInfo, UtilityError> {
    let device = FidoKeyHidFactory::create(&Cfg::init())
        .map_err(|e| UtilityError::Fido2Error(e.to_string()))?;
    let info = device
        .get_human_readable_info()
        .map_err(|e| UtilityError::Fido2Error(e.to_string()))?;
    Ok(info)
}

#[tauri::command]
pub async fn fido2_register(
    app: AppHandle,
    params: Fido2RegisterParams,
    on_event: Channel<Fido2RegisterEvent>,
) -> Result<Fido2Credential, UtilityError> {
    // create `challenge`
    let challenge = verifier::create_challenge();

    on_event
        .send(Fido2RegisterEvent::Fido2RegisterPinNeeded {
            challenge: challenge
                .iter()
                .map(|byte| format!("{:02x}", byte))
                .collect::<String>(),
        })
        .unwrap();

    let pin = Arc::new(Mutex::new(String::new()));
    let pin_clone = pin.clone();
    app.listen("fido2_register_pin_enter", move |event| {
        *pin_clone.lock().unwrap() = event.payload().to_string();
    });
    while pin.lock().unwrap().is_empty() {
        std::thread::sleep(std::time::Duration::from_millis(100));
        println!("waiting for pin");
    }

    println!("pin received");
    let pin = pin.lock().unwrap().clone();

    // create `MakeCredentialArgs`
    let make_credential_args = MakeCredentialArgsBuilder::new(&params.rpid, &challenge)
        .pin(&pin)
        .build();

    // create `FidoKeyHid`
    let device = FidoKeyHidFactory::create(&Cfg::init()).unwrap();

    // get `Attestation` Object
    let attestation = device
        .make_credential_with_args(&make_credential_args)
        .unwrap();
    println!("- Register Success");

    // verify `Attestation` Object
    let verify_result = verifier::verify_attestation(&params.rpid, &challenge, &attestation);
    if !verify_result.is_success {
        println!("- ! Verify Failed");
        return Err(UtilityError::Fido2Error("Verify Failed".to_string()));
    }

    Ok(verify_result.into())
}

#[universal_function(desktop_only)]
pub fn fido2_authenticate(
    rpid: &str,
    pin: &str,
    credential: Fido2Credential,
) -> Result<(), UtilityError> {
    // create `challenge`
    let challenge = verifier::create_challenge();

    // create `GetAssertionArgs`
    let get_assertion_args = GetAssertionArgsBuilder::new(rpid, &challenge)
        .pin(&pin)
        .credential_id(&credential.id)
        .build();

    // create `FidoKeyHid`
    let device = FidoKeyHidFactory::create(&Cfg::init()).unwrap();

    // get `Assertion` Object
    let assertions = device.get_assertion_with_args(&get_assertion_args).unwrap();
    println!("- Authenticate Success");

    // verify `Assertion` Object
    let public_key: PublicKey = credential.public_key.clone().into();
    if !verifier::verify_assertion(rpid, &public_key, &challenge, &assertions[0]) {
        println!("- ! Verify Assertion Failed");
        return Err(UtilityError::Fido2Error(
            "Verify Assertion Failed".to_string(),
        ));
    }

    Ok(())
}
