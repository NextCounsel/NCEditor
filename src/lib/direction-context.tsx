import React, { createContext, useContext, useState, ReactNode } from "react";

type Direction = "ltr" | "rtl";

interface DirectionContextType {
  direction: Direction;
  setDirection: (dir: Direction) => void;
}

const DirectionContext = createContext<DirectionContextType | undefined>(
  undefined
);

interface DirectionProviderProps {
  children: ReactNode;
  initialDirection?: Direction;
}

export function DirectionProvider({
  children,
  initialDirection = "ltr",
}: DirectionProviderProps) {
  const [direction, setDirection] = useState<Direction>(initialDirection);

  return (
    <DirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    return { direction: "ltr" };
  }
  return context;
}
