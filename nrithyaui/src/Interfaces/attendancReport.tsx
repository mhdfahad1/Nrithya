export interface TeacherAttendanceRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  id: number;

  name: string;
  whatsapp_number: string;
  Total_classes: number;
  attendance: number;
  percentage: string;
}

export interface Metadata {
  totalcount: number;
}

// student attendance

export interface StudentAttendanceRootObject {
  success: boolean;
  payload: StudentAttendancePayload;
}

export interface StudentAttendancePayload {
  metadata: StudentAttendanceMetadata;
  data: StudentAttendanceDatum[];
}

export interface StudentAttendanceDatum {
  id: number;
  name: string;
  whatsapp_number: string;
  total_attendance: number;
  attendance: number;
  percentage: string;
}

export interface StudentAttendanceMetadata {
  totalcount: number;
}

// export interface individualteacherAttendanceRootObject {
//   batch_name: string;
//   attendance: Attendance[];
// }

// export interface Attendance {
//   isAttended: boolean;
//   date: string;
// }

export interface individualStudentAttendanceRootObject {
  success: boolean;
  payload: studentAttendance[];
}

export interface studentAttendance {
  batch_name: string;
  attendance_records: Attendancerecord[];
}

export interface Attendancerecord {
  id: number;
  attended: boolean;
  late_by: string;
  reason: string;
  date: string;
}

export interface individualteacherAttendanceRootObject {
  success: boolean;
  payload: teacherPayload[];
}

export interface teacherPayload {
  batch_name: string;
  attendance: Attendance[];
}

export interface Attendance {
  isAttended: boolean;
  date: string;
}
