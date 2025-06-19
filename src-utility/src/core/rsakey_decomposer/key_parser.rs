use rsa::{RsaPrivateKey, RsaPublicKey, pkcs1::DecodeRsaPrivateKey, pkcs1::DecodeRsaPublicKey};
use pem::parse as parse_pem;
use crate::models::{PublicKeyParams, PrivateKeyParams};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum KeyType { Public, Private }

pub enum ParsedKey{
    Public(RsaPublicKey),
    Private(RsaPrivateKey),
}
pub fn parse_pem_and_detect_key_type(pem_data:&str)-> Result<ParsedKey,String>{
     let pem = parse_pem(pem_data).map_err(|e| format!("PEM parsing failed:{}",e))?;
     match pem.tag.as_str(){
        "RSA PUBLIC KEY" => {
            let key = RsaPublicKey::from_pkcs1_der(&pem.contents).map_err(|e| format!("RSA public key parsing failed:{}",e))?;
            Ok(ParsedKey::Public(pub_key))
        }
        "RSA PRIVATE KEY" => {
            let key = RsaPrivateKey::from_pkcs1_der(&pem.contents).map_err(|e| format!("RSA private key parsing failed:{}",e))?;
            Ok(ParsedKey::Private(priv_key))
        }
        _=> Err(format!("Unsupported key type, only RSA public and private keys are supported. Found:{}".to_string()))
     }
}

#[cfg(test)]
mod tests{
    use super::*;
    use rsa::{RsaPrivateKey, RsaPublicKey};
    use num_bigint::BigUint;

    #[test]
    fn test_parse_pem_and_detect_key_type(){
        
    }
}