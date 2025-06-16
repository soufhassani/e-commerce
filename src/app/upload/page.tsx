"use client";
import React, { ChangeEvent, useRef, useState } from "react";
import { useUploadFile } from "@/features/upload/useUploadQuery";
import simulateProgress from "@/utils/simulateProgress";
import useLoading from "@/features/upload/hooks/useLoading";

type FileState = {
  url: string;
  index: number;
  progress: number;
};

const page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filesURL, setFileUrl] = useState<FileState[] | []>([]);
  const [imagePreview, setImagePreview] = useState<FileState[] | []>([]);

  const { loading } = useLoading();
  const { mutateAsync: upload } = useUploadFile();

  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.add("border-blue-500");
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove("border-blue-500");
  };

  const handleLoading = (percentage: number) => {
    setProgress(percentage);
  };

  const handleUpload = async (
    e: React.DragEvent | ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    let files: File[] | null = null;

    if ("dataTransfer" in e) {
      files = Array.from(e.dataTransfer?.files ?? []);
    } else {
      files = Array.from(e.currentTarget?.files ?? []);
    }

    if (!files || !files.length) return;

    const { isLoading: fetching, progress, clearLoading } = loading();

    setIsLoading(fetching);
    // const cleanupFakeProgress = simulateProgress({
    //   setProgress
    // });

    for (const file of files) {
      const url = URL.createObjectURL(file);
      setImagePreview((state) => [
        ...state,
        {
          url: url,
          progress: progress,
          index: files.indexOf(file),
        },
      ]);

      try {
        const data = await upload({
          file: file,
          options: { onLoad: handleLoading },
        });
        console.log(data);
        // setFileUrl([filesURL]);
      } catch (error) {
        console.log(error);
        setImagePreview([]);
      }
    }
    clearLoading();
    // cleanupFakeProgress();
    // setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div
        ref={dropRef}
        onDrop={handleUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 hover:bg-neutral-900 transition-all"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 ">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x400px)
          </p>

          <input
            onChange={handleUpload}
            type="file"
            className="opacity-0 cursor-pointer appearance-none absolute top-0 left-0 w-full h-full"
            multiple
          />
        </div>
      </div>

      {progress && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="asdasdas">
        {imagePreview.length > 0 && (
          <div className="pt-4">
            {/* <p className="text-green-600">✅ Upload complete</p> */}
            {imagePreview.map((fileURL) => (
              <div key={fileURL.index} className="relative">
                <img
                  src={fileURL.url as string}
                  alt="Uploaded"
                  className="w-40 mt-2 rounded"
                />
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${fileURL.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
