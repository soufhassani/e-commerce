import { AxiosProgressEvent } from "axios";
import { useMutation } from "@tanstack/react-query";
import { getSignedUrl, uploadToS3, deleteFile } from "./upload.service";
import { UploadOptions } from "./upload.types";

type UploadFunction = {
  file: File;
  options?: UploadOptions;
};

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, options }: UploadFunction) => {
      const { signedUrl, fileUrl } = await getSignedUrl(file.name, file.type);
      await uploadToS3(file, signedUrl, options);
      return fileUrl;
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: deleteFile,
  });
}
