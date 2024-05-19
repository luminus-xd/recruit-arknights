import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Recruit } from "@/types/recruit";
import { toast } from "sonner";

interface RecruitContextType {
  recruitData: Recruit | null;
  isLoading: boolean;
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

export const RecruitProvider = ({ children }: { children: ReactNode }) => {
  const [recruitData, setRecruitData] = useState<Recruit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/json/ak-recruit.json");
        const data: Recruit = await response.json();
        setRecruitData(data);
      } catch (error) {
        toast.error("公開求人データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <RecruitContext.Provider value={{ recruitData, isLoading }}>
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
