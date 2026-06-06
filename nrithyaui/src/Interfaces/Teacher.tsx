export interface courseType {
  course_id: string;
  course_name: string;
  is_active: boolean;
}
export interface teacheDetailPayload {
  teacher: {
    address: string;
    alternative_number: string;
    bio: string;
    city: string;
    courses: courseType[];
    email: string;
    first_name: string;
    last_name: string;
    place: string;
    qualification: string;
    state: string;
    teacher_id: number;
    whatsapp_number: string;
    gender: string;
    date_of_birth: string;
    date_of_joining: string;
  };
}
export interface TeacherAddPayloadType {
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
  courses: number[];
}
export interface TeacherUpdatePayloadType {
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
  courses: number[];
}

export interface GetTeacherRootObject {
  success: boolean;
  payload: Payload;
}

interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
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
  created_at: string;
  updated_at: string;
  coursesAndBatches: CoursesAndBatch[];
}

interface CoursesAndBatch {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  batches: Batch[];
}

interface Batch {
  batch_id: number;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
}

interface Metadata {
  total_count: number;
}
