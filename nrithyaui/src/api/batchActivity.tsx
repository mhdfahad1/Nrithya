import {
  AcrivityRootObject,
  ActivityPayload,
  RootObject,
} from "@/Interfaces/batchActivity";
import { Dropdownbatch } from "@/Interfaces/batchdropdown";
import { axiosInstance } from "@/service/axios";

export const BatchActivityList = async (
  batch_id: number,
  date: string,
  pageNum: number
) => {
  const response = await axiosInstance.get<RootObject>(
    `/batches/activity?batch_id=${batch_id ? batch_id : ""}&date=${
      date ? date : ""
    }&page=${pageNum}&limit=25`
  );
  return response.data.payload;
};

export const BatchlistDropdownActivity = async (course_id?: string) => {
  const response = await axiosInstance.get<Dropdownbatch>(
    `/batches?status=ongoing&course_id=${
      course_id ? Number(course_id) : ""
    }&pagenation=none`
  );
  return response.data.payload.data;
};

export const addBatchActivity = async (payload: AcrivityRootObject) => {
  const response = await axiosInstance.post(`/batches/activity`, payload);
  return response.data.payload;
};

export const getBatchActivityById = async (activityId: number) => {
  const response = await axiosInstance.get(`/batches/activity/${activityId}`);
  return response.data.payload;
};

export const UpdateBatchActivities = async (payload: ActivityPayload) => {
  const response = await axiosInstance.patch(`/batches/activity`, payload);
  return response.data.payload;
};
export const deleteBatchActivity = async (activityId: number) => {
  const response = await axiosInstance.delete(
    `/batches/activity/${activityId}`
  );
};
