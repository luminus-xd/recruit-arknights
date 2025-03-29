# 画像最適化ツール

このドキュメントでは、静的生成されたページでNext.jsの`Image`コンポーネントが使用できない場合の代替ソリューションとして提供している画像最適化ツールについて説明します。

## 背景

Next.jsの`Image`コンポーネントは優れた機能を提供していますが、静的生成されたページ（`export`モードなど）では一部の機能が制限されています。このツールは以下の機能を提供することで、その制限を回避します：

- 複数サイズの画像生成
- 最新のフォーマット（WebP、AVIF）への変換
- ブラウザのサポート状況に応じた最適なフォーマットの自動選択
- 遅延読み込み機能

## セットアップ

このツールを使用するには、以下のパッケージが必要です：

```json
{
  "devDependencies": {
    "glob": "^10.3.10",
    "sharp": "^0.33.3"
  }
}
```

これらのパッケージはすでにプロジェクトに含まれていますが、もし不足している場合は以下のコマンドでインストールできます：

```bash
npm install --save-dev glob sharp
```

## ツールの構成

画像最適化ツールは2つの主要なスクリプトで構成されています：

1. `tools/image-optimizer.js` - 画像の最適化とフォーマット変換を行います
2. `tools/generate-image-component.js` - 最適化された画像を使用するためのReactコンポーネントを生成します

## 使用方法

### 1. 画像の最適化

まず、`optimize-images`コマンドを実行して、画像の最適化を行います：

```bash
# すべての画像を最適化
npm run optimize-images

# 特定のディレクトリの画像のみを最適化（例：operators）
npm run optimize-images operators
```

このコマンドは以下の処理を行います：

- 指定されたディレクトリ内のすべての画像ファイル（jpg、jpeg、png、gif）を検索
- 各画像を複数のサイズ（48px、96px、144px）にリサイズ
- 各サイズの画像をWebPとAVIFフォーマットに変換
- オリジナルサイズの画像もWebPとAVIFフォーマットに変換
- 出力を`public/img/optimized`ディレクトリに保存

### 2. Reactコンポーネントの生成

次に、`generate-image-components`コマンドを実行して、最適化された画像を使用するためのReactコンポーネントを生成します：

```bash
npm run generate-image-components
```

このコマンドは以下の処理を行います：

- `public/img/optimized`ディレクトリ内の最適化済み画像を検索
- 各画像に対応するTypeScriptのReactコンポーネントを生成
- 生成されたコンポーネントを`src/components/generated`ディレクトリに保存
- すべてのコンポーネントをエクスポートするindex.tsファイルを生成

### 3. 生成されたコンポーネントの使用

生成されたコンポーネントは以下のように使用できます：

```tsx
import { Image1 } from "@/components/generated";

function MyComponent() {
  return (
    <div>
      <h1>オペレーター</h1>
      <Image1 
        alt="オペレーター1" 
        size="96" // 48, 96, 144, original から選択
        priority={true} // 重要な画像の場合、優先的に読み込む
        className="rounded-lg" // オプションのクラス名
      />
    </div>
  );
}
```

## コンポーネントのプロパティ

生成されたコンポーネントは以下のプロパティを受け取ります：

| プロパティ | 型 | 説明 | デフォルト値 |
|------------|------|-------------|--------------|
| `alt` | string | 画像の代替テキスト（必須） | - |
| `size` | string | 画像サイズ（'48'、'96'、'144'、'original'） | '96' |
| `priority` | boolean | 優先的に読み込むかどうか | false |
| `className` | string | 追加のCSSクラス | '' |

## 詳細仕様

### 画像最適化ツール（image-optimizer.js）

このツールは以下の設定で動作します：

```javascript
const config = {
  inputDir: 'public/img',
  outputDir: 'public/img/optimized',
  sizes: [48, 96, 144], // 最適化する画像サイズ (px)
  formats: ['webp', 'avif'], // 出力フォーマット
  quality: 80 // 画質 (0-100)
};
```

これらの設定を変更することで、異なるサイズやフォーマット、画質で画像を最適化できます。

### コンポーネント生成ツール（generate-image-component.js）

このツールは以下の設定で動作します：

```javascript
const config = {
  imageDir: 'public/img/optimized',
  componentOutputDir: 'src/components/generated',
  basePublicPath: '/img/optimized',
  sizes: [48, 96, 144, 'original'],
  formats: ['webp', 'avif'],
  defaultSize: 96,
  defaultFormat: 'webp'
};
```

## 内部の動作

生成されたコンポーネントは以下の機能を提供します：

1. **フォーマットサポートの検出**: ブラウザがAVIFやWebPをサポートしているかをクライアントサイドで検出
2. **適切なフォーマットの選択**: ブラウザがサポートする最適なフォーマットを使用（AVIF > WebP > オリジナル）
3. **遅延読み込み**: 非優先の画像は`loading="lazy"`属性で遅延読み込み
4. **サイズごとの画像提供**: 用途に応じて適切なサイズの画像を選択可能

## カスタマイズ

ツールの動作をカスタマイズするには、各スクリプト内の`config`オブジェクトを変更します。例えば：

- 異なるサイズの画像を生成するには、`sizes`配列を変更
- 異なる出力ディレクトリを使用するには、`outputDir`や`componentOutputDir`を変更
- 異なる画質設定を使用するには、`quality`の値を変更

## トラブルシューティング

### 画像が見つからない場合

```
画像が見つかりませんでした。パスを確認してください: public/img/**/*.{jpg,jpeg,png,gif}
```

このエラーが表示される場合は、`public/img`ディレクトリに画像ファイルが存在するか確認してください。

### シャープモジュールのエラー

```
❌ エラー (filename.png, 96px, webp): Input file is missing
```

このエラーが表示される場合は、画像ファイルが存在するか、または読み取り可能か確認してください。

### コンポーネント生成エラー

```
⚠️ image.webp の最適化バージョンが見つかりません。スキップします。
```

このエラーが表示される場合は、先に`optimize-images`コマンドを実行して画像を最適化してください。

## ベストプラクティス

1. **必要なサイズのみ生成**: 実際に使用するサイズのみを生成して、ディスク容量を節約
2. **適切な画質設定**: 用途に応じて画質を調整（写真は80-90、イラストは70-80程度が推奨）
3. **Git管理**: 生成された最適化画像は`.gitignore`に追加して、リポジトリサイズを抑制
4. **CI/CDパイプライン統合**: ビルド時に自動的に画像を最適化するようにCIを設定

## 制限事項

- サーバーサイドレンダリングには非対応（クライアントサイドのみ）
- レスポンシブ画像（`srcset`）は手動で設定が必要
- 画像の自動アップロード機能は含まれていない

## 将来の拡張予定

- WebP/AVIFのフォールバックとしてJPEG/PNGの自動生成
- レスポンシブ画像のより簡単な実装
- 画像の自動圧縮率最適化 