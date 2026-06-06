export interface ActivityLogRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Datum {
  id: number;
  action: string;
  date: string;
  relation: string;
  users: Users;
}

export interface Users {
  user_id: number;
  user_name: string;
  user_role: string;
  password: string;
  status: string;
}

export interface Metadata {
  total_count: number;
}
