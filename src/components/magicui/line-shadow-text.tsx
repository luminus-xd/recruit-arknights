import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "motion/react";

interface LineShadowTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, keyof MotionProps>,
    MotionProps {
  shadowColor?: string;
  shadowColorDark?: string;
}

export function LineShadowText({
  children,
  shadowColor = "black",
  shadowColorDark = "white",
  className,
  ...props
}: LineShadowTextProps) {
  const content = typeof children === "string" ? children : null;

  if (!content) {
    throw new Error("LineShadowText only accepts string content");
  }

  return (
    <motion.span
      style={
        {
          "--ls-shadow-light": shadowColor,
          "--ls-shadow-dark": shadowColorDark,
        } as React.CSSProperties
      }
      className={cn(
        "relative z-0 inline-flex",
        "[--ls-shadow:var(--ls-shadow-light)] dark:[--ls-shadow:var(--ls-shadow-dark)]",
        "after:absolute after:left-[0.04em] after:top-[0.04em] after:content-[attr(data-text)]",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--ls-shadow)_45%,var(--ls-shadow)_55%,transparent_0)]",
        "after:-z-10 after:bg-size-[0.06em_0.06em] after:bg-clip-text after:text-transparent",
        "after:animate-line-shadow",
        className,
      )}
      data-text={content}
      {...props}
    >
      {content}
    </motion.span>
  );
}
