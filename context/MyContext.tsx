"use client";
import { createContext, useState, useContext, ReactNode } from "react";

interface MyContextType {
  value: number;
  setValue: (val: number) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(0);

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
}
