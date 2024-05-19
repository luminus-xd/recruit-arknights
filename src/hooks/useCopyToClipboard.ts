import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * 現在のURLをクリップボードにコピーする
 * @returns
 */
const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    if (navigator.clipboard && window.location.href) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setIsCopied(true);
          toast.success("URLがクリップボードにコピーされました");
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => {
          setIsCopied(false);
          toast.error("URLのコピーに失敗しました");
        });
    }
  }, []);

  return { isCopied, copyToClipboard };
};

export default useCopyToClipboard;
