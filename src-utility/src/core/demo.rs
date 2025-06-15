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

use universal_function_macro::universal_function;

#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;

#[universal_function]
pub fn demo_function(a: usize, b: usize) -> usize {
    a + b
}
