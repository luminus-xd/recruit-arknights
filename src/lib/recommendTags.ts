import { RARITY } from "@/lib/constants";
import {
    filterByCombination,
    getOperatorTags,
    operatorHasTag,
} from "@/lib/operatorMatching";
import type { Operator, Recruit } from "@/types/recruit";

const EXCLUDED_TAGS = ["上級エリート", "エリート", "ロボット"] as const;

/**
 * 星4以上または星5確定のオペレーターを特定できるタグ組み合わせを検出する
 * @param recruitData - リクルートデータ
 * @returns - 検出されたタグ組み合わせとそれに対応するオペレーター（星5確定と星4以上確定に分類）
 */
export function detectRecommendedTags(recruitData: Recruit): { [key: string]: Operator[] } {
    if (!recruitData || recruitData.length === 0) {
        return {};
    }

    const combinations = collectCandidateCombinations(recruitData);
    const { star5, star4Plus } = classifyCombinations(recruitData, combinations);

    const finalResults: [string, Operator[]][] = [
        ...sortAndDeduplicate(star5).map(([tags, operators]): [string, Operator[]] => [`${tags} [星5確定]`, operators]),
        ...sortAndDeduplicate(star4Plus).map(([tags, operators]): [string, Operator[]] => [`${tags} [星4以上確定]`, operators])
    ];

    return Object.fromEntries(finalResults);
}

/** タグ1個・2個の組み合わせを列挙する */
function collectCandidateCombinations(recruitData: Recruit): string[][] {
    // 全タグを収集（除外タグを除く）
    const allTags = new Set<string>();

    // 職業タイプも含める
    const allTypes = new Set<string>();

    recruitData.forEach((operator) => {
        getOperatorTags(operator).forEach(tag => {
            if (!EXCLUDED_TAGS.includes(tag as (typeof EXCLUDED_TAGS)[number])) {
                allTags.add(tag);
            }
        });

        // 職業タイプを追加
        allTypes.add(operator.type);
    });

    // タグと職業タイプを結合
    const allTagsAndTypes = [...Array.from(allTags), ...Array.from(allTypes)];

    // タグの組み合わせを生成（1つ、2つの組み合わせ）
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

    return combinations;
}

/** 組み合わせを「星5確定」「星4以上確定」に分類する */
function classifyCombinations(
    recruitData: Recruit,
    combinations: string[][],
): {
    star5: Record<string, Operator[]>;
    star4Plus: Record<string, Operator[]>;
} {
    // 各組み合わせに対して、条件に合うオペレーターを検出
    const star5Combinations: { [key: string]: Operator[] } = {}; // 星5確定
    const star4PlusCombinations: { [key: string]: Operator[] } = {}; // 星4以上確定（星5を含む可能性あり）

    combinations.forEach(combination => {
        const filteredOperators = filterByCombination(recruitData, combination);

        // 星6のオペレーターは上級エリートタグがないと出現しないため除外
        const validOperators = filteredOperators.filter(op => op.rarity !== RARITY.UPPER_ELITE);

        // ロボットタグを持つオペレーターを除外
        const operatorsWithoutRobots = validOperators.filter(op => !operatorHasTag(op, "ロボット"));

        // 星5のオペレーターのみを抽出
        const star5Operators = operatorsWithoutRobots.filter(op => op.rarity === RARITY.ELITE);

        // 星4以上のオペレーターを抽出
        const star4PlusOperators = operatorsWithoutRobots.filter(op => op.rarity >= RARITY.HIGH_RARITY_MIN);

        const combinationKey = combination.join(" + ");

        // 星5確定の組み合わせを検出（全てのオペレーターが星5）
        if (star5Operators.length > 0 && operatorsWithoutRobots.every(op => op.rarity === RARITY.ELITE)) {
            star5Combinations[combinationKey] = star5Operators.sort((a, b) => a.rarity - b.rarity);
        }

        // 星4以上確定の組み合わせを検出（全てのオペレーターが星4以上）
        else if (star4PlusOperators.length > 0 && operatorsWithoutRobots.every(op => op.rarity >= RARITY.HIGH_RARITY_MIN)) {
            star4PlusCombinations[combinationKey] = star4PlusOperators.sort((a, b) => a.rarity - b.rarity);
        }
    });

    return {
        star5: star5Combinations,
        star4Plus: star4PlusCombinations,
    };
}

/**
 * タグ数昇順 → オペレーター数昇順でソートし、同一オペレーター集合を除外する。
 * 同一集合ではタグ数が少ない方、同数ならオペレーター数が少ない方を採用する。
 */
function sortAndDeduplicate(
    combinations: Record<string, Operator[]>,
): [string, Operator[]][] {
    const sortedResults = Object.entries(combinations).sort((a, b) => {
        // タグの数で比較（少ない方が上）
        const aTagCount = a[0].split(" + ").length;
        const bTagCount = b[0].split(" + ").length;

        if (aTagCount !== bTagCount) {
            return aTagCount - bTagCount;
        }

        // タグの数も同じ場合はオペレーターの数で比較（少ない方が上）
        return a[1].length - b[1].length;
    });

    const deduplicatedResults: [string, Operator[]][] = [];
    const seenOperatorSets = new Map<string, number>();

    for (const [tags, operators] of sortedResults) {
        // オペレーターのIDをソートしてキーを作成
        const operatorKey = operators.map(op => op.id).sort((a, b) => a - b).join(',');

        // この組み合わせが既に見つかっているか確認
        if (seenOperatorSets.has(operatorKey)) {
            // 既存のタグ組み合わせのインデックスを取得
            const existingIndex = seenOperatorSets.get(operatorKey)!;
            const existingEntry = deduplicatedResults[existingIndex];
            const existingTagsCount = existingEntry[0].split(" + ").length;
            const currentTagsCount = tags.split(" + ").length;

            // 現在のタグ数が少ない場合は既存のものを置き換える
            if (currentTagsCount < existingTagsCount) {
                deduplicatedResults[existingIndex] = [tags, operators];
            }
            // タグ数が同じでオペレーター数が少ない場合も置き換える
            else if (currentTagsCount === existingTagsCount && operators.length < existingEntry[1].length) {
                deduplicatedResults[existingIndex] = [tags, operators];
            }
        } else {
            // 新しい組み合わせを追加
            seenOperatorSets.set(operatorKey, deduplicatedResults.length);
            deduplicatedResults.push([tags, operators]);
        }
    }

    return deduplicatedResults;
}
