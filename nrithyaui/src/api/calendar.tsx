import { PaylodCalendarType } from "@/app/Admin/calendar/week/page";
import { RootObject } from "@/Interfaces/calendarWeek";
import { axiosInstance } from "@/service/axios";

export const GetWeekCalendar = async (
  payload: PaylodCalendarType,
  teacherId: string
) => {
  const response = await axiosInstance.post<RootObject>(
    `/calendar?teacher_id=${teacherId ? Number(teacherId) : ""}`,
    payload
  );
  return response.data.payload;
};

export const GetWeekCalendarDownload = async (
  payload: PaylodCalendarType,
  teacherId: string
) => {
  const response = await axiosInstance.post(
    `/calendar?save=true&teacher_id=${teacherId ? Number(teacherId) : ""}`,
    payload,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response.data;
};
