export interface RootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  registration_date: string;
  status: string;
  batches: Batches[];
}

export interface Metadata {
  totalcount: number;
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
  registration_date: string;
  status: string;
  batch_started: string;
  joining_date: string;
  batch_status: string;
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

//Add payload
export interface AddPayloadType {
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  status: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  batches: Batch[];
  level?:string;
}

export interface Batch {
  batch_id: number;
  joining_date: string;
  batch_name: string;
  status: string;
  batch_status?: string;
  // fee?:string;
}

export interface UpdatePayloadType {
  student_id: number;
  first_name: string;
  last_name: string;
  status: string;
  gender: string;
  date_of_birth: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  batches: BatchUpdate[];
  level?:string;

}

export interface BatchUpdate {
  batch_id: number;
  joining_date: string;
  batch_name: string;
  status: string;
}

export interface ActiveType {
  student_id: number;
  batch_timings: [];
}
