import {
  BankAccountPaylod,
  BankAccountRootObject,
  EditBankAccountPaylod,
} from "@/Interfaces/bankAccount";
import { IndividualBankRootObject } from "@/Interfaces/IndividualBank";
import { axiosInstance } from "@/service/axios";

export const getBankAccounts = async (searchkey?: string) => {
  const response = await axiosInstance.get<BankAccountRootObject>(
    `/bankdetails?account_holder=${searchkey ? searchkey : ""}`
  );
  return response?.data.payload;
};
export const IndividualgetBankAccounts = async (bankId: string) => {
  const response = await axiosInstance.get<IndividualBankRootObject>(
    `/bankdetails/${Number(bankId)}`
  );
  return response?.data.payload;
};

export const AddBankAccountApi = async (Payload: BankAccountPaylod) => {
  const response = await axiosInstance.post(`/bankdetails`, Payload);
  return response?.data.payload;
};

export const EditBankAccountApi = async (Payload: EditBankAccountPaylod) => {
  const response = await axiosInstance.patch(`/bankdetails`, Payload);
  return response?.data.payload;
};
export const DeleteBankAccountApi = async (bank_id: number) => {
  const response = await axiosInstance.delete(`/bankdetails/${bank_id}`);
  return response?.data.payload;
};
