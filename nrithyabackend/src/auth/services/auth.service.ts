import { FastifyReply, FastifyRequest } from "fastify";
import { Users } from "../../users/entities/user.entities";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import { BAD_REQUEST, INTERNAL_ERROR, REFRESH_TOKEN_EXPIRY, SUCCESS_GET, TOKEN_EXPIRY, camparePassword, recordAudit } from "../../utils/common";
import { LoginBody, Loginresponse, refreshBody, refreshResponse } from "../types/auth.types";
import logger from "../../utils/logger";
import jwt, { Secret } from 'jsonwebtoken';

export class AuthController {
    // LOGIN
    login = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {

        try {
            const data = request.body;
            if (data.user_name && data.password) {
                const appDatasourse = await getDataSource()
                const userRepository = appDatasourse.getRepository(Users);
                const user = new Users()
                const existingUser = await userRepository.findOneBy({
                    user_name: data.user_name
                })
                if (existingUser && existingUser.status == 'active') {
                    const isMatch = await camparePassword(data.password, existingUser.password)
                    if (isMatch) {
                        const accessObj = {
                            user_id: existingUser.user_id,
                            user_name: existingUser.user_name,
                            user_role: existingUser.user_role
                        }
                        const refreshObj = {
                            user_id: existingUser.user_id
                        }
                        const token = jwt.sign(accessObj, process.env.SECRET_KEY as Secret, { expiresIn: TOKEN_EXPIRY });
                        const refresh_token = jwt.sign(refreshObj, process.env.SECRET_KEY as Secret, { expiresIn: REFRESH_TOKEN_EXPIRY });
                        const response = Success<Loginresponse>({
                            user_details: {
                                user_id: existingUser.user_id,
                                user_name: existingUser.user_name,
                                user_role: existingUser.user_role
                            },
                            tokens: {
                                access_token: token,
                                refresh_token: refresh_token
                            }
                        })
                        logger.info('Login successful')
                        reply.status(SUCCESS_GET).send(response)

                        recordAudit("login", new Date, "users", response.payload.user_details.user_id)
                    }
                    else {
                        logger.error(`Invalid password`)
                        const data = CustomError<string>(BAD_REQUEST, "Invalid password")
                        reply.status(BAD_REQUEST).send(data)
                    }
                }
                else {
                    logger.error(`User does not exists`)
                    const data = CustomError<string>(BAD_REQUEST, "User does not exists or suspended");
                    reply.status(BAD_REQUEST).send(data);
                }
            }
            else {
                logger.error(`Bad request`)
                const data = CustomError<string>(BAD_REQUEST, "Bad request")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error(`Data currepted`, error);
            const data = CustomError<string>(BAD_REQUEST, "request body does not exist or currupted")
            reply.status(BAD_REQUEST).send(data)
        }
    }

    // REFRESH TOKEN
    refresh_token = async (request: FastifyRequest<{ Body: refreshBody }>, reply: FastifyReply) => {

        try {
            const data = request.body;
            if (data.refresh_token) {
                const appDatasourse = await getDataSource()
                const userRepository = appDatasourse.getRepository(Users);
                const refreshObj = jwt.verify(data.refresh_token, process.env.SECRET_KEY as Secret) as { user_id: number, iat: number }
                if (refreshObj) {
                    const existingUser = await userRepository.findOneBy({
                        user_id: refreshObj.user_id
                    })
                    if (existingUser && existingUser.status == 'active') {
                        const accessObj = {
                            user_id: existingUser.user_id,
                            user_name: existingUser.user_name,
                            user_role: existingUser.user_role
                        }
                        const refreshObj = {
                            user_id: existingUser.user_id
                        }
                        const token = jwt.sign(accessObj, process.env.SECRET_KEY as Secret, { expiresIn: TOKEN_EXPIRY });
                        const refresh_token = jwt.sign(refreshObj, process.env.SECRET_KEY as Secret, { expiresIn: REFRESH_TOKEN_EXPIRY });
                        const response = Success<refreshResponse>({
                            access_token: token,
                            refresh_token: refresh_token
                        })
                        reply.status(SUCCESS_GET).send(response)
                    }
                    else {
                        logger.error(`User does not exist`)
                        const data = CustomError<string>(BAD_REQUEST, "User does not exists");
                        reply.status(BAD_REQUEST).send(data);
                    }
                }
                else {
                    logger.error(`Invalid token`)
                    const data = CustomError<string>(BAD_REQUEST, "Invalid refresh token")
                    reply.status(BAD_REQUEST).send(data)
                }
            }
            else {
                logger.error(`Invalid token`)
                const data = CustomError<string>(BAD_REQUEST, "Invalid refresh token")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error(`Internal server error`)
            const data = CustomError<string>(INTERNAL_ERROR, "Internal server error")
            reply.status(INTERNAL_ERROR).send(data)
        }
    }
}