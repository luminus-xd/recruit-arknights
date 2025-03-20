"use client";

import { useState, useEffect, RefObject } from "react";

interface IntersectionObserverOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
}

/**
 * 要素の可視性を監視するカスタムフック
 */
export default function useIntersectionObserver(
    ref: RefObject<Element>,
    options: IntersectionObserverOptions = {}
): boolean {
    const [isIntersecting, setIsIntersecting] = useState(true);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
}