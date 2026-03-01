import type { Operator } from "@/types/recruit";
import { detectRecommendedTags } from "@/lib/recommendTags";
import recruitData from "../../../public/json/ak-recruit.min.json";
import RecommendTags from "@/components/recommend-tags";
import RecommendHeader from "@/components/recommend-header";

export const dynamic = "force-static";

type SlimOperator = Pick<Operator, 'id' | 'name' | 'rarity' | 'imgPath' | 'wiki'>;

export const metadata = {
	title: "おすすめタグ組み合わせ | アークナイツ公開求人タグ検索",
	description:
		"アークナイツの公開求人で星4以上のオペレーターを確実に入手できるタグ組み合わせを紹介します。",
};

export default function RecommendPage() {
	const recommendedTags = detectRecommendedTags(recruitData as Operator[]);

	// クライアントに必要なフィールドのみ送信してHTMLペイロードを削減
	const slimRecommendedTags: { [key: string]: SlimOperator[] } = {};
	for (const [key, ops] of Object.entries(recommendedTags)) {
		slimRecommendedTags[key] = ops.map(({ id, name, rarity, imgPath, wiki }) => ({
			id,
			name,
			rarity,
			imgPath,
			wiki,
		}));
	}

	return (
		<>
			<RecommendHeader />
			<div className="mt-6 scroll-mt-20">
				<RecommendTags recommendedTags={slimRecommendedTags} />
			</div>
		</>
	);
}
