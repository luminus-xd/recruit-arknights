"use client";

import React from 'react';
import { Operator } from "@/types/recruit";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowBigLeft } from 'lucide-react';
// 最適化された画像コンポーネントをインポート
import * as OptimizedImages from "@/components/generated";

interface RecommendTagsProps {
    recommendedTags: { [key: string]: Operator[] };
}

// オペレーターアイテムコンポーネント
const OperatorItem = ({ operator }: { operator: Operator }) => {
    // 画像IDを取得する関数
    const getImageId = (operator: Operator) => {
        // 例: "/img/operators/1.png" から "1" を取得
        const match = operator.imgPath.match(/\/(\d+)\.png$/);
        return match ? match[1] : null;
    };

    // 画像IDを取得
    const imageId = getImageId(operator);
    
    // コンポーネント名を動的に生成（例: "Image1"）
    const componentName = imageId ? `Image${imageId}` : null;
    
    // 最適化された画像コンポーネントがあるかチェック
    const hasOptimizedImage = 
        componentName && 
        typeof OptimizedImages === 'object' && 
        OptimizedImages !== null && 
        componentName in OptimizedImages;

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
                            {hasOptimizedImage ? (
                                // 最適化された画像コンポーネントを使用
                                React.createElement(
                                    OptimizedImages[componentName as keyof typeof OptimizedImages], 
                                    {
                                        alt: operator.name,
                                        size: "80",
                                        className: "h-full w-full object-cover"
                                    }
                                )
                            ) : (
                                // 最適化された画像がない場合は通常の画像を使用
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

export default function RecommendTags({ recommendedTags }: RecommendTagsProps) {
    const groupedByRarity = useMemo(() => {
        // 星5確定と星4以上確定のグループを準備
        const grouped: { [key: string]: { tags: string; operators: Operator[] }[] } = {
            'star5': [], // 星5確定
            'star4plus': [], // 星4以上確定
        };

        Object.entries(recommendedTags).forEach(([fullTag, operators]) => {
            // タグから確定レアリティ情報を抽出
            let rarityGroup = '';
            let cleanTag = fullTag;
            
            if (fullTag.includes('[星5確定]')) {
                rarityGroup = 'star5';
                cleanTag = fullTag.replace(' [星5確定]', '');
            } else if (fullTag.includes('[星4以上確定]')) {
                rarityGroup = 'star4plus';
                cleanTag = fullTag.replace(' [星4以上確定]', '');
            }
            
            if (rarityGroup) {
                grouped[rarityGroup].push({ 
                    tags: cleanTag, 
                    operators 
                });
            }
        });

        return grouped;
    }, [recommendedTags]);

    if (Object.keys(recommendedTags).length === 0) {
        return <div className="text-center py-8">おすすめタグ組み合わせが見つかりませんでした。</div>;
    }

    return (
        <div className="space-y-8">
            {/* 星5確定 */}
            <div className="space-y-4" id="rarity-5">
                <hgroup className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Rarity 5</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">星5確定</p>
                </hgroup>

                {groupedByRarity['star5']?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedByRarity['star5'].map(({ tags, operators }) => (
                            <div key={tags} className="border rounded-lg p-4">
                                <h3 className="text-lg font-bold border-b-2 pb-1">{tags}</h3>
                                <TooltipProvider>
                                    <ul className="flex flex-wrap gap-2 mt-3">
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

            {/* 星4以上確定 */}
            <div className="space-y-4" id="rarity-4">
                <hgroup className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Rarity 4+</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">星4以上確定</p>
                </hgroup>

                {groupedByRarity['star4plus']?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedByRarity['star4plus'].map(({ tags, operators }) => (
                            <div key={tags} className="border rounded-lg p-4">
                                <h3 className="text-lg font-bold border-b-2 pb-1">{tags}</h3>
                                <TooltipProvider>
                                    <ul className="flex flex-wrap gap-2 mt-3">
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

            <Separator />

            <ul className="mt-8 text-sm text-muted-foreground list-disc list-outside pl-[1em] leading-6">
                <li>タグの組み合わせは2つまでを対象としています。</li>
                <li>星6のオペレーターは上級エリートタグがないと出現しないため、このページには表示されていません。</li>
                <li>同じオペレーターが出現する場合は、最小限のタグ組み合わせのみ表示しています。</li>
            </ul>

            <div className="mt-4">
                <Button variant="outline" asChild>
                    <Link href="/" className="font-bold">
                        <ArrowBigLeft className="mr-2 h-5 w-5" />
                        公開求人シミュレーターに戻る
                    </Link>
                </Button>
            </div>
        </div>
    );
}