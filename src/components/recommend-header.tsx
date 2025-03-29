"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function RecommendHeader() {
    return (
        <div className="space-y-4">
            <Header />
            <div className="flex flex-wrap gap-3 mt-4 justify-self-start">
                <Button variant="outline" asChild>
                    <a href="#rarity-5" className="font-bold">
                        <ArrowDown className="mr-2 h-5 w-5" />
                        星5以上
                    </a>
                </Button>
                <Button variant="outline" asChild>
                    <a href="#rarity-4" className="font-bold">
                        <ArrowDown className="mr-2 h-5 w-5" />
                        星4以上
                    </a>
                </Button>
            </div>
        </div>
    );
}