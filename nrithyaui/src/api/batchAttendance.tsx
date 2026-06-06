import {
  AddStudentAttendancePayload,
  AddTeacherAttendancePayload,
  CalendarRootObject,
  RootObjectAttendance,
  RootObjectAttendanceFirst,
  UpdateAttendancePayload,
} from "@/Interfaces/batchAttendance";
import { axiosInstance } from "@/service/axios";

export const addAttendanceTeacher = async (
  data: AddTeacherAttendancePayload
) => {
  const response = await axiosInstance.post(`/attendance/teachers`, data);
  return response.data;
};

export const addAttendanceStudent = async (
  data: AddStudentAttendancePayload
) => {
  const response = await axiosInstance.post(`/attendance/students`, data);
  return response.data;
};

// update teacher

export const updateAttendanceTeacher = async (
  data: UpdateAttendancePayload
) => {
  const response = await axiosInstance.patch(`attendance/teachers`, data);
  return response.data;
};
export const updateAttendanceStudent = async (
  data: UpdateAttendancePayload
) => {
  const response = await axiosInstance.patch(`attendance/students`, data);
  return response.data;
};

// new

export const getClassAttendance = async (
  batch_id: string,
  date: string,
  start_time: string,
  end_time: string
) => {
  const response = await axiosInstance.get<
    RootObjectAttendanceFirst | RootObjectAttendance
  >(
    `attendance/class?batch_id=${batch_id}&date=${date}&start_time=${start_time}&end_time=${end_time}`
  );
  return response.data.payload;
};

// calendar
export const getCalendar = async (calendar_id: string) => {
  const response = await axiosInstance.get<CalendarRootObject>(
    `calendar/${calendar_id}`
  );
  return response.data.payload;
};
