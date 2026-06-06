export interface ReportFeeRootObject {
  success: boolean;
  payload: ReportFeePayload;
}

export interface ReportFeePayload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  payment_id: number;
  date: string;
  due_date: string;
  remarks: string;
  status: boolean;
  amount: number;
  transaction_id: string;
  batches: Batches;
  students: Students;
  paid_date: string;
  payment_receipt_url: string;
  bank: Bank;
}

export interface Bank {
  bank_id: number;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Students {
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

interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Metadata {
  totalcount: number;
}
