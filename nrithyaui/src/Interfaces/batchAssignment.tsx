export interface BatchAssignmentAdd {
  id: number;
  grade: number;
  date: string;
}
export interface BatchAssignmentListResponse {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  id: number;
  status: boolean;
  submission_date: string;
  grade: number;
  student: {
    first_name: string;
    last_name: string;
  };
  teacher: Dropdownteacher;
}

export interface BatchAssignments {
  id: number;
  assigning_date: string;
  submission_deadline: string;
  batch: Batch;
  assignment: Assignment;
}

export interface Assignment {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  created_at: string;
  updated_at: string;
  courses: Courses;
  teachers: Teachers;
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

export interface Dropdownteacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
}

export interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
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

export interface Metadata {
  totalcount: number;
}
