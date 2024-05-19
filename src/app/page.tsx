"use client";

import { RecruitProvider } from "@/contexts/RecruitContext";

import { Toaster } from "@/components/ui/sonner";

import Operators from "@/components/operators";
import Recruit from "@/components/recruit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <RecruitProvider>
        <article key="1" className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold">Recruitment</h1>
            <p className="text-gray-500 dark:text-gray-400">
              [WIP] 絞り込みを行うタグを選択してください
            </p>
          </div>
          <Recruit />
          <Operators />
        </article>
      </RecruitProvider>
      <Toaster richColors />
    </main>
  );
}
