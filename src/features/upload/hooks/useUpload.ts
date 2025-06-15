import APIClient from "@/lib/APIClient";
import {
  DeleteUploadResponse,
  GetUploadSignedResponse,
  UploadFile,
  UploadSignedResponse,
} from "../upload.types";
import { AxiosProgressEvent } from "axios";

const getImages = async (images: string[] | string) => {
  const res = await APIClient.POST<GetUploadSignedResponse>({
    endpoint: "/upload/get",
    data: images,
  });

  return res.data;
};

const upload = async (
  file: File,
  onLoad?: (progress: AxiosProgressEvent) => void
) => {
  const data = await APIClient.POST<UploadFile>({
    endpoint: "/upload",
    data: { filename: file.name, fileType: file.type },
  });

  const { signedUrl, fileUrl } = data;

  // Step 2: Upload file using PUT
  await APIClient.PUT<UploadSignedResponse>({
    endpoint: signedUrl,
    data: file,
    config: {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progress) => (onLoad ? onLoad(progress) : ""),
    },
  });

  return fileUrl;
};

const remove = async (key: string) => {
  const res = await APIClient.DELETE<DeleteUploadResponse>({
    endpoint: `/upload/${key}`,
  });

  return res.data;
};

const useUpload = () => ({
  getImages,
  upload,
  remove,
});

export default useUpload;
