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
use syn::{parse::Parse, parse::ParseStream, parse_macro_input, Ident, ItemFn, Token};

struct UniversalFunctionArgs {
    web_only: bool,
    desktop_only: bool,
}

impl Parse for UniversalFunctionArgs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let mut web_only = false;
        let mut desktop_only = false;

        while !input.is_empty() {
            let ident: Ident = input.parse()?;
            match ident.to_string().as_str() {
                "web_only" => web_only = true,
                "desktop_only" => desktop_only = true,
                _ => return Err(syn::Error::new(ident.span(), "Unknown argument. Use 'web_only' or 'desktop_only'")),
            }

            if input.peek(Token![,]) {
                input.parse::<Token![,]>()?;
            }
        }

        Ok(UniversalFunctionArgs {
            web_only,
            desktop_only,
        })
    }
}

#[proc_macro_attribute]
pub fn universal_function(args: TokenStream, input: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(input as ItemFn);

    let args = if args.is_empty() {
        UniversalFunctionArgs {
            web_only: false,
            desktop_only: false,
        }
    } else {
        parse_macro_input!(args as UniversalFunctionArgs)
    };

    let attrs = &input_fn.attrs;
    let vis = &input_fn.vis;
    let sig = &input_fn.sig;
    let block = &input_fn.block;

    let expanded = match (args.web_only, args.desktop_only) {
        (true, false) => {
            quote! {
                #(#attrs)*
                #[cfg_attr(feature = "web", wasm_bindgen::prelude::wasm_bindgen)]
                #vis #sig #block
            }
        }
        (false, true) => {
            quote! {
                #(#attrs)*
                #[cfg_attr(feature = "desktop", tauri::command)]
                #vis #sig #block
            }
        }
        _ => {
            quote! {
                #(#attrs)*
                #[cfg_attr(feature = "web", wasm_bindgen::prelude::wasm_bindgen)]
                #[cfg_attr(feature = "desktop", tauri::command)]
                #vis #sig #block
            }
        }
    };

    TokenStream::from(expanded)
}
