"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { useScreenshotAnalysis } from "@/hooks/useScreenshotAnalysis";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScreenshotAnalysisProps {
    applyOcrTags: (ocrTags: string[]) => void;
}

const isSupportedImage = (file: File) =>
    ["image/png", "image/jpeg", "image/webp"].includes(file.type);

export default function ScreenshotAnalysis({
    applyOcrTags,
}: ScreenshotAnalysisProps) {
    const [ocrTags, setOcrTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const isProcessingRef = useRef(false);

    const { analyzeImage, isLoading } = useScreenshotAnalysis();

    const processFile = useCallback(
        async (file: File) => {
            if (isProcessingRef.current) return;
            setError(null);

            if (!isSupportedImage(file)) {
                setError("PNG、JPEG、WebP形式の画像を選択してください。");
                return;
            }

            isProcessingRef.current = true;
            try {
                const extractedTags = await analyzeImage(file);
                if (extractedTags.length === 0) {
                    toast.error("タグの抽出に失敗しました", {
                        description:
                            "解像度や明るさなどにより、画像解析が困難な場合があります。",
                    });
                    return;
                }
                setOcrTags(extractedTags);
                applyOcrTags(extractedTags);
                toast.success("タグの抽出が完了しました", {
                    description: `タグ: ${extractedTags.join(", ")}`,
                });
            } catch (err) {
                console.error(err);
                setError("画像解析中にエラーが発生しました。");
            } finally {
                isProcessingRef.current = false;
            }
        },
        [analyzeImage, applyOcrTags],
    );

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            // Safariでは onClick 内で input.value="" をセットすると onChange が
            // ファイルピッカーを開く前に発火し、前回のファイルが渡されてしまう。
            // ここでリセットすることで、同じファイルの再選択も可能にしつつ
            // Safariの誤発火を防ぐ。
            e.target.value = "";
            if (file) void processFile(file);
        },
        [processFile],
    );

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.defaultPrevented || !e.clipboardData) return;

            const file = Array.from(e.clipboardData.files).find(
                isSupportedImage,
            );
            if (!file) return;

            e.preventDefault();
            void processFile(file);
        };

        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [processFile]);

    return (
        <>
            <hgroup className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight xl:text-xl">
                    Image Analysis
                </h2>
                <p className="mt-1 text-gray-500 dark:text-gray-400 font-bold tracking-tight xl:mt-0 xl:text-sm">
                    画像解析
                </p>
            </hgroup>
            <div>
                <div>
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 mt-4 xl:mt-2">
                        <span className="block">
                            公開求人画面のスクリーンショットを用いて、タグを抽出します
                        </span>
                    </p>
                    <ul className="text-sm ml-0 text-gray-500 list-disc list-inside mt-2 dark:text-gray-400 xl:mt-1 xl:text-xs xl:leading-5">
                        <li>横幅1000px以上の画像サイズが推奨されます</li>
                        <li>完璧にタグを抽出できない場合があります</li>
                    </ul>
                </div>
                <div className="grid w-full max-w-sm items-center gap-2 mt-6 xl:mt-4 xl:max-w-none">
                    <Label htmlFor="picture" className="xl:sr-only">
                        スクリーンショット{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                            (.png, .jpg, .jpeg, .webp)
                        </span>
                    </Label>
                    <Input
                        id="picture"
                        className="mt-1 h-auto text-sm px-2.5 py-3.5 text-gray-500 dark:text-gray-400 xl:py-2.5"
                        onChange={handleFileChange}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isLoading}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 xl:text-xs">
                        画像をコピーして、この画面に貼り付けることもできます。
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="mt-4 flex items-center gap-2">
                    <svg
                        className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                    </svg>
                    <span className="text-gray-500 dark:text-gray-400">
                        読み込み中...
                    </span>
                </div>
            )}

            {error && <p className="text-rose-600">{error}</p>}

            {ocrTags.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold">抽出されたタグ</h2>
                    <ul className="flex flex-wrap gap-2 mt-2">
                        {ocrTags.map((item, i) => (
                            <li
                                key={i}
                                className="inline-block text-xs bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-stone-950 font-bold px-3 py-1 rounded-full"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
