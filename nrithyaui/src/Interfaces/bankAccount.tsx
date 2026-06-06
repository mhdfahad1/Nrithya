export interface BankAccountRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  bank_id: number;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Metadata {
  total_count: number;
}

export interface BankAccountPaylod {
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
}
export interface EditBankAccountPaylod {
  bank_id: number;

  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
}
