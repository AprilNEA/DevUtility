/**
 * Copyright (c) 2023-2025, AprilNEA LLC.
 *
 * Dual licensed under:
 * - GPL-3.0 (open source)
 * - Commercial license (contact us)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for details or contact admin@aprilnea.com
 */

import { execSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";

/**
 * Get the current version from package.json
 */
function getCurrentVersion(): string {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}

/**
 * Get the short git commit hash
 */
function getShortCommitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch (error) {
    console.error("Failed to get git commit hash:", error);
    return "unknown";
  }
}

/**
 * Set environment variable in GitHub Actions
 * Handles both Windows and Unix-like systems
 */
function setGitHubEnv(name: string, value: string): void {
  const githubEnvPath = process.env.GITHUB_ENV;
  if (githubEnvPath) {
    // GitHub Actions environment
    const envLine = `${name}=${value}`;
    appendFileSync(githubEnvPath, `${envLine}\n`, "utf-8");
    console.log(`Set GitHub Actions environment variable: ${name}=${value}`);
  } else {
    // Local environment - just print for now
    console.log(`Export ${name}=${value}`);
  }
}

/**
 * Update version in various configuration files
 */
function updateVersionInFiles(
  version: string,
  updateConfigs: boolean = false,
): void {
  if (!updateConfigs) {
    return;
  }

  // Update package.json
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const originalVersion = packageJson.version;
  packageJson.version = version;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`Updated package.json: ${originalVersion} → ${version}`);

  // Update Cargo.toml files
  const cargoFiles = [
    "dev-utility/Cargo.toml",
    "dev-utility-tauri/Cargo.toml",
    "dev-utility-workers/Cargo.toml",
  ];

  for (const cargoFile of cargoFiles) {
    const cargoPath = join(process.cwd(), cargoFile);
    try {
      let cargoContent = readFileSync(cargoPath, "utf-8");
      const originalContent = cargoContent;

      // Update version in [package] section
      cargoContent = cargoContent.replace(
        /^version = ".*"$/m,
        `version = "${version}"`,
      );

      if (originalContent !== cargoContent) {
        writeFileSync(cargoPath, cargoContent);
        console.log(`Updated ${cargoFile}`);
      }
    } catch (error) {
      console.warn(`Could not update ${cargoFile}:`, error);
    }
  }

  // Check if tauri.conf.json has a version field to update
  const tauriConfPath = join(
    process.cwd(),
    "dev-utility-tauri/tauri.conf.json",
  );
  try {
    const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));

    // Only update if version is not pointing to package.json
    if (tauriConf.version && tauriConf.version !== "../package.json") {
      tauriConf.version = version;
      writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
      console.log(`Updated tauri.conf.json version to ${version}`);
    }
  } catch (error) {
    console.warn("Could not update tauri.conf.json:", error);
  }
}

/**
 * Set the build version based on:
 * 1. Custom version from command line argument
 * 2. Custom version from GitHub Actions input
 * 3. Custom version from environment variable
 * 4. Current version from package.json + git commit hash
 */
function setBuildVersion(): string {
  // Check for command line arguments
  const args = process.argv.slice(2);
  const customVersionFromArgs = args.find((arg) => !arg.startsWith("--"));
  const shouldUpdateFiles = args.includes("--update-files");

  // Check for custom version from GitHub Actions input
  // This is automatically set by GitHub Actions as an environment variable
  const customVersionFromInput = process.env.INPUT_VERSION;

  // Check for custom version from environment variable (for CI/CD)
  const customVersionFromEnv = process.env.CUSTOM_VERSION;

  let version: string;
  let isCustomVersion = true;

  if (customVersionFromArgs) {
    version = customVersionFromArgs;
    console.log(`Using custom version from command line: ${version}`);
  } else if (customVersionFromInput && customVersionFromInput.trim()) {
    version = customVersionFromInput.trim();
    console.log(`Using custom version from GitHub Actions input: ${version}`);
  } else if (customVersionFromEnv) {
    version = customVersionFromEnv;
    console.log(`Using custom version from environment: ${version}`);
  } else {
    // Get current version and add commit hash
    const currentVersion = getCurrentVersion();
    const commitHash = getShortCommitHash();
    version = `${currentVersion}-${commitHash}`;
    console.log(`Generated version: ${version}`);
    isCustomVersion = false;
  }

  // Update files if requested
  if (shouldUpdateFiles && isCustomVersion) {
    updateVersionInFiles(version, true);
  }

  // Export to environment variable for other scripts to use
  setGitHubEnv("CUSTOM_VERSION", version);

  return version;
}

// Show usage if --help is passed
if (process.argv.includes("--help")) {
  console.log(`
Usage: tsx scripts/build-version.ts [version] [options]

Arguments:
  version          Custom version to set (optional)

Options:
  --update-files   Update version in package.json and Cargo.toml files
  --help           Show this help message

Examples:
  tsx scripts/build-version.ts                    # Generate version with git hash
  tsx scripts/build-version.ts 1.2.3              # Set custom version
  tsx scripts/build-version.ts 1.2.3 --update-files  # Set and update all files

Environment variables:
  CUSTOM_VERSION   Custom version (alternative to command line)
  INPUT_VERSION    GitHub Actions input version
  GITHUB_ENV       GitHub Actions environment file path
`);
  process.exit(0);
}

// Main execution
const version = setBuildVersion();
console.log(`Custom version set to: ${version}`);

// Exit with version for shell scripts to capture
process.stdout.write(version);
