import {
  AddCompensationPayloadStudent,
  RootObject,
  UpdateCompensationStudent,
} from "@/Interfaces/StudentCompensation";
import { axiosInstance } from "@/service/axios";

//AddStudentCompensation
export const addStudentCompensation = async (
  payload: AddCompensationPayloadStudent
) => {
  try {
    const response = await axiosInstance.post(
      `/compensation/students`,
      payload
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

//GetStudentCompensation
export const getStudentCompensation = async (
  searchkey: string,
  pageNum: number,
  from: string,
  to: string
) => {
  try {
    const response = await axiosInstance.get<RootObject>(
      `/compensation/students?student_name=${searchkey}&page=${pageNum}&from=${from}&to=${to}&limit=25`
    );

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};

export const UpdateStudent = async (payload: UpdateCompensationStudent) => {
  const response = await axiosInstance.patch(`/compensation/students`, payload);
  return response.data.payload;
};

export const getStudentById = async (studentId: string) => {
  const response = await axiosInstance.get(
    `/compensation/students/${Number(studentId)}`
  );
  return response.data.payload;
};

export const deleteCompensationStudent = async (studentId: number) => {
  const response = await axiosInstance.delete(
    `/compensation/students?id=${studentId}`
  );
  return response.data.payload;
};
