// features/upload/upload.store.ts
import { create } from "zustand";

type UploadState = {
  isUploading: boolean;
  uploadedFiles: string[];
  startUpload: () => void;
  finishUpload: (url: string) => void;
  reset: () => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  isUploading: false,
  uploadedFiles: [],
  startUpload: () => set({ isUploading: true }),
  finishUpload: (url) =>
    set((state) => ({
      isUploading: false,
      uploadedFiles: [...state.uploadedFiles, url],
    })),
  reset: () => set({ isUploading: false, uploadedFiles: [] }),
}));
