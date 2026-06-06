import {
  batchPayload,
  batchUpdatePayload,
  ListBatchRootObject,
} from "@/Interfaces/batch";
import { BatchStudntsRootObject } from "@/Interfaces/BatchStudents";
import { axiosInstance } from "@/service/axios";

export const AddBatch = async (payload: batchPayload) => {
  const response = await axiosInstance.post<ListBatchRootObject>(
    `/batches`,
    payload
  );
  return response.data.payload;
};

export const BatchesList = async (
  searchkey: string,
  pageNum: number,
  course_id: string,
  teacher_id: string,

  from: string,
  to: string
) => {
  const response = await axiosInstance.get(
    `/batches/?batch_name=${
      searchkey ? searchkey : ""
    }&page=${pageNum}&course_id=${
      course_id ? Number(course_id) : ""
    }&status=ongoing&from=${from ? from : ""}&to=${
      to ? to : ""
    }&limit=25&teacher_id=${teacher_id ? Number(teacher_id) : ""}`
  );
  return response.data.payload;
};
export const downloadBatchesList = async (
  searchkey: string,
  course_id: string,
  teacher_id: string,
  from: string,
  to: string
) => {
  const response = await axiosInstance.get(
    `/batches?save=true&pagenation=none&batch_name=${
      searchkey ? searchkey : ""
    }&course_id=${course_id ? Number(course_id) : ""}&status=ongoing&from=${
      from ? from : ""
    }&to=${to ? to : ""}&teacher_id=${teacher_id ? Number(teacher_id) : ""}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};

export const UpdateByBatch = async (payload: batchUpdatePayload) => {
  const response = await axiosInstance.patch(`/batches`, payload);
  return response.data.payload;
};

export const CourseList = async () => {
  const response = await axiosInstance.get(`/courses?pagenation=none`);
  return response.data.payload.data;
};

export const TeacherList = async () => {
  const response = await axiosInstance.get(`/teachers`);
  return response?.data?.payload?.data;
};

export const TeacherByCourse = async (courseId: number) => {
  const response = await axiosInstance.get(`/teachers?course_id=${courseId}`);
  return response?.data?.payload?.data;
};

export const BatchDetail = async (BatchId: string) => {
  const response = await axiosInstance.get(`/batches/${Number(BatchId)}`);
  return response.data.payload;
};
export const BatchStudentList = async (BatchId: string,calendar_date?: string) => {
  const response = await axiosInstance.get<BatchStudntsRootObject>(
    `/students?batch_id=${Number(BatchId)}&percent=true&status=active&calendar_date=${calendar_date? calendar_date : ""}`
  );
  return response.data.payload;
};
export const deleteBatchApi = async (BatchId: number) => {
  const response = await axiosInstance.delete(`/batches?batch_id=${BatchId}`);
  return response.data.payload.data;
};
