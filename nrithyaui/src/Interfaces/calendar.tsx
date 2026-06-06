export interface RootObject {
  success: boolean;
  payload: Payload[];
}

export interface Payload {
  calendar_id: number;
  start_time: string;
  end_time: string;
  date: string;
  batches: Batches;
  compensated: boolean;
}

export interface Batches {
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
}

export interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
}
