export interface FrequencyRootObject {
  success: boolean;
  payload: Payload[];
}

export interface Payload {
  freq_id: number;
  fee_notification: number;
  enquiry_1: number;
  enquiry_2: number;
  enquiry_3: number;
}
