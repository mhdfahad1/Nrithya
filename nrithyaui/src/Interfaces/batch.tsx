export interface batchPayload {
  batch_name: string;
  course_id: number;
  teacher_id: number;
  batch_started: string;
  max_strength: string;
  whatsapp_link: string;
  fee: string;
  day_of_week: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface BatchTimingType {
  timing_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface BatchListPayloadType {
  batch_id: number;
  courses: {
    course_id: number;
    course_name: string;
    is_active: boolean;
  };
  teachers: {
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
  };
  batch_name: string;
  fee: string;
  max_strength: string;
  current_strength: number;
  batch_started: string;
  whatsapp_link: string;
  status: string;
  batch_timings: BatchTimingType[];
}
export interface CoursePayloadType {
  course_id: number;
  course_name: string;
  is_active: string;
}
export interface TeacherPayloadType {
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
  coursesAndBatches: [];
}

export interface batchUpdatePayload {
  batch_id: number;
  batch_name: string;
  batch_started: string;
  max_strength: string;
  whatsapp_link: string;
  teacher_id: number;
  // status: string;
  fee: string;
  batch_timings: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface RootObject {
  success: boolean;
  payload: Payload[];
}

export interface Payload {
  batch_id: number;
  courses: Courses;
  teachers: Teachers;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
  batch_timings: Batchtiming[];
}

export interface Batchtiming {
  timing_id: number;
  day: string;
  batch: Batch;
  start_time: string;
  end_time: string;
}

export interface Batch {
  batch_id: number;
  courses: Courses;
  teachers: Teachers;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
}

export interface Teachers {
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
}

export interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
}
// //.................................................................
export interface ListBatchRootObject {
  success: boolean;
  payload: BatchPayload;
}

export interface BatchPayload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  batch_id: number;
  courses: Courses;
  teachers: Teachers;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
  batch_timings: Batchtiming[];
}

export interface Batchtiming {
  timing_id: number;
  day: string;
  batch: Batch;
  start_time: string;
  end_time: string;
}

export interface Batch {
  batch_id: number;
  courses: Courses;
  teachers: Teachers;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
}

export interface Teachers {
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
}

export interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
}

export interface Metadata {
  totalcount: number;
}
