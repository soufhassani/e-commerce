"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useUploadFile } from "@/features/upload/useUploadQuery";

type FileState = {
  url: string;
  index: number;
  progress: number;
};

type UploadItem = {
  id: string;
  preview: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  fileUrl?: string;
};

const page = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const { mutateAsync: uploadFile } = useUploadFile();

  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.add("border-blue-500");
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove("border-blue-500");
  };

  const handleOnLoad = (percentage: number, id: string) =>
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, progress: percentage, status: "uploading" } : u
      )
    );

  const handleOnLoadSuccess = (id: string) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, progress: 100, status: "done" } : u
      )
    );
  };

  const handleOnLoadError = (id: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "error" } : u))
    );
  };

  const handleUpload = async (
    e: React.DragEvent | ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const files =
      "dataTransfer" in e
        ? Array.from(e.dataTransfer.files ?? [])
        : Array.from(e.currentTarget.files ?? []);

    files.forEach(async (file) => {
      const id = nanoid();
      const preview = URL.createObjectURL(file);

      setUploads((prev) => [
        ...prev,
        { id, preview, progress: 0, status: "pending" },
      ]);

      try {
        const fileUrl = await uploadFile({
          file,
          options: {
            onLoad: (percentage) => handleOnLoad(percentage, id),
            onSuccess: () => handleOnLoadSuccess(id),
            onError: () => handleOnLoadError(id),
          },
        });

        // 3️⃣  store the final public URL if you need it later
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, fileUrl } : u))
        );
      } catch (_) {
        console.log("error: ", _);
      }
    });
  };

  useEffect(
    () => () => uploads.forEach((u) => URL.revokeObjectURL(u.preview)),
    [uploads]
  );

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
            aria-label="Click to upload"
          />
        </div>
      </div>

      <div className="asdasdas">
        {uploads.map((u) => (
          <div key={u.id} className="w-40 mb-4">
            <img src={u.preview} alt="" className="rounded" />
            <div className="h-2 bg-gray-300 rounded-full mt-1">
              <div
                role="progressbar"
                aria-label={u.preview.split("/").pop()}
                aria-valuenow={u.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 bg-blue-600 rounded-full transition-all"
                style={{ width: `${u.progress}%` }}
              />
            </div>

            {u.status === "error" && (
              <span className="text-xs text-red-600">upload failed</span>
            )}
          </div>
        ))}

        {/* {imagePreview.length > 0 && (
          <div className="pt-4">
            {/* <p className="text-green-600">✅ Upload complete</p> 
            {imagePreview.map((fileURL) => {
              console.log("fileURL.progress: ", fileURL.progress);
              return (
                <div key={fileURL.index} className="relative">
                  <img
                    src={fileURL.url as string}
                    alt="Uploaded"
                    className="w-40 mt-2 rounded"
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )} 
        */}
      </div>
    </div>
  );
};

export default page;
