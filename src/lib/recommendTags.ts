import { Operator, Recruit } from "@/types/recruit";

/**
 * 星4以上のオペレーターを特定できるタグ組み合わせを検出する
 * @param recruitData - リクルートデータ
 * @returns - 検出されたタグ組み合わせとそれに対応するオペレーター
 */
export function detectRecommendedTags(recruitData: Recruit): { [key: string]: Operator[] } {
    if (!recruitData || recruitData.length === 0) {
        return {};
    }

    // 除外するタグ
    const excludedTags = ["上級エリート", "エリート", "ロボット"];

    // 全タグを収集（除外タグを除く）
    const allTags = new Set<string>();

    // 職業タイプも含める
    const allTypes = new Set<string>();

    recruitData.forEach((operator) => {
        // tagsが文字列の場合（"['近距離', '支援', 'ロボット']"のような形式）
        if (typeof operator.tags === 'string') {
            try {
                const tagsStr = operator.tags as string;
                const tagsArray = tagsStr
                    .replace(/'/g, '"')
                    .replace(/\[|\]/g, '')
                    .split(', ')
                    .map((tag: string) => tag.replace(/"/g, '').trim());

                tagsArray.forEach(tag => {
                    if (!excludedTags.includes(tag)) {
                        allTags.add(tag);
                    }
                });
            } catch (e) {
                console.error('タグの解析エラー:', e);
            }
        } else if (Array.isArray(operator.tags)) {
            operator.tags.forEach(tag => {
                if (!excludedTags.includes(tag as string)) {
                    allTags.add(tag as string);
                }
            });
        }

        // 職業タイプを追加
        allTypes.add(operator.type);
    });

    // タグと職業タイプを結合
    const allTagsAndTypes = [...Array.from(allTags), ...Array.from(allTypes)];

    // タグの組み合わせを生成（1つ、2つ、3つの組み合わせ）
    const combinations: string[][] = [];

    // 1つのタグ
    allTagsAndTypes.forEach(tag => {
        combinations.push([tag]);
    });

    // 2つのタグの組み合わせ
    for (let i = 0; i < allTagsAndTypes.length; i++) {
        for (let j = i + 1; j < allTagsAndTypes.length; j++) {
            combinations.push([allTagsAndTypes[i], allTagsAndTypes[j]]);
        }
    }

    // 3つのタグの組み合わせ
    for (let i = 0; i < allTagsAndTypes.length; i++) {
        for (let j = i + 1; j < allTagsAndTypes.length; j++) {
            for (let k = j + 1; k < allTagsAndTypes.length; k++) {
                combinations.push([allTagsAndTypes[i], allTagsAndTypes[j], allTagsAndTypes[k]]);
            }
        }
    }

    // 各組み合わせに対して、星4以上のオペレーターのみを含む組み合わせを検出
    const recommendedCombinations: { [key: string]: Operator[] } = {};

    combinations.forEach(combination => {
        const filteredOperators = filterByCombination(recruitData, combination);

        // 星6のオペレーターは上級エリートタグがないと出現しないため除外
        const validOperators = filteredOperators.filter(op => op.rarity !== 6);

        // 星4以上のオペレーターのみを抽出
        const highRarityOperators = validOperators.filter(op => op.rarity >= 4);

        // 星4以上のオペレーターが存在し、かつ全てのオペレーターが星4以上の場合のみ追加
        if (highRarityOperators.length > 0 && highRarityOperators.length === validOperators.length) {
            const combinationKey = combination.join(" + ");
            recommendedCombinations[combinationKey] = highRarityOperators.sort((a, b) => a.rarity - b.rarity);
        }
    });

    // 結果をソート（オペレーターの最低レアリティが高い順）
    const sortedResults = Object.entries(recommendedCombinations).sort((a, b) => {
        // 最低レアリティを比較
        const aMinRarity = Math.min(...a[1].map(op => op.rarity));
        const bMinRarity = Math.min(...b[1].map(op => op.rarity));

        if (bMinRarity !== aMinRarity) {
            return bMinRarity - aMinRarity; // 最低レアリティが高い順
        }

        // 最低レアリティが同じ場合はタグの数で比較（少ない方が上）
        const aTagCount = a[0].split(" + ").length;
        const bTagCount = b[0].split(" + ").length;

        if (aTagCount !== bTagCount) {
            return aTagCount - bTagCount;
        }

        // タグの数も同じ場合はオペレーターの数で比較（少ない方が上）
        return a[1].length - b[1].length;
    });

    return Object.fromEntries(sortedResults);
}

/**
 * 選択された項目の組み合わせに基づいてオペレーターをフィルタリング
 * @param recruitData - リクルートデータ
 * @param combination - 選択された項目の組み合わせ
 * @returns - フィルタリングされたオペレーター
 */
function filterByCombination(recruitData: Recruit, combination: string[]): Operator[] {
    return recruitData.filter((operator: Operator) => {
        return combination.every((item) => {
            if (operator.type === item) return true;

            // tagsが文字列の場合（"['近距離', '支援', 'ロボット']"のような形式）
            if (typeof operator.tags === 'string') {
                try {
                    const tagsStr = operator.tags as string;
                    const tagsArray = tagsStr
                        .replace(/'/g, '"')
                        .replace(/\[|\]/g, '')
                        .split(', ')
                        .map((tag: string) => tag.replace(/"/g, '').trim());

                    return tagsArray.includes(item);
                } catch (e) {
                    console.error('タグの解析エラー:', e);
                    return false;
                }
            }

            // 通常の配列の場合
            return Array.isArray(operator.tags) && operator.tags.includes(item as any);
        });
    });
}