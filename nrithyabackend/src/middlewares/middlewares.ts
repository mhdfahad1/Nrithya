import { FastifyReply } from "fastify";
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR } from "../utils/common";
import jwt, { Secret } from 'jsonwebtoken';
import { authHeader } from "../auth/types/auth.types";
import { CustomRequest } from "../auth/types/auth.types";
import { CustomError } from "../utils/response";
import logger from "../utils/logger";

export class Middlewares {
    authorize = async (request: CustomRequest<{ Headers: authHeader }>, reply: FastifyReply) => {
        const authHeader = request.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(" ")[1];
                if (token) {
                    const Identity = jwt.verify(token, process.env.SECRET_KEY as Secret) as { 
                        user_id: number;
                        user_name: string;
                        user_role: string;
                        iat: number;
                        exp: number;
                    }
                    request.user_details = Identity
                    return
                } else {
                    logger.error(`Invalid token in the request`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Invalid token provided");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            catch(error) {
                logger.error(`access token expired`);
                const errResponse = CustomError<string>(FORBIDDEN, "access token expired");
                reply.status(FORBIDDEN).send(errResponse);
            }
        } else {
            logger.error(`No token provided`);
            const errResponse = CustomError<string>(FORBIDDEN, "no token provided");
            reply.status(FORBIDDEN).send(errResponse);
        }
    }

    adminAccess = async (request: CustomRequest<{ Headers: authHeader }>, reply: FastifyReply) => {
        const user_details = request.user_details;

        if(user_details?.user_role == "admin") {
            return
        }
        else {
            logger.error(`only admin is allowed`);
            const errResponse = CustomError<string>(FORBIDDEN, "this route is reserved for admin access");
            reply.status(FORBIDDEN).send(errResponse);
        }
    }

    superAdminAccess = async (request: CustomRequest<{ Headers: authHeader }>, reply: FastifyReply) => {
        const user_details = request.user_details;

        if(user_details?.user_role == "superadmin") {
            return
        }
        else {
            logger.error(`only super admin is allowed`);
            const errResponse = CustomError<string>(FORBIDDEN, "this route is reserved for super admin access");
            reply.status(FORBIDDEN).send(errResponse);
        }
    }
}