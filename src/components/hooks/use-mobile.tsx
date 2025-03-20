"use client";

import { useEffect, useState } from "react";

// PascalCaseの名前付き関数を使用し、単一のエクスポートにする
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // 名前付き関数を使用
        function checkIsMobile() {
            setIsMobile(window.innerWidth < 768);
        }

        // 初期チェック
        checkIsMobile();

        // リサイズイベントのリスナーを追加
        window.addEventListener("resize", checkIsMobile);

        // クリーンアップ
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
}