import { ReportFeeRootObject } from "@/Interfaces/reportFeeCollection";
import { axiosInstance } from "@/service/axios";

export const reportFeeDetails = async (
  searchkey: string,
  batch_id: string,
  status: string,
  duefrom: string,
  dueto: string,
  paidfrom: string,
  paidto: string,
  bank_id: string,
  pageNum: number
) => {
  const response = await axiosInstance.get<ReportFeeRootObject>(
    `/fee?student_name=${searchkey ? searchkey : ""}&batch_id=${
      batch_id ? Number(batch_id) : ""
    }&status=${status ? status : ""}&duefrom=${duefrom ? duefrom : ""}&dueto=${
      dueto ? dueto : ""
    }&paidfrom=${paidfrom ? paidfrom : ""}&paidto=${
      paidto ? paidto : ""
    }&bank_id=${bank_id ? Number(bank_id) : ""}&page=${pageNum}&limit=25`
  );
  return response.data.payload;
};
