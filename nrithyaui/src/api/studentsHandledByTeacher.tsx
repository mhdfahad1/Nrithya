import { StudentsHandledByTeacherType } from "@/app/super-admin/dashboard/StudentsHandledByTeacher";
import { axiosInstance } from "@/service/axios";

export const getStudentsHandledByTeacher = async (from: string, to: string) => {
  const response = await axiosInstance.get<StudentsHandledByTeacherType>(
    `dashboard/teachers?from=${from}&to=${to}&pagenation=none`
  );
  return response.data.payload;
};
