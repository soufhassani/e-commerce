"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { nanoid } from "nanoid";
import { useUploadFile } from "@/features/upload/useUploadQuery";

type UploadItem = {
  id: string;
  preview: string;
  fileName: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  loaded: boolean;
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
    setTimeout(
      () =>
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, progress: 100, status: "done" } : u
          )
        ),
      200
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
        {
          id,
          preview,
          fileName: file.name,
          size: file.size,
          progress: 0,
          loaded: false,
          status: "pending",
        },
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

      <div className="grid grid-cols-5 gap-2.5">
        {uploads.map((u) => (
          <div
            key={u.id}
            className="relative flex flex-col gap-2.5 w-full h-full mb-4 p-2.5 border-1 border-neutral-800 rounded-lg"
          >
            <div className="relative max-h-56 h-full w-full flex-1 overflow-hidden">
              <img
                src={u.preview}
                alt={u.fileName}
                className="rounded w-full h-full object-cover"
              />
              {u.status === "done" && (
                <div className="bg-green-600 absolute top-2.5 right-2.5 p-1.5 rounded-full">
                  <FaCheck size={15} color="white" />
                </div>
              )}
            </div>
            <div className="p-1.5 flex flex-col justify-between gap-2.5">
              <div className="flex justify-between gap-2.5">
                <span className="text-xs font-medium">{u.fileName}</span>
                <span className="text-xs text-gray-500">{`${(
                  u.size / 1024
                ).toFixed(2)}kb`}</span>
              </div>
              <div className="h-2 w-full bg-gray-300 rounded-full mt-1">
                <div
                  role="progressbar"
                  aria-label={u.fileName}
                  aria-valuenow={u.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-full bg-blue-600  rounded-full transition-all"
                  style={{
                    width: `${u.progress}%`,
                    backgroundColor:
                      u.status === "done" ? "oklch(62.7% 0.194 149.214)" : "",
                  }}
                />
              </div>
            </div>

            {u.status === "error" && (
              <span className="text-xs text-red-600">upload failed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
