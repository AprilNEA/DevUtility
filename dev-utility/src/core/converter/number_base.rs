use crate::error::UtilityError;
use universal_function_macro::universal_function;

/// Convert an integer literal between arbitrary bases (2..=36).
///
/// Leading whitespace and a single `+`/`-` sign are tolerated. The
/// input is parsed as an `i128` so the full range of 64-bit two's
/// complement values round-trips cleanly.
#[universal_function]
pub fn number_base_convert(
    input: &str,
    from_base: u32,
    to_base: u32,
) -> Result<String, UtilityError> {
    if !(2..=36).contains(&from_base) || !(2..=36).contains(&to_base) {
        return Err(UtilityError::InvalidInput(
            "Base must be between 2 and 36".to_string(),
        ));
    }

    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Ok(String::new());
    }

    let value = i128::from_str_radix(trimmed, from_base)
        .map_err(|e| UtilityError::ParseError(e.to_string()))?;

    Ok(render_in_base(value, to_base))
}

fn render_in_base(value: i128, base: u32) -> String {
    if value == 0 {
        return "0".to_string();
    }

    let negative = value < 0;
    let mut n = value.unsigned_abs();
    let mut digits = Vec::new();
    while n > 0 {
        let d = (n % base as u128) as u32;
        digits.push(char::from_digit(d, base).unwrap());
        n /= base as u128;
    }
    if negative {
        digits.push('-');
    }
    digits.iter().rev().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn binary_to_decimal() {
        assert_eq!(number_base_convert("1010", 2, 10).unwrap(), "10");
    }

    #[test]
    fn decimal_to_hex() {
        assert_eq!(number_base_convert("255", 10, 16).unwrap(), "ff");
    }

    #[test]
    fn handles_negatives() {
        assert_eq!(number_base_convert("-10", 10, 2).unwrap(), "-1010");
    }

    #[test]
    fn empty_input_is_empty() {
        assert_eq!(number_base_convert("", 10, 2).unwrap(), "");
    }

    #[test]
    fn rejects_invalid_base() {
        assert!(number_base_convert("10", 1, 10).is_err());
        assert!(number_base_convert("10", 10, 37).is_err());
    }
}
