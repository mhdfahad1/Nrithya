import {
  AddBatchCompensation,
  BatchCompensation,
  EditBatchCompensation,
} from "@/Interfaces/BatchCompensation";
import { IndividualBatchCompensationRootObject } from "@/Interfaces/individualBatchcompensation";
import { RootObject } from "@/Interfaces/Student";
import { axiosInstance } from "@/service/axios";

//Add Batch Compensation
export const addBatchCompensation = async (payload: AddBatchCompensation) => {
  try {
    const response = await axiosInstance.post(`/compensation/batches`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//Get Batch Compensation
export const getBatchCompensation = async (
  searchkey: string,
  pageNum: number,
  from: string,
  to: string
) => {
  try {
    const response = await axiosInstance.get<BatchCompensation>(
      `/compensation/batches?batch_name=${searchkey}&page=${pageNum}&from=${from}&to=${to}`
    );

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};

export const deletcompensationBatch = async (compensation_id: number) => {
  const response = await axiosInstance.delete(
    `/compensation/batches?compensation_id=${compensation_id}`
  );
  return response.data.payload;
};

export const IndividalcompensationBatch = async (compensation_id: number) => {
  const response = await axiosInstance.get<IndividualBatchCompensationRootObject>(
    `/compensation/batches/${compensation_id}`
  );
  return response.data.payload;
};

export const EditcompensationBatch = async (Payload: EditBatchCompensation) => {
  const response = await axiosInstance.patch(`/compensation/batches`, Payload);
  return response.data.payload;
};

//list batches for batch dropdown list
export const BatchDropdownList = async () => {
  const response = await axiosInstance.get<RootObject>(`/batches`);
  return response.data.payload.data;
};

export const getIndividualBatchAPi = async (batchId: string) => {
  const response = await axiosInstance.get<RootObject>(`/batches/${batchId}`);
  return response.data.payload.data;
};
