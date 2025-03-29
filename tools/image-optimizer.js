#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// 設定
const config = {
    inputDir: 'public/img',
    outputDir: 'public/img/optimized',
    sizes: [80], // 最適化する画像サイズ (px)
    formats: ['webp', 'avif'], // 出力フォーマット
    quality: 90 // 画質 (0-100)
};

// 出力ディレクトリの作成
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 ディレクトリを作成しました: ${dir}`);
    }
}

// 画像のリサイズと最適化
async function optimizeImage(inputPath, outputDir, filename) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    console.log(`📷 最適化処理中: ${inputPath}`);

    // 入力画像の取得
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`ℹ️ 画像情報: ${name} (${metadata.width}x${metadata.height}px, フォーマット: ${metadata.format})`);

    // 各サイズとフォーマットで処理
    for (const size of config.sizes) {
        // オリジナルサイズより大きいサイズはスキップ
        if (size > metadata.width) {
            console.log(`ℹ️ サイズ ${size}px はオリジナル (${metadata.width}px) より大きいのでスキップします`);
            continue;
        }

        // サイズディレクトリはoutputDirの直下に作成
        const sizeDir = path.join(config.outputDir, `${size}`);
        ensureDirectoryExists(sizeDir);

        for (const format of config.formats) {
            const outputPath = path.join(sizeDir, `${name}.${format}`);

            try {
                await image
                    .clone()
                    .resize(size)
                [format]({ quality: config.quality })
                    .toFile(outputPath);

                console.log(`✅ 生成完了: ${outputPath} (${size}px)`);
            } catch (err) {
                console.error(`❌ エラー (${filename}, ${size}px, ${format}):`, err.message);
            }
        }
    }

    // オリジナルサイズも最適化
    const originalDir = path.join(config.outputDir, 'original');
    ensureDirectoryExists(originalDir);

    for (const format of config.formats) {
        const outputPath = path.join(originalDir, `${name}.${format}`);

        try {
            await image
                .clone()
            [format]({ quality: config.quality })
                .toFile(outputPath);

            console.log(`✅ 生成完了: ${outputPath} (オリジナルサイズ)`);
        } catch (err) {
            console.error(`❌ エラー (${filename}, オリジナル, ${format}):`, err.message);
        }
    }
}

// 対象ディレクトリ内のすべての画像ファイルを処理
async function processImages() {
    // 出力ディレクトリの作成
    ensureDirectoryExists(config.outputDir);

    // 画像ファイルのパターン
    const pattern = path.join(config.inputDir, '**/*.{jpg,jpeg,png,gif}');

    try {
        const files = glob.sync(pattern);
        console.log(`🔍 ${files.length}個の画像ファイルが見つかりました`);

        if (files.length === 0) {
            console.log(`画像が見つかりませんでした。パスを確認してください: ${pattern}`);
            return;
        }

        // 各ファイルの処理
        for (const file of files) {
            const filename = path.basename(file);

            // 出力先は常にconfig.outputDirの直下のサイズディレクトリ
            await optimizeImage(file, config.outputDir, filename);
        }

        console.log('🎉 すべての画像の最適化が完了しました！');
    } catch (err) {
        console.error('❌ 処理中にエラーが発生しました:', err);
    }
}

// 特定のディレクトリのみ処理する機能
async function processSpecificDirectory(subDir) {
    const inputSubDir = path.join(config.inputDir, subDir);

    if (!fs.existsSync(inputSubDir)) {
        console.error(`❌ 指定されたディレクトリが存在しません: ${inputSubDir}`);
        return;
    }

    ensureDirectoryExists(config.outputDir);

    const pattern = path.join(inputSubDir, '**/*.{jpg,jpeg,png,gif}');
    const files = glob.sync(pattern);

    console.log(`🔍 ${subDir} ディレクトリ内で ${files.length}個の画像ファイルが見つかりました`);

    for (const file of files) {
        const filename = path.basename(file);
        await optimizeImage(file, config.outputDir, filename);
    }

    console.log(`🎉 ${subDir} ディレクトリの画像最適化が完了しました！`);
}

// メイン処理
async function main() {
    console.log('📸 画像最適化ツールを起動します...');

    // コマンドライン引数の処理
    const args = process.argv.slice(2);

    if (args.length > 0) {
        // 特定のディレクトリを処理
        await processSpecificDirectory(args[0]);
    } else {
        // すべての画像を処理
        await processImages();
    }
}

main().catch(err => {
    console.error('❌ 予期せぬエラーが発生しました:', err);
    process.exit(1);
}); 