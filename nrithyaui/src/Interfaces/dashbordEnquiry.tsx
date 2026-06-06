export interface DashbordEnquiryRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  total_enquiry: number;
  enquiry_conversion_percentage: number;
  total_demo_requested: number;
  demo_conversion_percentage: number;
  enquiry_types: Enquirytype[];
}

export interface Enquirytype {
  enquiryTypeId: number;
  enquiryTypeName: string;
  totalCount: number;
}
