import { StudentBatchStatus } from "./student.batch.enums";
import { StudentLevels } from "./student.enums";

export interface StudentDataInput {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  level?: StudentLevels;
  batches: [{ batch_id: number; joining_date: Date }];
}

export interface StudentSearch {
  reg_no?:string;
  student_name: string;
  page?: number;
  limit?: number;
  course_id?: number;
  teacher_id?: number;
  batch_id?: number;
  pagenation?:string;
  status?: string;
  percent?:boolean;
  from?:Date;
  to?:Date;
  download?:boolean;
  save?:boolean;
  performance?:number;
  sortorder?:string;
  attendance?:number;
  assignment?:number;
  calendar_date?: string;
}

export interface studentUpdate {
  student_id: number;
  reg_no?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: Date;
  address?: string;
  place?: string;
  city?: string;
  state?: string;
  whatsapp_number?: string;
  alternative_number?: string;
  email?: string;
  level?: StudentLevels;
  batches: Array<{ batch_id: number; joining_date: Date; status: StudentBatchStatus  }>
}

export interface StudentDeleteData {
  student_id: number;
  dismiss: boolean;
}

export interface BatchList{
  batch_batch_id:number;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum StudentStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DISMISSED = "dismissed",
}
