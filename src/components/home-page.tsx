"use client";

import { RecruitProvider } from "@/contexts/RecruitContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import Recruit from "@/components/recruit";
import DialogUpdateLog from "@/components/dialog-update-log";
import Header from "@/components/header";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { ClipboardCopy } from "lucide-react";
import type { Recruit as RecruitData } from "@/types/recruit";

type HomePageProps = {
	initialRecruitData: RecruitData;
};

export default function HomePage({ initialRecruitData }: HomePageProps) {
	const { isCopied, copyToClipboard } = useCopyToClipboard();

	return (
		<main className="flex w-full min-h-screen flex-col items-center justify-between">
			<RecruitProvider initialData={initialRecruitData}>
				<article key="1" className="w-full">
					<Recruit
						intro={
							<div className="xl:flex xl:items-end xl:justify-between xl:gap-8">
								<Header />
								<div className="mt-4 xl:mt-0 xl:grid xl:grid-cols-[auto_auto] xl:justify-end xl:gap-x-3 xl:gap-y-2">
									<Button onClick={copyToClipboard}>
										<ClipboardCopy className="mr-2 h-4 w-4" />
										{isCopied
											? "URLがコピーされました"
											: "クリップボードにURLをコピー"}
									</Button>
									<p className="mt-2 text-sm text-gray-500 xl:order-last xl:col-span-2 xl:mt-0 xl:text-right xl:text-xs dark:text-gray-400">
										コピーされたURLを共有することで、タグの選択状態も共有できます。
									</p>
									<div className="mt-4 xl:mt-0">
										<DialogUpdateLog />
									</div>
								</div>
							</div>
						}
					/>
				</article>
			</RecruitProvider>
			<Toaster
				richColors
				toastOptions={{
					classNames: {
						description: "text-gray-800",
					},
				}}
			/>
		</main>
	);
}
