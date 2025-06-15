"use client";
import useUpload from "@/features/upload/hooks/useUpload";
import React, { useRef, useState } from "react";

const page = () => {
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const { upload } = useUpload();

    try {
      const fileUrl = await upload(file);
      console.log(fileUrl);
      setFileUrl(fileUrl);
    } catch (error) {
      console.log(error);
    }
    // Step 1: Get signed PUT URL from API
    // const res = await fetch("/api/upload", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ filename: file.name, fileType: file.type }),
    // });
    // const { signedUrl, fileUrl } = await res.json();

    // // Step 2: Upload file using PUT
    // await fetch(signedUrl, {
    //   method: "PUT",
    //   headers: { "Content-Type": file.type },
    //   body: file,
    // }).then(() => {
    //   setFileUrl(fileUrl);
    //   setProgress(100);
    // });

    // (Optional: animate progress)
    // let i = 0;
    // const fakeProgress = setInterval(() => {
    //   i += 10;
    //   setProgress(i);
    //   if (i >= 90) clearInterval(fakeProgress);
    // }, 50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.add("border-blue-500");
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove("border-blue-500");
  };

  return (
    <div className="space-y-4">
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 cursor-pointer transition-all"
      >
        <p>Drag and drop a file here</p>
      </div>

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {fileUrl && (
        <div className="pt-4">
          <p className="text-green-600">✅ Upload complete</p>
          <img src={fileUrl} alt="Uploaded" className="w-40 mt-2 rounded" />
        </div>
      )}
    </div>
  );
};

export default page;
