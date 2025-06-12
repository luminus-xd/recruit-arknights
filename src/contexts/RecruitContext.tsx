import React, {
	createContext,
	useContext,
	ReactNode,
	useMemo,
	useEffect,
	useState,
	useCallback,
} from "react";
import useSWR from "swr";
import { Recruit } from "@/types/recruit";
import { toast } from "sonner";

interface RecruitContextType {
	recruitData: Recruit | null;
	isLoading: boolean;
	error: Error | null;
	refreshData: () => Promise<Recruit | undefined>;
	clearCache: () => Promise<void>;
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

const fetcher = async (url: string): Promise<Recruit> => {
	try {
		const res = await fetch(url, {
			cache: "no-cache", // 常に最新データを取得
			next: { revalidate: 1800 }, // 30分ごとに再検証
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		return res.json();
	} catch (error) {
		console.error("データフェッチエラー:", error);
		throw error;
	}
};

export const RecruitProvider = ({ children }: { children: ReactNode }) => {
	const [localCache, setLocalCache] = useState<Recruit | null>(null);

	const { data, error, mutate } = useSWR<Recruit>(
		"/json/ak-recruit.min.json",
		fetcher,
		{
			revalidateOnFocus: true, // フォーカス時の再検証を有効化
			revalidateOnReconnect: true, // 再接続時に再検証
			dedupingInterval: 1800000, // 30分の重複排除間隔
			focusThrottleInterval: 5000, // フォーカスイベントのスロットリング
			errorRetryCount: 3, // エラー時の再試行回数
			onSuccess: (data) => {
				// 成功時にローカルキャッシュを更新
				setLocalCache(data);
			},
		},
	);

	const isLoading = !data && !error && !localCache;

	useEffect(() => {
		if (error) {
			console.error("RecruitContext エラー:", error);
			toast.error("公開求人データの取得に失敗しました", {
				description: "ネットワーク接続を確認してください",
				duration: 5000,
			});
		}
	}, [error]);

	const contextValue = useMemo(() => {
		// useMemoコールバック内でrefreshData関数を定義
		const refreshData = async () => {
			try {
				return await mutate();
			} catch (refreshError) {
				toast.error("データの更新に失敗しました");
				console.error("データ更新エラー:", refreshError);
				return undefined;
			}
		};

		// PWAキャッシュクリア機能
		const clearCache = async () => {
			try {
				// Service Workerキャッシュをクリア
				if ('caches' in window) {
					const cache = await caches.open('json-data');
					await cache.delete('/json/ak-recruit.min.json');
				}
				
				// SWRキャッシュもクリア
				await mutate(undefined, { revalidate: true });
				
				// ローカルキャッシュもクリア
				setLocalCache(null);
				
				toast.success("キャッシュをクリアしました", {
					description: "最新データを取得しています...",
				});
			} catch (cacheError) {
				toast.error("キャッシュのクリアに失敗しました");
				console.error("キャッシュクリアエラー:", cacheError);
			}
		};

		return {
			recruitData: data || localCache, // ローカルキャッシュをフォールバックとして使用
			isLoading,
			error: error ?? null,
			refreshData,
			clearCache,
		};
	}, [data, localCache, isLoading, error, mutate]);

	return (
		<RecruitContext.Provider value={contextValue}>
			{children}
		</RecruitContext.Provider>
	);
};

export const useRecruit = () => {
	const context = useContext(RecruitContext);
	if (context === undefined) {
		throw new Error("useRecruit must be used within a RecruitProvider");
	}
	return context;
};
