// Copyright (c) 2023-2026, AprilNEA LLC.
//
// Dual licensed under:
// - GPL-3.0 (open source)
// - Commercial license (contact us)
//
// See LICENSE file for details or contact admin@aprilnea.com

use crate::error::UtilityError;
use universal_function_macro::universal_function;

/// Reformat HTML with two-space indentation.
///
/// Pragmatic single-pass tokenizer. Does not validate markup, does not
/// resolve entities, does not re-wrap attributes — it just normalizes
/// whitespace between tags and indents nested elements. Good enough for
/// human-readable debug output; not a replacement for Prettier.
#[universal_function(desktop_only)]
pub fn format_html(input: &str) -> Result<String, UtilityError> {
    let bytes = input.as_bytes();
    let mut out = String::new();
    let mut indent: i32 = 0;
    let mut pos = 0;

    while pos < bytes.len() {
        // Skip leading whitespace between tokens.
        while pos < bytes.len() && bytes[pos].is_ascii_whitespace() {
            pos += 1;
        }
        if pos >= bytes.len() {
            break;
        }

        if bytes[pos] == b'<' {
            let start = pos;

            // --- CDATA section: <![CDATA[ ... ]]> ---
            if bytes[pos..].starts_with(b"<![CDATA[") {
                pos += 9; // skip "<![CDATA["
                loop {
                    if pos + 3 <= bytes.len() && bytes[pos..pos + 3] == *b"]]>" {
                        pos += 3;
                        break;
                    }
                    if pos >= bytes.len() {
                        break;
                    }
                    pos += 1;
                }
                let cdata = std::str::from_utf8(&bytes[start..pos])
                    .map_err(|e| UtilityError::ParseError(e.to_string()))?;
                push_indent(&mut out, indent);
                out.push_str(cdata);
                out.push('\n');
                continue;
            }

            // --- HTML comment: <!-- ... --> ---
            if bytes[pos..].starts_with(b"<!--") {
                pos += 4;
                loop {
                    if pos + 3 <= bytes.len() && bytes[pos..pos + 3] == *b"-->" {
                        pos += 3;
                        break;
                    }
                    if pos >= bytes.len() {
                        break;
                    }
                    pos += 1;
                }
                let tag = std::str::from_utf8(&bytes[start..pos])
                    .map_err(|e| UtilityError::ParseError(e.to_string()))?;
                push_indent(&mut out, indent);
                out.push_str(tag);
                out.push('\n');
                continue;
            }

            // --- Regular tag: scan to `>` respecting quoted attribute values ---
            pos += 1; // skip the opening `<`
            let mut in_quote: Option<u8> = None;
            loop {
                if pos >= bytes.len() {
                    break;
                }
                let b = bytes[pos];
                match in_quote {
                    Some(q) if b == q => {
                        in_quote = None;
                        pos += 1;
                    }
                    Some(_) => {
                        pos += 1;
                    }
                    None => {
                        if b == b'"' || b == b'\'' {
                            in_quote = Some(b);
                            pos += 1;
                        } else if b == b'>' {
                            pos += 1;
                            break;
                        } else {
                            pos += 1;
                        }
                    }
                }
            }

            let tag = std::str::from_utf8(&bytes[start..pos])
                .map_err(|e| UtilityError::ParseError(e.to_string()))?;

            let is_closing = tag.starts_with("</");
            let is_comment_or_decl = tag.starts_with("<!") || tag.starts_with("<?");
            let is_self_closing = tag.ends_with("/>")
                || (!is_comment_or_decl && !is_closing && is_void_element(tag));

            if is_closing {
                indent = (indent - 1).max(0);
            }

            push_indent(&mut out, indent);
            out.push_str(tag);
            out.push('\n');

            if !is_closing && !is_self_closing && !is_comment_or_decl {
                indent += 1;

                // --- Raw-text elements: <script> / <style> ---
                let tag_name = raw_text_tag_name(tag);
                if let Some(name) = tag_name {
                    // Scan forward to the matching closing tag (case-insensitive).
                    let close_pat = format!("</{}>", name);
                    let close_pat_bytes: Vec<u8> = close_pat.bytes().map(|b| b.to_ascii_lowercase()).collect();
                    let n = close_pat_bytes.len();
                    let raw_start = pos;
                    let mut found_close = false;
                    while pos < bytes.len() {
                        // Check for closing tag at current position using byte comparison
                        // (avoids UTF-8 boundary issues from str::from_utf8).
                        if pos + n <= bytes.len() {
                            let matches = bytes[pos..pos + n]
                                .iter()
                                .zip(close_pat_bytes.iter())
                                .all(|(a, b)| a.to_ascii_lowercase() == *b);
                            if matches {
                                found_close = true;
                                break;
                            }
                        }
                        pos += 1;
                    }
                    // Emit the raw interior verbatim (no re-indenting).
                    let raw_content = std::str::from_utf8(&bytes[raw_start..pos])
                        .map_err(|e| UtilityError::ParseError(e.to_string()))?;
                    if !raw_content.is_empty() {
                        out.push_str(raw_content);
                        if !raw_content.ends_with('\n') {
                            out.push('\n');
                        }
                    }
                    if found_close {
                        // Consume the closing tag.
                        let close_start = pos;
                        pos += n;
                        let close_tag = std::str::from_utf8(&bytes[close_start..pos])
                            .map_err(|e| UtilityError::ParseError(e.to_string()))?;
                        indent = (indent - 1).max(0);
                        push_indent(&mut out, indent);
                        out.push_str(close_tag);
                        out.push('\n');
                    } else {
                        // No closing tag found (truncated/malformed input): undo the
                        // indent increment so subsequent tags are not corrupted.
                        indent = (indent - 1).max(0);
                    }
                    continue;
                }
            }
        } else {
            let start = pos;
            while pos < bytes.len() && bytes[pos] != b'<' {
                pos += 1;
            }
            let text = std::str::from_utf8(&bytes[start..pos])
                .map_err(|e| UtilityError::ParseError(e.to_string()))?;
            let trimmed = text.trim();
            if !trimmed.is_empty() {
                push_indent(&mut out, indent);
                out.push_str(trimmed);
                out.push('\n');
            }
        }
    }

    Ok(out)
}

