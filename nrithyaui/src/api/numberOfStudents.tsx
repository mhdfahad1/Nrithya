import { axiosInstance } from "@/service/axios";
interface NumberOfStudentsRootObject {
  success: boolean;
  payload: NumberOfStudentsPayload[];
}

interface NumberOfStudentsPayload {
  month: string;
  year: number;
  students: number;
}
export const getNumberOfStudents = async (from: string, to: string) => {
  try {
    const response = await axiosInstance.get<NumberOfStudentsRootObject>(
      `/dashboard/students?from=${from}&to=${to}&pagenation=none`
    );
    return response?.data?.payload;
  } catch (error) {
    throw error;
  }
};
