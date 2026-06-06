import { TeacherDetailRootObject } from "@/Interfaces/teacherDetail";
import {
  GetTeacherRootObject,
  TeacherAddPayloadType,
  TeacherUpdatePayloadType,
} from "@/Interfaces/Teacher";
import { axiosInstance } from "@/service/axios";

const getTeachers = async (
  searchKey: string,
  pageNum: number,
  courseId: string,
  batchId: string
) => {
  try {
    const response = await axiosInstance.get<GetTeacherRootObject>(
      `/teachers?teacher_name=${searchKey}&page=${pageNum}&course_id=${
        courseId && Number(courseId)
      }&batch_id=${batchId && Number(batchId)}&limit=25`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
const addTeacher = async (payload: TeacherAddPayloadType) => {
  const response = await axiosInstance.post(`/teachers`, payload);
  return response.data;
};
const updateTeacher = async (payload: TeacherUpdatePayloadType) => {
  const response = await axiosInstance.put(`/teachers`, payload);
  return response.data;
};
const deleteTeacher = async (teacherId: number) => {
  const response = await axiosInstance.delete(
    `/teachers?teacher_id=${teacherId}`
  );
};

export { getTeachers, addTeacher, updateTeacher, deleteTeacher };

export const TeacherDetails = async (teacherId: number) => {
  const response = await axiosInstance.get(`/teachers/${teacherId}`);
  return response.data.payload;
};
export const IndividualTeacherDetails = async (teacherId: number) => {
  const response = await axiosInstance.get<TeacherDetailRootObject>(
    `/teachers/${teacherId}`
  );
  return response.data.payload;
};
