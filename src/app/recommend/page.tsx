import RecommendTags from "@/components/recommend-tags";
import { detectRecommendedTags } from "@/lib/recommendTags";
import { Operator } from "@/types/recruit";
import fs from "fs";
import path from "path";

export const metadata = {
    title: "おすすめタグ組み合わせ | アークナイツ公開求人タグ検索",
    description: "アークナイツの公開求人で星4以上のオペレーターを確実に入手できるタグ組み合わせを紹介します。",
};

// ビルド時に実行される関数
export default async function RecommendPage() {
    // JSONファイルからデータを読み込む
    const filePath = path.join(process.cwd(), "public/json/ak-recruit.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const recruitData = JSON.parse(fileContents) as Operator[];

    // おすすめタグ組み合わせを検出
    const recommendedTags = detectRecommendedTags(recruitData);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">おすすめタグ組み合わせ</h1>
            <p className="mb-6">
                以下のタグ組み合わせを選択すると、星4以上のオペレーターを確実に入手できます。
                星6のオペレーターは上級エリートタグがないと出現しないため、このページには表示されていません。
            </p>

            <RecommendTags recommendedTags={recommendedTags} />
        </div>
    );
}