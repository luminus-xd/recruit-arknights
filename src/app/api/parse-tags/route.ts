import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getVisionClient } from '@/lib/google-vision';
import { allTags } from "@/lib/utils";
import levenshtein from 'fast-levenshtein';

// タグキーワードをメモリにキャッシュ
const TAG_KEYWORDS = allTags;

// ファジーマッチングの許容割合（実証済みの最適値）
const FUZZY_THRESHOLD_RATIO = 0.3;

// 結果キャッシュ（同じ画像に対する重複リクエストを防止）
const resultCache = new Map<string, string[]>();
const CACHE_MAX_SIZE = 50; // キャッシュの最大サイズ

/**
 * ファジーマッチング関数
 * @param target OCR 結果の行
 * @param keyword 比較対象のタグ
 */
const isFuzzyMatch = (target: string, keyword: string): boolean => {
    // 完全一致の場合は即時返却
    if (target === keyword) return true;

    // 職業タイプの特別処理（「先鋒タイプ」→「先鋒」など）
    const typeKeywords = ['先鋒', '前衛', '狙撃', '術師', '重装', '医療', '補助', '特殊'];
    if (typeKeywords.includes(keyword)) {
        // 「先鋒タイプ」のようなパターンをチェック
        const typeRegex = new RegExp(`${keyword}(タイプ|職業|クラス)?`, 'i');
        if (typeRegex.test(target)) return true;
    }

    // 通常の単語境界チェック
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(target)) return true;

    // 単語境界なしでもチェック（部分一致）
    const partialRegex = new RegExp(keyword, 'i');
    if (partialRegex.test(target)) {
        // 短いキーワード（3文字以下）は誤検出が多いため、追加チェック
        if (keyword.length <= 3) {
            // 短いキーワードは単語の一部として含まれる可能性が高いため、
            // 前後の文字をチェックして誤検出を減らす
            return false;
        }
        return true;
    }

    // Levenshtein距離による判定
    const distance = levenshtein.get(target.toLowerCase(), keyword.toLowerCase());
    const threshold = Math.floor(keyword.length * FUZZY_THRESHOLD_RATIO);
    return distance <= threshold;
};

/**
 * 画像ハッシュの生成
 * SHA-256を使用して画像全体から一意なハッシュを生成する。
 * 以前の先頭100文字によるキーはCanvas JPEGエンコード時に
 * 全画像で共通のJPEGヘッダー部分が一致してしまい衝突が発生していた。
 */
const generateImageHash = (imageBase64: string): string => {
    return createHash('sha256').update(imageBase64).digest('hex');
};

/**
 * キャッシュ管理関数
 */
const manageCache = () => {
    // キャッシュサイズが上限を超えた場合、古いエントリを削除
    if (resultCache.size > CACHE_MAX_SIZE) {
        const keysToDelete = Array.from(resultCache.keys()).slice(0, Math.floor(CACHE_MAX_SIZE / 4));
        keysToDelete.forEach(key => resultCache.delete(key));
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'No image data provided.' },
                { status: 400 }
            );
        }

        // キャッシュチェック
        const imageHash = generateImageHash(imageBase64);
        if (resultCache.has(imageHash)) {
            return NextResponse.json({
                tags: resultCache.get(imageHash),
                cached: true
            });
        }

        const buffer = Buffer.from(imageBase64, 'base64');
        const client = getVisionClient();

        const [result] = await Promise.race([
            client.documentTextDetection({
                image: { content: buffer },
                imageContext: {
                    languageHints: ["ja", "en"],
                }
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Vision API request timeout')), 15000)
            )
        ]);

        const detections = result.fullTextAnnotation?.text || '';

        const lines: string[] = detections
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 1); // 1文字以下の行は無視

        // 結果を格納する Set
        const foundTags = new Set<string>();

        // 特殊なタグを先に処理（優先度の高いタグ）
        const specialTags = ["上級エリート", "エリート", "ロボット"];
        const regularTags = TAG_KEYWORDS.filter(tag => !specialTags.includes(tag));

        // 特殊タグの処理
        for (const line of lines) {
            // 上級エリートの処理
            if (isFuzzyMatch(line, "上級エリート")) {
                foundTags.add("上級エリート");

                // 行内に「上級エリート」以外の独立した「エリート」が存在するかチェック
                if (/(?<!上級)エリート/.test(line)) {
                    foundTags.add("エリート");
                }
                continue;
            }

            // エリートの処理
            if (isFuzzyMatch(line, "エリート")) {
                foundTags.add("エリート");
                continue;
            }

            // ロボットの処理
            if (isFuzzyMatch(line, "ロボット")) {
                foundTags.add("ロボット");
            }
        }

        // 通常タグの処理
        const tagPromises = lines.map(async (line) => {
            const matchedTags = regularTags.filter(tag => isFuzzyMatch(line, tag));
            return matchedTags;
        });

        const tagResults = await Promise.all(tagPromises);
        tagResults.flat().forEach(tag => foundTags.add(tag));

        const uniqueTags = Array.from(foundTags);

        // キャッシュに結果を保存
        resultCache.set(imageHash, uniqueTags);
        manageCache();

        // デバッグ情報（本番環境では削除または条件付きで出力）
        if (process.env.NODE_ENV === 'development') {
            console.log("OCR取得結果の行:", lines);
            console.log("抽出されたタグ:", uniqueTags);
        }

        return NextResponse.json({ tags: uniqueTags });
    } catch (error) {
        console.error("OCR処理エラー:", error);

        // エラーの種類に応じた適切なレスポンス
        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                return NextResponse.json(
                    { error: 'Request timeout. Please try with a smaller image.' },
                    { status: 408 }
                );
            }

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
