export interface AssignmentDataInput {
  assignment_name: string;
  assignment_desc: string;
  url: string;
  course_id: number;
  teacher_id: number;
  batches: Array<{batch_id: number, submission_deadline: Date}>
}

export interface AssignmentSearch {
  assignment_name: string;
  page?: number;
  limit?: number;
  course_id?: number;
  teacher_id?: number;
  pagenation?:string;
  sortorder?:string
}

export interface AssignmentUpdate {
  assignment_id: number;
  assignment_name?: string;
  assignment_desc?: string;
  url?: string;
  course_id?: number;
  teacher_id?: number;
  batches: Array<{batch_id: number, submission_deadline: Date}>
}
