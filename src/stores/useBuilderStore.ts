import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CCCItem } from "@/lib/ccc-types";
import { CCPCompetency } from "@/lib/ccc-mapper";
import { CCCDocumentMetaInput } from "@/lib/ccc-document-mapper";

interface BuilderState {
  ccpData: CCPCompetency[];
  cccData: CCCItem[];
  cccDocumentMeta: CCCDocumentMetaInput | null;

  setCCPData: (data: CCPCompetency[]) => void;
  setCCCData: (data: CCCItem[]) => void;
  setCCCDocumentMeta: (meta: CCCDocumentMetaInput) => void;

  resetAll: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      ccpData: [],
      cccData: [],
      cccDocumentMeta: null,

      setCCPData: (data) => set({ ccpData: data }),
      setCCCData: (data) => set({ cccData: data }),
      setCCCDocumentMeta: (meta) => set({ cccDocumentMeta: meta }),

      resetAll: () =>
        set({
          ccpData: [],
          cccData: [],
          cccDocumentMeta: null,
        }),
    }),
    {
      name: "cocs-builder-storage", // 🔥 nama dalam localStorage
    }
  )
);