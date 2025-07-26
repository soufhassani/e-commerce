// components/UploadBox.tsx
import { useDropzone } from "react-dropzone";
import { useUploadFile } from "@/features/upload/useUploadQuery";
import { useState } from "react";

export default function UploadBox() {
  const [progress, setProgress] = useState(0);
  const { mutate: upload } = useUploadFile();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    upload(
      {
        file,
        options: {
          onLoad: (e) => {
            const percent = Math.round((e.loaded / (e.total || 1)) * 100);
            setProgress(percent);
          },
        },
      },
      {
        onSuccess: () => setProgress(100),
      }
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 border-gray-400 p-6 rounded-md cursor-pointer bg-black/10 text-center hover:bg-black/20 transition-colors"
    >
      <input {...getInputProps()} aria-label="Click to upload" />
      <p className="text-sm text-gray-300">
        {isDragActive
          ? "Drop the file..."
          : "Drag and drop a file here or click to select"}
      </p>
      {progress > 0 && (
        <div className="mt-4 h-2 w-full bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
