#[derive(Debug, Serialize, Deserialize)]
pub struct RsaKeyAnalysis {
    pub key_type: KeyType,
    pub key_size: u32,
    pub public_params: Option<PublicKeyParams>,
    pub private_params: Option<PrivateKeyParams>,
    pub derived_params: Option<DerivedParams>,
    pub security_info: SecurityInfo,
    pub fingerprint: KeyFingerprint,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PublicKeyParams {
    pub n: String,           // Modulus
    pub e: String,           // Public exponent
    pub n_hex: String,       // Modulus in hex
    pub e_hex: String,       // Public exponent in hex
    pub n_bits: u32,         // Modulus bit length
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrivateKeyParams {
    pub n: String,           // Modulus
    pub e: String,           // Public exponent
    pub d: String,           // Private exponent
    pub p: String,           // First prime
    pub q: String,           // Second prime
    pub dp: String,          // d mod (p-1)
    pub dq: String,          // d mod (q-1)
    pub qinv: String,        // q^-1 mod p
    // Hex representations
    pub n_hex: String,
    pub e_hex: String,
    pub d_hex: String,
    pub p_hex: String,
    pub q_hex: String,
    pub dp_hex: String,
    pub dq_hex: String,
    pub qinv_hex: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DerivedParams {
    pub phi_n: String,       // Euler's totient φ(n) = (p-1)(q-1)
    pub lambda_n: String,    // Carmichael function λ(n)
    pub p_minus_1: String,   // p - 1
    pub q_minus_1: String,   // q - 1
    pub key_size_bits: u32,  // Actual key size in bits
    pub key_size_bytes: u32, // Key size in bytes
}