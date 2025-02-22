import { NextRequest, NextResponse } from 'next/server';
import { getVisionClient } from '@/lib/google-vision';
import { allTags } from "@/lib/utils";
import levenshtein from 'fast-levenshtein';

const TAG_KEYWORDS = allTags;

// ファジーマッチングの許容割合（例：キーワード長の30%以内の差ならマッチとする）
const FUZZY_THRESHOLD_RATIO = 0.3;

/**
 * キーワードと対象テキストがファジーマッチするかどうかを判定する。
 * まずは正規表現による完全一致チェック（大文字小文字無視）、
 * その上で Levenshtein 距離による判定を行う。
 * @param target OCR 結果の行
 * @param keyword 比較対象のタグ
 */
const isFuzzyMatch = (target: string, keyword: string): boolean => {
    const regex = new RegExp(keyword, 'i');
    if (regex.test(target)) return true;

    const distance = levenshtein.get(target, keyword);
    const threshold = Math.floor(keyword.length * FUZZY_THRESHOLD_RATIO);
    return distance <= threshold;
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

        const buffer = Buffer.from(imageBase64, 'base64');
        const client = getVisionClient();

        // OCR を実行
        const [result] = await client.documentTextDetection({
            image: { content: buffer },
            imageContext: {
                languageHints: ["ja", "en"],
            },
        });

        const detections = result.fullTextAnnotation?.text || '';
        const lines: string[] = detections
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        // 結果を格納する Set
        const foundTags = new Set<string>();

        // 各行について処理
        for (const line of lines) {
            // まず「上級エリート」と「エリート」について特別に処理
            if (isFuzzyMatch(line, "上級エリート")) {
                // 行内に「上級エリート」が含まれる場合は必ず抽出
                foundTags.add("上級エリート");

                // 行内に「上級エリート」以外の独立した「エリート」が存在するかチェック
                // 正規表現の lookbehind で「上級」に続かない「エリート」を探す
                if (/(?<!上級)エリート/.test(line)) {
                    foundTags.add("エリート");
                }
            } else if (isFuzzyMatch(line, "エリート")) {
                // 「上級エリート」がない場合、単体で「エリート」があれば抽出
                foundTags.add("エリート");
            }

            // その他のタグについては通常の処理
            for (const keyword of TAG_KEYWORDS.filter(k => k !== "エリート" && k !== "上級エリート")) {
                if (isFuzzyMatch(line, keyword)) {
                    foundTags.add(keyword);
                }
            }
        }

        const uniqueTags = Array.from(foundTags);

        console.log("OCR取得結果の行:", lines);
        console.log("抽出されたタグ:", uniqueTags);

        return NextResponse.json({ tags: uniqueTags });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
