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

use serde::{Deserialize, Serialize};
use sonic_rs;

use crate::error::UtilityError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IndentStyle {
    Spaces(usize),
    Tabs,
    Minified,
}

#[tauri::command]
pub fn format_json(input: &str, style: IndentStyle) -> Result<String, UtilityError> {
    let value: sonic_rs::Value =
        sonic_rs::from_str(input).map_err(|e| UtilityError::ParseError(e.to_string()))?;
    match style {
        IndentStyle::Minified => {
            Ok(sonic_rs::to_string(&value).unwrap_or_else(|_| "{}".to_string()))
        }
        IndentStyle::Spaces(size) => Ok(sonic_rs::to_string_pretty(&value)
            .unwrap_or_else(|_| "{}".to_string())
            .lines()
            .map(|line| {
                if size == 2 {
                    return line.to_string();
                }
                let leading_spaces = line.len() - line.trim_start().len();
                let indent_level = leading_spaces / 2;

                format!("{}{}", " ".repeat(indent_level * size), line.trim_start())
            })
            .collect::<Vec<_>>()
            .join("\n")),
        IndentStyle::Tabs => Ok(sonic_rs::to_string_pretty(&value)
            .unwrap_or_else(|_| "{}".to_string())
            .lines()
            .map(|line| {
                let leading_spaces = line.len() - line.trim_start().len();
                let indent_level = leading_spaces / 2; // Default is 2-space indentation
                format!("{}{}", "\t".repeat(indent_level), line.trim_start())
            })
            .collect::<Vec<_>>()
            .join("\n")),
    }
}
