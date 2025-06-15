import axios, { AxiosRequestConfig } from "axios";

type NoramlProps = {
  endpoint: string;
  config?: AxiosRequestConfig;
};
type EditProps = {
  endpoint: string;
  data: any;
  config?: AxiosRequestConfig;
};

const app = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: { "Content-Type": "application/json" },
});

app.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || "Unknown error";
    console.error("API Error:", status, message);
    return Promise.reject({ status, message });
  }
);

class ApiClientInternal {
  constructor() {}

  private isFormData = (data: any) => {
    return typeof FormData !== "undefined" && data instanceof FormData;
  };

  private isRawFile = (data: any) =>
    typeof File !== "undefined" && data instanceof File;

  private isBlob = (data: any) =>
    typeof Blob !== "undefined" && data instanceof Blob;

  private prepareData = (data: any) => {
    if (this.isRawFile(data) || this.isBlob(data) || this.isFormData(data))
      return data;

    return JSON.stringify(data);
  };

  async get({ endpoint, config }: NoramlProps) {
    const res = await app.get(endpoint, config);
    return res.data;
  }
  async post({ endpoint, data, config }: EditProps) {
    const res = await app.post(endpoint, this.prepareData(data), config);
    console.log("Res", res);
    return res.data;
  }
  async put({ endpoint, data, config }: EditProps) {
    const res = await app.put(endpoint, this.prepareData(data), config);
    return res.data;
  }
  async delete({ endpoint, config }: NoramlProps) {
    const res = await app.delete(endpoint, config);
    return res.data;
  }
}

const instance = new ApiClientInternal();

const GET = <T>(props: NoramlProps): Promise<T> => {
  return instance.get(props);
};
const POST = <T>(props: EditProps): Promise<T> => {
  return instance.post(props);
};
const PUT = <T>(props: EditProps): Promise<T> => {
  return instance.put(props);
};
const DELETE = <T>(props: NoramlProps): Promise<T> => {
  return instance.delete(props);
};

export default { GET, POST, PUT, DELETE };
