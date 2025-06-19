use num_bigint::BigUint;
use num_integer::Integer;
use crate::models::{DerivedParams,PrivateKeyParams,PublicKeyParams};

pub fn calculate_derived_params(n: &BigUint, e: &BigUint, d: &BigUint) -> DerivedParams{
    let p=BigUint::parse_bytes(priv_params.p.as_bytes(),10).unwrap();
    let q=BigUint::parse_bytes(priv_param.q.as_bytes(),10).unwrap();
    let n=BigUint::parse_bytes(priv_params.n.as_bytes(),10).unwrap();

    let p_minus_1= &p-1u8;
    let q_minus_1= &q-1u8;

    let phi_n= &p_minus_1 * &q_minus_1;
    let lambda_n= &p_minus_1.lcm(&q_minus_1);

    let key_size_bits=n.bits();
    let key_size_bytes=key_size_bits/8;

    DerivedParams{
        phi_n: phi_n.to_str_radix(10),
        lambda_n: lambda_n.to_str_radix(10),
        p_minus_1: p_minus_1.to_str_radix(10),
        q_minus_1: q_minus_1.to_str_radix(10),
        key_size_bits,
        key_size_bytes,
    }
}