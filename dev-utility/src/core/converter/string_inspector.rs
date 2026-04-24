use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct StringInspection {
    pub char_count: usize,
    pub word_count: usize,
    pub line_count: usize,
    pub byte_count: usize,
}

#[universal_function]
pub fn inspect_string(input: &str) -> StringInspection {
    StringInspection {
        char_count: input.chars().count(),
        word_count: input.split_whitespace().count(),
        // `.lines()` drops a trailing empty line; count explicit newlines
        // to match the intuition of "how many lines are there" including
        // a trailing blank.
        line_count: if input.is_empty() {
            0
        } else {
            input.matches('\n').count() + 1
        },
        byte_count: input.len(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty() {
        let r = inspect_string("");
        assert_eq!(r.char_count, 0);
        assert_eq!(r.word_count, 0);
        assert_eq!(r.line_count, 0);
        assert_eq!(r.byte_count, 0);
    }

    #[test]
    fn multibyte_chars() {
        let r = inspect_string("café");
        assert_eq!(r.char_count, 4);
        assert_eq!(r.byte_count, 5);
    }

    #[test]
    fn lines_and_words() {
        let r = inspect_string("hello world\nsecond line");
        assert_eq!(r.word_count, 4);
        assert_eq!(r.line_count, 2);
    }
}
