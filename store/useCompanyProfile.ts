// src/store/fileStore.ts
import { create } from "zustand";

type CompanyCardData = {
  name: string;
  city: string;
  country: string;
};

type FileStore = {
  files: CompanyCardData[];
  isProfileStreaming: boolean;
  addFile: (file: CompanyCardData) => void;
  setIsProfileStreaming: (isStreaming: boolean) => void;
  resetFiles: () => void;
};

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  isProfileStreaming: false,
  addFile: (file) =>
    set((state) => ({
      files: [file, ...state.files],
    })),
  setIsProfileStreaming: (isStreaming) => set({ isProfileStreaming: isStreaming }),
  resetFiles: () => set({ files: [] }),
}));