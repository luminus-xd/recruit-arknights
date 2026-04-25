"use client";

import type { Operator } from "@/types/recruit";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";
import { ArrowBigLeft } from "lucide-react";

type SlimOperator = Pick<Operator, "id" | "name" | "rarity" | "imgPath" | "wiki">;

type RecommendationItem = {
	tags: string;
	operators: SlimOperator[];
};

type RaritySection = {
	id: string;
	title: string;
	label: string;
	description: string;
	items: RecommendationItem[];
};

interface RecommendTagsProps {
	recommendedTags: { [key: string]: SlimOperator[] };
}

const SECTION_CONFIG = {
	star5: {
		id: "rarity-5",
		title: "Rarity 5",
		label: "星5確定",
		description: "対象オペレーターが星5だけに絞られる組み合わせ",
	},
	star4plus: {
		id: "rarity-4",
		title: "Rarity 4+",
		label: "星4以上確定",
		description: "対象オペレーターが星4以上だけになる組み合わせ",
	},
} as const;

const TAG_TONE_CLASSES: Record<string, string> = {
	近距離: "border-zinc-300 bg-zinc-100 text-zinc-950 dark:border-zinc-500/50 dark:bg-zinc-500/20 dark:text-zinc-100",
	遠距離: "border-sky-300 bg-sky-100 text-sky-950 dark:border-sky-400/50 dark:bg-sky-400/20 dark:text-sky-100",
	先鋒: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-400/50 dark:bg-emerald-400/20 dark:text-emerald-100",
	前衛: "border-red-300 bg-red-100 text-red-950 dark:border-red-400/50 dark:bg-red-400/20 dark:text-red-100",
	狙撃: "border-lime-300 bg-lime-100 text-lime-950 dark:border-lime-400/50 dark:bg-lime-400/20 dark:text-lime-100",
	術師: "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-400/50 dark:bg-violet-400/20 dark:text-violet-100",
	重装: "border-slate-300 bg-slate-100 text-slate-950 dark:border-slate-400/50 dark:bg-slate-400/20 dark:text-slate-100",
	医療: "border-teal-300 bg-teal-100 text-teal-950 dark:border-teal-400/50 dark:bg-teal-400/20 dark:text-teal-100",
	補助: "border-indigo-300 bg-indigo-100 text-indigo-950 dark:border-indigo-400/50 dark:bg-indigo-400/20 dark:text-indigo-100",
	特殊: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950 dark:border-fuchsia-400/50 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
	火力: "border-red-300 bg-red-100 text-red-950 dark:border-red-400/50 dark:bg-red-400/20 dark:text-red-100",
	生存: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-400/50 dark:bg-emerald-400/20 dark:text-emerald-100",
	防御: "border-slate-300 bg-slate-100 text-slate-950 dark:border-slate-400/50 dark:bg-slate-400/20 dark:text-slate-100",
	治療: "border-teal-300 bg-teal-100 text-teal-950 dark:border-teal-400/50 dark:bg-teal-400/20 dark:text-teal-100",
	支援: "border-indigo-300 bg-indigo-100 text-indigo-950 dark:border-indigo-400/50 dark:bg-indigo-400/20 dark:text-indigo-100",
	範囲攻撃: "border-orange-300 bg-orange-100 text-orange-950 dark:border-orange-400/50 dark:bg-orange-400/20 dark:text-orange-100",
	減速: "border-cyan-300 bg-cyan-100 text-cyan-950 dark:border-cyan-400/50 dark:bg-cyan-400/20 dark:text-cyan-100",
	牽制: "border-purple-300 bg-purple-100 text-purple-950 dark:border-purple-400/50 dark:bg-purple-400/20 dark:text-purple-100",
	弱化: "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-400/50 dark:bg-rose-400/20 dark:text-rose-100",
	COST回復: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-400/50 dark:bg-emerald-400/20 dark:text-emerald-100",
	強制移動: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-400/50 dark:bg-amber-400/20 dark:text-amber-100",
	爆発力: "border-orange-300 bg-orange-100 text-orange-950 dark:border-orange-400/50 dark:bg-orange-400/20 dark:text-orange-100",
	召喚: "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-400/50 dark:bg-violet-400/20 dark:text-violet-100",
	高速再配置: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950 dark:border-fuchsia-400/50 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
	元素: "border-cyan-300 bg-cyan-100 text-cyan-950 dark:border-cyan-400/50 dark:bg-cyan-400/20 dark:text-cyan-100",
};

const DEFAULT_TAG_TONE_CLASS = "border-border bg-muted text-foreground";

function groupRecommendedTags(recommendedTags: RecommendTagsProps["recommendedTags"]) {
	const grouped: Record<keyof typeof SECTION_CONFIG, RecommendationItem[]> = {
		star5: [],
		star4plus: [],
	};

	Object.entries(recommendedTags).forEach(([fullTag, operators]) => {
		if (fullTag.includes("[星5確定]")) {
			grouped.star5.push({
				tags: fullTag.replace(" [星5確定]", ""),
				operators,
			});
			return;
		}

		if (fullTag.includes("[星4以上確定]")) {
			grouped.star4plus.push({
				tags: fullTag.replace(" [星4以上確定]", ""),
				operators,
			});
		}
	});

	return grouped;
}

