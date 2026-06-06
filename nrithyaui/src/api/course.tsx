import {
  AddCourseType,
  CourseType,
  RootObjectCourse,
} from "@/Interfaces/course";
import { axiosInstance } from "@/service/axios";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getCourse = async (searchKey: string, page: number) => {
  const response = await axiosInstance.get<RootObjectCourse>(
    `${baseUrl}/courses?course_name=${searchKey}&page=${page}&limit=25`
  );
  return response.data.payload;
};
export const addCourse = async (data: AddCourseType) => {
  const response = await axiosInstance.post(`${baseUrl}/courses`, data);
  return response.data;
};
export const updateCourse = async (course_id: number, data: CourseType) => {
  const response = await axiosInstance.patch(`${baseUrl}/courses`, data);
  return response.data;
};
export const deleteCourse = async (course_id: number) => {
  const response = await axiosInstance.delete(`courses/${course_id}`);
  return response.data;
};
