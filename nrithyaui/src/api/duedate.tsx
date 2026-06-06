import { PayloadRootObject } from "@/Interfaces/duedate";
import { axiosInstance } from "@/service/axios";

export const updateDuedate = async (
  payment_id: number,
  data: PayloadRootObject
) => {
  const response = await axiosInstance.patch(`/fee/${payment_id}`, data);
  return response.data;
};
