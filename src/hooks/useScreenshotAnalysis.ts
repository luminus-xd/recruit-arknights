import { useCallback, useRef } from "react";
import useSWRMutation from "swr/mutation";

import { OCR_TIMEOUT } from "@/lib/constants";
import { getImageCacheKey } from "@/lib/image-cache-key";
import { preprocessImage } from "@/lib/image-preprocess";

/**
 * POSTリクエスト用のfetcher
 */
const fetcherPost = async (
  url: string,
  { arg }: { arg: { imageBase64: string } },
) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      OCR_TIMEOUT.CLIENT_MS,
    );

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "不明なエラー" }));
        throw new Error(
          errorData.error || `タグ解析に失敗しました (${res.status})`,
        );
      }

      return res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("リクエストがタイムアウトしました。");
    }
    throw error;
  }
};

/**
 * スクリーンショット解析用のカスタムフック
 */
export function useScreenshotAnalysis() {
  // 解析結果のキャッシュ（画像コンテンツベースのキーで管理）
  const resultCacheRef = useRef(new Map<string, string[]>());

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    "/api/parse-tags",
    fetcherPost,
  );

  // ファイルから画像を読み込み、前処理後に解析
  const analyzeImage = useCallback(
    async (file: File): Promise<string[]> => {
      try {
        if (!file || !(file instanceof File)) {
          throw new Error("有効なファイルが選択されていません。");
        }

        // NOTE: キャッシュキーはファイルメタデータ（name/size/lastModified）ではなく
        // 画像コンテンツから生成する。iOS SafariではlastModified=0になるため
        // メタデータベースのキーは異なる画像で衝突する可能性がある。
        const base64 = await preprocessImage(file);

        const cacheKey = getImageCacheKey(base64);
        if (resultCacheRef.current.has(cacheKey)) {
          return resultCacheRef.current.get(cacheKey) || [];
        }

        const result = await trigger({ imageBase64: base64 });

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
    [trigger],
  );

  const resetAnalysis = useCallback(() => {
    reset();
  }, [reset]);

  return {
    analyzeImage,
    data,
    error,
    isLoading: isMutating,
    resetAnalysis,
  };
}
