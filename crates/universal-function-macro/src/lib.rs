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

use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, ItemFn};

#[proc_macro_attribute]
pub fn universal_function(_args: TokenStream, input: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(input as ItemFn);

    let attrs = &input_fn.attrs;
    let vis = &input_fn.vis;
    let sig = &input_fn.sig;
    let block = &input_fn.block;

    let expanded = quote! {
        #(#attrs)*
        #[cfg_attr(feature = "web", wasm_bindgen::wasm_bindgen)]
        #[cfg_attr(feature = "desktop", tauri::command)]
        #vis #sig #block
    };

    TokenStream::from(expanded)
}
