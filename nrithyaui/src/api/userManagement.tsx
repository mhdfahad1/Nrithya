import { LoginPayloadType } from "@/Interfaces/Login";
import { axiosInstance } from "@/service/axios";
const login = async (payload: LoginPayloadType) => {
  const response = await axiosInstance.post(`/auth`, payload);
  return response.data;
};

export { login };
