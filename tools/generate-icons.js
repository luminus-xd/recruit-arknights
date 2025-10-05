#!/usr/bin/env node
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const defaultInput = path.join(projectRoot, "public", "img", "icon.png");

async function main() {
  const args = process.argv.slice(2);
  let inputPath = defaultInput;
  let quiet = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if ((arg === "-i" || arg === "--input") && args[i + 1]) {
      inputPath = path.resolve(process.cwd(), args[i + 1]);
      i += 1;
    } else if (arg === "-q" || arg === "--quiet") {
      quiet = true;
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      return;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  const inputReadablePath = path.relative(projectRoot, inputPath) || path.basename(inputPath);

  try {
    await fs.access(inputPath);
  } catch (error) {
    throw new Error(`Input image not found at ${inputPath}`);
  }

  const { default: pngToIco } = await import("png-to-ico");

  const outputRoot = path.join(projectRoot, "public");
  const targets = [
    { file: "favicon-16x16.png", size: 16 },
    { file: "favicon-32x32.png", size: 32 },
    { file: "favicon-48x48.png", size: 48 },
    { file: "favicon-64x64.png", size: 64 },
    { file: "favicon-128x128.png", size: 128 },
    { file: "favicon-192x192.png", size: 192 },
    { file: path.join("pwa-icons", "icon-192x192.png"), size: 192 },
    { file: path.join("pwa-icons", "icon-256x256.png"), size: 256 },
    { file: path.join("pwa-icons", "icon-384x384.png"), size: 384 },
    { file: path.join("pwa-icons", "icon-512x512.png"), size: 512 },
    { file: "apple-touch-icon.png", size: 180 },
  ];

  await Promise.all(
    Array.from(
      new Set(targets.map((target) => path.dirname(target.file)))
    )
      .filter((dir) => dir !== ".")
      .map((dir) => fs.mkdir(path.join(outputRoot, dir), { recursive: true }))
  );

  const results = [];

  for (const target of targets) {
    const outputPath = path.join(outputRoot, target.file);
    await sharp(inputPath)
      .resize(target.size, target.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(outputPath);
    results.push({ type: "png", path: outputPath, size: target.size });
  }

  const faviconPngSizes = [16, 32, 48, 64, 128, 192];
  const faviconBuffers = [];
  for (const size of faviconPngSizes) {
    const buffer = await sharp(inputPath)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    faviconBuffers.push(buffer);
  }

  const faviconIco = await pngToIco(faviconBuffers);
  const faviconIcoPath = path.join(projectRoot, "src", "app", "favicon.ico");
  await fs.writeFile(faviconIcoPath, faviconIco);
  results.push({ type: "ico", path: faviconIcoPath, size: faviconPngSizes.join("/") });

  if (!quiet) {
    console.log(`Generated icons from ${inputReadablePath}`);
    for (const result of results) {
      console.log(` • ${path.relative(projectRoot, result.path)} (${result.type === "ico" ? `${result.type} ${result.size}` : `${result.type} ${result.size}x${result.size}`})`);
    }
  }
}

function printHelp() {
  console.log(`Usage: node tools/generate-icons.js [options]\n\nOptions:\n  -i, --input <path>   Source image (default: public/img/icon.png)\n  -q, --quiet          Suppress output\n  -h, --help           Show this help message`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