function getSections(grouped: Record<keyof typeof SECTION_CONFIG, RecommendationItem[]>): RaritySection[] {
	return [
		{ ...SECTION_CONFIG.star5, items: grouped.star5 },
		{ ...SECTION_CONFIG.star4plus, items: grouped.star4plus },
	];
}

function OperatorBadge({ operator }: { operator: SlimOperator }) {
	return (
		<li className="min-w-0">
			<a
				aria-label={`${operator.name}のWikiを開く`}
				className="group inline-flex h-11 max-w-full items-center gap-2 rounded-md border bg-background px-2 pr-3 text-sm transition-colors hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				href={operator.wiki}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Avatar rarity={operator.rarity} className="h-8 w-8 border-2">
					<Image
						src={operator.imgPath}
						alt={operator.name}
						width={40}
						height={40}
						className="h-full w-full object-cover"
						sizes="32px"
					/>
					<AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<span className="min-w-0 max-w-32 truncate font-bold leading-none sm:max-w-40">
					{operator.name}
				</span>
			</a>
		</li>
	);
}

function TagChips({ tags }: { tags: string }) {
	return (
		<div className="flex min-w-0 flex-wrap items-center gap-1.5">
			{tags.split(" + ").map((tag) => {
				const toneClass = TAG_TONE_CLASSES[tag] ?? DEFAULT_TAG_TONE_CLASS;

				return (
					<span
						key={tag}
						className={`rounded-md border px-3 py-1.5 text-[15px] font-bold leading-5 shadow-xs sm:px-2.5 sm:py-1 sm:text-sm ${toneClass}`}
					>
						{tag}
					</span>
				);
			})}
		</div>
	);
}

function RecommendationRow({ item }: { item: RecommendationItem }) {
	return (
		<li className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] md:items-center md:px-5">
			<div className="min-w-0 -mx-4 -mt-4 bg-muted/40 px-4 py-4 md:mx-0 md:mt-0 md:bg-transparent md:p-0">
				<TagChips tags={item.tags} />
			</div>

			<ul className="flex min-w-0 flex-wrap gap-2">
				{item.operators.map((operator) => (
					<OperatorBadge key={operator.id} operator={operator} />
				))}
			</ul>
		</li>
	);
}

function RecommendationSection({ section }: { section: RaritySection }) {
	return (
		<section id={section.id} className="scroll-mt-28 space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1">
					<h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
						{section.title}
					</h2>
					<p className="text-sm text-muted-foreground">{section.description}</p>
				</div>
			</div>

			{section.items.length > 0 ? (
				<div className="overflow-hidden rounded-lg border bg-card shadow-xs">
					<div className="hidden grid-cols-[minmax(220px,300px)_minmax(0,1fr)] gap-3 border-b bg-muted/50 px-5 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground md:grid">
						<span>タグ</span>
						<span>候補オペレーター</span>
					</div>
					<ul className="divide-y">
						{section.items.map((item) => (
							<RecommendationRow key={item.tags} item={item} />
						))}
					</ul>
				</div>
			) : (
				<div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
					該当するタグ組み合わせはありません。
				</div>
			)}
		</section>
	);
}

export default function RecommendTags({ recommendedTags }: RecommendTagsProps) {
	if (Object.keys(recommendedTags).length === 0) {
		return (
			<div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
				おすすめタグ組み合わせが見つかりませんでした。
			</div>
		);
	}

	const grouped = groupRecommendedTags(recommendedTags);
	const sections = getSections(grouped);
	const totalCount = sections.reduce((count, section) => count + section.items.length, 0);

	return (
		<div className="space-y-10">
			<div className="grid grid-cols-3 gap-2 sm:gap-3">
				<div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
					<p className="text-xs font-semibold text-muted-foreground sm:text-sm">合計</p>
					<p className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{totalCount}件</p>
				</div>
				{sections.map((section) => (
					<a
						key={section.id}
						href={`#${section.id}`}
						className="rounded-lg border bg-background p-3 transition-colors hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-4"
					>
						<p className="text-xs font-semibold text-muted-foreground sm:text-sm">{section.label}</p>
						<p className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">
							{section.items.length}件
						</p>
					</a>
				))}
			</div>

			<div className="space-y-12">
				{sections.map((section) => (
					<RecommendationSection key={section.id} section={section} />
				))}
			</div>

			<Separator />

			<ul className="text-sm leading-6 text-muted-foreground">
				<li>タグの組み合わせは2つまでを対象としています。</li>
				<li>星6のオペレーターは上級エリートタグがないと出現しないため、このページには表示されていません。</li>
				<li>同じオペレーターが出現する場合は、最小限のタグ組み合わせのみ表示しています。</li>
			</ul>

			<div>
				<Button variant="outline" asChild>
					<Link href="/" className="font-bold">
						<ArrowBigLeft className="mr-2 h-5 w-5" aria-hidden="true" />
						公開求人シミュレーターに戻る
					</Link>
				</Button>
			</div>
		</div>
	);
}
