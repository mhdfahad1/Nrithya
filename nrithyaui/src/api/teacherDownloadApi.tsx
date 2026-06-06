import { axiosInstance } from "@/service/axios";

export const downloadTeacher = async (
  searchKey: string,
  courseId: string,
  batchId: string
) => {
  const response = await axiosInstance.get(
    `/reports/teachers?save=true&pagenation=none&teacher_name=${searchKey}&course_id=${
      courseId && Number(courseId)
    }&batch_id=${batchId && Number(batchId)}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};
