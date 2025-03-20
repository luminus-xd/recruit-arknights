import RecommendTags from "@/components/recommend-tags";
import { detectRecommendedTags } from "@/lib/recommendTags";
import { Operator } from "@/types/recruit";
import RecommendHeader from "@/components/recommend-header";
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
        <>
            <RecommendHeader />
            <div className="mt-6">
                <RecommendTags recommendedTags={recommendedTags} />
            </div>
        </>
    );
}