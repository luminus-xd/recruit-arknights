"use client";

import { useEffect, useState, useRef } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterIntersecting, setIsFooterIntersecting] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false); // Default to false, useEffect will set initial state

  const footerRef = useRef<HTMLElement | null>(null);
  const footerIntersectionObserverRef = useRef<IntersectionObserver | null>(null); // Ref for footer observer
  const visibilityTargetObserverRef = useRef<IntersectionObserver | null>(null); // Ref for visibility observer

  const adjustmentMargin = 16; // 1rem, space between button and footer

  // Effect for IntersectionObserver to control button visibility based on #scroll-visibility-target
  useEffect(() => {
    const visibilityTargetElement = document.getElementById('scroll-visibility-target');

    if (!visibilityTargetElement) {
      console.warn("ScrollToTopButton: Visibility target element #scroll-visibility-target not found.");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target.id === 'scroll-visibility-target') {
          // Show button if target is NOT intersecting AND its top is above viewport's top
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      },
      {
        // No specific rootMargin needed here, relying on isIntersecting and boundingClientRect
        // threshold: [0] // Optional: trigger as soon as it starts to exit/enter
      }
    );

    observer.observe(visibilityTargetElement);
    visibilityTargetObserverRef.current = observer; // Store observer for cleanup

    return () => {
      observer.unobserve(visibilityTargetElement);
      observer.disconnect();
      visibilityTargetObserverRef.current = null;
    };
  }, []); // Runs once on mount

  // Effect for determining if the screen is desktop size
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mediaQuery = window.matchMedia("(min-width: 769px)");
      setIsDesktop(mediaQuery.matches); // Set initial state

      const handleChange = (event: MediaQueryListEvent) => {
        setIsDesktop(event.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Effect for IntersectionObserver to detect footer visibility, conditional on isDesktop
  useEffect(() => {
    if (!isDesktop) {
      // Not on desktop, disconnect any existing footer observer and reset footer intersection state
      if (footerIntersectionObserverRef.current) {
        footerIntersectionObserverRef.current.disconnect();
        footerIntersectionObserverRef.current = null;
      }
      setIsFooterIntersecting(false);
      return;
    }

    // On desktop, setup the IntersectionObserver for the footer
    footerRef.current = document.getElementById("site-footer");

    if (!footerRef.current) {
      console.warn("ScrollToTopButton: Footer element #site-footer not found.");
      return;
    }

    if (!footerIntersectionObserverRef.current) {
      footerIntersectionObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsFooterIntersecting(entry.isIntersecting);
          if (entry.isIntersecting) {
            setFooterHeight(footerRef.current?.offsetHeight || 0);
          }
        },
        {
          rootMargin: "0px 0px 60px 0px",
        }
      );
    }
    
    footerIntersectionObserverRef.current.observe(footerRef.current);
    const currentFooterRef = footerRef.current; // Capture for cleanup

    return () => {
      if (currentFooterRef && footerIntersectionObserverRef.current) {
        footerIntersectionObserverRef.current.unobserve(currentFooterRef);
      }
      // If isDesktop becomes false, the observer is disconnected at the start of this effect.
      // If component unmounts while isDesktop is true, disconnect here.
      if (footerIntersectionObserverRef.current && !isDesktop) { 
          footerIntersectionObserverRef.current.disconnect();
          footerIntersectionObserverRef.current = null;
      }
    };
  }, [isDesktop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  const baseClasses =
    "fixed right-4 md:right-8 rounded-full bg-gray-800 p-3 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50";

  let positionClasses = "bottom-4 md:bottom-8";
  let dynamicBottomStyle: React.CSSProperties = {};

  if (isDesktop && isFooterIntersecting && footerHeight > 0) {
    dynamicBottomStyle = { bottom: `${footerHeight + adjustmentMargin}px` };
    positionClasses = ""; 
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`${baseClasses} ${positionClasses}`.trim()}
      style={dynamicBottomStyle}
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
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
      <span className="visually-hidden">ページトップへ戻る</span>
    </button>
  );
};

export default ScrollToTopButton;
