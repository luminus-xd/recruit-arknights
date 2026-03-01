"use client";

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import type { Operator } from "@/types/recruit";
import Link from "next/link";
import Image from "next/image";
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
import { ArrowBigLeft, LayoutGrid, Table2, List } from 'lucide-react';

type SlimOperator = Pick<Operator, 'id' | 'name' | 'rarity' | 'imgPath' | 'wiki'>;

type LayoutMode = 'grid' | 'table' | 'list';

const LAYOUT_MODE_STORAGE_KEY = "recommend-layout-mode";

interface RecommendTagsProps {
    recommendedTags: { [key: string]: SlimOperator[] };
}

// オペレーターアイテムコンポーネント
const OperatorItem = ({ operator }: { operator: SlimOperator }) => {
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
                            <Image
                                src={operator.imgPath}
                                alt={operator.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                                unoptimized={false}
                            />
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

// グリッドレイアウト
const GridLayout = ({ items }: { items: { tags: string; operators: SlimOperator[] }[] }) => (
    <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ tags, operators }) => (
                <div key={tags} className="border rounded-lg p-4">
                    <h3 className="text-lg font-bold border-b-2 pb-1">{tags}</h3>
                    <ul className="flex flex-wrap gap-2 mt-3">
                        {operators.map(operator => (
                            <OperatorItem key={operator.id} operator={operator} />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </TooltipProvider>
);

// テーブルレイアウト
const TableLayout = ({ items }: { items: { tags: string; operators: SlimOperator[] }[] }) => (
    <TooltipProvider>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b-2">
                        <th className="text-left py-2 pr-6 font-bold whitespace-nowrap">タグ組み合わせ</th>
                        <th className="text-left py-2 font-bold">オペレーター</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(({ tags, operators }) => (
                        <tr key={tags} className="border-b">
                            <td className="py-2 pr-6 font-semibold align-middle whitespace-nowrap">{tags}</td>
                            <td className="py-2">
                                <ul className="flex flex-wrap gap-2">
                                    {operators.map(operator => (
                                        <OperatorItem key={operator.id} operator={operator} />
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </TooltipProvider>
);

// リスト(dl/dt/dd)レイアウト
const ListLayout = ({ items }: { items: { tags: string; operators: SlimOperator[] }[] }) => (
    <TooltipProvider>
        <dl className="space-y-4">
            {items.map(({ tags, operators }) => (
                <div key={tags} className="border-l-4 border-primary pl-4">
                    <dt className="font-bold text-base">{tags}</dt>
                    <dd className="mt-2">
                        <ul className="flex flex-wrap gap-2">
                            {operators.map(operator => (
                                <OperatorItem key={operator.id} operator={operator} />
                            ))}
                        </ul>
                    </dd>
                </div>
            ))}
        </dl>
    </TooltipProvider>
);

// セクション内容をレイアウトモードに応じてレンダリング
const SectionContent = ({
    items,
    layoutMode,
}: {
    items: { tags: string; operators: SlimOperator[] }[];
    layoutMode: LayoutMode;
}) => {
    if (items.length === 0) {
        return (
            <div className="text-gray-500 italic">
                該当するタグ組み合わせはありません。
            </div>
        );
    }
    switch (layoutMode) {
        case 'table': return <TableLayout items={items} />;
        case 'list':  return <ListLayout items={items} />;
        default:      return <GridLayout items={items} />;
    }
};

export default function RecommendTags({ recommendedTags }: RecommendTagsProps) {
    const storedLayoutMode = useSyncExternalStore(
        () => () => {},
        () => window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY),
        () => null,
    );
    const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
        if (storedLayoutMode === 'grid' || storedLayoutMode === 'table' || storedLayoutMode === 'list') {
            return storedLayoutMode;
        }
        return 'grid';
    });

    // localStorage にレイアウトモードを保存する
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, layoutMode);
    }, [layoutMode]);

    const groupedByRarity = useMemo(() => {
        // 星5確定と星4以上確定のグループを準備
        const grouped: { [key: string]: { tags: string; operators: SlimOperator[] }[] } = {
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
            {/* レイアウトモード切替 */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">表示形式</span>
                <Button
                    size="sm"
                    variant={layoutMode === 'grid' ? 'default' : 'outline-solid'}
                    onClick={() => setLayoutMode('grid')}
                >
                    <LayoutGrid className="mr-1.5 h-4 w-4" />
                    グリッド
                </Button>
                <Button
                    size="sm"
                    variant={layoutMode === 'table' ? 'default' : 'outline-solid'}
                    onClick={() => setLayoutMode('table')}
                >
                    <Table2 className="mr-1.5 h-4 w-4" />
                    テーブル
                </Button>
                <Button
                    size="sm"
                    variant={layoutMode === 'list' ? 'default' : 'outline-solid'}
                    onClick={() => setLayoutMode('list')}
                >
                    <List className="mr-1.5 h-4 w-4" />
                    リスト
                </Button>
            </div>

            {/* 星5確定 */}
            <div className="space-y-4" id="rarity-5">
                <hgroup className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Rarity 5</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">星5確定</p>
                </hgroup>

                <SectionContent
                    items={groupedByRarity['star5'] ?? []}
                    layoutMode={layoutMode}
                />
            </div>

            {/* 星4以上確定 */}
            <div className="space-y-4" id="rarity-4">
                <hgroup className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Rarity 4+</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">星4以上確定</p>
                </hgroup>

                <SectionContent
                    items={groupedByRarity['star4plus'] ?? []}
                    layoutMode={layoutMode}
                />
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
