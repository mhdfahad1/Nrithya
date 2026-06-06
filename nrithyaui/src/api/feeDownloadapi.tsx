import { axiosInstance } from "@/service/axios";

export const downloadFeeCollection = async (
  searchkey: string,
  batch_id: string,
  status: string,
  duefrom: string,
  dueto: string,
  paidfrom: string,
  paidto: string,
  bank_id: string
) => {
  const response = await axiosInstance.get(
    `/reports/fee?save=true?pagenation=none&student_name=${
      searchkey ? searchkey : ""
    }&batch_id=${batch_id ? batch_id : ""}&status=${
      status ? status : ""
    }&duefrom=${duefrom ? duefrom : ""}&dueto=${dueto ? dueto : ""}&paidfrom=${
      paidfrom ? paidfrom : ""
    }&paidto=${paidto ? paidto : ""}&bank_id=${bank_id ? Number(bank_id) : ""}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};
