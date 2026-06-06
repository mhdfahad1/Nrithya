import { axiosInstance } from "@/service/axios";
interface RevenueGrowthRootObject {
  success: boolean;
  payload: RevenueGrowthPayload[];
}

interface RevenueGrowthPayload {
  month: string;
  year: number;
  revenue: number;
}
export const getRevenueGrowth = async (from: string, to: string) => {
  try {
    const response = await axiosInstance.get<RevenueGrowthRootObject>(
      `/dashboard/revenue?from=${from}&to=${to}&pagenation=none`
    );
    return response?.data?.payload;
  } catch (error) {
    throw error;
  }
};
