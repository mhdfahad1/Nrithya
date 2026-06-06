import { PerformanceRootObject } from "@/Interfaces/performance";
import { axiosInstance } from "@/service/axios";

export const PerformanceListApi = async (
  searchKey: string,
  page: number,
  percent: string,
  assignment: string,
  attendance: string
) => {
  const response = await axiosInstance.get<PerformanceRootObject>(
    `/reports/performance?student_name=${
      searchKey ? searchKey : ""
    }&page=${page}&limit=25&performance=${
      percent ? Number(percent) : ""
    }&assignment=${assignment ? Number(assignment) : ""}&attendance=${
      attendance ? Number(attendance) : ""
    }`
  );
  return response?.data?.payload;
};

export const downloadPerformance = async (
  searchKey: string,
  percent: string,
  assignment: string,
  attendance: string
) => {
  const response = await axiosInstance.get(
    `/reports/performance?save=true&pagenation=none&student_name=${
      searchKey ? searchKey : ""
    }&performance=${percent ? Number(percent) : ""}&assignment=${
      assignment ? Number(assignment) : ""
    }&attendance=${attendance ? Number(attendance) : ""}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};
