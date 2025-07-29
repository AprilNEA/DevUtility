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

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { platform } from "node:os";
import { basename, join } from "node:path";

/**
 * Parse artifact paths from JSON string
 * Handles both string arrays and JSON strings containing arrays
 */
function parseArtifactPaths(jsonInput: string): string[] {
  try {
    // First, try to parse as JSON directly
    const parsed = JSON.parse(jsonInput);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If it's a string, try parsing it again (double-encoded JSON)
    if (typeof parsed === "string") {
      const doubleParsed = JSON.parse(parsed);
      if (Array.isArray(doubleParsed)) {
        return doubleParsed;
      }
    }
    throw new Error("Parsed value is not an array");
  } catch (error) {
    console.error("Failed to parse artifact paths:", error);
    console.error("Input was:", jsonInput);
    return [];
  }
}

/**
 * Copy build artifacts to a target directory
 * Works across Windows, macOS, and Linux
 */
function copyArtifacts(
  artifactPaths: string[],
  targetDir: string = "artifacts",
): void {
  // Create target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  let copiedCount = 0;
  let skippedCount = 0;

  for (const filePath of artifactPaths) {
    // Clean the path (remove quotes if present)
    const cleanPath = filePath.replace(/^["']|["']$/g, "").trim();

    if (!cleanPath) {
      console.warn("Skipping empty path");
      skippedCount++;
      continue;
    }

    try {
      // Check if file exists
      if (!existsSync(cleanPath)) {
        console.warn(`File not found: ${cleanPath}`);
        skippedCount++;
        continue;
      }

      // Check if it's actually a file (not a directory)
      const stats = statSync(cleanPath);
      if (!stats.isFile()) {
        console.warn(`Not a file: ${cleanPath}`);
        skippedCount++;
        continue;
      }

      // Get the filename
      const filename = basename(cleanPath);
      const targetPath = join(targetDir, filename);

      // Copy the file
      console.log(`Copying ${cleanPath} to ${targetPath}`);
      copyFileSync(cleanPath, targetPath);
      copiedCount++;
    } catch (error) {
      console.error(`Failed to copy ${cleanPath}:`, error);
      skippedCount++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Files copied: ${copiedCount}`);
  console.log(`- Files skipped: ${skippedCount}`);
  console.log(`- Total processed: ${artifactPaths.length}`);
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  // Show usage if --help is passed or no arguments
  if (args.includes("--help") || args.length === 0) {
    console.log(`
Usage: tsx scripts/copy-artifacts.ts <artifact-paths-json> [target-dir]

Arguments:
  artifact-paths-json  JSON array of file paths to copy
  target-dir           Target directory (default: "artifacts")

Options:
  --help               Show this help message

Examples:
  # Copy artifacts using JSON string
  tsx scripts/copy-artifacts.ts '["path/to/file1.dmg", "path/to/file2.app"]'
  
  # Copy to custom directory
  tsx scripts/copy-artifacts.ts '["file.exe"]' dist/

Environment:
  Platform: ${platform()}
  Node version: ${process.version}
`);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  // Get JSON input from first argument
  const jsonInput = args[0];
  const targetDir = args[1] || "artifacts";

  // Parse artifact paths
  const artifactPaths = parseArtifactPaths(jsonInput);

  if (artifactPaths.length === 0) {
    console.error("No valid artifact paths found");
    process.exit(1);
  }

  console.log(`Found ${artifactPaths.length} artifact(s) to copy`);
  console.log(`Target directory: ${targetDir}`);
  console.log(`Platform: ${platform()}\n`);

  // Copy artifacts
  copyArtifacts(artifactPaths, targetDir);
}

// Run the script
main();
