import { BatchStatus } from "./batch.enums";

export interface BatchDataInput {
    batch_name: string;
    fee: number;
    max_strength: number;
    current_strength: number;
    whatsapp_link: string;
    day_of_week: Array<{
        day: string;
        start_time: string;
        end_time: string;
    }>;
    batch_started: Date;
    start_time: string;
    end_time: string;
    course_id: number;
    teacher_id: number;
}

export interface BatchDataUpdate {
    batch_id: number;
    batch_name?: string;
    fee?: number;
    max_strength?: number;
    current_strength?: number;
    whatsapp_link?: string;
    day_of_week?: Array<string>;
    batch_started?: Date;
    start_time?: string;
    end_time?: string;
    course_id?: number;
    teacher_id?: number;
    status?: BatchStatus;
    batch_timings: Array<any>
}

export interface BatchSearch {
    batch_name?: string;
    course_id?: number;
    teacher_id?: number;
    page?: number;
    limit?: number;
    pagenation?:string;
    status?: string;
    from?:Date;
    to?:Date;
    download?:boolean;
    save?:boolean;
    sortorder?:string;
}

export interface singleBatch {
    batch_id?: number;
}

export interface updateBatchTimings {
    timing_id: number;
    start_time?: string;
    end_time?: string;
}

export interface addBatchTimings {
    batch_id: number;
    day: string;
    start_time: string;
    end_time: string;
}

export interface deleteBatchTimings {
    timing_id: number;
}

export interface BathActivityAdd{
    date:Date;
    task:string;
    batch_id:number;
}

export interface BatchActivitySearch{
    date?:Date;
    batch_id?:number;
    page?: number;
    limit?: number;
    sortorder?:string;
}

export interface BatchActivityUpdate{
    activity_id:number;
    date?:Date;
    batch_id?:number;
    task?:string;
}