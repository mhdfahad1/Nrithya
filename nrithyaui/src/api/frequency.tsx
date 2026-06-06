import { DataType } from "@/app/super-admin/frequency/page";
import { FrequencyRootObject } from "@/Interfaces/frequency";
import { axiosInstance } from "@/service/axios";

export const frequencyGet = async () => {
  const response = await axiosInstance.get<FrequencyRootObject>(
    `/followfrequency`
  );
  return response.data.payload;
};

export const frequencyPatch = async (Payload: DataType) => {
  const response = await axiosInstance.patch(`/followfrequency`, Payload);
  return response.data.payload;
};

// export const frequencyAdd = async (Payload: DataType) => {
//   const response = await axiosInstance.post(`/superadmin`, Payload);
//   return response.data.payload;
// };
