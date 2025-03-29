import RecommendTags from "@/components/recommend-tags";
import { Operator } from "@/types/recruit";
import RecommendHeader from "@/components/recommend-header";

export const metadata = {
    title: "おすすめタグ組み合わせ | アークナイツ公開求人タグ検索",
    description: "アークナイツの公開求人で星4以上のオペレーターを確実に入手できるタグ組み合わせを紹介します。",
};

// ISRの設定を追加
export const revalidate = 86400; // 24時間ごとに再検証

export default async function RecommendPage() {
    const fs = require('fs');
    const path = require('path');
    const { detectRecommendedTags } = require('@/lib/recommendTags');

    // JSONファイルからデータを読み込む
    const filePath = path.join(process.cwd(), "public/json/ak-recruit.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const recruitData = JSON.parse(fileContents) as Operator[];

    // おすすめタグ組み合わせを検出
    const recommendedTags = detectRecommendedTags(recruitData);

    return (
        <>
            <RecommendHeader />
            <div className="mt-6 scroll-mt-20">
                <RecommendTags recommendedTags={recommendedTags} />
            </div>
        </>
    );
}