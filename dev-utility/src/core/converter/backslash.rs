use crate::error::UtilityError;
use universal_function_macro::universal_function;

/// Escape common control characters into backslash sequences.
///
/// Covers `\n`, `\r`, `\t`, `\0`, `\\`, and `\"`.
#[universal_function]
pub fn escape_backslash(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for ch in input.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            '\0' => out.push_str("\\0"),
            '"' => out.push_str("\\\""),
            c => out.push(c),
        }
    }
    out
}

/// Inverse of `escape_backslash`. Supports the same sequences plus a
/// conservative subset — unknown escapes are returned as an error.
#[universal_function]
pub fn unescape_backslash(input: &str) -> Result<String, UtilityError> {
    let mut out = String::with_capacity(input.len());
    let mut chars = input.chars();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('n') => out.push('\n'),
            Some('r') => out.push('\r'),
            Some('t') => out.push('\t'),
            Some('0') => out.push('\0'),
            Some('\\') => out.push('\\'),
            Some('"') => out.push('"'),
            Some('\'') => out.push('\''),
            Some(other) => {
                return Err(UtilityError::InvalidInput(format!(
                    "Unknown escape sequence: \\{}",
                    other
                )))
            }
            None => {
                return Err(UtilityError::InvalidInput(
                    "Trailing backslash".to_string(),
                ))
            }
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip() {
        let original = "line one\nline two\ttabbed \"quoted\" \\slash";
        let escaped = escape_backslash(original);
        let back = unescape_backslash(&escaped).unwrap();
        assert_eq!(back, original);
    }

    #[test]
    fn rejects_unknown() {
        assert!(unescape_backslash("\\q").is_err());
    }
}
