# 最適化画像コンポーネントの使用方法

このドキュメントでは、作成した画像最適化ツールを使って生成されたコンポーネントをページで実際に使用する方法を説明します。

## 基本的な使用方法

### 1. 画像の最適化とコンポーネント生成

まず、以下のコマンドを実行して画像を最適化し、対応するReactコンポーネントを生成します。

```bash
# 画像の最適化
npm run optimize-images

# Reactコンポーネントの生成
npm run generate-image-components
```

これにより、`public/img/optimized`に最適化された画像と、`src/components/generated`に対応するReactコンポーネントが生成されます。

### 2. コンポーネントのインポート

生成されたコンポーネントはインデックスファイルからエクスポートされるため、以下のようにインポートできます。

```tsx
// 特定のコンポーネントをインポート
import { Image1, Image2 } from "@/components/generated";

// または必要に応じてすべてインポート
import * as OptimizedImages from "@/components/generated";
```

### 3. コンポーネントの使用

```tsx
// 基本的な使用方法
<Image1 alt="オペレーター1" />

// サイズを指定（利用可能なサイズ: '40', 'original'）
<Image1 alt="オペレーター1" size="40" />

// 優先的に読み込む場合
<Image1 alt="オペレーター1" priority={true} />

// スタイルの適用
<Image1 alt="オペレーター1" className="rounded-lg shadow-md" />
```

## レコメンドページへの適用例

レコメンドページでの使用例として、既存の`AvatarImage`コンポーネントを最適化画像コンポーネントに置き換える方法を示します。

### 変更前のコード（AvatarImageを使用）

```tsx
const OperatorItem = ({ operator }: { operator: Operator }) => (
    <li>
        <Tooltip>
            <TooltipTrigger>
                <a
                    className="hover:scale-105"
                    href={operator.wiki}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Avatar rarity={operator.rarity}>
                        <AvatarImage alt={operator.name} src={operator.imgPath} />
                        <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </a>
            </TooltipTrigger>
            <TooltipContent>
                <p>{operator.name}</p>
            </TooltipContent>
        </Tooltip>
    </li>
);
```

### 変更後のコード（最適化コンポーネントを使用）

```tsx
// 最適化画像コンポーネントをインポート
import { Image1, Image2, Image10 /* 他のコンポーネント */ } from "@/components/generated";

const OperatorItem = ({ operator }: { operator: Operator }) => {
    // 画像IDを取得する関数
    const getImageId = (operator: Operator) => {
        const match = operator.imgPath.match(/\/(\d+)\.png$/);
        return match ? match[1] : null;
    };

    // 適切な画像コンポーネントを取得
    const getImageComponent = (id: string | null) => {
        if (!id) return null;

        // IDに基づいて適切なコンポーネントを選択
        switch (id) {
            case "1":
                return <Image1 alt={operator.name} size="40" />;
            case "2":
                return <Image2 alt={operator.name} size="40" />;
            case "10":
                return <Image10 alt={operator.name} size="40" />;
            // 他のケースも同様に...
            default:
                return null;
        }
    };

    const imageId = getImageId(operator);
    const optimizedImage = getImageComponent(imageId);

    return (
        <li>
            <Tooltip>
                <TooltipTrigger>
                    <a
                        className="hover:scale-105"
                        href={operator.wiki}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <Avatar rarity={operator.rarity}>
                            {/* 最適化された画像コンポーネントが存在すればそれを使用 */}
                            {optimizedImage || (
                                // フォールバック: 従来の画像
                                <img 
                                    src={operator.imgPath} 
                                    alt={operator.name} 
                                    width="40" 
                                    height="40" 
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            )}
                            <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </a>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{operator.name}</p>
                </TooltipContent>
            </Tooltip>
        </li>
    );
};
```

## より実用的な実装

実際の開発では、すべての画像IDに対して個別のcase文を書くのは非効率です。次のようなアプローチも検討できます：

### コンポーネントマッピングの動的作成

```tsx
import * as OptimizedImages from "@/components/generated";

const OperatorItem = ({ operator }: { operator: Operator }) => {
    // 画像IDを取得する関数
    const getImageId = (operator: Operator) => {
        const match = operator.imgPath.match(/\/(\d+)\.png$/);
        return match ? match[1] : null;
    };

    // 動的なコンポーネント選択
    const getImageComponent = (id: string | null) => {
        if (!id) return null;

        // コンポーネント名を動的に生成（例: "Image1"）
        const componentName = `Image${id}`;
        
        // 対応するコンポーネントが存在するか確認
        if (OptimizedImages[componentName as keyof typeof OptimizedImages]) {
            const ImageComponent = OptimizedImages[componentName as keyof typeof OptimizedImages];
            return <ImageComponent alt={operator.name} size="40" />;
        }
        
        return null;
    };

    const imageId = getImageId(operator);
    const optimizedImage = getImageComponent(imageId);

    // 以下は同じ...
};
```

## パフォーマンスの向上

静的生成ページで最適化画像を使用することで、以下のパフォーマンス向上が期待できます：

1. **最適なフォーマット**: WebPやAVIFなどの最新フォーマットを使用することで、同じ画質でファイルサイズを削減
2. **複数サイズ**: 実際に表示するサイズに近い画像を提供することで、帯域とメモリを節約
3. **レイジーローディング**: 画面外の画像は遅延読み込みされ、初期ロード時間を短縮
4. **ブラウザサポートの自動検出**: 各ブラウザがサポートする最適なフォーマットを自動的に選択

## デプロイ時の注意点

1. **最適化画像の生成**: ビルド前に画像最適化コマンドを実行するようにCI/CDパイプラインを設定
   ```bash
   # package.jsonの例
   "scripts": {
     "prebuild": "npm run optimize-images && npm run generate-image-components",
     "build": "next build"
   }
   ```

2. **Git管理**: 生成ファイルは`.gitignore`に追加し、リポジトリサイズを管理可能に保つ

3. **静的エクスポート**: `next export`使用時も問題なく動作することを確認 