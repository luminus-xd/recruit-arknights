"use client";

import {
	createContext,
	use,
	type ReactNode,
	useMemo,
} from "react";
import type { Recruit } from "@/types/recruit";

interface RecruitContextType {
	recruitData: Recruit;
	isLoading: boolean;
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

type RecruitProviderProps = {
	children: ReactNode;
	initialData: Recruit;
};

export const RecruitProvider = ({ children, initialData }: RecruitProviderProps) => {
	const contextValue = useMemo(
		() => ({
			recruitData: initialData,
			isLoading: false,
		}),
		[initialData],
	);

	return (
		<RecruitContext.Provider value={contextValue}>
			{children}
		</RecruitContext.Provider>
	);
};

export const useRecruit = () => {
	const context = use(RecruitContext);
	if (context === undefined) {
		throw new Error("useRecruit must be used within a RecruitProvider");
	}
	return context;
};
