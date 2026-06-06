export interface AssignmentType {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  courses: {
    course_id: number;
    course_name: string;
  };
  teachers: {
    teacher_id: number;
    first_name: string;
    last_name: string;
  };
}
export interface AssignmentGetPayloadType {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  courses: {
    course_id: number;
    course_name: string;
  };
  teachers: {
    teacher_id: number;
    first_name: string;
    last_name: string;
  };
}
export interface AddAssignmentType {
  assignment_name: string;
  assignment_desc: string;
  url: string;
  teacher_id: number;
  course_id: number;
  batches: Batch[];
}
export interface Batch {
  batch_id: number;
  submission_deadline: string;
}
export interface TeacherComboboxType {
  teacher_id: string;
  first_name: string;
  last_name: string;
}
export interface CourseComboboxType {
  course_id: number;
  course_name: string;
}

export interface RootObjectAssignment {
  success: boolean;
  payload: Payload;
}

interface Payload {
  metadata: Metadata;
  data: Datum[];
}

interface Datum {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  created_at: string;
  updated_at: string;
  courses: Courses;
  teachers: Teachers;
}

interface Teachers {
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

interface Metadata {
  totalcount: number;
}

// get assignment by id

export interface GetAssignmentById {
  success: boolean;
  payload: GetAssignmentByIdPayload;
}

export interface GetAssignmentByIdPayload {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  created_at: string;
  updated_at: string;
  courses: Courses;
  teachers: Teachers;
  batches: Batch2[];
}

interface Batch2 {
  id: number;
  assigning_date: string;
  submission_deadline: string;
  batch: GetBatch;
  assignment: Assignment;
}

interface Assignment {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  url: string;
  created_at: string;
  updated_at: string;
  courses: Courses;
  teachers: Teachers;
}

interface GetBatch {
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

interface Teachers {
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
