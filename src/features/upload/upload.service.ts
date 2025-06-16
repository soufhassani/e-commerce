import APIClient from "@/lib/APIClient";
import type {
  UploadFile,
  UploadOptions,
  UploadSignedResponse,
} from "./upload.types";

export async function getSignedUrl(filename: string, fileType: string) {
  const data = await APIClient.POST<UploadFile>({
    endpoint: "/upload",
    data: { filename, fileType },
  });
  return data;
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
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );
          options?.onLoad?.(percent); // or directly update your progress bar
        },
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
