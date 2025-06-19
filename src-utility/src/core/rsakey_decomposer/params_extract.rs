use rsa::{RsaPrivateKey, RsaPublicKey, pkcs1::DecodeRsaPrivateKey, pkcs1::DecodeRsaPublicKey};
use num_bigint::BigUint;
use crate::models::{PublicKeyParams, PrivateKeyParams};
use serde::{Serialize, Deserialize};

pub fn extract_public_key_params(pub_key: &RsaPublicKey) -> PublicKeyParams{
    let n = pub_key.n();
    let e = pub_key.e();
    PublicKeyParams{
        n: n.to_str_radix(10),
        e: e.to_str_radix(10),
        n_hex: n_hex.to_str_radix(16),
        e_hex: e_hex.to_str_radix(16),
        n_bits: n_bits.to_str_radix(),
    }
}

pub fn extract_private_key_params(priv_key: &RsaPrivateKey) -> PrivateKeyParams {
    let n = priv_key.n();
    let e = priv_key.e();
    let d = priv_key.d();
    let primes = priv_key.primes();

    let (p, q) = (primes[0].clone(), primes[1].clone());
    let dp = d % (&p - 1u8);
    let dq = d % (&q - 1u8);
    let qinv = q.mod_inverse(&p).unwrap_or(BigUint::from(0u8)); // 需要 num-integer/num-bigint 的 mod_inverse

    PrivateKeyParams {
        n: n.to_str_radix(10),
        e: e.to_str_radix(10),
        d: d.to_str_radix(10),
        p: p.to_str_radix(10),
        q: q.to_str_radix(10),
        dp: dp.to_str_radix(10),
        dq: dq.to_str_radix(10),
        qinv: qinv.to_str_radix(10),
        n_hex: n.to_str_radix(16),
        e_hex: e.to_str_radix(16),
        d_hex: d.to_str_radix(16),
        p_hex: p.to_str_radix(16),
        q_hex: q.to_str_radix(16),
        dp_hex: dp.to_str_radix(16),
        dq_hex: dq.to_str_radix(16),
        qinv_hex: qinv.to_str_radix(16),
    }
}
#[derive(Serialize, Deserialize)]
pub struct PublicKeyParams {
    pub n: String,
    pub e: String,
    pub n_hex: String,
    pub e_hex: String,
    pub n_bits: String,
}


#[cfg(test)]
mod tests {
    use super::*;
    use rsa::{RsaPrivateKey, RsaPublicKey};
    use num_bigint::BigUint;

    #[test]
    fn test_extract_public_key_params() {
        // 构造一个简单的公钥
        let n = BigUint::from(3233u32); // 例子: n = 61 * 53
        let e = BigUint::from(17u32);
        let pub_key = RsaPublicKey::new(n.clone(), e.clone()).unwrap();

        let params = extract_public_key_params(&pub_key);

        assert_eq!(params.n, n.to_str_radix(10));
        assert_eq!(params.e, e.to_str_radix(10));
        assert_eq!(params.n_hex, n.to_str_radix(16));
        assert_eq!(params.e_hex, e.to_str_radix(16));
        assert_eq!(params.n_bits, n.bits().to_string());
    }

    #[test]
    fn test_extract_private_key_params() {
        // 构造一个简单的私钥
        let bits = 64;
        let priv_key = RsaPrivateKey::new(&mut rand::thread_rng(), bits).unwrap();

        let params = extract_private_key_params(&priv_key);

        // 检查 n, e, d 是否非空
        assert!(!params.n.is_empty());
        assert!(!params.e.is_empty());
        assert!(!params.d.is_empty());
        // 检查 p, q, dp, dq, qinv 是否非空
        assert!(!params.p.is_empty());
        assert!(!params.q.is_empty());
        assert!(!params.dp.is_empty());
        assert!(!params.dq.is_empty());
        assert!(!params.qinv.is_empty());
    }
}
