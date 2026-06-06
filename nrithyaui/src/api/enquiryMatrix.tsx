import { axiosInstance } from "@/service/axios";
interface EnquiryMatrixRootObject {
  success: boolean;
  payload: EnquiryMatrixPayload;
}

interface EnquiryMatrixPayload {
  total_enquiry: number;
  converted_enquiry: number;
  enquiry_conversion_percentage: number;
  total_demo_requested: number;
  demo_percentage: number;
  converted_demo_requested: number;
  demo_conversion_percentage: number;
  enquiry_types: EnquiryMatrixtype[];
}

interface EnquiryMatrixtype {
  enquiryTypeId: number;
  enquiryTypeName: string;
  totalCount: number;
}
export const getEnquiryMatrix = async (from: string, to: string) => {
  try {
    const response = await axiosInstance.get<EnquiryMatrixRootObject>(
      `/dashboard/enquiry?from=${from}&to=${to}`
    );
    return response?.data?.payload;
  } catch (error) {
    throw error;
  }
};
