import {
  BatchAssignmentAdd,
  BatchAssignmentListResponse,
} from "@/Interfaces/batchAssignment";
import { TeacherDropDown } from "@/Interfaces/teacherDropdown";
import { axiosInstance } from "@/service/axios";

export const addBatchAssignment = async (payload: BatchAssignmentAdd) => {
  const response = await axiosInstance.patch(`/assignments/students`, payload);
  return response.data.payload;
};

export const listBatchAssignment = async (id: string) => {
  const response = await axiosInstance.get<BatchAssignmentListResponse>(
    `/assignments/students?id=${Number(id)}&Limit=25`
  );

  return response.data.payload;
};

export const TeacherlistDropdown = async () => {
  const response = await axiosInstance.get<TeacherDropDown>(`/teachers`);
  return response.data.payload.data;
};
