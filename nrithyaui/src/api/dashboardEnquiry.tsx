import { DashbordEnquiryRootObject } from "@/Interfaces/dashbordEnquiry";
import { axiosInstance } from "@/service/axios";

export const dashboardEnquiryApi = async (dateFrom: string, dateTo: string) => {
  const response = await axiosInstance.get<DashbordEnquiryRootObject>(
    `/dashboard/enquiry?from=${dateFrom}&to=${dateTo}&pagenation=none`
  );
  return response.data.payload;
};
