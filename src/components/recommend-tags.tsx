"use client";

import { Operator } from "@/types/recruit";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendTagsProps {
    recommendedTags: { [key: string]: Operator[] };
}

// オペレーターアイテムコンポーネント
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

export default function RecommendTags({ recommendedTags }: RecommendTagsProps) {
    const groupedByRarity = useMemo(() => {
        const grouped: { [key: number]: { tags: string; operators: Operator[] }[] } = {
            5: [],
            4: [],
        };

        Object.entries(recommendedTags).forEach(([tags, operators]) => {
            // 最低レアリティを取得
            const minRarity = Math.min(...operators.map(op => op.rarity));

            // 星4以上のみを対象とする（星6は上級エリートタグがないと出現しないため除外）
            if (minRarity >= 4 && minRarity <= 5) {
                if (!grouped[minRarity]) {
                    grouped[minRarity] = [];
                }

                grouped[minRarity].push({ tags, operators });
            }
        });

        return grouped;
    }, [recommendedTags]);

    if (Object.keys(recommendedTags).length === 0) {
        return <div className="text-center py-8">おすすめタグ組み合わせが見つかりませんでした。</div>;
    }

    return (
        <div className="space-y-8">
            {[5, 4].map(rarity => (
                <div key={rarity} className="space-y-4">
                    <h2 className="text-xl font-bold border-b pb-2">
                        最低レアリティ {rarity}★ のタグ組み合わせ
                    </h2>

                    {groupedByRarity[rarity]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupedByRarity[rarity].map(({ tags, operators }) => (
                                <div key={tags} className="border rounded-lg p-4">
                                    <h3 className="text-lg font-bold border-b-2 pb-1">{tags}</h3>
                                    <div className="text-sm text-gray-600 mt-2 mb-3">
                                        {operators.length}人のオペレーター
                                    </div>

                                    <TooltipProvider>
                                        <ul className="flex flex-wrap gap-2">
                                            {operators.map(operator => (
                                                <OperatorItem key={operator.id} operator={operator} />
                                            ))}
                                        </ul>
                                    </TooltipProvider>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">
                            該当するタグ組み合わせはありません。
                        </div>
                    )}
                </div>
            ))}

            <Separator />

            <div className="mt-8 text-sm text-gray-600">
                <p>※ 上級エリート・エリート・ロボットのタグは検出条件に含めていません。</p>
                <p>※ タグの組み合わせは3つまでを検出対象としています。</p>
                <p>※ 表示されているタグ組み合わせで確実に星4以上のオペレーターが出現します。</p>
                <p>※ 星6のオペレーターは上級エリートタグがないと出現しないため、このページには表示されていません。</p>
            </div>

            <div className="mt-4">
                <Button variant="outline" asChild>
                    <Link href="/">
                        ← 公開求人タグ検索に戻る
                    </Link>
                </Button>
            </div>
        </div>
    );
}