"use client";

import { createContext, useRef, RefObject, ReactNode } from "react";

interface HeaderContextType {
    headerRef: RefObject<HTMLDivElement | null>;
}

export const HeaderContext = createContext<HeaderContextType>({
    headerRef: { current: null },
});

interface HeaderProviderProps {
    children: ReactNode;
}

export function HeaderProvider({ children }: HeaderProviderProps) {
    const headerRef = useRef<HTMLDivElement>(null);

    return (
        <HeaderContext.Provider value={{ headerRef }}>
            {children}
        </HeaderContext.Provider>
    );
}