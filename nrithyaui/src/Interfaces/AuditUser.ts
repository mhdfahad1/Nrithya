export interface UserListRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: UserDatum[];
}

export interface UserDatum {
  user_id: number;
  user_name: string;
  user_role: string;
  password: string;
  status: string;
}

export interface Metadata {
  totalcount: number;
}
