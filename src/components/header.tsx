import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    // パスに基づいてタイトルと説明を設定
    const isRecommendPage = pathname === "/recommend";

    const title = isRecommendPage
        ? "Recommend"
        : "Recruitment";

    const description = isRecommendPage
        ? "★4以上を確定で招集するタグの組み合わせ"
        : "絞り込みを行うタグを選択してください";

    return (
        <hgroup className="scroll-mt-16">
            <h1 className="text-5xl font-extrabold tracking-tight">
                {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </hgroup>
    );
}