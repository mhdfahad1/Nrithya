import { FastifyReply, FastifyRequest } from "fastify";
import { Users } from "../entities/user.entities";
import { getDataSource } from "../../utils/data-source";
import { Success, CustomError } from "../../utils/response";
import { SUCCESS_CREATE, INTERNAL_ERROR, BAD_REQUEST, SUCCESS_GET, hashPassword, camparePassword, NOT_FOUND, ERROR_COMMON_MESSAGE, recordAudit, FORBIDDEN } from "../../utils/common";
import { UserDataInput, userPagination, userCreateResponse, userUpdate, singleUser } from "../types/user.types";
import logger from "../../utils/logger";
import * as dotenv from "dotenv";
import { relative } from "path";
import { Role } from "../types/users.enums";
dotenv.config();


export class UserController {
    // CREATING ADMIN USERS
    async createUser(request:FastifyRequest<{ Body: UserDataInput }>,reply:FastifyReply){
        const data =request.body;
        const user_details = (request as any).user_details;
        if(data.user_name && data.user_role == Role.ADMIN || data.user_role == Role.SUPERADMIN && data.password){
            try {
                const appDatasourse=await getDataSource()
                const userRepository = appDatasourse.getRepository(Users);
                if(data.user_role == Role.SUPERADMIN) {
                    const existingSuperAdmin = await userRepository.findOneBy ({
                        user_role: Role.SUPERADMIN
                    });
                    if(existingSuperAdmin) {
                        logger.error(`Super admin already exists`)
                        const data = CustomError<string>(BAD_REQUEST, "super admin already exist");
                        reply.status(BAD_REQUEST).send(data);
                        return
                    }
                }
                const user=new Users()
                const existingUser = await userRepository.findOneBy({
                    user_name: data.user_name
                })
                if(existingUser) {
                    logger.error(`User already exists: ${existingUser.user_name}`)
                    const data = CustomError<string>(BAD_REQUEST, "User already exists");
                    reply.status(BAD_REQUEST).send(data);
                }
                else{
                    logger.info(`Creating new user: ${data.user_name}`  );
                    user.user_name=data.user_name 
                    user.user_role=data.user_role
                    user.created_at=new Date() 
                    user.updated_at=new Date()  
                    user.password = await hashPassword(data.password)
                    const newuser = await appDatasourse.manager.save(user)
                    const response = Success<userCreateResponse>({
                        user_name: newuser.user_name,
                        user_role: newuser.user_role == "admin"? Role.ADMIN: Role.SUPERADMIN,
                        user_id: newuser.user_id
                    });
                    reply.status(SUCCESS_CREATE).send(response)

                    if(user_details) {
                        recordAudit("user created", new Date, "users", user_details.user_id)
                    }
                }
            }
            catch(error) {
                logger.error(`Error creating user ${error}`)
                const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE)
                reply.status(INTERNAL_ERROR).send(data)
            }
        }
        else {
            logger.error(`Data missing in request: ${request.body.user_name}, ${request.body.user_role}`)
            const data = CustomError<string>(BAD_REQUEST, "input data currepted")
            reply.status(BAD_REQUEST).send(data)
        }

    }

    // LISTING ADMIN USERS
    async getUsers(request:FastifyRequest<{ Querystring: userPagination }>,reply:FastifyReply){
        
        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;

        try {
            const appDatasourse=await getDataSource()
            const userRepository = appDatasourse.getRepository(Users)
            const queryBuilder = userRepository.createQueryBuilder("users")
            queryBuilder.select(["users.user_id", "users.user_name", "users.user_role", "users.status"])
            queryBuilder.where('LOWER(users.user_name) LIKE LOWER(:user_name)', { user_name: request.query.user_name ? `%${request.query.user_name}%`: '%%'})
            queryBuilder.andWhere("users.user_role = :user_role", { user_role: "admin"})
            if(request.query.status) {
                queryBuilder.andWhere("users.status = :user_status", { user_status: request.query.status })
            }

            if (request.query.sortorder == "desc") {
                queryBuilder.addOrderBy('LOWER(users.user_name)', 'DESC');
            } else {
                queryBuilder.addOrderBy('LOWER(users.user_name)', 'ASC');
            }

            let count;
            let response;
            let data;
            count = await queryBuilder.getCount();
      
            if(request.query.pagenation=="none"){
                data = await queryBuilder.getMany();
            }else{
                data = await queryBuilder.skip(offset).take(perPage).getMany();
            }
            response = Success<any>({ metadata: { totalcount: count }, data: [...data] })
            return reply.status(SUCCESS_GET).send(response)
        }
        catch (error) {
            logger.error(`Internal server error`);
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    // UPDATING ADMIN DETAILS
    updateUser = async (request: FastifyRequest<{ Body: userUpdate }>, reply: FastifyReply) => {

        try {
            const updateBody = request.body;
            const user_details = (request as any).user_details;

            if(updateBody.user_id) {
                const appDatasourse = await getDataSource();
                const userRepository = appDatasourse.getRepository(Users);
                const existingUser = await userRepository.findOneBy({
                    user_id: updateBody.user_id
                })
                if(existingUser) {
                    const user = new Users()
                    let hashedPassword = "";
                    user.user_id = updateBody.user_id;
                    if(updateBody.password) {
                        hashedPassword = await hashPassword(updateBody.password);
                    }
                    if(updateBody.user_name) {
                        const samename = await userRepository.findOneBy({
                            user_name: updateBody.user_name
                        })
                        if(samename) {
                            logger.error(`User already exists: ${updateBody.user_name}`)
                            const data = CustomError<string>(BAD_REQUEST, "User already exists consider using a different name");
                            reply.status(BAD_REQUEST).send(data);
                        }
                    }
                    await userRepository
                        .createQueryBuilder()
                        .update(Users)
                        .set({ 
                            status: updateBody.status? updateBody.status: existingUser.status,
                            user_name: updateBody.user_name? updateBody.user_name: existingUser.user_name,
                            password: updateBody.password? hashedPassword: existingUser.password,
                            updated_at: new Date(), 
                        })
                        .where("user_id = :id", { id: updateBody.user_id })
                        .execute();
                        const response = Success<string>("user data updated")
                        reply.status(SUCCESS_CREATE).send(response)

                        if(user_details) {
                            recordAudit("user updated", new Date, "users", user_details.user_id)
                        }
                }
                else {
                    const errResponse = CustomError<string>(NOT_FOUND, "User not found");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            }
            else {
                const errResponse = CustomError<string>(INTERNAL_ERROR, "User id is not provided")
                reply.status(BAD_REQUEST).send(errResponse)
            }

        }
        catch (error) {
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE)
            reply.status(INTERNAL_ERROR).send(data)
        }
    }

    async getUser(request:FastifyRequest<{ Params: singleUser }>,reply:FastifyReply){
        try {
            const appDatasourse=await getDataSource()
            const userRepository = appDatasourse.getRepository(Users)
            const queryBuilder = userRepository.createQueryBuilder("users")
            queryBuilder.select(["users.user_id", "users.user_name", "users.user_role", "users.status"])
            queryBuilder.where('users.user_id = :user_id', { user_id: request.params.user_id })
            const data = await queryBuilder.getOne();
            const response = Success<any>(data)
            return reply.status(SUCCESS_GET).send(response)
        }
        catch (error) {
            logger.error(`Internal server error`);
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    async changePassword(request:FastifyRequest<{ Body: {
        password?: string,
        new_password?: string
    } }>,reply:FastifyReply) {
        try {
            const user_details = (request as any).user_details

            const appDataSource = await getDataSource();
            const userRepository = appDataSource.getRepository(Users)
            const existingUser = await userRepository.findOneBy({
                user_name: user_details.user_name
            })

            if(existingUser && request.body.password && request.body.new_password) {
                const isMatch = await camparePassword(request.body.password, existingUser.password)

                if(isMatch) {
                    const hashed = await hashPassword(request.body.new_password);
                    await userRepository
                            .createQueryBuilder()
                            .update(Users)
                            .set({ 
                                password: hashed
                            })
                            .where("user_id = :id", { id: user_details.user_id })
                            .execute();

                    const response = Success<any>("user password updated successfully")
                    return reply.status(SUCCESS_GET).send(response)
                }
                else {
                    const response = CustomError<any>(BAD_REQUEST, "user password mismatch")
                    return reply.status(BAD_REQUEST).send(response)
                }
            }
            else {
                logger.error(`Internal server error`);
                const data = CustomError<string>(BAD_REQUEST,`Invalid user`);
                reply.status(BAD_REQUEST).send(data);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    //admin detail
    async getUserDetail(request:FastifyRequest,reply:FastifyReply){
        try {
          const userDetails = (request as any).user_details
          const data = {id:userDetails.user_id,userName:userDetails.user_name,userRole:userDetails.user_role}          
          const response = Success<any>(data)
          return reply.status(SUCCESS_GET).send(response)
        }
        catch (error) {
            logger.error(`Internal server error`);
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }
}
