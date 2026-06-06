import { Role, UserStatus } from "./users.enums";

export interface userPagination {
    page?: number;
    limit?: number;
    user_name?: string;
    status?: string;
    pagenation?:string;
    sortorder?:string;
}

export interface userCreateResponse {
    user_name: string;
    user_role: Role;
    user_id: number;
}
  
export interface UserDataInput {
    user_name: string;
    user_role: Role;
    password: string;
}

export interface userUpdate {
    user_id: number;
    user_name?: string;
    password?:string;
    status?: UserStatus;
}

export interface singleUser {
    user_id: number;
}