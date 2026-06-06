export type CourseType = {
  course_id: number;
  course_name: string;
};
export type AddCourseType = {
  course_name: string;
};
export interface CoursePayloadType {
  course_id?: number;
  course_name?: string;
  is_active?: string;
}

export interface RootObjectCourse {
  success: boolean;
  payload: Payload;
}

interface Payload {
  metadata: Metadata;
  data: Datum[];
}

interface Datum {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Metadata {
  totalcount: number;
}
