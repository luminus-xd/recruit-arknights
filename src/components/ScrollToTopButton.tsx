"use client";

import { useEffect, useState, useRef } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterIntersecting, setIsFooterIntersecting] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLElement | null>(null);

  const adjustmentMargin = 16; // 1rem, space between button and footer

  // Effect for showing/hiding the button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Effect for IntersectionObserver to detect footer visibility
  useEffect(() => {
    // Assign footerRef.current here, after component mounts
    footerRef.current = document.getElementById("site-footer");

    if (!footerRef.current) {
      console.warn("ScrollToTopButton: Footer element #site-footer not found.");
      return; // Do not proceed if footer element is not found
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          // Ensure footerRef.current is available before accessing offsetHeight
          setFooterHeight(footerRef.current?.offsetHeight || 0);
        }
      },
      {
        // Triggers when the top of the footer is 60px from the bottom of the viewport.
        rootMargin: "0px 0px 60px 0px", // top right bottom left
      }
    );

    observer.observe(footerRef.current);

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  // Base classes from the button's current styling, excluding 'bottom-4' and 'md:bottom-8'.
  // This preserves: fixed, right positioning, rounding, background, padding, text color,
  // shadow, transition, hover, and focus states.
  // Actual classes from previous file read:
  // "fixed right-4 rounded-full bg-gray-800 p-3 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 md:right-8"
  const baseClasses =
    "fixed right-4 md:right-8 rounded-full bg-gray-800 p-3 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50";

  let positionClasses = "bottom-4 md:bottom-8"; // Default Tailwind classes for bottom positioning
  let dynamicBottomStyle: React.CSSProperties = {};

  if (isFooterIntersecting && footerHeight > 0) {
    // Footer is intersecting, calculate dynamic bottom style
    // The button's bottom edge should be `adjustmentMargin` above the footer's top edge.
    dynamicBottomStyle = { bottom: `${footerHeight + adjustmentMargin}px` };
    positionClasses = ""; // Remove Tailwind bottom classes to prevent conflict, inline style will take over.
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`${baseClasses} ${positionClasses}`.trim()} // .trim() to remove trailing space if positionClasses is empty
      style={dynamicBottomStyle}
      aria-label="ページトップへ戻る" // Matches the visually-hidden span for accessibility
    >
      {/* Existing inline SVG icon */}
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
