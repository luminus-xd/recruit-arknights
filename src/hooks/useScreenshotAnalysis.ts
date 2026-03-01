import { useCallback, useRef } from "react";
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
        // ファイルタイプの検証
        if (!file.type.startsWith('image/')) {
            reject("サポートされていない画像形式です。");
            return;
        }

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
            try {
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

                // Androidの一部デバイスで画像描画に問題がある場合の対策
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // 画像をBase64に変換
                const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

                // Base64データからプレフィックスを削除
                const base64Data = dataUrl.split(",")[1];

                if (!base64Data) {
                    throw new Error("画像の変換に失敗しました");
                }

                resolve(base64Data);
            } catch (err) {
                reject("画像処理中にエラーが発生しました: " + (err instanceof Error ? err.message : String(err)));
            } finally {
                // URLオブジェクトを解放
                URL.revokeObjectURL(url);
            }
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
 * base64画像データからコンテンツベースのキャッシュキーを生成する。
 *
 * Canvas JPEGエンコードでは先頭部分がJPEGヘッダー（SOI/APP0/DQT）で
 * 全画像共通になるため、先頭のみを使うと衝突が発生する。
 * iOS Safariのスクリーンショットは常に1MB超でCanvas圧縮が適用されるため
 * このヘッダー衝突問題は特にSafariで顕在化していた。
 *
 * 対策として先頭1000文字（ヘッダー領域）をスキップし、
 * 中間・末尾を含めた複数位置のデータを組み合わせてキーを生成する。
 */
const getImageCacheKey = (base64: string): string => {
    const len = base64.length;
    // JPEGヘッダー（~700 base64文字）をスキップして画像固有のデータを使用
    const skip = Math.min(1000, Math.floor(len * 0.1));
    const mid = Math.floor(len * 0.5);
    return `${len}_${base64.substring(skip, skip + 64)}_${base64.substring(mid, mid + 64)}_${base64.substring(Math.max(0, len - 64))}`;
};

/**
 * スクリーンショット解析用のカスタムフック
 */
export function useScreenshotAnalysis() {
    // 解析結果のキャッシュ（画像コンテンツベースのキーで管理）
    const resultCacheRef = useRef(new Map<string, string[]>());

    const { trigger, data, error, isMutating, reset } = useSWRMutation(
        "/api/parse-tags",
        fetcherPost
    );

    // ファイルから画像を読み込み、前処理後に解析
    const analyzeImage = useCallback(
        async (file: File): Promise<string[]> => {
            try {
                if (!file || !(file instanceof File)) {
                    throw new Error("有効なファイルが選択されていません。");
                }

                // 画像の前処理（base64に変換）
                // NOTE: キャッシュキーはファイルメタデータ（name/size/lastModified）ではなく
                // 画像コンテンツから生成する。iOS SafariではlastModified=0になるため
                // メタデータベースのキーは異なる画像で衝突する可能性がある。
                const base64 = await preprocessImage(file);

                // コンテンツベースのキャッシュチェック
                const cacheKey = getImageCacheKey(base64);
                if (resultCacheRef.current.has(cacheKey)) {
                    return resultCacheRef.current.get(cacheKey) || [];
                }

                // APIリクエスト
                const result = await trigger({ imageBase64: base64 });

                // キャッシュに保存
                const tags = result.tags || [];
                resultCacheRef.current.set(cacheKey, tags);

                return tags;
            } catch (error) {
                console.error("画像解析エラー:", error);
                throw error instanceof Error
                    ? error
                    : new Error("画像の解析中に予期せぬエラーが発生しました。");
            }
        },
        [trigger]
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
