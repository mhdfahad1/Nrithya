export interface CourseDataInput {
    course_name: string;
}

export interface CourseSearch {
    course_name?: string;
    page?: number;
    limit?: number;
    pagenation?:string;
    sortorder?:string;
}

export interface courseUpdate {
    course_id: number;
    course_name?: string;
    is_active?: boolean;
}