import {
  individualStudentAttendanceRootObject,
  individualteacherAttendanceRootObject,
  StudentAttendanceRootObject,
  TeacherAttendanceRootObject,
} from "@/Interfaces/attendancReport";
import { axiosInstance } from "@/service/axios";

export const getStudentAttendanceRport = async (
  from: string,
  to: string,
  pageNum: number
) => {
  const response = await axiosInstance.get<StudentAttendanceRootObject>(
    `/reports/studentattendance?from=${from}&to=${to}&page=${pageNum}&limit=25`
  );
  return response.data.payload;
};

export const getTeacherAttendanceRport = async (
  from: string,
  to: string,

  pageNum: number
) => {
  const response = await axiosInstance.get<TeacherAttendanceRootObject>(
    `/reports/teacherattendance?from=${from}&to=${to}&page=${pageNum}`
  );
  return response.data.payload;
};
export const StudentAttendanceDownload = async (from: string, to: string) => {
  const response = await axiosInstance.get(
    `/reports/studentattendance?save=true&pagenation=none&from=${from}&to=${to}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};

export const teacherAttendanceDownload = async (from: string, to: string) => {
  const response = await axiosInstance.get(
    `/reports/teacherattendance?save=true&pagenation=none&from=${from}&to=${to}`,
    {
      responseType: "blob",
      headers: {
        accept: "*/*",
      },
    }
  );
  return response?.data;
};

export const individualTeacherAttendance = async (
  teacherId: number,
  from: string,
  to: string
) => {
  const response =
    await axiosInstance.get<individualteacherAttendanceRootObject>(
      `/reports/teacherattendance/${teacherId}?from=${from}&to=${to}`
    );
  return response.data.payload;
};

export const individualStudentAttendance = async (
  studentId: number,
  from: string,
  to: string
) => {
  const response =
    await axiosInstance.get<individualStudentAttendanceRootObject>(
      `/reports/studentattendance/${studentId}?from=${from}&to=${to}`
    );
  return response?.data.payload;
};
