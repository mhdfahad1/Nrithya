export interface TeacherDataInput {
  courses: number[];
  first_name: string;
  last_name?: string;
  gender:string;
  date_of_birth:Date
  date_of_joining:Date;
  address?:string;
  place?: string;
  city?: string;
  state?:string;
  alternative_number?: string;
  whatsapp_number: string;
  email?: string;
  bio?: string;
  qualification?: string;
}

export interface TeacherUpdateData {
  courses?: number[];
  first_name?: string;
  last_name?: string;
  gender?:string;
  date_of_birth?:Date
  date_of_joining?:Date;
  address?:string;
  place?: string;
  city?: string;
  state?:string;
  alternative_number?: string;
  whatsapp_number?: string;
  email?: string;
  bio?: string;
  qualification?: string;
}

export interface TeacherBatchData {
  teacherBatchData: any[]; 
}

export interface TeacherSearch {
  teacher_name?: string;
  course_id?: number;
  batch_id?: number;
  page?: number;
  limit?: number;
  pagenation?:string;
  from?:Date;
  to?:Date;
  download?:boolean;
  save?:boolean;
  sortorder?:string;
}

export interface teacherCourse {
  first_name?: string;
  last_name?: string;
  gender?:string;
  date_of_birth?:Date
  date_of_joining?:Date;
  address?:string;
  place?: string;
  city?: string;
  state?:string;
  alternative_number?: string;
  whatsapp_number?: string;
  email?: string;
  bio?: string;
  qualification?: string;
  courses?: number[];
}

export interface Teacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  date_of_joining: Date;
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

export interface Course {
  course_id: number;
  course_name: string;
  is_active: boolean;
}

export interface Batch {
  batch_id: number;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: Date;
}

export interface TeacherCourse {
  teacher_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  date_of_joining: Date;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  bio: string;
  qualification: string;
  coursesAndBatches: CourseWithBatches[];
}

export interface TeacherWithCourses {
  _id: number;
  teachers: Teacher;
  courses: Course;
}

export interface CourseWithBatches {
  batches: Batch[];
  course_id: number;
  course_name: string;
  is_active: boolean;
}

export interface TeacherWithCoursesAndBatches {
  teacher_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  date_of_joining: Date;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  bio: string;
  qualification: string;
  coursesAndBatches: CourseWithBatches[];
}
