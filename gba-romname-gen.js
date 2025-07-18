#!/usr/bin/env node
/**
 * GBA ROM Name Generator
 *
 * @author Pedro Ladaria <pedro.ladaria@gmail.com>
 * @author Gemini (Modernization)
 */
"use strict";

import { readdir, open } from "fs/promises";
import path from "path";

const SPACE = " ";

/**
 * Recursively finds all .gba files in a directory.
 * @param {string} dir - The directory to search.
 * @returns {Promise<string[]>} A list of full paths to .gba files.
 */
async function getGbaFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        return getGbaFiles(res);
      }
      return res;
    }),
  );
  return files.flat().filter((file) => /.gba$/i.test(file));
}

/**
 * Extracts Game Title and Game Code from a GBA ROM header.
 * @param {string} filename - The path to the .gba file.
 * @returns {Promise<{gameTitle: string, gameCode: string}|null>}
 */
async function extractRomInfo(filename) {
  let filehandle;
  try {
    filehandle = await open(filename, "r");
    const romData = Buffer.alloc(0xc0);
    await filehandle.read(romData, 0, romData.length, 0);

    return {
      gameTitle: romData
        .slice(0xa0, 0xa0 + 12)
        .toString("utf8")
        .replace(/\0/g, SPACE),
      gameCode: romData
        .slice(0xac, 0xac + 4)
        .toString("utf8")
        .replace(/\0/g, SPACE),
    };
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    return null;
  } finally {
    await filehandle?.close();
  }
}

/**
 * Cleans a filename to create a display title.
 * @param {string} filename - The original filename.
 * @returns {string} The cleaned title.
 */
function cleanTitle(filename) {
  return path
    .basename(filename)
    .replace(/\.gba$/i, "") // strip extension
    .replace(/^\d{4}\s*[-]?\s*/, "") // strip leading ROM number
    .replace(/(\s*\[:?.*\]|\s*\(:?.*\))+$/, "") // strip trailing [] or ()
    .replace(/\s+/g, SPACE) // remove extra spaces
    .trim();
}

/**
 * Main function.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1 || args.some((v) => v === "--help" || v === "-h")) {
    console.log(`Usage:\n\t${path.basename(process.argv[1])} <gba_roms_path>`);
    process.exit();
  }

  const [romsPath] = args;

  try {
    const gbaFiles = await getGbaFiles(romsPath);

    for (const file of gbaFiles) {
      const romInfo = await extractRomInfo(file);
      if (!romInfo) continue;

      const key = romInfo.gameTitle + romInfo.gameCode;

      if (!key.trim()) {
        continue; // skip roms without title and code
      }

      // Check if the key contains non-ASCII characters
      if (Buffer.byteLength(key) !== key.length) {
        continue; // skip roms without ascii title or code
      }

      const title = cleanTitle(file);

      // Use CRLF for compatibility with Windows-based tools like EZ4 Client
      process.stdout.write(`${key}|${romInfo.gameCode}|${title}\r\n`);
    }
  } catch (error) {
    console.error(`Error processing ROMs in ${romsPath}:`, error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
