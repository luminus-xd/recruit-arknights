"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 320;
const DESKTOP_BREAKPOINT = 769;
const DEFAULT_BOTTOM_MOBILE = 16;
const DEFAULT_BOTTOM_DESKTOP = 32;
const FOOTER_GAP = 16;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState<number>(DEFAULT_BOTTOM_MOBILE);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let footerElement: HTMLElement | null = document.getElementById("site-footer");

    const updateButtonState = () => {
      if (typeof window === "undefined") {
        return;
      }

      if (!footerElement || !document.body.contains(footerElement)) {
        footerElement = document.getElementById("site-footer");
      }

      const currentScrollY = window.scrollY || window.pageYOffset;
      const shouldShow = currentScrollY > SCROLL_THRESHOLD;
      setIsVisible((prev) => (prev === shouldShow ? prev : shouldShow));

      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      const baseBottom = isDesktop ? DEFAULT_BOTTOM_DESKTOP : DEFAULT_BOTTOM_MOBILE;

      if (!isDesktop || !footerElement) {
        setBottomOffset((prev) => (prev === baseBottom ? prev : baseBottom));
        return;
      }

      const footerRect = footerElement.getBoundingClientRect();
      const overlap = Math.max(0, window.innerHeight - footerRect.top);
      const adjustedBottom = overlap > 0 ? baseBottom + overlap + FOOTER_GAP : baseBottom;
      setBottomOffset((prev) => (prev === adjustedBottom ? prev : adjustedBottom));
    };

    updateButtonState();

    // requestAnimationFrameでスクロールイベントをスロットル（60fps上限）
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateButtonState();
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateButtonState);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateButtonState);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed right-4 rounded-full bg-gray-800 p-3 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 md:right-8"
      style={{ bottom: bottomOffset }}
      aria-label="ページトップへ戻る"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      <span className="visually-hidden">ページトップへ戻る</span>
    </button>
  );
};

export default ScrollToTopButton;
