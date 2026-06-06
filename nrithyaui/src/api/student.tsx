import { ActiveType, AddPayloadType, RootObject } from "@/Interfaces/Student";
import { axiosInstance } from "@/service/axios";

export const studentList = async (
  searchkey: string,
  status: string,
  pageNum: number,
  batch_id: number,
  dateFrom?: string,
  dateTo?: string
) => {
  const response = await axiosInstance.get<RootObject>(
    `/students?student_name=${searchkey ? searchkey : ""}&status=${
      status ? status : ""
    }&page=${pageNum}&batch_id=${batch_id ? batch_id : ""}&from=${
      dateFrom ? dateFrom : ""
    }&to=${dateTo ? dateTo : ""}&limit=25`
  );
  return response.data.payload;
};

export const DownloadStudent = async (
  searchkey: string,
  status: string,
  batch_id: number
) => {
  const response = await axiosInstance.get(
    `/students?student_name=${searchkey ? searchkey : ""}&status=${
      status ? status : ""
    }&batch_id=${batch_id ? batch_id : ""}&pagenation=none&save=true`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response.data;
};

export const addStudent = async (payload: AddPayloadType) => {
  const response = await axiosInstance.post(`/students`, payload);
  return response.data.payload;
};

export const UpdateStudent = async (payload: AddPayloadType) => {
  const response = await axiosInstance.patch(`/students`, payload);
  return response.data.payload;
};

export const getStudentById = async (studentId: string) => {
  const response = await axiosInstance.get(`/students/${Number(studentId)}`);
  return response.data.payload;
};

export const studentDropDownList = async (batchId: number) => {
  const response = await axiosInstance.get<RootObject>(
    `/students?pagenation=none&batch_id=${batchId}`
  );

  return response.data.payload.data;
};

export const deleteStudent = async (studentId: number) => {
  const response = await axiosInstance.delete(
    `/students?student_id=${studentId}`
  );
  return response.data.payload.data;
};

export const activeStudent = async (payload: ActiveType) => {
  const response = await axiosInstance.patch(`/students`, payload);
  return response.data.payload;
};

export const dismissStudent = async (studentId: number) => {
  const response = await axiosInstance.delete(
    `/students?dismiss=true&student_id=${studentId}`
  );
  return response.data.payload;
};
