import { FormValues } from "@/app/Admin/feecollection/updateFeeCollection";
import { AddFeePayload, FeeResponse } from "@/Interfaces/feeCollection";
import { axiosInstance } from "@/service/axios";
import { headers } from "next/headers";
import { ChangeEvent } from "react";

export const getFeeCollection = async (
  batch_id: number,
  searchkey: string,
  pageNum: number
) => {
  try {
    const response = await axiosInstance.get<FeeResponse>(
      `/fee?batch_id=${
        batch_id ? batch_id : ""
      }&student_name=${searchkey}&page=${pageNum}&limit=25`
    );

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};

export const addStatusFeeCollection = async (payload: AddFeePayload) => {
  const formData = new FormData();

  formData.append("payment_id", payload.payment_id);
  formData.append("transaction_id", payload.transaction_id);

  formData.append("paid_date", payload.paid_date);
  formData.append("remarks", payload.remarks);
  formData.append("bank_id", payload.bank_id);

  formData.append("file", payload.file);

  try {
    const response = await axiosInstance.patch(`/fee`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};

export const downloadFee = async (searchkey: string, batch_id: number) => {
  try {
    const response = await axiosInstance.get(
      `/reports/fee?save=true&pagenation=none&batch_id=${
        batch_id ? batch_id : ""
      }&student_name=${searchkey}`,
      {
        responseType: "blob",
        headers: {
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
