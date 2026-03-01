"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

// レアリティに応じたボーダーの色を設定
const rarityBorderColors: { [key: number]: string } = {
  1: "border-gray-200",
  2: "border-green-200",
  3: "border-blue-200",
  4: "border-purple-200",
  5: "border-orange-200",
  6: "border-red-200",
};

function Avatar({
  className,
  rarity,
  ref,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & { rarity?: number }) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-solid",
        rarity ? rarityBorderColors[rarity] : "border-gray-200",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      width={40}
      height={40}
      decoding="async"
      loading="lazy"
      fetchPriority="low"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
