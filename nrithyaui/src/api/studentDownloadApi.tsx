import { axiosInstance } from "@/service/axios";

export const downloadStudent = async (
  searchkey: string,
  status: string,
  batch_id: number,
  dateFrom?: string,
  dateTo?: string
) => {
  const response = await axiosInstance.get(
    `/students?save=true&pagenation=none&student_name=${
      searchkey ? searchkey : ""
    }&status=${status ? status : ""}&batch_id=${
      batch_id ? batch_id : ""
    }&from=${dateFrom ? dateFrom : ""}&to=${dateTo ? dateTo : ""}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};
