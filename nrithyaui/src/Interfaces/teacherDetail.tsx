export interface TeacherDetailRootObject {
  success: boolean;
  payload: Payload[];
}

export interface Payload {
  teacher: Teacher;
}

export interface Teacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  date_of_joining: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  bio: string;
  qualification: string;
  status: string;
  coursesAndBatches: CoursesAndBatch[];
}

export interface CoursesAndBatch {
  course_id: number;
  course_name: string;
  is_active: boolean;
  batches: any[];
}