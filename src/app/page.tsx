"use client";

import { RecruitProvider } from "@/contexts/RecruitContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import Recruit from "@/components/recruit";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { ClipboardCopy } from "lucide-react";

export default function Home() {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <RecruitProvider>
        <article key="1" className="container mx-auto px-4 py-8">
          <div>
            <h1 className="text-5xl font-bold">Recruitment</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              絞り込みを行うタグを選択してください
            </p>
            <div className="mt-4">
              <Button onClick={copyToClipboard}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                {isCopied
                  ? "URLがコピーされました"
                  : "クリップボードにURLをコピー"}
              </Button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                コピーされたURLを共有することで、タグの選択状態も共有できます。
              </p>
              <ul className="flex flex-col mt-4 gap-2">
                <li className="text-sm font-bold">
                  <time
                    className="text-rose-600 dark:text-rose-500"
                    dateTime="2025-01-01"
                  >
                    2025-01-01
                  </time>
                  <br />
                  <span>
                    オペレーターのアイコンをホバーする際に、オペレーター名を表示するよう仕様を追加しました。
                  </span>
                </li>
                <li className="text-sm font-bold">
                  <time
                    className="text-rose-600 dark:text-rose-500"
                    dateTime="2024-12-31"
                  >
                    2024-12-31
                  </time>
                  <br />
                  <span>
                    エリート、及び上級エリートを選択した場合に、優先してエリート系列のオペレーターを表示するようにロジックを変更しました。
                  </span>
                </li>
                <li className="text-sm font-bold">
                  <time
                    className="text-rose-600 dark:text-rose-500"
                    dateTime="2024-07-31"
                  >
                    2024-10-31
                  </time>
                  <br />
                  <span>
                    PhonoR-0、バブル、アオスタ、ブレミシャインを追加しました。
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <Recruit />
        </article>
      </RecruitProvider>
      <Toaster richColors />
    </main>
  );
}
