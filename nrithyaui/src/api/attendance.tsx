import { StudentRootObject, TeacherRootObject } from "@/Interfaces/attendance";
import { axiosInstance } from "@/service/axios";

export const getTeacherAttendance = async (
  from: string,
  to: string,
  teacher_name: string,
  batch_id: string,
  pageNum: number
) => {
  const response = await axiosInstance.get<TeacherRootObject>(
    `/attendance/streak/teachers?from=${from}&to=${to}&teacher_name=${teacher_name}&batch_id=${batch_id}&page=${pageNum}&limit=25`
  );
  return response.data.payload;
};

export const GetBatchCombobox = async () => {
  const response = await axiosInstance.get(
    "/batches?status=ongoing&pagenation=none"
  );
  return response.data.payload.data;
};

export const getStudentAttendance = async (
  from: string,
  to: string,
  teacher_name: string,
  batch_id: string,
  pageNum: number,
  status: string
) => {
  const response = await axiosInstance.get<StudentRootObject>(
    `/attendance/streak/students?from=${from}&to=${to}&student_name=${teacher_name}&batch_id=${batch_id}&page=${pageNum}&limit=25&status=${status}`
  );
  return response.data.payload;
};
