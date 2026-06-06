import { axiosInstance } from "@/service/axios";
interface UserDetailRootObject {
  success: boolean;
  payload: UserDetailPayload;
}

export interface UserDetailPayload {
  id: number;
  userName: string;
  userRole: string;
}
export const getUserDetail = async () => {
  try {
    const response = await axiosInstance.get<UserDetailRootObject>(
      `/users/profile`
    );
    return response?.data?.payload;
  } catch (error) {
    throw error;
  }
};
