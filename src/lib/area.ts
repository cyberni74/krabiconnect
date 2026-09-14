import { create } from "zustand";
import { persist } from "zustand/middleware";

type AreaState = {
  district: string;
  setDistrict: (district: string) => void;
};

export const useAreaStore = create<AreaState>()(
  persist(
    (set) => ({
      district: "",
      setDistrict: (district) => set({ district }),
    }),
    { name: "krabiconnect-area" },
  ),
);
