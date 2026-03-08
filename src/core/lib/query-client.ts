import { AxiosError } from "axios";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";

import type { IApiResponse } from "@core/interfaces/api-response.interface";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<IApiResponse>;

  return axiosError?.response?.data?.message ?? axiosError?.message ?? "Unexpected error";
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});
