"use client";
import { createContext } from "react";
import type { Modal, Store } from "./demo-data";
export type ContextType = {
  data: Store;
  change: (fn: (s: Store) => Store) => void;
  open: (m: Modal) => void;
  notify: (s: string) => void;
  date: string;
  setDate: (d: string) => void;
};
export const DemoContext = createContext<ContextType>(null!);
