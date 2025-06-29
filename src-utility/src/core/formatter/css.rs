// Copyright (c) 2023-2025, ApriilNEA LLC.
//
// Dual licensed under:
// - GPL-3.0 (open source)
// - Commercial license (contact us)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// See LICENSE file for details or contact admin@aprilnea.com

use lightningcss::stylesheet::{ParserOptions, PrinterOptions, StyleSheet};
use universal_function_macro::universal_function;

use crate::error::UtilityError;

/// Format CSS string using Lightning CSS
///
/// # Arguments
/// * `input` - Input CSS string
///
/// # Returns
/// * `Result<String, UtilityError>` - Formatted CSS string or error
#[universal_function]
pub fn format_css(input: String) -> Result<String, UtilityError> {
    let stylesheet = StyleSheet::parse(
        &input,
        ParserOptions {
            error_recovery: true,
            ..Default::default()
        },
    )
    .map_err(|e| UtilityError::ParseError(e.to_string()))?;

    let result = stylesheet
        .to_css(PrinterOptions {
            ..Default::default()
        })
        .map_err(|e| UtilityError::ParseError(e.to_string()))?;

    Ok(result.code)
}
