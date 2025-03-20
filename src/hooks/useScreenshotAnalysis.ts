import { useCallback, useState } from "react";
import useSWRMutation from "swr/mutation";

// 画像処理のための定数
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const IMAGE_QUALITY = 0.8;

/**
 * 画像の前処理を行う関数
 * - サイズが大きすぎる場合は圧縮
 * - 画像形式を最適化
 */
const preprocessImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // ファイルサイズチェック
        if (file.size <= MAX_IMAGE_SIZE) {
            // サイズが小さい場合は直接読み込み
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result.split(",")[1]);
                } else {
                    reject("ファイル読み込み結果が文字列ではありません。");
                }
            };
            reader.onerror = () => reject("ファイルの読み込みに失敗しました。");
            reader.readAsDataURL(file);
            return;
        }

        // 大きい画像の場合は圧縮処理
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject("Canvas 2D コンテキストの取得に失敗しました。");
            return;
        }

        const url = URL.createObjectURL(file);

        img.onload = () => {
            // 元の画像の比率を維持しながらサイズを調整
            let width = img.width;
            let height = img.height;

            // 最大幅/高さを設定（必要に応じて調整）
            const MAX_WIDTH = 2400;
            const MAX_HEIGHT = 1800;

            if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
            }

            if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            // 画像をBase64に変換
            const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

            // URLオブジェクトを解放
            URL.revokeObjectURL(url);

            // Base64データからプレフィックスを削除
            resolve(dataUrl.split(",")[1]);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject("画像の読み込みに失敗しました。");
        };

        img.src = url;
    });
};

/**
 * POSTリクエスト用のfetcher
 */
const fetcherPost = async (
    url: string,
    { arg }: { arg: { imageBase64: string } }
) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(arg),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "不明なエラー" }));
            throw new Error(errorData.error || `タグ解析に失敗しました (${res.status})`);
        }

        return res.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error("リクエストがタイムアウトしました。");
        }
        throw error;
    }
};

/**
 * スクリーンショット解析用のカスタムフック
 */
export function useScreenshotAnalysis() {
    // 解析結果のキャッシュ
    const [resultCache, setResultCache] = useState<Map<string, string[]>>(new Map());

    const { trigger, data, error, isMutating, reset } = useSWRMutation(
        "/api/parse-tags",
        fetcherPost
    );

    const saveToCache = useCallback((imageBase64: string, tags: string[]) => {
        const hash = btoa(imageBase64.substring(0, 100)); // 簡易ハッシュ
        setResultCache(prev => new Map(prev).set(hash, tags));
    }, []);

    // ファイルから画像を読み込み、前処理後に解析
    const analyzeImage = useCallback(
        async (file: File): Promise<string[]> => {
            try {
                // ファイルのハッシュを生成（簡易的な方法）
                const fileHash = `${file.name}-${file.size}-${file.lastModified}`;

                // キャッシュチェック
                if (resultCache.has(fileHash)) {
                    return resultCache.get(fileHash) || [];
                }

                // 画像の前処理
                const base64 = await preprocessImage(file);

                // APIリクエスト
                const result = await trigger({ imageBase64: base64 });

                // キャッシュに保存
                const tags = result.tags || [];
                saveToCache(base64, tags);
                setResultCache(prev => new Map(prev).set(fileHash, tags));

                return tags;
            } catch (error) {
                console.error("画像解析エラー:", error);
                throw error instanceof Error
                    ? error
                    : new Error("画像の解析中に予期せぬエラーが発生しました。");
            }
        },
        [trigger, resultCache, saveToCache]
    );

    // エラー発生時にリセット
    const resetAnalysis = useCallback(() => {
        reset();
    }, [reset]);

    return {
        analyzeImage,
        data,
        error,
        isLoading: isMutating,
        resetAnalysis
    };
}
