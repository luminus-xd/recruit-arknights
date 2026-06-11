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
const VALID_RARITIES = new Set([1, 2, 3, 4, 5, 6]);
const VALID_TYPES = new Set(["先鋒", "前衛", "重装", "狙撃", "術師", "医療", "補助", "特殊"]);

function getOperatorRecords(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && Array.isArray(data.operators)) {
    return data.operators;
  }

  return null;
}

function validateOperators(data) {
  const operators = getOperatorRecords(data);
  if (!operators) {
    throw new Error("ak-recruit.json の検証エラー: オペレーター配列が見つかりません。");
  }

  const errors = [];

  operators.forEach((operator, index) => {
    const label = `[${index}${operator && operator.name ? ` ${operator.name}` : ""}]`;

    if (!operator || typeof operator !== "object") {
      errors.push(`${label} レコードがオブジェクトではありません。`);
      return;
    }

    if (typeof operator.id !== "number") {
      errors.push(`${label} id が数値ではありません。`);
    }

    if (typeof operator.name !== "string" || operator.name.length === 0) {
      errors.push(`${label} name が不正です。`);
    }

    if (!VALID_RARITIES.has(operator.rarity)) {
      errors.push(`${label} rarity が不正です: ${operator.rarity}`);
    }

    if (!VALID_TYPES.has(operator.type)) {
      errors.push(`${label} type が不正です: ${operator.type}`);
    }

    if (!Array.isArray(operator.tags)) {
      errors.push(`${label} tags が配列ではありません。`);
    }

    if (typeof operator.wiki !== "string" || operator.wiki.length === 0) {
      errors.push(`${label} wiki が不正です。`);
    }

    if (typeof operator.imgPath !== "string" || operator.imgPath.length === 0) {
      errors.push(`${label} imgPath が不正です。`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`ak-recruit.json の検証エラー:\n${errors.join("\n")}`);
  }

  console.log(`ak-recruit.json を検証しました: ${operators.length} 件`);
}

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
  optimizeJson(inputPath, outputPath, options, (data) => {
    validateOperators(data);
    return transformOperatorsToWebp(data);
  });

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
  validateOperators,
};
