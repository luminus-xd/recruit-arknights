"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navigation() {
	const pathname = usePathname();

	const navItems = [
		{ name: "シミュレーター", href: "/" },
		{ name: "おすすめタグ", href: "/recommend" },
	];

	return (
		<nav className="sticky top-4 z-50 inline-flex gap-4 mb-6 p-3 rounded-xl bg-linear-to-r from-white/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/40 shadow-lg">
			{navItems.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						"px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 backdrop-blur-xs",
						pathname === item.href
							? "bg-primary/80 text-primary-foreground shadow-md"
							: "text-muted-foreground hover:bg-gray-200/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:shadow-md",
					)}
				>
					{item.name}
				</Link>
			))}
		</nav>
	);
}
