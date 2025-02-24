import React, { createContext, useContext, ReactNode, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Recruit } from "@/types/recruit";
import { toast } from "sonner";

interface RecruitContextType {
  recruitData: Recruit | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<Recruit | undefined>;
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

const fetcher = async (url: string): Promise<Recruit> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const RecruitProvider = ({ children }: { children: ReactNode }) => {
  const { data, error, mutate } = useSWR<Recruit>("/json/ak-recruit.json", fetcher);
  const isLoading = !data && !error;

  useEffect(() => {
    if (error) {
      toast.error("公開求人データの取得に失敗しました");
    }
  }, [error]);

  const refreshData = async () => {
    return mutate();
  };

  const contextValue = useMemo(
    () => ({
      recruitData: data ?? null,
      isLoading,
      error: error ?? null,
      refreshData,
    }),
    [data, isLoading, error]
  );

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
