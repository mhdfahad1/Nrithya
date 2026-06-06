export interface EnquiryTypeSearch{
    enquiry_type?:string;
    page?:number;
    limit?:number;
    pagenation?:string;
    sortorder?:string;
}

export interface EnquiryTypeToUpdate{
    enq_type_id:number;
    enquiry_type?:string;
}

export interface EnquiryResponseSearch{
    enquiry_response?:string;
    page?:number;
    limit?:number;
}

export interface EnquiryResponseToUpdate{
    enq_res_id:number;
    enquiry_response?:string;
}

export interface EnquiryDataInput{
    name:string;
    contact_number:string;
    enquiry_date:Date;
    course?:number;
    assignee?:number;
    enquiry_type?:number;
    status?:string;
    remarks?:string;
    demo_request?:boolean;
}

export interface Enquiry{
    enq_id?: number;
    name:string;
    courses:Object;
    assignee?:number;
    contact_number:string;
    enquiryType:Object;
    enq_date:Date;
    enq_status:string;
    remarks:string;
    last_call:Date | null;
    follow_up:Date;
}

export interface EnquirySearch{
    name?:string;
    enquiry_type?:number;
    enquiry_status?:string;
    demo_requested?:boolean;
    page?:number;
    limit?:number;
    enquiry_date?:Date;
    last_call?:Date;
    assignee?:number;
    course?:number;
    follow_up?:number;
    from?:Date;
    to?:Date;
    download?:boolean;
    save?:boolean;
    pagenation?:string;
}

export interface EnquiryUpdateData{
    enq_id:number;
    name?:string;
    contact_number?:string;
}

export interface FollowUpUpdateInput{
    enq_id:number;
    follow_up_no:number;
    follow_up_date:Date;
    course?:number;
    assignee?:number;
    enquiry_type?:number;
    status?:string;
    remarks?:string;
    demo_request?:boolean;
}