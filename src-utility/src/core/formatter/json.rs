// Copyright (c) 2023-2025, AprilNEA LLC.
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

#[cfg(target_arch = "wasm32")]
use serde_json::Value as JsonValue;
#[cfg(not(target_arch = "wasm32"))]
use sonic_rs::Value as JsonValue;

use crate::error::UtilityError;
use serde::{Deserialize, Serialize};
use sonic_rs;
use universal_function_macro::universal_function;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub enum IndentStyle {
    Spaces(usize),
    Tabs,
    Minified,
}

fn process_spaces_indentation(json: String, size: usize) -> String {
    json.lines()
        .map(|line| {
            if size == 2 {
                return line.to_string();
            }
            let leading_spaces = line.len() - line.trim_start().len();
            let indent_level = leading_spaces / 2;
            format!("{}{}", " ".repeat(indent_level * size), line.trim_start())
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn process_tabs_indentation(json: String) -> String {
    json.lines()
        .map(|line| {
            let leading_spaces = line.len() - line.trim_start().len();
            let indent_level = leading_spaces / 2;
            format!("{}{}", "\t".repeat(indent_level), line.trim_start())
        })
        .collect::<Vec<_>>()
        .join("\n")
}

#[universal_function]
pub fn format_json(input: &str, style: IndentStyle) -> Result<String, UtilityError> {
    #[cfg(not(target_arch = "wasm32"))]
    let value: JsonValue =
        sonic_rs::from_str(input).map_err(|e| UtilityError::ParseError(e.to_string()))?;

    #[cfg(target_arch = "wasm32")]
    let value: JsonValue =
        serde_json::from_str(input).map_err(|e| UtilityError::ParseError(e.to_string()))?;

    match style {
        IndentStyle::Minified => {
            #[cfg(not(target_arch = "wasm32"))]
            let result = sonic_rs::to_string(&value).unwrap_or_else(|_| "{}".to_string());

            #[cfg(target_arch = "wasm32")]
            let result = serde_json::to_string(&value).unwrap_or_else(|_| "{}".to_string());

            Ok(result)
        }
        IndentStyle::Spaces(size) => {
            #[cfg(not(target_arch = "wasm32"))]
            let pretty_json =
                sonic_rs::to_string_pretty(&value).unwrap_or_else(|_| "{}".to_string());

            #[cfg(target_arch = "wasm32")]
            let pretty_json =
                serde_json::to_string_pretty(&value).unwrap_or_else(|_| "{}".to_string());

            Ok(process_spaces_indentation(pretty_json, size))
        }
        IndentStyle::Tabs => {
            #[cfg(not(target_arch = "wasm32"))]
            let pretty_json =
                sonic_rs::to_string_pretty(&value).unwrap_or_else(|_| "{}".to_string());

            #[cfg(target_arch = "wasm32")]
            let pretty_json =
                serde_json::to_string_pretty(&value).unwrap_or_else(|_| "{}".to_string());

            Ok(process_tabs_indentation(pretty_json))
        }
    }
}

