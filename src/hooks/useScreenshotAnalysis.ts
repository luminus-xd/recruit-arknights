import { useCallback } from "react";
import useSWRMutation from "swr/mutation";

/**
 * FileReaderによるファイル読み込み
 * @param file 
 * @returns 
 */
const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject("ファイル読み込み結果が文字列ではありません。");
            }
        };
        reader.onerror = () => reject("ファイルの読み込みに失敗しました。");
        reader.readAsDataURL(file);
    });
};

/**
 * POSTリクエスト用のfetcher
 * @param url - Fetch先のURL
 * @returns 
 */
const fetcherPost = async (
    url: string,
    { arg }: { arg: { imageBase64: string } }
) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "タグ解析に失敗しました");
    }
    return res.json();
};

/**
 * スクリーンショット解析用のカスタムフック
 */
export function useScreenshotAnalysis() {
    const { trigger, data, error, isMutating } = useSWRMutation(
        "/api/parse-tags",
        fetcherPost
    );

    // ファイルから画像を読み込み、base64変換後に解析
    const analyzeImage = useCallback(
        async (file: File): Promise<string[]> => {
            const fileDataUrl = await readFileAsync(file);
            const base64 = fileDataUrl.split(",")[1];
            const result = await trigger({ imageBase64: base64 });
            return result.tags || [];
        },
        [trigger]
    );

    return { analyzeImage, data, error, isLoading: isMutating };
}
