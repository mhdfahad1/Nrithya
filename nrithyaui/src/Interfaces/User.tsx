export interface CreateUserPayloadType {
  user_name: string;
  password: string;
  user_role: "admin";
}
export interface ListUserType {
  user_name: string;
  status: string;
}
export interface ListUserPayloadType {
  payload: ListUserType[];
}

export interface UpdateUserPayloadType {
  user_id: number;
  user_name?: string;
  password?: string;
  status?: string;
}
export interface UpdateUserStatusType {
  status: string;
}
