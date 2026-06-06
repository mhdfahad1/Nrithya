export interface LoginPayloadType{
    user_name : string;
    password: string;
}
export interface LoginSuccessType{
    success: boolean,
    payload: {
        user_details: {
            user_id: number,
            user_name: string,
            user_role: string
        },
        "tokens": {
            access_token: string,
            refresh_token: string
        }
    }
}