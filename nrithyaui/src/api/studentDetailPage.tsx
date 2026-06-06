import { studentDetailRootObject } from "@/Interfaces/StudentDetail";
import { PreviousBatchRootObject } from "@/Interfaces/StudentPreviousBAtch";
import { axiosInstance } from "@/service/axios";

export const StudentDetails = async (studentId: number) => {
  const response = await axiosInstance.get<studentDetailRootObject>(
    `/students/${studentId}`
  );
  return response.data.payload;
};

export const PreviosBatch = async (studentId: number) => {
  const response = await axiosInstance.get<PreviousBatchRootObject>(
    `/students/batchhistory?student_id=${studentId}`
  );
  return response.data.payload;
};
