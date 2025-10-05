import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DialogUpdateLog() {
    const updateLog = [
        {
            date: "2025-10-05",
            content: "アプリアイコンを刷新しました。アプリとして追加している方は、一度削除いただき再度アプリをインストールしていただくと反映されます。"
        },
        {
            date: "2025-09-26",
            content: "表示結果のフィルターモード機能を追加しました。"
        },
        {
            date: "2025-07-17",
            content: "アルケット、アイリス、ビーンストークを追加しました。",
        },
        {
            date: "2025-04-24",
            content: "マウンテン、カフカ、パインコーンを追加しました。",
        },
        {
            date: "2025-03-20",
            content: "おすすめタグページ、ページ遷移用ナビゲーションUIを追加しました。",
        },
        {
            date: "2025-02-24",
            content: "公開求人画面のスクリーンショットを用いて、タグを抽出する機能を追加しました。",
        },
        {
            date: "2025-02-01",
            content: "ロボット、エリート、上級エリートのタグを「Rerity」の欄に移行しました。",
        },
        {
            date: "2025-01-16",
            content: "マドロック、ウィスパーレイン、ジャッキーを追加しました。",
        },
        {
            date: "2025-01-01",
            content: "オペレーターのアイコンをホバーする際に、オペレーター名を表示するよう仕様を追加しました。",
        },
        {
            date: "2024-12-31",
            content: "エリート、及び上級エリートを選択した場合に、優先してエリート系列のオペレーターを表示するようにロジックを変更しました。",
        },
        {
            date: "2024-10-31",
            content: "PhonoR-0、バブル、アオスタ、ブレミシャインを追加しました。",
        },
        {
            date: "2024-07-31",
            content: "スルト、エイプリル、アレーンを追加しました。",
        }
    ]

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">更新履歴</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>更新履歴</DialogTitle>
                        <DialogDescription>
                            <span className="inline-block">公開求人オペレーターの追加や</span>
                            <span className="inline-block">アプリの更新履歴を確認できます</span>
                            <span className="block text-xs mt-1">※下記はスクロール可能です</span>
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[280px] bg-gray-500/5 dark:bg-black/20 rounded-md border" tabIndex={0}>
                        <ul className="flex flex-col gap-2 px-4 py-3">
                            {updateLog.map((log, index) => (
                                <li key={index} className="text-sm">
                                    <time
                                        className="text-rose-600 dark:text-rose-500 font-semibold"
                                        dateTime={log.date}
                                    >
                                        {log.date}
                                    </time>
                                    <p>{log.content}</p>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button type="submit" aria-label="ダイアログを閉じる"><CircleX className="w-4 mr-2" />閉じる</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
