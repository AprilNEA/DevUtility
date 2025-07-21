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

import { readFileSync, writeFileSync } from "node:fs";

// Define the files to update
const files = [
  {
    path: "package.json",
    updateVersion: (content: string, newVersion: string) => {
      const pkg = JSON.parse(content);
      pkg.version = newVersion;
      return JSON.stringify(pkg, null, 2);
    },
  },
  {
    path: "dev-utility/Cargo.toml",
    updateVersion: (content: string, newVersion: string) => {
      return content.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
    },
  },
  {
    path: "dev-utility-tauri/Cargo.toml",
    updateVersion: (content: string, newVersion: string) => {
      return content.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
    },
  },
  {
    path: "dev-utility-workers/Cargo.toml",
    updateVersion: (content: string, newVersion: string) => {
      return content.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
    },
  },
];

type VersionType = "patch" | "minor" | "major" | "alpha" | "beta" | "rc";

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: {
    type: "alpha" | "beta" | "rc";
    version: number;
  };
}

function parseVersion(version: string): ParsedVersion {
  const match = version.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)\.(\d+))?$/,
  );
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  const [, major, minor, patch, prereleaseType, prereleaseVersion] = match;
  const result: ParsedVersion = {
    major: parseInt(major),
    minor: parseInt(minor),
    patch: parseInt(patch),
  };

  if (prereleaseType && prereleaseVersion) {
    result.prerelease = {
      type: prereleaseType as "alpha" | "beta" | "rc",
      version: parseInt(prereleaseVersion),
    };
  }

  return result;
}

function formatVersion(parsed: ParsedVersion): string {
  let version = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  if (parsed.prerelease) {
    version += `-${parsed.prerelease.type}.${parsed.prerelease.version}`;
  }
  return version;
}

function bumpVersion(versionType: VersionType = "patch") {
  // Read current version from package.json
  const packageJsonPath = "package.json";
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const currentVersion = packageJson.version;

  // Parse current version
  const parsed = parseVersion(currentVersion);
  let newVersion: string;

  switch (versionType) {
    case "major":
      parsed.major += 1;
      parsed.minor = 0;
      parsed.patch = 0;
      parsed.prerelease = undefined;
      break;

    case "minor":
      parsed.minor += 1;
      parsed.patch = 0;
      parsed.prerelease = undefined;
      break;

    case "patch":
      if (parsed.prerelease) {
        // If current version is a prerelease, patch removes the prerelease tag
        parsed.prerelease = undefined;
      } else {
        parsed.patch += 1;
      }
      break;

    case "alpha":
      if (parsed.prerelease?.type === "alpha") {
        // Increment alpha version
        parsed.prerelease.version += 1;
      } else {
        // Start new alpha version
        if (!parsed.prerelease) {
          // If stable version, increment patch for next alpha
          parsed.patch += 1;
        }
        parsed.prerelease = { type: "alpha", version: 1 };
      }
      break;

    case "beta":
      if (parsed.prerelease?.type === "beta") {
        // Increment beta version
        parsed.prerelease.version += 1;
      } else if (parsed.prerelease?.type === "alpha") {
        // Promote from alpha to beta
        parsed.prerelease = { type: "beta", version: 1 };
      } else {
        // Start new beta version
        if (!parsed.prerelease) {
          // If stable version, increment patch for next beta
          parsed.patch += 1;
        }
        parsed.prerelease = { type: "beta", version: 1 };
      }
      break;

    case "rc":
      if (parsed.prerelease?.type === "rc") {
        // Increment rc version
        parsed.prerelease.version += 1;
      } else if (
        parsed.prerelease?.type === "alpha" ||
        parsed.prerelease?.type === "beta"
      ) {
        // Promote from alpha/beta to rc
        parsed.prerelease = { type: "rc", version: 1 };
      } else {
        // Start new rc version
        if (!parsed.prerelease) {
          // If stable version, increment patch for next rc
          parsed.patch += 1;
        }
        parsed.prerelease = { type: "rc", version: 1 };
      }
      break;
  }

  newVersion = formatVersion(parsed);
  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

  // Update all files
  files.forEach((file) => {
    try {
      const content = readFileSync(file.path, "utf-8");
      const updatedContent = file.updateVersion(content, newVersion);
      writeFileSync(file.path, updatedContent);
      console.log(`✓ Updated ${file.path}`);
    } catch (error) {
      console.error(`✗ Failed to update ${file.path}:`, error);
    }
  });

  console.log(`Version bump complete: ${newVersion}`);
}

// Get version type from command line arguments
const versionType = process.argv[2] as VersionType;
const validTypes: VersionType[] = [
  "patch",
  "minor",
  "major",
  "alpha",
  "beta",
  "rc",
];

if (!versionType || !validTypes.includes(versionType)) {
  console.error(`Usage: npm run bump-version <${validTypes.join("|")}>`);
  console.error("\nExamples:");
  console.error("  npm run bump-version patch   # 1.0.0 -> 1.0.1");
  console.error("  npm run bump-version minor   # 1.0.0 -> 1.1.0");
  console.error("  npm run bump-version major   # 1.0.0 -> 2.0.0");
  console.error("  npm run bump-version alpha   # 1.0.0 -> 1.0.1-alpha.1");
  console.error(
    "  npm run bump-version beta    # 1.0.1-alpha.1 -> 1.0.1-beta.1",
  );
  console.error("  npm run bump-version rc      # 1.0.1-beta.1 -> 1.0.1-rc.1");
  process.exit(1);
}

bumpVersion(versionType);
