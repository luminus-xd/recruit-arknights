#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 設定
const config = {
    imageDir: 'public/img/optimized',
    componentOutputDir: 'src/components/generated',
    basePublicPath: '/img/optimized',
    sizes: [80, 'original'], // 利用可能なサイズディレクトリ
    formats: ['webp', 'avif'], // 利用可能なフォーマット
    defaultSize: 80, // デフォルトのサイズ
    defaultFormat: 'webp' // デフォルトのフォーマット
};

// 出力ディレクトリの作成
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 ディレクトリを作成しました: ${dir}`);
    }
}

// フォーマット名を大文字化する
function capitalizeFormat(format) {
    return format.charAt(0).toUpperCase() + format.slice(1);
}

// 画像のファイル名から適切なコンポーネント名を生成
function generateComponentName(imageName) {
    // 数字だけの場合は「Image」をプレフィックスとして追加
    if (/^\d+$/.test(imageName)) {
        return `Image${imageName}`;
    }

    // キャメルケースに変換
    return imageName
        .split(/[-_\s]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

// サイズディレクトリ内の画像ファイルから最適化画像コンポーネントを生成
function generateComponentForImage(subDir, imageFile) {
    const imageName = path.basename(imageFile, path.extname(imageFile));
    const relativeDirPath = path.dirname(imageFile).split(path.sep).pop();

    console.log(`処理中: ${imageFile} (名前: ${imageName}, 親ディレクトリ: ${relativeDirPath})`);

    // 利用可能なサイズとフォーマットを確認
    const availableSizes = [];
    const availableFormats = {};

    // originalディレクトリのファイルをチェック
    const originalDirPath = path.join(config.imageDir, 'original');

    if (fs.existsSync(originalDirPath)) {
        // 利用可能なフォーマットをチェック
        const formatFiles = {};

        for (const format of config.formats) {
            const formatFile = path.join(originalDirPath, `${imageName}.${format}`);

            if (fs.existsSync(formatFile)) {
                formatFiles[format] = `${config.basePublicPath}/original/${imageName}.${format}`;
            }
        }

        if (Object.keys(formatFiles).length > 0) {
            availableSizes.push('original');
            availableFormats['original'] = formatFiles;
        }
    }

    // 数値サイズディレクトリをチェック
    for (const size of config.sizes) {
        if (size === 'original') continue; // originalは上ですでにチェック済み

        const sizeDir = path.join(config.imageDir, size.toString());

        if (fs.existsSync(sizeDir)) {
            const formatFiles = {};

            for (const format of config.formats) {
                const formatFile = path.join(sizeDir, `${imageName}.${format}`);

                if (fs.existsSync(formatFile)) {
                    formatFiles[format] = `${config.basePublicPath}/${size}/${imageName}.${format}`;
                }
            }

            if (Object.keys(formatFiles).length > 0) {
                availableSizes.push(size);
                availableFormats[size] = formatFiles;
            }
        }
    }

    if (availableSizes.length === 0) {
        console.log(`⚠️ ${imageFile} の最適化バージョンが見つかりません。スキップします。`);
        console.log('利用可能なサイズ:', Object.keys(availableFormats));
        return null;
    }

    console.log(`✅ 画像 ${imageName} の利用可能なサイズ: ${availableSizes.join(', ')}`);

    // コンポーネントのファイル名とパスを決定
    const componentName = generateComponentName(imageName);
    const componentFileName = `${componentName}.tsx`;
    const componentOutputPath = path.join(config.componentOutputDir, relativeDirPath, componentFileName);

    // コンポーネントディレクトリを作成
    ensureDirectoryExists(path.dirname(componentOutputPath));

    // コンポーネントのコードを生成
    let componentCode = `"use client";\n\n`;
    componentCode += `import { useState, useEffect } from 'react';\n\n`;

    // コンポーネントのインターフェース
    componentCode += `interface ${componentName}Props {\n`;
    componentCode += `  className?: string;\n`;
    componentCode += `  alt: string;\n`;
    componentCode += `  size?: ${availableSizes.map(s => `'${s}'`).join(' | ')};\n`;
    componentCode += `  priority?: boolean;\n`;
    componentCode += `}\n\n`;

    // 画像パスのマッピングを定義
    componentCode += `const IMAGE_PATHS = {\n`;

    for (const size of availableSizes) {
        componentCode += `  '${size}': {\n`;

        for (const format of Object.keys(availableFormats[size])) {
            componentCode += `    ${format}: '${availableFormats[size][format]}',\n`;
        }

        componentCode += `  },\n`;
    }

    componentCode += `};\n\n`;

    // コンポーネント本体
    componentCode += `export default function ${componentName}({ className = '', alt, size = '${config.defaultSize}', priority = false }: ${componentName}Props) {\n`;
    componentCode += `  const [currentFormat, setCurrentFormat] = useState<'webp' | 'avif' | 'fallback'>('${config.defaultFormat}');\n\n`;

    // フォーマットのサポート検出
    componentCode += `  useEffect(() => {\n`;
    componentCode += `    const checkFormatSupport = async () => {\n`;
    componentCode += `      if (typeof window === 'undefined') return;\n`;
    componentCode += `      \n`;
    componentCode += `      const isAvifSupported = () => {\n`;
    componentCode += `        const canvas = document.createElement('canvas');\n`;
    componentCode += `        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;\n`;
    componentCode += `      };\n`;
    componentCode += `      \n`;
    componentCode += `      const isWebpSupported = () => {\n`;
    componentCode += `        const canvas = document.createElement('canvas');\n`;
    componentCode += `        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;\n`;
    componentCode += `      };\n`;
    componentCode += `      \n`;
    componentCode += `      if (isAvifSupported()) {\n`;
    componentCode += `        setCurrentFormat('avif');\n`;
    componentCode += `      } else if (isWebpSupported()) {\n`;
    componentCode += `        setCurrentFormat('webp');\n`;
    componentCode += `      } else {\n`;
    componentCode += `        setCurrentFormat('fallback');\n`;
    componentCode += `      }\n`;
    componentCode += `    };\n`;
    componentCode += `    \n`;
    componentCode += `    checkFormatSupport();\n`;
    componentCode += `  }, []);\n\n`;

    // 画像ソースの選択ロジック
    componentCode += `  const getImageSrc = () => {\n`;
    componentCode += `    // サイズの存在を確認\n`;
    componentCode += `    const validSize = IMAGE_PATHS[size] ? size : '${config.defaultSize}';\n`;
    componentCode += `    \n`;
    componentCode += `    // フォーマットの確認\n`;
    componentCode += `    if (currentFormat === 'avif' && IMAGE_PATHS[validSize].avif) {\n`;
    componentCode += `      return IMAGE_PATHS[validSize].avif;\n`;
    componentCode += `    }\n`;
    componentCode += `    \n`;
    componentCode += `    if (currentFormat === 'webp' && IMAGE_PATHS[validSize].webp) {\n`;
    componentCode += `      return IMAGE_PATHS[validSize].webp;\n`;
    componentCode += `    }\n`;
    componentCode += `    \n`;
    componentCode += `    // フォールバック：オリジナルのWebP\n`;
    componentCode += `    return IMAGE_PATHS['original'].webp || IMAGE_PATHS['${availableSizes[0]}'].webp;\n`;
    componentCode += `  };\n\n`;

    // レンダリング
    componentCode += `  return (\n`;
    componentCode += `    <img\n`;
    componentCode += `      src={getImageSrc()}\n`;
    componentCode += `      alt={alt}\n`;
    componentCode += `      className={className}\n`;
    componentCode += `      loading={priority ? 'eager' : 'lazy'}\n`;
    componentCode += `      width="${availableSizes.includes(config.defaultSize) ? config.defaultSize : availableSizes[0]}"\n`;
    componentCode += `      height="${availableSizes.includes(config.defaultSize) ? config.defaultSize : availableSizes[0]}"\n`;
    componentCode += `    />\n`;
    componentCode += `  );\n`;
    componentCode += `}\n`;

    // ファイルに書き込み
    fs.writeFileSync(componentOutputPath, componentCode);
    console.log(`✅ コンポーネント生成完了: ${componentOutputPath}`);

    return {
        componentName,
        componentPath: componentOutputPath,
        relativePath: path.relative(config.componentOutputDir, componentOutputPath)
    };
}

// インデックスファイルを生成
function generateIndexFile(components) {
    if (components.length === 0) {
        console.log('⚠️ 生成されたコンポーネントがありません。インデックスファイルは作成しません。');
        return;
    }

    const indexPath = path.join(config.componentOutputDir, 'index.ts');
    let indexContent = `// 自動生成された最適化画像コンポーネント\n\n`;

    // インポート文を生成
    components.forEach(comp => {
        const importPath = path.dirname(comp.relativePath);
        const importName = path.basename(comp.relativePath, '.tsx');

        if (importPath === '.') {
            indexContent += `export { default as ${comp.componentName} } from './${importName}';\n`;
        } else {
            indexContent += `export { default as ${comp.componentName} } from './${importPath}/${importName}';\n`;
        }
    });

    // ファイルに書き込み
    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ インデックスファイル生成完了: ${indexPath}`);
}

// メイン処理
async function main() {
    console.log('🔧 最適化画像コンポーネント生成ツールを起動します...');

    // コンポーネント出力ディレクトリの作成
    ensureDirectoryExists(config.componentOutputDir);

    try {
        // 最適化済み画像の検索
        // まずoriginalディレクトリをチェック
        const originalDir = path.join(config.imageDir, 'original');
        if (!fs.existsSync(originalDir)) {
            console.error(`❌ 最適化画像が見つかりません。先に optimize-images を実行してください。`);
            console.error(`存在しないディレクトリ: ${originalDir}`);
            return;
        }

        // webpファイルを検索
        const pattern = path.join(originalDir, '*.webp');
        console.log(`検索パターン: ${pattern}`);

        const files = glob.sync(pattern);
        console.log(`🔍 ${files.length}個の最適化済み画像が見つかりました`);

        if (files.length === 0) {
            console.log(`画像が見つかりませんでした。パスを確認してください: ${pattern}`);
            console.log(`先に image-optimizer.js を実行してください。`);

            // デバッグ: ディレクトリの内容を表示
            if (fs.existsSync(originalDir)) {
                console.log(`ディレクトリ ${originalDir} の内容:`);
                fs.readdirSync(originalDir).forEach(file => {
                    console.log(` - ${file}`);
                });
            }

            return;
        }

        // 各ファイルに対するコンポーネント生成
        const generatedComponents = [];

        for (const file of files) {
            const component = generateComponentForImage('original', file);
            if (component) {
                generatedComponents.push(component);
            }
        }

        // インデックスファイル生成
        if (generatedComponents.length > 0) {
            generateIndexFile(generatedComponents);
            console.log(`🎉 ${generatedComponents.length}個のコンポーネントを生成しました！`);
        } else {
            console.log(`⚠️ コンポーネントは生成されませんでした。`);
        }
    } catch (err) {
        console.error('❌ 処理中にエラーが発生しました:', err);
    }
}

main().catch(err => {
    console.error('❌ 予期せぬエラーが発生しました:', err);
    process.exit(1);
}); 