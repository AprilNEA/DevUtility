use html5ever::parse_document;
use html5ever::serialize::{serialize, SerializeOpts};
use html5ever::tendril::TendrilSink;
use markup5ever_rcdom::{RcDom, SerializableHandle};
use universal_function_macro::universal_function;

use crate::error::UtilityError;

#[universal_function(desktop_only)]
fn format_html(html: &str) -> Result<String, UtilityError> {
    let dom = parse_document(RcDom::default(), Default::default())
        .from_utf8()
        .read_from(&mut html.as_bytes())?;

    let mut output = Vec::new();
    let document = dom.document.clone();

    serialize(
        &mut output,
        &SerializableHandle::from(document),
        SerializeOpts::default(),
    )?;

    Ok(String::from_utf8(output)?)
}
