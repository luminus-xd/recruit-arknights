"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  Download,
  ImageDown,
  Loader2,
  Moon,
  Share2,
  Star,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { getGuarantee, isHighRarityGuarantee } from "@/lib/result-image/guarantee";
import type {
  ResultImageGroup,
  ResultImageInput,
  ResultImageOptions,
} from "@/lib/result-image/render";
import type { ResultImageTheme } from "@/lib/result-image/theme";
import { cn } from "@/lib/utils";

import { useResultImage, type ResultImageFile } from "@/hooks/useResultImage";

import { SegmentedControl } from "@/components/recruit/segmented-control";
import type { FilterMode } from "@/components/recruit/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { Operator } from "@/types/recruit";

type Scope = "all" | "guaranteed";
type Feedback = "saved" | "copied" | "shared" | null;

interface ResultImageDialogProps {
  selectedItems: string[];
  filteredOperators: Record<string, Operator[]>;
  filterMode: FilterMode;
}

export function ResultImageDialog(props: ResultImageDialogProps) {
  const [open, setOpen] = useState(false);
  const hasResults = Object.keys(props.filteredOperators).length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline-solid" disabled={!hasResults}>
          <ImageDown className="mr-1.5 h-4 w-4" aria-hidden />
          画像で保存
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex h-[min(880px,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-[1080px] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:flex-row",
          "[&>button:last-child]:z-20 [&>button:last-child]:rounded-full [&>button:last-child]:bg-background/80 [&>button:last-child]:p-1.5 [&>button:last-child]:backdrop-blur",
        )}
      >
        {open && <ExportWorkspace {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function ExportWorkspace({
  selectedItems,
  filteredOperators,
  filterMode,
}: ResultImageDialogProps) {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<ResultImageTheme>(
    resolvedTheme === "light" ? "light" : "dark",
  );
  const [scope, setScope] = useState<Scope>("all");
  const [showNames, setShowNames] = useState(true);
  const [feedback, setFeedback] = useState<Feedback>(null);
  // ダイアログを開いた時刻をレポートの日時として固定する
  const [generatedAt] = useState(() => new Date());

  const groups = useMemo<ResultImageGroup[]>(
    () =>
      Object.entries(filteredOperators).map(([key, operators]) => {
        const combination = key.split(" + ");
        return {
          combination,
          operators,
          guarantee: getGuarantee(combination, operators),
        };
      }),
    [filteredOperators],
  );
  const guaranteedCount = groups.filter((group) =>
    isHighRarityGuarantee(group.guarantee),
  ).length;
  const effectiveScope: Scope = guaranteedCount === 0 ? "all" : scope;

  const input = useMemo<ResultImageInput>(() => {
    const notes = [
      filterMode === "star14Plus" ? "ロボット & ★4以上のみ" : null,
      effectiveScope === "guaranteed" ? "★4以上確定の組み合わせのみ" : null,
    ].filter(Boolean);

    return {
      selectedTags: selectedItems,
      groups:
        effectiveScope === "guaranteed"
          ? groups.filter((group) => isHighRarityGuarantee(group.guarantee))
          : groups,
      generatedAt,
      siteLabel: window.location.host,
      note: notes.length > 0 ? notes.join(" · ") : undefined,
    };
  }, [selectedItems, groups, generatedAt, filterMode, effectiveScope]);

  const options = useMemo<ResultImageOptions>(
    () => ({ theme, showNames }),
    [theme, showNames],
  );

  const { image, isRendering, isError } = useResultImage(input, options);

  const fileName = `recruit-${formatFileStamp(generatedAt)}.${image?.format === "jpeg" ? "jpg" : "png"}`;
  const file = useMemo(
    () => (image ? new File([image.blob], fileName, { type: image.blob.type }) : null),
    [image, fileName],
  );

  const canShare =
    typeof navigator !== "undefined" &&
    !!file &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });
  const canCopy =
    typeof navigator !== "undefined" &&
    typeof ClipboardItem !== "undefined" &&
    !!navigator.clipboard?.write;

  const flash = (next: Feedback) => {
    setFeedback(next);
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const handleSave = () => {
    if (!image) return;
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    flash("saved");
    toast.success("画像を保存しました");
  };

  const handleShare = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "公開求人の結果" });
      flash("shared");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        toast.error("共有に失敗しました");
      }
    }
  };

  const handleCopy = async () => {
    if (!image) return;
    try {
      await navigator.clipboard.write([
        // Safari はユーザー操作の直後に write を呼ぶ必要があるため Promise のまま渡す
        new ClipboardItem({ "image/png": toPngBlob(image) }),
      ]);
      flash("copied");
      toast.success("画像をクリップボードにコピーしました");
    } catch {
      toast.error("画像のコピーに失敗しました");
    }
  };

  return (
    <>
      {/* Preview */}
      <section
        aria-label="プレビュー"
        className="relative min-h-0 flex-1 overflow-hidden bg-muted/50 dark:bg-black/40"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(120_120_120/0.22)_1px,transparent_1px)] bg-size-[18px_18px]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-linear-to-b from-muted/80 to-transparent dark:from-black/60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-muted/80 to-transparent dark:from-black/60" />

        <div className="relative h-full overflow-y-auto overscroll-contain px-5 py-8 sm:px-10 sm:py-12">
          <AnimatePresence mode="wait">
            {image ? (
              <motion.img
                key="preview"
                src={image.url}
                alt="書き出し画像のプレビュー"
                initial={{ opacity: 0, y: 12, filter: "blur(12px)" }}
                animate={{
                  opacity: isRendering ? 0.55 : 1,
                  y: 0,
                  filter: isRendering ? "blur(4px)" : "blur(0px)",
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto block w-full max-w-[520px] rounded-[10px] shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_30px_80px_-20px_rgb(0_0_0/0.55),0_12px_24px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/10 select-none dark:ring-white/10"
              />
            ) : (
              <motion.div
                key="skeleton"
                exit={{ opacity: 0 }}
                className="relative mx-auto aspect-[1080/1500] w-full max-w-[520px] overflow-hidden rounded-[10px] bg-background/60 ring-1 ring-black/5 dark:ring-white/10"
              >
                <div className="absolute inset-x-0 h-24 animate-[result-image-scan_1.6s_cubic-bezier(.4,0,.2,1)_infinite] bg-linear-to-b from-transparent via-foreground/8 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
          {image && (
            <p className="mt-4 text-center text-[11px] font-semibold text-muted-foreground any-hover:hidden">
              プレビューを長押しして保存することもできます
            </p>
          )}
        </div>

        <AnimatePresence>
          {isRendering && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-bold tracking-[0.2em] text-background shadow-lg"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              RENDERING
            </motion.div>
          )}
          {isError && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-5 left-1/2 z-20 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-destructive px-4 py-1.5 text-xs font-bold text-destructive-foreground shadow-lg"
            >
              画像の生成に失敗しました。もう一度お試しください
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* Controls */}
      <aside className="flex max-h-[60%] shrink-0 flex-col border-t bg-background md:max-h-none md:w-[340px] md:border-t-0 md:border-l">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-5 md:gap-6 md:p-6">
          <header className="md:pr-8">
            <p className="text-[11px] font-bold tracking-[0.24em] text-muted-foreground">
              EXPORT
            </p>
            <DialogTitle className="mt-1 text-xl font-extrabold tracking-tight md:mt-1.5 md:text-2xl">
              結果を画像で保存
            </DialogTitle>
            <DialogDescription className="mt-1.5 hidden text-xs leading-relaxed md:block">
              絞り込み結果を1枚の画像にまとめます。SNSでの共有や、あとで見返すメモにどうぞ。
            </DialogDescription>
          </header>

          <div className="flex flex-col gap-3 md:gap-4">
            <OptionField label="Theme" sub="テーマ">
              <SegmentedControl
                label="テーマ"
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "dark", label: <><Moon className="h-3.5 w-3.5" aria-hidden />ダーク</> },
                  { value: "light", label: <><Sun className="h-3.5 w-3.5" aria-hidden />ライト</> },
                ]}
              />
            </OptionField>

            <OptionField label="Scope" sub="範囲">
              <SegmentedControl
                label="範囲"
                value={effectiveScope}
                onChange={setScope}
                options={[
                  {
                    value: "all",
                    label: (
                      <>
                        すべて
                        <Count value={groups.length} />
                      </>
                    ),
                  },
                  {
                    value: "guaranteed",
                    disabled: guaranteedCount === 0,
                    label: (
                      <>
                        <Star className="h-3 w-3 fill-current" aria-hidden />
                        <span className="whitespace-nowrap">4+ 確定</span>
                        <Count value={guaranteedCount} />
                      </>
                    ),
                  },
                ]}
              />
            </OptionField>

            <OptionField label="Names" sub="オペレーター名">
              <SegmentedControl
                label="オペレーター名"
                value={showNames ? "show" : "hide"}
                onChange={(value) => setShowNames(value === "show")}
                options={[
                  { value: "show", label: "表示" },
                  { value: "hide", label: "アイコンのみ" },
                ]}
              />
            </OptionField>
          </div>

        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t bg-muted/30 p-4 md:p-6">
          <p className="text-center text-[11px] font-semibold text-muted-foreground tabular-nums md:hidden">
            {image
              ? `${image.width} × ${image.height} · ${image.format.toUpperCase()} · ${formatBytes(image.blob.size)}`
              : "—"}
          </p>
          <dl className="mb-2 hidden grid-cols-2 md:grid gap-px overflow-hidden rounded-lg border bg-border text-xs">
            <Spec label="SIZE" value={image ? `${image.width} × ${image.height}` : "—"} />
            <Spec label="FILE" value={image ? `${image.format.toUpperCase()} · ${formatBytes(image.blob.size)}` : "—"} />
          </dl>
          <Button
            size="lg"
            className="h-11 w-full gap-2 rounded-lg px-4 text-sm md:h-12"
            onClick={handleSave}
            disabled={!image || isRendering}
          >
            <FeedbackIcon active={feedback === "saved"} icon={<Download className="h-4 w-4" aria-hidden />} />
            {feedback === "saved" ? "保存しました" : "画像を保存"}
          </Button>
          {(canShare || canCopy) && (
            <div className={cn("grid gap-2", canShare && canCopy ? "grid-cols-2" : "grid-cols-1")}>
              {canShare && (
                <Button variant="outline-solid" className="gap-2" onClick={handleShare} disabled={isRendering}>
                  <FeedbackIcon active={feedback === "shared"} icon={<Share2 className="h-4 w-4" aria-hidden />} />
                  共有
                </Button>
              )}
              {canCopy && (
                <Button variant="outline-solid" className="gap-2" onClick={handleCopy} disabled={isRendering}>
                  <FeedbackIcon active={feedback === "copied"} icon={<Copy className="h-4 w-4" aria-hidden />} />
                  {feedback === "copied" ? "コピーしました" : "コピー"}
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function OptionField({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3 md:flex md:flex-col md:items-stretch md:gap-2">
      <p className="flex flex-col md:flex-row md:items-baseline md:gap-2">
        <span className="text-[11px] font-bold tracking-[0.2em] text-foreground uppercase">
          {label}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground md:text-[11px]">{sub}</span>
      </p>
      {children}
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-foreground/8 px-1.5 py-px text-[10px] tabular-nums">
      {value}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-3 py-2.5">
      <dt className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function FeedbackIcon({ active, icon }: { active: boolean; icon: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={active ? "check" : "icon"}
        initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.35 }}
        className="inline-flex"
      >
        {active ? <Check className="h-4 w-4" aria-hidden /> : icon}
      </motion.span>
    </AnimatePresence>
  );
}

/** クリップボードは PNG しか受け付けないブラウザが多いため、JPEG の場合は変換する */
async function toPngBlob(image: ResultImageFile) {
  if (image.format === "png") {
    return image.blob;
  }
  const bitmap = await createImageBitmap(image.blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) {
    throw new Error("Failed to convert image");
  }
  return blob;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatFileStamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}
