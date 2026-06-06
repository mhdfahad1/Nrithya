export interface IndividualBankRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  bank_id: number;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}
