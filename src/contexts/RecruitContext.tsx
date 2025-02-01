import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { Recruit } from "@/types/recruit";
import { toast } from "sonner";

interface RecruitContextType {
  recruitData: Recruit | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => void;
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

export const RecruitProvider = ({ children }: { children: ReactNode }) => {
  const [recruitData, setRecruitData] = useState<Recruit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await fetch("/json/ak-recruit.json", { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Recruit = await response.json();
      setRecruitData(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const error = err instanceof Error ? err : new Error("Failed to fetch recruit data");
      setError(error);
      toast.error("公開求人データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const contextValue = useMemo(() => ({
    recruitData,
    isLoading,
    error,
    refreshData: fetchData,
  }), [recruitData, isLoading, error, fetchData]);

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