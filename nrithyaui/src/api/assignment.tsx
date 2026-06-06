import { FormType } from "@/app/Admin/assignment/update-assignment/[assignmentId]/page";
import {
  AddAssignmentType,
  GetAssignmentById,
  RootObjectAssignment,
} from "@/Interfaces/assignment";
import { RootObjectCourse } from "@/Interfaces/course";
import { GetTeacherRootObject } from "@/Interfaces/Teacher";
import { AddAssignmentPayload } from "@/app/Admin/batch/[batchId]/assignment/AddAssignment";
import { AssignmentRootObject } from "@/Interfaces/AddAssignment";
import { BatchAssignmentRootObject } from "@/Interfaces/listAssignment";
import { axiosInstance } from "@/service/axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getCourseComboBox = async () => {
  const response = await axiosInstance.get<RootObjectCourse>(
    `${baseUrl}/courses?pagenation=none`
  );
  return response.data.payload.data;
};
export const getTeacherComboBox = async (courseid?: string) => {
  const response = await axiosInstance.get<GetTeacherRootObject>(
    `${baseUrl}/teachers?pagenation=none&course_id=${
      courseid ? Number(courseid) : ""
    }`
  );
  return response.data.payload;
};
export const getTeacherComboBoxByCourse = async (course_id: string) => {
  const response = await axiosInstance.get<GetTeacherRootObject>(
    `${baseUrl}/teachers?course_id=${course_id}&pagenation=none`
  );
  return response.data.payload;
};

export const getAssignment = async (
  searchKey: string,
  pageNum: number,
  course_id: string,
  teacher_id: string
) => {
  const response = await axiosInstance.get<RootObjectAssignment>(
    `${baseUrl}/assignments?assignment_name=${searchKey}&page=${pageNum}&course_id=${course_id}&teacher_id=${teacher_id}&limit=25`
  );
  return response.data.payload;
};
export const addAssignment = async (data: AddAssignmentType) => {
  const response = await axiosInstance.post(`${baseUrl}/assignments`, data);
  return response.data;
};

export const getAssignmentById = async (assignment_id: string) => {
  const response = await axiosInstance.get<GetAssignmentById>(
    `${baseUrl}/assignments/${assignment_id}`
  );
  return response.data.payload;
};
export const getAllAssignments = async () => {
  const response = await axiosInstance.get<AssignmentRootObject>(
    `${baseUrl}/assignments`
  );
  return response.data.payload.data;
};

export const AddBatchAssignment = async (Payload: AddAssignmentPayload) => {
  const response = await axiosInstance.post(
    `${baseUrl}/assignments/batch`,
    Payload
  );
  return response.data.payload;
};

export const updateAssignment = async (data: FormType) => {
  const response = await axiosInstance.patch(`${baseUrl}/assignments`, data);
  return response.data;
};
export const assignmentDelete = async (assignment_id: number) => {
  const response = await axiosInstance.delete(
    `assignments?assignment_id=${assignment_id}`
  );
  return response.data;
};
export const getBatchAssignment = async (batchId: string, page: number) => {
  const response = await axiosInstance.get<BatchAssignmentRootObject>(
    `${baseUrl}/assignments/batch?batch_id=${batchId}&page=${page}`
  );
  return response.data.payload;
};

export const deleteAssignment = async (batchId: number) => {
  const response = await axiosInstance.delete(
    `${baseUrl}/assignments/batch?id=${batchId}`
  );
  return response.data.payload;
};
