import { LocalStorage } from "@/app/utility/localstorage";
import axios, { AxiosInstance } from "axios";

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const UserToken = LocalStorage.getItem("authToken");

export class Axios {
  private static instance: AxiosInstance;
  static getInstance(): AxiosInstance {
    Axios.instance =
      Axios.instance ||
      axios.create({
        baseURL: BaseUrl,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    Axios.instance.interceptors.request.use(
      (config) => {
        const { headers } = config;
        headers.Authorization = UserToken ? `Bearer ${UserToken}` : "";
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // Axios instance response interceptor
    Axios.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const refresh_token = LocalStorage?.getItem("refreshToken");
        // Check if the user is not authenticated and add redirection logic
        if (error?.response?.status === 403 && !refresh_token) {
          // User is not authenticated, redirect to the login page
          window.location.href = "/login";
          return Promise.reject(error);
        }
        if (
          error?.response?.status === 403 &&
          refresh_token !== null &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const response = await axiosInstance.post(`/auth/refresh`, {
              refresh_token,
            });
            if (response.data.success) {
              LocalStorage?.setItem(
                "authToken",
                response?.data?.payload?.access_token
              );
              LocalStorage.setItem(
                "refreshToken",
                response?.data?.payload?.refresh_token
              );
              // Set new authToken in axios instance
              Axios.instance.defaults.headers.common.Authorization = `Bearer ${response?.data?.payload?.access_token}`;
              window?.location?.reload();
            } else {
              // remove authToken from localStorage
              LocalStorage?.clear();
              window.location.href = "/login";
            }
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${UserToken}`;
            return axios(originalRequest);
          } catch (error) {
            LocalStorage.clear();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
    return Axios.instance;
  }
}
export const axiosInstance = Axios.getInstance();
