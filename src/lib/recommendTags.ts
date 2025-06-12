import { Operator, Recruit, Tag, RarityTag } from "@/types/recruit";
import { isValidTag, type AllTag } from "@/lib/utils";

/**
 * 星4以上または星5確定のオペレーターを特定できるタグ組み合わせを検出する
 * @param recruitData - リクルートデータ
 * @returns - 検出されたタグ組み合わせとそれに対応するオペレーター（星5確定と星4以上確定に分類）
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

    // 各組み合わせに対して、条件に合うオペレーターを検出
    const star5Combinations: { [key: string]: Operator[] } = {}; // 星5確定
    const star4PlusCombinations: { [key: string]: Operator[] } = {}; // 星4以上確定（星5を含む可能性あり）

    combinations.forEach(combination => {
        const filteredOperators = filterByCombination(recruitData, combination);

        // 星6のオペレーターは上級エリートタグがないと出現しないため除外
        const validOperators = filteredOperators.filter(op => op.rarity !== 6);

        // ロボットタグを持つオペレーターを除外
        const operatorsWithoutRobots = validOperators.filter(op => {
            // tagsが文字列の場合
            if (typeof op.tags === 'string') {
                try {
                    const tagsStr = op.tags as string;
                    const tagsArray = tagsStr
                        .replace(/'/g, '"')
                        .replace(/\[|\]/g, '')
                        .split(', ')
                        .map((tag: string) => tag.replace(/"/g, '').trim());

                    return !tagsArray.includes('ロボット');
                } catch (e) {
                    console.error('タグの解析エラー:', e);
                    return true;
                }
            }
            // 配列の場合
            return !(Array.isArray(op.tags) && op.tags.includes('ロボット'));
        });

        // 星5のオペレーターのみを抽出
        const star5Operators = operatorsWithoutRobots.filter(op => op.rarity === 5);

        // 星4以上のオペレーターを抽出
        const star4PlusOperators = operatorsWithoutRobots.filter(op => op.rarity >= 4);

        const combinationKey = combination.join(" + ");

        // 星5確定の組み合わせを検出（全てのオペレーターが星5）
        if (star5Operators.length > 0 && operatorsWithoutRobots.every(op => op.rarity === 5)) {
            star5Combinations[combinationKey] = star5Operators.sort((a, b) => a.rarity - b.rarity);
        }

        // 星4以上確定の組み合わせを検出（全てのオペレーターが星4以上）
        else if (star4PlusOperators.length > 0 && operatorsWithoutRobots.every(op => op.rarity >= 4)) {
            star4PlusCombinations[combinationKey] = star4PlusOperators.sort((a, b) => a.rarity - b.rarity);
        }
    });

    // 星5確定の結果をソート
    const sortedStar5Results = Object.entries(star5Combinations).sort((a, b) => {
        // タグの数で比較（少ない方が上）
        const aTagCount = a[0].split(" + ").length;
        const bTagCount = b[0].split(" + ").length;

        if (aTagCount !== bTagCount) {
            return aTagCount - bTagCount;
        }

        // タグの数も同じ場合はオペレーターの数で比較（少ない方が上）
        return a[1].length - b[1].length;
    });

    // 星4以上確定の結果をソート
    const sortedStar4PlusResults = Object.entries(star4PlusCombinations).sort((a, b) => {
        // タグの数で比較（少ない方が上）
        const aTagCount = a[0].split(" + ").length;
        const bTagCount = b[0].split(" + ").length;

        if (aTagCount !== bTagCount) {
            return aTagCount - bTagCount;
        }

        // タグの数も同じ場合はオペレーターの数で比較（少ない方が上）
        return a[1].length - b[1].length;
    });

    // 星5確定の重複するオペレーター組み合わせを除外
    const deduplicatedStar5Results: [string, Operator[]][] = [];
    const seenStar5OperatorSets = new Map<string, number>();

    for (const [tags, operators] of sortedStar5Results) {
        // オペレーターのIDをソートしてキーを作成
        const operatorKey = operators.map(op => op.id).sort((a, b) => a - b).join(',');

        // この組み合わせが既に見つかっているか確認
        if (seenStar5OperatorSets.has(operatorKey)) {
            // 既存のタグ組み合わせのインデックスを取得
            const existingIndex = seenStar5OperatorSets.get(operatorKey)!;
            const existingEntry = deduplicatedStar5Results[existingIndex];
            const existingTagsCount = existingEntry[0].split(" + ").length;
            const currentTagsCount = tags.split(" + ").length;

            // 現在のタグ数が少ない場合は既存のものを置き換える
            if (currentTagsCount < existingTagsCount) {
                deduplicatedStar5Results[existingIndex] = [tags, operators];
            }
            // タグ数が同じでオペレーター数が少ない場合も置き換える
            else if (currentTagsCount === existingTagsCount && operators.length < existingEntry[1].length) {
                deduplicatedStar5Results[existingIndex] = [tags, operators];
            }
        } else {
            // 新しい組み合わせを追加
            seenStar5OperatorSets.set(operatorKey, deduplicatedStar5Results.length);
            deduplicatedStar5Results.push([tags, operators]);
        }
    }

    // 星4以上確定の重複するオペレーター組み合わせを除外
    const deduplicatedStar4PlusResults: [string, Operator[]][] = [];
    const seenStar4PlusOperatorSets = new Map<string, number>();

    for (const [tags, operators] of sortedStar4PlusResults) {
        // オペレーターのIDをソートしてキーを作成
        const operatorKey = operators.map(op => op.id).sort((a, b) => a - b).join(',');

        // この組み合わせが既に見つかっているか確認
        if (seenStar4PlusOperatorSets.has(operatorKey)) {
            // 既存のタグ組み合わせのインデックスを取得
            const existingIndex = seenStar4PlusOperatorSets.get(operatorKey)!;
            const existingEntry = deduplicatedStar4PlusResults[existingIndex];
            const existingTagsCount = existingEntry[0].split(" + ").length;
            const currentTagsCount = tags.split(" + ").length;

            // 現在のタグ数が少ない場合は既存のものを置き換える
            if (currentTagsCount < existingTagsCount) {
                deduplicatedStar4PlusResults[existingIndex] = [tags, operators];
            }
            // タグ数が同じでオペレーター数が少ない場合も置き換える
            else if (currentTagsCount === existingTagsCount && operators.length < existingEntry[1].length) {
                deduplicatedStar4PlusResults[existingIndex] = [tags, operators];
            }
        } else {
            // 新しい組み合わせを追加
            seenStar4PlusOperatorSets.set(operatorKey, deduplicatedStar4PlusResults.length);
            deduplicatedStar4PlusResults.push([tags, operators]);
        }
    }

    // 星5確定と星4以上確定の結果を結合し、各エントリーにレアリティ情報を追加
    const finalResults: [string, Operator[]][] = [
        ...deduplicatedStar5Results.map(([tags, operators]): [string, Operator[]] => [`${tags} [星5確定]`, operators]),
        ...deduplicatedStar4PlusResults.map(([tags, operators]): [string, Operator[]] => [`${tags} [星4以上確定]`, operators])
    ];

    return Object.fromEntries(finalResults);
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
            if (Array.isArray(operator.tags) && isValidTag(item)) {
                // タイプと一致するかチェック
                if (item === operator.type) {
                    return true;
                }
                // タグ配列内に含まれるかチェック
                return operator.tags.includes(item as Tag | RarityTag);
            }
            return false;
        });
    });
}