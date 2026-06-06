export interface PreviousBatchRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  id: number;
  student_id: number;
  student_name: string;
  batch_id: number;
  batch_name: string;
  teacher_name: string;
  course: string;
}

export interface Metadata {
  totalcount: number;
}
