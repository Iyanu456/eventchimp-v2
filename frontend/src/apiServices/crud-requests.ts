import axios, { AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./base-urls";
import { tokenService } from "./token-service";
import { sessionActions } from "@/stores/session-store";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

client.interceptors.request.use((config) => {
  const token = tokenService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.removeToken();
      sessionActions.logout();
      sessionActions.expireSession();
    }

    return Promise.reject(error);
  }
);

export const crudRequest = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await client.get<T>(url, config);
    return response.data;
  },
  post: async <T, P>(url: string, payload?: P, config?: AxiosRequestConfig) => {
    const response = await client.post<T>(url, payload, config);
    return response.data;
  },
  patch: async <T, P>(url: string, payload?: P, config?: AxiosRequestConfig) => {
    const response = await client.patch<T>(url, payload, config);
    return response.data;
  },
  put: async <T, P>(url: string, payload?: P, config?: AxiosRequestConfig) => {
    const response = await client.put<T>(url, payload, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await client.delete<T>(url, config);
    return response.data;
  }
};
