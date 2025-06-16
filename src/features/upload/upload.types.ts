import { AxiosProgressEvent } from "axios";

export type LoadingProps = AxiosProgressEvent;

export type UploadFile = {
  signedUrl: string;
  fileUrl: string;
  key: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
};

export type GetUploadSignedResponse = {
  data: UploadFile[];
};

export type UploadSignedResponse = {
  data: UploadFile;
};
export type DeleteUploadResponse = {
  data: {
    message: string;
  };
};

export type UploadOptions = {
  onLoad?: (percentage: number) => void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};
