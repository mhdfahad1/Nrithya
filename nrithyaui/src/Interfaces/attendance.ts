export interface GetTeacherAttendanceType {
  teachers: {
    first_name: string;
    last_name: string;
    alternative_number: string;
    total_class: number;
    attended: number;
  };
  batch_name: string;
  status: string;
  attendance: {
    id: number;
    attended: boolean;
  }[];
}
export interface BatchCombobox {
  batch_id: string;
  batch_name: string;
}

export interface TeacherRootObject {
  success: boolean;
  payload: TeacherPayload;
}

export interface TeacherPayload {
  metadata: Metadata;
  data: GetTeacherAttendanceType[];
}

interface Metadata {
  totalcount: number;
}
// student

export interface StudentRootObject {
  success: boolean;
  payload: StudentPayload;
}

export interface StudentPayload {
  metadata: Metadata;
  data: GetStudentAttendanceType[];
}

export interface GetStudentAttendanceType {
  students: {
    first_name: string;
    last_name: string;
    whatsapp_number: string;
  };
  batches: {
    batch_name: string;
    status: string;
  };
  total_class: number;
  attended: number;
  attendance: {
    id: number;
    attended: boolean;
  }[];
}
