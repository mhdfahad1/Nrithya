export interface TeacherRevenueResponse {
  success: boolean;
  payload: Payload[];
}

export interface Payload {
  teacher_id: number;
  first_name: string;
  last_name: string;
  revenue: number;
  students: number;
  working_hours: number;
}
