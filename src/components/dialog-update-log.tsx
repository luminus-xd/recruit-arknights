import { CircleX } from "lucide-react";
import { updateLog } from "@/data/update-log";
import { toJapaneseDateLabel } from "@/lib/date";
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
                                        {toJapaneseDateLabel(log.date)}
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
