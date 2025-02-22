"use client";

import React, { useState } from 'react';
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScreenshotAnalysisProps {
    checkedItems: { [key: string]: boolean };
    setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    selectedCount: number;
    setSelectedCount: React.Dispatch<React.SetStateAction<number>>;
    applyOcrTags: (ocrTags: string[]) => void;
}

export default function ScreenshotAnalysis(props: ScreenshotAnalysisProps) {
    const { applyOcrTags } = props;

    const [ocrTags, setOcrTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                if (typeof reader.result === "string") {
                    // "data:image/png;base64,..." の形で返ってくるので、カンマ以降を取り出す
                    const base64 = reader.result.split(",")[1];

                    const response = await fetch("/api/parse-tags", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ imageBase64: base64 }),
                    });

                    if (!response.ok) {
                        const { error } = await response.json();
                        setError(error);
                        return;
                    }

                    const data = await response.json();
                    const extractedTags: string[] = data.tags || [];

                    if (extractedTags.length === 0) {
                        toast.error("タグの抽出に失敗しました", {
                            description: "解像度や明るさなどにより、画像解析が困難な場合があります。",
                        });
                        return;
                    }

                    setOcrTags(extractedTags);
                    applyOcrTags(extractedTags);

                    toast.success(
                        "タグの抽出が完了しました",
                        {
                            description: `タグ: ${extractedTags.join(", ")}`,
                        }
                    );
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setError("ファイルの読み込みでエラーが発生しました。");
        }
    };

    return (
        <>
            <hgroup className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">Image Analysis</h2>
                <p className="mt-1 text-gray-500 dark:text-gray-400">画像解析</p>
            </hgroup>
            <div className="grid w-full max-w-sm items-center gap-2 mt-6">
                <Label htmlFor="picture">公開求人画面のスクリーンショット</Label>
                <Input
                    id="picture"
                    onChange={handleFileChange}
                    type="file"
                    accept="image/*"
                    placeholder=''
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {ocrTags.length > 0 && (
                <div className="mt-4">
                    <h2>抽出されたタグ</h2>
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