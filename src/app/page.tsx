"use client";

import { Suspense } from "react";
import { RecruitProvider } from "@/contexts/RecruitContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import Recruit from "@/components/recruit";
import DialogUpdateLog from "@/components/dialog-update-log";
import Header from "@/components/header";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { ClipboardCopy } from "lucide-react";

export default function Home() {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-between">
      <RecruitProvider>
        <article key="1" className="w-full">
          <Header />
          <div className="mt-4">
            <Button onClick={copyToClipboard}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              {isCopied
                ? "URLがコピーされました"
                : "クリップボードにURLをコピー"}
            </Button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              コピーされたURLを共有することで、タグの選択状態も共有できます。
            </p>
            <div className="mt-4">
              <DialogUpdateLog />
            </div>
          </div>
          <Separator className="my-8" />
          <Suspense fallback={null}>
            <Recruit />
          </Suspense>
        </article>
      </RecruitProvider>
      <Toaster richColors toastOptions={{
        classNames: {
          description: 'text-gray-800'
        },
      }} />
    </main>
  );
}
