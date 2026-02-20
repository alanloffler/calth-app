import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }

    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config,
      (error: AxiosError) => Promise.reject(error),
    );

    let isRefreshing: boolean = false;
    let failedQueue: { resolve: (value: unknown) => void; reject: (reason: any) => void }[] = [];
    const processQueue = (error: AxiosError | null, success: boolean) => {
      failedQueue.forEach((promise) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        error ? promise.reject(error) : promise.resolve(success);
      });

      failedQueue = [];
    };

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest?.url || originalRequest.url.includes("/auth/login")) {
          return Promise.reject(error);
        }

        const is401 = error.response?.status === 401;

        if (!is401) return Promise.reject(error);

        if (originalRequest._retry) return Promise.reject(error);

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => this.axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true });
          processQueue(null, true);

          return this.axiosInstance(originalRequest);
        } catch (error) {
          const refreshError = error as AxiosError;
          (refreshError as any).isRefreshFail = true;

          processQueue(refreshError as AxiosError, false);

          const isAdminCheck = originalRequest.url?.includes("/auth/admin");

          if (!isAdminCheck) {
            toast.error("Tu sesión ha expirado");

            setTimeout(() => {
              window.location.replace("/");
            }, 2000);
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );
  }

  public getClient(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = ApiClient.getInstance().getClient();
