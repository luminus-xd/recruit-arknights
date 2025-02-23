import { useEffect } from "react";
import { useRecruit } from "@/contexts/RecruitContext";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Recruit } from "@/types/recruit";

export default function Operators() {
  const { recruitData, isLoading } = useRecruit();

  useEffect(() => {
    if (!isLoading) {
      console.log(recruitData);
    }
  }, [isLoading, recruitData]);

  return (
    <>
      <h2 className="text-2xl font-bold tracking-tight mt-4">Operators</h2>
      <p className="text-gray-500 dark:text-gray-400">
        クリックすると白Wikiのページに遷移します
      </p>
      <div className="grid mt-3 gap-6">
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!isLoading && recruitData ? (
            recruitData.map((operator) => (
              <li key={operator.id}>
                <a href={operator.wiki} rel="nooreferer" target="_blank">
                  <Card>
                    <div className="flex items-center gap-4 p-4">
                      <Avatar>
                        <AvatarImage
                          alt={operator.name}
                          src={operator.imgPath}
                        />
                        <AvatarFallback>
                          {operator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{operator.name}</h3>
                    </div>
                  </Card>
                </a>
              </li>
            ))
          ) : (
            <li>Loading...</li>
          )}
        </ul>
      </div>
    </>
  );
}
