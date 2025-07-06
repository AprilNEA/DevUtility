use std::collections::HashMap;

use crate::error::UtilityError;
use hidapi::{DeviceInfo, HidApi};
use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]

pub struct HidDeviceInfo {
    pub vendor_id: u16,
    pub product_id: u16,
    pub manufacturer_string: Option<String>,
    pub product_string: Option<String>,
    pub serial_number: Option<String>,
    pub path: String,
    pub interface_number: i32,
    pub usage_page: u16,
    pub usage: u16,
}

impl From<DeviceInfo> for HidDeviceInfo {
    fn from(device_info: DeviceInfo) -> Self {
        HidDeviceInfo {
            vendor_id: device_info.vendor_id(),
            product_id: device_info.product_id(),
            manufacturer_string: device_info.manufacturer_string().map(|s| s.to_string()),
            product_string: device_info.product_string().map(|s| s.to_string()),
            serial_number: device_info.serial_number().map(|s| s.to_string()),
            path: device_info.path().to_string_lossy().to_string(),
            interface_number: device_info.interface_number(),
            usage_page: device_info.usage_page(),
            usage: device_info.usage(),
        }
    }
}

#[derive(Debug)]
pub struct LogicalDevice {
    pub vendor_id: u16,
    pub product_id: u16,
    pub device_path: String,
    pub product_name: Option<String>,
    pub manufacturer_name: Option<String>,
    pub serial_number: Option<String>,
    pub interfaces: Vec<HidInterface>,
}

#[derive(Debug)]
pub struct HidInterface {
    pub usage_page: u16,
    pub usage: u16,
    // pub capabilities: Vec<String>,
}

#[universal_function(desktop_only)]
pub fn list_hid_devices() -> Result<Vec<HidDeviceInfo>, UtilityError> {
    let api = HidApi::new().map_err(|e| UtilityError::ApiError(e.to_string()))?;

    let devices = api
        .device_list()
        .map(|device_info| HidDeviceInfo::from(device_info.clone()))
        .collect();

    Ok(devices)
}

// pub fn get_logical_devices() -> Result<Vec<LogicalDevice>, UtilityError> {
//     let devices = list_hid_devices()?;

//     let mut logical_devices: HashMap<String, LogicalDevice> = HashMap::new();

//     for device in devices {
//         let device_path = device.path;
//         let logical_device = logical_devices.entry(device_path).or_insert(LogicalDevice {
//             vendor_id: device.vendor_id,
//             product_id: device.product_id,
//             device_path: device.path,
//             product_name: device.product_string,
//             manufacturer_name: device.manufacturer_string,
//             serial_number: device.serial_number,
//             interfaces: Vec::new(),
//         });
//     }

//     // Ok(logical_devices.values().cloned().collect())
// }
