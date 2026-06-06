import { ResetPasswordPayload } from "@/Interfaces/resetPassword";
import { axiosInstance } from "@/service/axios";

export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  const response = await axiosInstance.post(`/users/changepassword`, payload);

  return response.data.payload;
};
