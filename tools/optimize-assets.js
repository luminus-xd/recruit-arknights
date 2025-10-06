#!/usr/bin/env node

const path = require("node:path");
const fs = require("node:fs/promises");
const sharp = require("sharp");
const {
  optimizeJson,
  parseArguments,
  DEFAULT_INPUT_PATH,
  formatFileSize,
} = require("./optimize-json.js");

const DEFAULT_ICON_DIR = path.resolve(__dirname, "../public/img/operators");
const TARGET_SIZE = 96;
const WEBP_QUALITY = 90;

function toWebpPath(value) {
  if (typeof value !== "string") {
    return value;
  }

  const [pathPart, query = ""] = value.split("?");
  if (!pathPart.match(/\.png$/i)) {
    return value;
  }

  const convertedPath = pathPart.replace(/\.png$/i, ".webp");
  return query.length > 0 ? `${convertedPath}?${query}` : convertedPath;
}

function convertOperatorRecord(record, changeCounter) {
  if (!record || typeof record !== "object") {
    return record;
  }

  if (typeof record.imgPath !== "string") {
    return record;
  }

  const nextImgPath = toWebpPath(record.imgPath);
  if (nextImgPath === record.imgPath) {
    return record;
  }

  changeCounter.count += 1;
  return {
    ...record,
    imgPath: nextImgPath,
  };
}

function transformOperatorsToWebp(data) {
  const changeCounter = { count: 0 };

  if (Array.isArray(data)) {
    const converted = data.map((item) => convertOperatorRecord(item, changeCounter));
    logImgPathChange(changeCounter.count);
    return converted;
  }

  if (data && typeof data === "object") {
    const cloned = { ...data };
    if (Array.isArray(cloned.operators)) {
      cloned.operators = cloned.operators.map((item) => convertOperatorRecord(item, changeCounter));
    }
    logImgPathChange(changeCounter.count);
    return cloned;
  }

  logImgPathChange(changeCounter.count);
  return data;
}

function logImgPathChange(count) {
  if (count > 0) {
    console.log(`imgPathをWebP拡張子に置き換え: ${count} 件`);
  } else {
    console.log("imgPathの拡張子に変更はありませんでした。");
  }
}

async function optimizeOperatorIcons({
  inputDir = DEFAULT_ICON_DIR,
  width = TARGET_SIZE,
  height = TARGET_SIZE,
  quality = WEBP_QUALITY,
} = {}) {
  const dirEntries = await fs.readdir(inputDir, { withFileTypes: true });
  const pngEntries = dirEntries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"),
  );

  if (pngEntries.length === 0) {
    console.log("変換対象のオペレーターアイコンが見つかりませんでした。");
    return { processed: 0 };
  }

  console.log(`オペレーターアイコンを最適化します (${pngEntries.length} 件)`);

  let processed = 0;
  for (const entry of pngEntries) {
    const basename = path.parse(entry.name).name;
    const inputPath = path.join(inputDir, entry.name);
    const outputPath = path.join(inputDir, `${basename}.webp`);

    await sharp(inputPath)
      .resize(width, height, { fit: "cover" })
      .webp({ quality })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(
      `生成: ${path.relative(process.cwd(), outputPath)} (${formatFileSize(stats.size)})`,
    );
    processed += 1;
  }

  console.log(`合計 ${processed} 件のオペレーターアイコンを最適化しました。`);
  return { processed };
}

function isDefaultRecruitJson(inputPath) {
  const resolvedInput = path.resolve(process.cwd(), inputPath);
  const resolvedDefault = path.resolve(process.cwd(), DEFAULT_INPUT_PATH);
  return resolvedInput === resolvedDefault;
}

async function main() {
  const { inputPath, outputPath, options } = parseArguments();
  optimizeJson(inputPath, outputPath, options, transformOperatorsToWebp);

  if (isDefaultRecruitJson(inputPath)) {
    await optimizeOperatorIcons();
  } else {
    console.log("入力ファイルが既定値ではないため、アイコンの最適化をスキップしました。");
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  });
}

module.exports = {
  optimizeOperatorIcons,
  transformOperatorsToWebp,
};
