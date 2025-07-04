// Copyright (c) 2023-2025, AprilNEA LLC.
//
// Dual licensed under:
// - GPL-3.0 (open source)
// - Commercial license (contact us)
//
// This program is free software: you can redistribute it and/or modify
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// See LICENSE file for details or contact admin@aprilnea.com

use std::net::Ipv4Addr;
use universal_function_macro::universal_function;

/// The result of analyzing an IPv4 address and subnet mask.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IpAnalysisResult {
    /// The network address (first address in the subnet)
    pub network_address: Ipv4Addr,
    /// The broadcast address (last address in the subnet)
    pub broadcast_address: Ipv4Addr,
    /// The first usable host address in the subnet (None if not applicable)
    pub first_usable_host: Option<Ipv4Addr>,
    /// The last usable host address in the subnet (None if not applicable)
    pub last_usable_host: Option<Ipv4Addr>,
    /// The total number of addresses in the subnet (including network and broadcast)
    pub total_hosts: u32,
    /// The number of usable host addresses (excluding network and broadcast)
    pub usable_hosts: u32,
    /// The subnet mask
    pub subnet_mask: Ipv4Addr,
    /// The CIDR prefix length (e.g., 24 for 255.255.255.0)
    pub cidr: u8,
}

/// Converts an IPv4 address to a 32-bit unsigned integer.
///
/// # Arguments
///
/// * `ip` - An IPv4 address.
///
/// # Returns
///
/// A 32-bit unsigned integer representation of the IPv4 address.
fn ip_to_u32(ip: Ipv4Addr) -> u32 {
    u32::from(ip)
}

/// Converts a 32-bit unsigned integer to an IPv4 address.
///
/// # Arguments
///
/// * `val` - A 32-bit unsigned integer.
///
/// # Returns
///
/// An IPv4 address corresponding to the integer value.
fn u32_to_ip(val: u32) -> Ipv4Addr {
    Ipv4Addr::from(val)
}

/// Converts a subnet mask to its CIDR prefix length (number of 1 bits).
///
/// # Arguments
///
/// * `mask` - An IPv4 subnet mask.
///
/// # Returns
///
/// The CIDR prefix length as a `u8`.
fn mask_to_cidr(mask: Ipv4Addr) -> u8 {
    ip_to_u32(mask).count_ones() as u8
}

/// Converts a CIDR prefix length to a subnet mask.
///
/// # Arguments
///
/// * `cidr` - The CIDR prefix length (0-32).
///
/// # Returns
///
/// The corresponding IPv4 subnet mask.
fn cidr_to_mask(cidr: u8) -> Ipv4Addr {
    let mask = if cidr == 0 { 0 } else { (!0u32) << (32 - cidr) };
    u32_to_ip(mask)
}

/// Analyzes an IPv4 address and subnet mask, returning network information.
///
/// # Arguments
///
/// * `ip` - The IPv4 address to analyze.
/// * `mask` - The subnet mask to use for analysis.
///
/// # Returns
///
/// An `Option<IpAnalysisResult>` containing network, broadcast, usable hosts, etc., or `None` if the mask is invalid.
pub fn analyze_ipv4_mask(ip: Ipv4Addr, mask: Ipv4Addr) -> Option<IpAnalysisResult> {
    let ip_u32 = ip_to_u32(ip);
    let mask_u32 = ip_to_u32(mask);
    let cidr = mask_to_cidr(mask);
    // Check for invalid mask (all zeros but nonzero CIDR)
    if mask_u32 == 0 && cidr != 0 {
        return None;
    }
    // Calculate network and broadcast addresses
    let network = ip_u32 & mask_u32;
    let broadcast = network | !mask_u32;
    // Calculate total number of addresses in the subnet
    let total_hosts = if cidr < 32 {
        2u32.pow((32 - cidr) as u32)
    } else {
        1
    };
    // Calculate usable host addresses (excluding network and broadcast)
    let usable_hosts = if cidr < 31 {
        total_hosts - 2
    } else if cidr == 31 {
        0
    } else {
        0
    };
    // Determine the first and last usable host addresses
    let first_usable = if usable_hosts > 0 {
        Some(u32_to_ip(network + 1))
    } else {
        None
    };
    let last_usable = if usable_hosts > 0 {
        Some(u32_to_ip(broadcast - 1))
    } else {
        None
    };
    Some(IpAnalysisResult {
        network_address: u32_to_ip(network),
        broadcast_address: u32_to_ip(broadcast),
        first_usable_host: first_usable,
        last_usable_host: last_usable,
        total_hosts,
        usable_hosts,
        subnet_mask: mask,
        cidr,
    })
}

/// Analyzes an IPv4 address and CIDR prefix, returning network information.
///
/// # Arguments
///
/// * `ip` - The IPv4 address to analyze.
/// * `cidr` - The CIDR prefix length (0-32).
///
/// # Returns
///
/// An `Option<IpAnalysisResult>` containing network, broadcast, usable hosts, etc., or `None` if the CIDR is invalid.
pub fn analyze_ipv4_cidr(ip: Ipv4Addr, cidr: u8) -> Option<IpAnalysisResult> {
    if cidr > 32 {
        return None;
    }
    let mask = cidr_to_mask(cidr);
    analyze_ipv4_mask(ip, mask)
}


// pub fn analyze_ipv4(ip: Ipv4Addr) -> Option<IpAnalysisResult> {
    
// }