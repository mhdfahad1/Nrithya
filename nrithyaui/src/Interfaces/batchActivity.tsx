export interface RootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  activity_id: number;
  date: string;
  batch: Batch;
  task: string;
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
  total_count: number;
}

export interface BatchActivityPayloadType {
  date: string;
  task: string;
  activity_id: number;
  batch: {
    batch_id: number;
    batch_name: string;
  };
}
export interface ActivityPayload {
  date: string;
  task: string;
  activity_id: number;
  batch_id: number;
}
export interface AcrivityRootObject {
  batch_id: number;
  date: string;
  task: string;
}
