import APIClient from "@/lib/APIClient";
import type { UploadOptions, UploadSignedResponse } from "./upload.types";

export async function getSignedUrl(filename: string, fileType: string) {
  const res = await APIClient.POST<UploadSignedResponse>({
    endpoint: "/upload",
    data: { filename, fileType },
  });
  return res.data;
}

export async function uploadToS3(
  file: File,
  signedUrl: string,
  options?: UploadOptions
) {
  try {
    await APIClient.PUT({
      endpoint: signedUrl,
      data: file,
      config: {
        headers: { "Content-Type": file.type },
        onUploadProgress: options?.onLoad,
      },
    });
    options?.onSuccess?.();
  } catch (error) {
    options?.onError?.(error);
    throw error;
  }
}

export async function deleteFile(key: string) {
  return await APIClient.DELETE({
    endpoint: `/upload/${key}`,
  });
}
