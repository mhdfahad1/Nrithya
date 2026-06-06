export interface StudentAttendace {
    batch_id: number;
    date: Date;
    start_time: string;
    end_time: string;
    attendance: Array<{
        attended: boolean;
        late_by?: string;
        reason?: string;
        student_id: number;
    }>
}


export interface TeacherAttendace {
    attended: boolean;
    late_by?: string;
    reason?: string;
    teacher_id: number;
    date: Date;
    batch_id: number;
    start_time: string;
    end_time: string;
}