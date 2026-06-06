import { BankRootObject } from "@/Interfaces/ListBankDetails";
import { axiosInstance } from "@/service/axios";

export const getBankDetails = async () => {
  const response = await axiosInstance.get<BankRootObject>(`/bankdetails`);
  return response.data.payload.data;
};
