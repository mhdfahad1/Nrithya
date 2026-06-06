export interface FeeResponse {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  payment_id: number;
  payment_method: null;
  date: string;
  due_date: string;
  remarks: null;
  status: boolean;
  amount: number;
  transaction_id: string;
  batches: Batches;
  students: Students;
  paid_date: string;
}

export interface Students {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  // gender: string;
  // date_of_birth: string;
  // address: string;
  // place: string;
  // city: string;
  // state: string;
  // alternative_number: string;
  whatsapp_number: string;
  // email: string;
  // registration_date: string;
  // status: string;
  // created_at: string;
  // updated_at: string;
}

export interface Batches {
  // batch_id: number;
  // courses: Courses;
  // teachers: Teachers;
  batch_name: string;
  // fee: number;
  // max_strength: number;
  // current_strength: number;
  // whatsapp_link: string;
  // status: string;
  // batch_started: string;
  // created_at: string;
  // updated_at: string;
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

export interface AddFeePayload {
  payment_id: string;
  transaction_id: string;
  paid_date: string;
  bank_id: string;
  remarks: string;
  file: File | "";
}
