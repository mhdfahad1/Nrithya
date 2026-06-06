import {
  CreateUserPayloadType,
  UpdateUserPayloadType,
} from "@/Interfaces/User";
import { axiosInstance } from "@/service/axios";

const createUser = async (payload: CreateUserPayloadType) => {
  try {
    const response = await axiosInstance.post(`/users`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getUsers = async (
  searchKey: string,
  pageNum: number,
  userStatus: string
) => {
  try {
    const response = await axiosInstance.get(
      `/users?user_name=${searchKey}&page=${pageNum}&status=${userStatus}&limit=25`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getUsersCombobox = async () => {
  try {
    const response = await axiosInstance.get(`/users?status=active`);
    return response.data.payload;
  } catch (error) {
    throw error;
  }
};
const updateUser = async (payload: UpdateUserPayloadType, user_id: number) => {
  try {
    const response = await axiosInstance.patch(`/users/`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { createUser, getUsers, updateUser, getUsersCombobox };
