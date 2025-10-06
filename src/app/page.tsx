import type { Recruit } from "@/types/recruit";
import HomePage from "@/components/home-page";
import recruitData from "../../public/json/ak-recruit.min.json";

export const dynamic = "force-static";

export default function Page() {
  return <HomePage initialRecruitData={recruitData as Recruit} />;
}
