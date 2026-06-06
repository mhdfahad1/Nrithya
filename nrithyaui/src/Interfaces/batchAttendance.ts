export interface AddAttendanceType {
  batch_id: number;
  date: string;
  attendance: {
    student_id: number;
    attended: boolean;
    late_by: string;
    reason: string;
    student_name: string;
    contact_number: string;
    attendance_id: number;
  }[];
  teacher_attended: boolean;
  teacher_id: number;
  teacher_lateBy: string;
  teacher_remarks: string;
  T_attendance_id: number;
}

export interface AttendanceAddTeacherType {
  batch_id: number;
  teachers: {
    teacher_id: number;
    first_name: string;
    last_name: string;
  };
}

export interface AddTeacherAttendancePayload {
  attended: boolean;
  date: string;
  teacher_id: number;
  batch_id: number;
  late_by: string;
  reason: string;
  start_time: string;
  end_time: string;
}

export interface AddStudentAttendancePayload {
  batch_id: number;
  date: string;
  start_time: string;
  end_time: string;
  attendance: {
    student_id: number;
    attended: boolean;
    late_by: string;
    reason: string;
  }[];
}

export interface UpdateAttendance {
  id: number | undefined;
  attended: boolean | undefined;
  late_by: string | undefined;
  reason: string | undefined;
}
export interface UpdateAttendancePayload {
  id: number;
  attended: boolean | undefined;
  late_by: string | undefined;
  reason: string | undefined;
}

export interface GetTeacherDataType {
  id: number;
  attended: boolean;
  late_by: string;
  reason: string;
}

// new

export interface RootObjectAttendanceFirst {
  success: boolean;
  payload: AttendancePayloadFirst;
}

export interface AttendancePayloadFirst {
  batch: BatchFirst;
  teacher: TeachersFirst;
  students: StudentFirst[];
  is_first: boolean;
}

export interface StudentFirst {
  id: number; //to fix typescript error
  students: Students; //to fix
  attended: boolean; //
  late_by: string; //
  reason: string; //
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

interface BatchFirst {
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

export interface TeachersFirst {
  id: number; // to fix
  attended: boolean;
  late_by: string;
  reason: string;
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

export interface RootObjectAttendance {
  success: boolean;
  payload: AttendancePayload;
}

export interface AttendancePayload {
  batch: Batch;
  teacher: Teacher;
  students: Teacher[];
  is_first: boolean;
}

export interface Teacher {
  id: number;
  attended: boolean;
  late_by: string;
  reason: string;
  students: Students;
  batch: Batch;
  date: string;
  first_name: string; //
  last_name: string; //
  whatsapp_number: string; //
  student_id: number; //
}

interface Students {
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

interface Batch {
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

// calendar
export interface CalendarRootObject {
  success: boolean;
  payload: CalendarDataPayload;
}

export interface CalendarDataPayload {
  calendar_id: number;
  start_time: string;
  end_time: string;
  date: string;
  batches: Batches;
  compensated: boolean;
}

interface Batches {
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
