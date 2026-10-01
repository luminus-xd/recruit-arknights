import { useEffect, useState } from "react";

import type {
  ResultImageInput,
  ResultImageOptions,
} from "@/lib/result-image/render";

export interface ResultImageFile {
  blob: Blob;
  format: "png" | "jpeg";
  url: string;
  width: number;
  height: number;
}

/**
 * X(Twitter) の画像上限 5MB を目安に、PNG が重くなりすぎる場合は
 * 高品質 JPEG に切り替える。結果が多いと人物画像の情報量で PNG が肥大するため。
 */
const PNG_BUDGET_BYTES = 4.5 * 1024 * 1024;
const JPEG_QUALITY = 0.92;

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

async function encode(canvas: HTMLCanvasElement) {
  const png = await toBlob(canvas, "image/png");
  if (png && png.size <= PNG_BUDGET_BYTES) {
    return { blob: png, format: "png" as const };
  }
  const jpeg = await toBlob(canvas, "image/jpeg", JPEG_QUALITY);
  if (jpeg) {
    return { blob: jpeg, format: "jpeg" as const };
  }
  return png ? { blob: png, format: "png" as const } : null;
}

interface Settled {
  input: ResultImageInput;
  options: ResultImageOptions;
  image: ResultImageFile | null;
  failed: boolean;
}

/**
 * 入力やオプションが変わるたびに結果画像を描き直す。
 * 描画モジュールは初回利用時にだけ読み込み、メインバンドルを膨らませない。
 * 直前の画像は描き直しの間も保持し、プレビューが途切れないようにしている。
 */
export function useResultImage(
  input: ResultImageInput,
  options: ResultImageOptions,
) {
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { renderResultImage } = await import("@/lib/result-image/render");
        const rendered = await renderResultImage(input, options);
        const encoded = await encode(rendered.canvas);
        if (!encoded) {
          throw new Error("Failed to encode image");
        }
        if (cancelled) {
          return;
        }
        setSettled({
          input,
          options,
          failed: false,
          image: {
            ...encoded,
            url: URL.createObjectURL(encoded.blob),
            width: rendered.width,
            height: rendered.height,
          },
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSettled((prev) => ({
            input,
            options,
            failed: true,
            image: prev?.image ?? null,
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [input, options]);

  // 新しい画像に差し替わった時・アンマウント時に古い Blob URL を解放する
  const currentUrl = settled?.image?.url;
  useEffect(() => {
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [currentUrl]);

  const isCurrent = settled?.input === input && settled?.options === options;

  return {
    image: settled?.image ?? null,
    isRendering: !isCurrent,
    isError: isCurrent && settled.failed,
  };
}
