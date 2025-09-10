#!/usr/bin/env node

/**
 * Arknightsリクルートデータ最適化ツール
 *
 * 元のJSON形式を保持しながら余分な空白を除去して最適化します。
 * 元のファイルは保持され、最適化されたファイルは別名で保存されます。
 *
 * 使用方法:
 * 1. 実行権限を付与: chmod +x tools/optimize-json.js
 * 2. 直接実行: ./tools/optimize-json.js [入力ファイル] [出力ファイル] [オプション]
 *
 * 例:
 * ./tools/optimize-json.js ./public/json/ak-recruit.json ./public/json/ak-recruit.min.json
 * ./tools/optimize-json.js --pretty --indent=2
 *
 * npm scripts からの実行例:
 * npm run optimize-json
 * npm run optimize-json:pretty
 *
 * オプション:
 * --pretty: 出力JSONに適切な改行とインデントを含めます
 * --indent=n: インデント幅を指定（デフォルト: 2）
 */

const fs = require("node:fs");
const path = require("node:path");

// デフォルトのファイルパス
const DEFAULT_INPUT_PATH = "./public/json/ak-recruit.json";
const DEFAULT_OUTPUT_PATH = "./public/json/ak-recruit.min.json";

/**
 * JSONファイルを最適化する関数
 * @param {string} inputPath - 入力ファイルのパス
 * @param {string} outputPath - 出力ファイルのパス
 * @param {Object} options - 最適化オプション
 */
function optimizeJson(inputPath, outputPath, options = {}) {
	try {
		// ファイルの存在確認
		if (!fs.existsSync(inputPath)) {
			console.error(`エラー: ファイル "${inputPath}" が見つかりません。`);
			process.exit(1);
		}

		console.log(`JSONファイルを読み込み中... (${inputPath})`);
		const jsonData = fs.readFileSync(inputPath, "utf8");

		// ファイルサイズを記録
		const originalSize = Buffer.byteLength(jsonData, "utf8");
		console.log(`元のファイルサイズ: ${formatFileSize(originalSize)}`);

		// JSONをパースして最適化
		const data = JSON.parse(jsonData);

		// 改行を保持するかどうかに基づいてJSONを生成
		const optimizedJson = options.pretty
			? JSON.stringify(data, null, options.indent)
			: JSON.stringify(data);

		// 最適化されたJSONを保存
		fs.writeFileSync(outputPath, optimizedJson, "utf8");

		// 最適化後のファイルサイズを記録
		const optimizedSize = Buffer.byteLength(optimizedJson, "utf8");
		console.log(`最適化後のファイルサイズ: ${formatFileSize(optimizedSize)}`);

		// 削減率を計算
		const reductionRate = ((originalSize - optimizedSize) / originalSize) * 100;
		console.log(`削減率: ${reductionRate.toFixed(2)}%`);

		console.log(`最適化されたJSONを保存しました: ${outputPath}`);
	} catch (error) {
		console.error("エラーが発生しました:", error.message);
		process.exit(1);
	}
}

/**
 * ファイルサイズを読みやすい形式に変換する関数
 * @param {number} bytes - バイト数
 * @returns {string} - 読みやすい形式のファイルサイズ
 */
function formatFileSize(bytes) {
	if (bytes < 1024) {
		return `${bytes} バイト`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(2)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * コマンドライン引数をパースする関数
 * @returns {Object} - パースされた引数とオプション
 */
function parseArguments() {
	const args = process.argv.slice(2);
	const options = {
		pretty: false,
		indent: 2,
	};
	const paths = [];

	for (const arg of args) {
		if (arg === "--pretty") {
			options.pretty = true;
			continue;
		}

		if (arg.startsWith("--indent=")) {
			const indentValue = Number.parseInt(arg.split("=")[1], 10);
			if (!Number.isNaN(indentValue) && indentValue >= 0) {
				options.indent = indentValue;
			}
			continue;
		}

		paths.push(arg);
	}

	return {
		inputPath: paths[0] || DEFAULT_INPUT_PATH,
		outputPath: paths[1] || DEFAULT_OUTPUT_PATH,
		options,
	};
}

// コマンドライン引数を処理
const { inputPath, outputPath, options } = parseArguments();

// 実行
optimizeJson(inputPath, outputPath, options);
