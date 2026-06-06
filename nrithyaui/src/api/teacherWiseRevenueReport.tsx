import { TeacherRevenueResponse } from "@/Interfaces/teacherWiseRevenue";
import { axiosInstance } from "@/service/axios";

export const teacherWiseRevenueReportApi = async (
  dateFrom: string,
  dateTo: string
) => {
  const response = await axiosInstance.get<TeacherRevenueResponse>(
    `/dashboard/teachers?from=${dateFrom}&to=${dateTo}&pagenation=none`
  );
  return response.data.payload;
};
