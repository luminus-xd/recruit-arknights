import { NextRequest, NextResponse } from 'next/server';
import { getVisionClient } from '@/lib/google-vision';
import { allTags } from "@/lib/utils";

// タグのキーワード例
const TAG_KEYWORDS = allTags;

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

        // APIクライアント取得
        const client = getVisionClient();

        // OCRを実行
        const [result] = await client.documentTextDetection({
            image: { content: buffer },
            imageContext: {
                languageHints: ["ja", "en"],
            },
        });

        const detections = result.fullTextAnnotation?.text || '';

        // 行ごとに分割
        const lines: string[] = detections
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

        // キーワードを含む行を抽出し、重複排除
        const foundTags: string[] = [];
        for (const line of lines) {
            for (const keyword of TAG_KEYWORDS) {
                if (line.includes(keyword)) {
                    foundTags.push(keyword);
                }
            }
        }
        const uniqueTags = Array.from(new Set(foundTags));

        console.log(lines);

        return NextResponse.json({ tags: uniqueTags });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}