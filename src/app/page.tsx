"use client";

import { RecruitProvider } from "@/contexts/RecruitContext";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

import Recruit from "@/components/recruit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <RecruitProvider>
        <article key="1" className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold">Recruitment</h1>
            <p className="text-gray-500 dark:text-gray-400">
              絞り込みを行うタグを選択してください
            </p>
          </div>
          <Recruit />
          <h2 className="text-2xl font-bold">Operators</h2>
          <div className="grid mt-2 gap-6">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage
                      alt="Operator Name"
                      src="/img/operator/1.png"
                    />
                    <AvatarFallback>o</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Operator Name</h3>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage
                      alt="Operator Name"
                      src="/img/operator/2.png"
                    />
                    <AvatarFallback>o</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Operator Name</h3>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage
                      alt="Operator Name"
                      src="/img/operator/3.png"
                    />
                    <AvatarFallback>o</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Operator Name</h3>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage
                      alt="Operator Name"
                      src="/img/operator/4.png"
                    />
                    <AvatarFallback>o</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Operator Name</h3>
                </div>
              </Card>
            </div>
          </div>
        </article>
      </RecruitProvider>
      <Toaster richColors />
    </main>
  );
}