fn push_indent(out: &mut String, indent: i32) {
    for _ in 0..indent {
        out.push_str("  ");
    }
}

fn is_void_element(tag: &str) -> bool {
    const VOID: &[&str] = &[
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param",
        "source", "track", "wbr",
    ];
    let inner = tag
        .trim_start_matches('<')
        .trim_end_matches('>')
        .trim_end_matches('/');
    let name = inner
        .split(|c: char| c.is_whitespace())
        .next()
        .unwrap_or("")
        .to_ascii_lowercase();
    VOID.contains(&name.as_str())
}

/// If `tag` is an opening `<script>` or `<style>` tag, return the lowercase
/// tag name; otherwise return `None`.
fn raw_text_tag_name(tag: &str) -> Option<&'static str> {
    let inner = tag
        .trim_start_matches('<')
        .trim_end_matches('>')
        .trim_end_matches('/');
    let name = inner
        .split(|c: char| c.is_whitespace())
        .next()
        .unwrap_or("")
        .to_ascii_lowercase();
    match name.as_str() {
        "script" => Some("script"),
        "style" => Some("style"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn indents_nested_elements() {
        let input = "<div><p>hello</p></div>";
        let expected = "<div>\n  <p>\n    hello\n  </p>\n</div>\n";
        assert_eq!(format_html(input).unwrap(), expected);
    }

    #[test]
    fn handles_void_elements() {
        let input = "<p><br><img src=\"a.png\"></p>";
        let out = format_html(input).unwrap();
        assert!(out.contains("<br>"));
        assert!(!out.contains("</br>"));
    }

    #[test]
    fn preserves_comments() {
        let input = "<!-- hi --><div>x</div>";
        let out = format_html(input).unwrap();
        assert!(out.contains("<!-- hi -->"));
    }

    // Bug fix 1: quoted attribute values containing `>`
    #[test]
    fn quoted_attribute_with_gt() {
        let input = r#"<div><input value=">"></div>"#;
        let out = format_html(input).unwrap();
        // The input tag must be preserved intact, not split at the `>` inside quotes.
        assert!(out.contains(r#"<input value=">">"#));
        // And the closing div must still appear.
        assert!(out.contains("</div>"));
    }

    #[test]
    fn single_quoted_attribute_with_gt() {
        let input = "<div><input value='>'></div>";
        let out = format_html(input).unwrap();
        assert!(out.contains("<input value='>'>"));
        assert!(out.contains("</div>"));
    }

    // Bug fix 2: HTML comments containing `>`
    #[test]
    fn comment_with_gt_inside() {
        let input = "<!-- x > y --><p>ok</p>";
        let out = format_html(input).unwrap();
        assert!(out.contains("<!-- x > y -->"));
        assert!(out.contains("<p>"));
        assert!(out.contains("ok"));
    }

    // Bug fix 3: <script> and <style> raw-text content is emitted verbatim
    #[test]
    fn script_raw_text_not_reindented() {
        let input = "<html><head><script>if(a>b){alert(1);}</script></head></html>";
        let out = format_html(input).unwrap();
        // Raw content must appear verbatim (not split on `>`).
        assert!(out.contains("if(a>b){alert(1);}"));
        // Closing tags must still be present and correctly indented.
        assert!(out.contains("</script>"));
        assert!(out.contains("</head>"));
        assert!(out.contains("</html>"));
    }

    #[test]
    fn style_raw_text_not_reindented() {
        let input = "<html><head><style>a>b{color:red}</style></head></html>";
        let out = format_html(input).unwrap();
        assert!(out.contains("a>b{color:red}"));
        assert!(out.contains("</style>"));
    }

    // Fix 1: unclosed <script> must not leak indent into subsequent tags
    #[test]
    fn unclosed_script_does_not_leak_indent() {
        // No closing </script> — truncated input.
        let input = "<html><body><script>alert(1)";
        let out = format_html(input).unwrap();
        // </body> and </html> are absent, but the emitted lines must not be
        // over-indented.  The opening <html> must be at indent 0.
        let first_line = out.lines().next().unwrap_or("");
        assert_eq!(first_line, "<html>", "first tag must be at indent 0");
        // No line should start with more than 4 leading spaces
        // (i.e. indent must not have leaked beyond the expected nesting depth).
        for line in out.lines() {
            let leading = line.len() - line.trim_start_matches(' ').len();
            assert!(
                leading <= 4,
                "unexpected over-indentation ({} spaces) in: {:?}",
                leading,
                line
            );
        }
    }

    // Fix 2: CDATA block must be emitted verbatim, not re-indented or split
    #[test]
    fn cdata_preserved() {
        let input = "<root><![CDATA[hello > world & <tag>]]></root>";
        let out = format_html(input).unwrap();
        assert!(
            out.contains("<![CDATA[hello > world & <tag>]]>"),
            "CDATA block must appear verbatim; got:\n{out}"
        );
        assert!(out.contains("</root>"));
    }

    // Fix 4: CDATA closing delimiter exactly at end of input must not be missed
    #[test]
    fn cdata_close_at_end_of_input() {
        // Minimum well-formed CDATA block: closing ]]> is the very last 3 bytes.
        let input = "<![CDATA[x]]>";
        let out = format_html(input).unwrap();
        assert!(
            out.contains("<![CDATA[x]]>"),
            "CDATA block must be emitted intact when ]]> is at end of input; got:\n{out}"
        );
    }

    // Fix 3: UTF-8 multibyte characters inside raw text must not break close-tag detection
    #[test]
    fn raw_text_close_at_utf8_boundary() {
        // The raw content contains multibyte UTF-8 (Japanese).
        let input = "<html><head><script>var s = \"日本語\"; </script></head></html>";
        let out = format_html(input).unwrap();
        assert!(
            out.contains("var s = \"日本語\";"),
            "multibyte content must be preserved; got:\n{out}"
        );
        assert!(
            out.contains("</script>"),
            "close script tag must be found; got:\n{out}"
        );
        assert!(
            out.contains("</head>"),
            "subsequent tags must still appear; got:\n{out}"
        );
        assert!(
            out.contains("</html>"),
            "document close must appear; got:\n{out}"
        );
    }
}
