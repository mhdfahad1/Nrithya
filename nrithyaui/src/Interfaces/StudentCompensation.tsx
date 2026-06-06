// export interface Student {
//   student_id: number;
//   first_name: string;
// }
// export interface CompensationStudentType {
//   student_id: number;
//   old_batch: number;
//   new_batch: number;
//   old_date: string;

//   new_date: string;
// }

export interface RootObject {
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
  own_batches: {
    batch_name: string;
    batch_id: number;
  };
  new_batches: {
    batch_name: string;
    batch_id: number;
  };
  student: {
    reg_no: string;
    first_name: string;
    last_name: string;
    student_id: number;
  };
}

export interface AddCompensationPayloadStudent {
  old_date: string;
  new_date: string;
  student_id: number;
  new_batch: number;
  old_batch: number;
}

export interface UpdateCompensationStudent {
  old_date: string;
  new_date: string;
  old_batch_id: number;
  new_batch_id: number;
  id: number;
  student_id: number;
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
}

export interface Ownbatches {
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
