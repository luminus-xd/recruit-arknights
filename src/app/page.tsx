import type { Recruit } from "@/types/recruit";
import HomePage from "@/components/home-page";
import recruitData from "../../public/json/ak-recruit.min.json";

export const dynamic = "force-static";

// クライアントに必要なフィールドのみ送信してHTMLペイロードを削減
const slimRecruitData = (recruitData as Recruit).map(
  ({ id, name, rarity, type, tags, wiki, imgPath }) => ({
    id, name, rarity, type, tags, wiki, imgPath,
  })
) as Recruit;

export default function Page() {
  return <HomePage initialRecruitData={slimRecruitData} />;
}
