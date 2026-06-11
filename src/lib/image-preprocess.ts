const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const IMAGE_QUALITY = 0.8;
const MAX_WIDTH = 2400;
const MAX_HEIGHT = 1800;

/**
 * 画像の前処理を行う関数。
 * サイズが大きすぎる場合は圧縮し、API に渡す base64 文字列へ変換する。
 */
export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject("サポートされていない画像形式です。");
      return;
    }

    if (file.size <= MAX_IMAGE_SIZE) {
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

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject("Canvas 2D コンテキストの取得に失敗しました。");
      return;
    }

    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

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

        const dataUrl = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
        const base64Data = dataUrl.split(",")[1];

        if (!base64Data) {
          throw new Error("画像の変換に失敗しました");
        }

        resolve(base64Data);
      } catch (err) {
        reject(
          "画像処理中にエラーが発生しました: " +
            (err instanceof Error ? err.message : String(err)),
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject("画像の読み込みに失敗しました。");
    };

    img.src = url;
  });
}
