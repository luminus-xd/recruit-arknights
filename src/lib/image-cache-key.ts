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
export function getImageCacheKey(base64: string): string {
  const len = base64.length;
  // JPEGヘッダー（~700 base64文字）をスキップして画像固有のデータを使用
  const skip = Math.min(1000, Math.floor(len * 0.1));
  const mid = Math.floor(len * 0.5);

  return `${len}_${base64.substring(skip, skip + 64)}_${base64.substring(
    mid,
    mid + 64,
  )}_${base64.substring(Math.max(0, len - 64))}`;
}
