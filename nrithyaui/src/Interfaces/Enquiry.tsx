// enquiry types
export interface addEnquiryTypePayload {
  enquiry_type: string;
}
export interface updateEnquiryTypePayload {
  enq_type_id: number;
  enquiry_type: string;
}
export interface GetEnquiryTypeRootObject {
  success: boolean;
  payload: EnquiryTypePayLoad;
}

interface EnquiryTypePayLoad {
  metadata: EnquiryTypeMetadata;
  data: EnquiryTypeDatum[];
}

export interface EnquiryTypeDatum {
  enq_type_id: number;
  enq_type: string;
}

interface EnquiryTypeMetadata {
  total_count: number;
}
// enquiry type combo box
export interface GetEnquiryTypeComboBox {
  success: boolean;
  payload: EnquiryTypePayLoadComboBox;
}

interface EnquiryTypePayLoadComboBox {
  metadata: EnquiryTypeComboBoxMetadata;
  data: EnquiryTypeCombobox[];
}

export interface EnquiryTypeCombobox {
  enq_type_id: string;
  enq_type: string;
}

interface EnquiryTypeComboBoxMetadata {
  total_count: number;
}

export interface AssigneeCombobox {
  teacher_id: number;
  first_name: string;
  last_name: string;
}

// enquiry response
export interface addEnquiryResponsePayload {
  enquiry_response: string;
}
export interface updateEnquiryResponsePayload {
  enq_res_id: number;
  enquiry_response: string;
}
// Enquiry
export interface GetEnquiryRootObject {
  success: boolean;
  payload: Payload;
}

interface Payload {
  metadata: Metadata;
  data: getEnquiryPayload[];
}

export interface getEnquiryPayload {
  enq_id: number;
  name: string;
  contact_number: string;
  enq_date: string;
  enq_status: string;
  remarks: string;
  demo_requested: boolean;
  last_call: string;
  follow_up: string;
  first_follow_up: boolean;
  second_follow_up: boolean;
  third_follow_up: boolean;
  courses: Course | null;
  enquiryType: EnquiryType | null;
  assignee: Assignee | null;
}

interface Assignee {
  user_id: number;
  user_name: string;
  user_role: string;
  status: string;
}

interface EnquiryType {
  enq_type_id: number;
  enq_type: string;
  created_at: string;
  updated_at: string;
}

interface Course {
  course_id: number;
  course_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Metadata {
  total_count: number;
}
export interface addEnquiryPayload {
  name: string;
  enquiryType?: number;
  enquiry_type: number;
  course: number;
  status: string;
  contact_number: string;
  assignee: string;
  remarks: string;
  enquiry_date: string;
  demo_request: boolean;
}
export interface editEnquiryPayload {
  enq_id: number;
  name: string;
  contact_number: string;
}
export interface editEnquiryValue {
  name: string;
  contact_number: string;
}
export interface updateEnquiryPayload {
  enq_id: number;
  follow_up_no: number;
  course: number;
  assignee: number;
  enquiry_type: string;
  status: string;
  remarks: string;
  demo_request: boolean;
  follow_up_date: string;
}
export interface updateEnquiryValue {
  enq_id: number;
  follow_up_no: number;
  course: number;
  assignee: number;
  enquiry_type: string;
  status: string;
  remarks: string;
  demo_request: boolean;
  follow_up: string;
}

interface AssigneeType {
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
interface EnquiryType {
  enq_type_id: number;
  enq_type: string;
}

interface Courses {
  course_id: number;
  course_name: string;
  is_active: boolean;
}
