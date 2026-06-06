export interface compensationBatchInput {
    old_date: Date;
    new_date: Date;
    batch_id: number;
    start_time: string;
    end_time: string;
}

export interface compensationStudentInput {
    batch_id: number;
    new_date: Date;
    old_date: Date;
    new_batch: number;
    old_batch: number;
    student_id: number;
}

export interface listCompensation {
    limit?: number;
    page?: number;
}