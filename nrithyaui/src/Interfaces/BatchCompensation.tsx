export interface BatchCompensation {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  id: number;
  old_date: string;
  new_date: string;
  batches: Batches;
  start_time: string;
  old_start_time: string;
  old_end_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Metadata {
  totalcount: number;
}

export interface AddBatchCompensation {
  new_date: string;
  old_date: string;
  start_time: string;
  end_time: string;
  batch_id: number;
}
export interface EditBatchCompensation {
  compensation_id: number;
  new_date: string;
  old_date: string;
  start_time: string;
  end_time: string;
}
