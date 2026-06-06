import { FastifyRequest } from "fastify";

export interface LoginBody {
    user_name: string;
    password: string;
}

export interface LoginBody {
    user_name: string;
    password: string;
}

export interface Loginresponse {
    user_details: {
        user_id: number;
        user_name: string;
        user_role: string;
    },
    tokens: {
        access_token: string;
        refresh_token: string;
    }
}

export interface refreshBody {
    refresh_token: string;
}

export interface refreshResponse {
    access_token: string;   
    refresh_token: string; 
}

export interface authHeader {
    authorization: string;
}

export interface CustomRequest<T> extends FastifyRequest {
    user_details?: {
        user_id: number;
        user_name: string;
        user_role: string;
        iat: number;
        exp: number;
    }
}