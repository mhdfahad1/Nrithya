import { StudentByCourseType } from "@/app/super-admin/dashboard/StudentsByCourse";
import { axiosInstance } from "@/service/axios";

export const getStudentByCourse = async (from: string, to: string) => {
  const response = await axiosInstance.get<StudentByCourseType>(
    `dashboard/coursestudents?from=${from}&to=${to}&pagenation=none`
  );
  return response.data.payload;
};
