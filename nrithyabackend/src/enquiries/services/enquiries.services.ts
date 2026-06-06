import { FastifyReply, FastifyRequest } from "fastify";
import { getDataSource } from "../../utils/data-source";
import { EnquiryType } from "../entities/enquirytype.entities";
import { CustomError, Success } from "../../utils/response";
import { BAD_REQUEST, createExcel, ERROR_COMMON_MESSAGE, INTERNAL_ERROR, NOT_FOUND, recordAudit, SUCCESS_CREATE, SUCCESS_GET } from "../../utils/common";
import logger from "../../utils/logger";
import { ILike } from "typeorm";
import { Enquiry, EnquiryDataInput, EnquirySearch, EnquiryTypeSearch, EnquiryTypeToUpdate, EnquiryUpdateData, FollowUpUpdateInput } from "../types/enquiries.types";
import { Courses } from "../../course/entities/course.entities";
import { Enquiries } from "../entities/enquiries.entities";
import { Frequency } from "../../frequency/entities/frequency.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { Users } from "../../users/entities/user.entities";

export class EnquiriesControllers{
    // ENQUIRY TYPE CREATE
    createEnquiryType = async (request:FastifyRequest<{Body:{enquiry_type:string}}>,reply:FastifyReply)=>{
        try {
            const enquiryTypeData = request.body;
            const userDetails = (request as any).user_details;
            if(enquiryTypeData.enquiry_type){
                const appDataSource = await getDataSource();
                const enquiryTypeRepository = appDataSource.getRepository(EnquiryType)
                const enquiryTypeQueryBuilder = enquiryTypeRepository.createQueryBuilder("enquiry_type")

                const existingEnquiryType = await enquiryTypeQueryBuilder
                    .where("LOWER(enquiry_type.enq_type) = LOWER(:enq_type)", { enq_type: enquiryTypeData.enquiry_type })
                    .andWhere("enquiry_type.is_active = :status", { status: true })
                    .getOne();

                if(!existingEnquiryType){
                    const enquiryType = new EnquiryType();
                    enquiryType.enq_type = enquiryTypeData.enquiry_type;
                    enquiryType.created_at = new Date();
                    enquiryType.updated_at = new Date();
                    await enquiryTypeRepository.save(enquiryType)

                    logger.info("Enquiry type created successfully")
                    const response = Success<string>("Enquiry type created successfully")
                    reply.status(SUCCESS_CREATE).send(response)

                    if(userDetails){
                        recordAudit("Enquiry type created", new Date, "enquiry", userDetails.user_id);
                    }
                } else{
                    logger.error(`Enquiry type is already exist!`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry type is already exist!");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            } else{
                logger.error(`All fields are compulsorry!`);
                const errResponse = CustomError<string>(BAD_REQUEST, "All fields are compulsorry!");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error("Internal server error");
            const errorResponse = CustomError<string>( INTERNAL_ERROR, ERROR_COMMON_MESSAGE );
            reply.status( INTERNAL_ERROR ).send( errorResponse );
        }
    }

    // INDIVIDUAL ENQUIRY TYPE
    listEnquiryType = async (request:FastifyRequest<{Params:{enquiry_type_id:number}}>,reply:FastifyReply) => {
        try {
            const enquiryTypeId:number = request.params.enquiry_type_id;    

            const appDataSource = await getDataSource();
            const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);   

            if(enquiryTypeId){
                const existingEnquiryType = await enquiryTypeRepository.findOne({
                    where: {enq_type_id: enquiryTypeId}
                });
                if(existingEnquiryType){
                    const enquiryTypeQueryBuilder = enquiryTypeRepository.createQueryBuilder('enquiry_type');
                    enquiryTypeQueryBuilder.where('enquiry_type.enq_type_id = :enq_type_id', {enq_type_id:enquiryTypeId})
                    const enquiryType= await enquiryTypeQueryBuilder.getMany();

                    logger.info("Enquiry type listed successfully")
                    const response = Success<any>(enquiryType)
                    reply.status(SUCCESS_GET).send(response);
                } else{
                    logger.error("Enquiry type does not exist!");
                    const errResponse = CustomError<string>(NOT_FOUND,"Enquiry type does not exist!");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            } else{
                logger.error("Enquiry type id is missing!");
                const data = CustomError<string>(BAD_REQUEST,"Enquiry type id is missing!");
                return reply.status(BAD_REQUEST).send(data);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse); 
        }
    }


    // ALL ENQUIRY TYPE LISTING
    listAllEnquiryTypes = async (request:FastifyRequest<{Querystring:EnquiryTypeSearch}>,reply:FastifyReply)=>{
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 10;
            const offset = (page - 1) * perPage;
    
            const enquiryType =request.query.enquiry_type;
            const appDataSource = await getDataSource();
            const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);

            const enquiryTypeQuiryBuilder = enquiryTypeRepository.createQueryBuilder('enquiry_type').where("enquiry_type.is_active = :isActive", {isActive:"true"})
            if(enquiryType) {
                enquiryTypeQuiryBuilder.where('LOWER(enquiry_type.enq_type) LIKE LOWER(:enq_type)', { enq_type: enquiryType ? `%${enquiryType}%`: '%%'})
            }
            
            let totalCount ;
            let enquiryTypeData;
            if(request.query.sortorder == 'desc'){
                enquiryTypeQuiryBuilder.orderBy('LOWER(enquiry_type.enq_type)','DESC')
            }else{
                enquiryTypeQuiryBuilder.orderBy('LOWER(enquiry_type.enq_type)','ASC')
            }

            if(request.query.pagenation=="none"){
                totalCount = await enquiryTypeQuiryBuilder.getCount();
                enquiryTypeData = await enquiryTypeQuiryBuilder.getMany()
              } else{
                totalCount = await enquiryTypeQuiryBuilder.getCount();
                enquiryTypeData = await enquiryTypeQuiryBuilder.skip(offset).take(perPage).getMany();
            }
            const resobj: any = {metadata: {
                total_count: totalCount
            }, data: []};

            resobj.data.push(...enquiryTypeData);

            logger.info("All Enquiry types listed successfully")
            const response = Success<any>(resobj)
            reply.status(SUCCESS_GET).send(response);
        } catch (error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    // ENQUIRY TYPE UPDATE
    updateEnquiryType = async (request:FastifyRequest<{Body:EnquiryTypeToUpdate}>,reply:FastifyReply)=>{
        try {
            const enquiryTypeData = request.body;
            const userDetails = (request as any).user_details;
            if(enquiryTypeData.enq_type_id) {
                const appDataSource = await getDataSource();
                const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);
    
                const existingEnquiryType = await enquiryTypeRepository.findOneBy({
                    enq_type_id: enquiryTypeData.enq_type_id
                })

                const enquiryTypeExist = await enquiryTypeRepository.createQueryBuilder("enquiry_type")
                .where("enquiry_type.enq_type_id != :enq_type_id",{enq_type_id:enquiryTypeData.enq_type_id})
                .andWhere("enquiry_type.enq_type = :enq_type",{enq_type:enquiryTypeData.enquiry_type})
                .andWhere("enquiry_type.is_active = :isActive",{isActive:"true"})
                .getOne();

                if(enquiryTypeExist) {
                    logger.error(`Enquiry type already exist!`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry type already exist!");
                    return reply.status(BAD_REQUEST).send(errResponse);
                }

                if(existingEnquiryType) {
                    await enquiryTypeRepository.createQueryBuilder()
                    .update(EnquiryType)
                    .set({
                        enq_type:enquiryTypeData.enquiry_type? enquiryTypeData.enquiry_type : existingEnquiryType.enq_type,
                        updated_at: new Date(),
                    })
                    .where("enq_type_id=:enq_type_id",{enq_type_id:enquiryTypeData.enq_type_id})
                    .execute();

                    logger.info("Enquiry type updated successfully");
                    const response = Success<string>("Enquiry type updated successfully")
                    reply.status(SUCCESS_CREATE).send(response);
                    if(userDetails){
                        recordAudit("Enquiry type updated", new Date, "enquiry", userDetails.user_id);
                    }
                } else{
                    logger.error(`Enquiry type does not exist!`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry type does not exist! please create a new one");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            } else{
                logger.error(`All fields are compulsorry!`);
                const errResponse = CustomError<string>(BAD_REQUEST, "All fields are compulsorry!");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    // ENQUIRY TYPE DELETE
    deleteEnquiryType = async (request:FastifyRequest<{Querystring:{enq_type_id:number}}>,reply:FastifyReply)=>{
        try {
            const enquiryTypeId = request.query.enq_type_id;
            const user_details = (request as any).user_details;

            if(enquiryTypeId){
                const appDataSource = await getDataSource();
                const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);
    
                const existingEnquiryType = await enquiryTypeRepository.findOneBy({
                    enq_type_id: enquiryTypeId
                })
                if(existingEnquiryType){
                    existingEnquiryType.is_active = false;
                    await enquiryTypeRepository.save(existingEnquiryType);

                    logger.info("Enquiry type deleted successfully");
                    const response = Success<string>("Enquiry type deleted successfully");
                    reply.status(SUCCESS_CREATE).send(response);

                    if(user_details){
                        recordAudit("Enquiry type deleted", new Date, "enquiry", user_details.user_id)
                    }
                } else{
                    logger.error("Enquiry type doest not exist or not found!");
                    const errResponse = CustomError<string>(NOT_FOUND, "Enquiry type doest not exist or not found!");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            } else{
                logger.error(`Enquiry id is missing in the querystring!`);
                const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry id is missing in the querystring!");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    // // ENQUIRY RESPONSE CREATE
    // createEnquiryResponse = async (request:FastifyRequest<{Body:{enquiry_response:string}}>,reply:FastifyReply)=>{
    //     try {
    //         const enquiryResponseData = request.body;
    //         if(enquiryResponseData.enquiry_response){
    //             const appDataSource = await getDataSource();
    //             const enquiryResponseRepository =appDataSource.getRepository(EnquiryResponse)

    //             const existingEnquiryResponse = await enquiryResponseRepository.findOne({
    //                 where: {enquiry_response:ILike(enquiryResponseData.enquiry_response)}
    //             })
    //             if(!existingEnquiryResponse){
    //                 const enquiryResponse = new EnquiryResponse();
    //                 enquiryResponse.enquiry_response = enquiryResponseData.enquiry_response;
    //                 await enquiryResponseRepository.save(enquiryResponse)

    //                 logger.info("Enquiry response created successfully")
    //                 const response = Success<string>("Enquiry response created successfully")
    //                 reply.status(SUCCESS_CREATE).send(response)
    //             } else{
    //                 logger.error(`Enquiry response is already exist!`);
    //                 const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry response is already exist!");
    //                 reply.status(BAD_REQUEST).send(errResponse);
    //             }
    //         } else{
    //             logger.error(`All fields are compulsorry!`);
    //             const errResponse = CustomError<string>(BAD_REQUEST, "All fields are compulsorry!");
    //             reply.status(BAD_REQUEST).send(errResponse);
    //         }
    //     } catch (error) {
    //         logger.error("Internal server error");
    //         const errorResponse = CustomError<string>( INTERNAL_ERROR, ERROR_COMMON_MESSAGE );
    //         reply.status( INTERNAL_ERROR ).send( errorResponse );
    //     }
    // }

    // // ENQUIRY RESPONSE LIST
    // listEnquiryResponses = async (request:FastifyRequest<{Querystring:EnquiryResponseSearch}>,reply:FastifyReply)=>{
    //     try {
    //         const page = request.query.page || 1;
    //         const perPage = request.query.limit || 10;
    //         const offset = (page - 1) * perPage;
    
    //         const enquiryResponse =request.query.enquiry_response;
    //         const appDataSource = await getDataSource();
    //         const enquiryResponseRepository = appDataSource.getRepository(EnquiryResponse);

    //         const enquiryResponseQuiryBuilder = enquiryResponseRepository.createQueryBuilder('enquiry_response');
    //         if(enquiryResponse) {
    //             enquiryResponseQuiryBuilder.where('LOWER(enquiry_response.enquiry_response) LIKE LOWER(:enquiry_response)', { enquiry_response: enquiryResponse ? `%${enquiryResponse}%`: '%%'})
    //         }
    //         const enquiryResponseData = await enquiryResponseQuiryBuilder.skip(offset).take(perPage).getMany()

    //         logger.info("All Enquiry response listed successfully")
    //         const response = Success<any>(enquiryResponseData)
    //         reply.status(SUCCESS_GET).send(response);
    //     } catch (error) {
    //         logger.error(`Internal server error`);
    //         const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
    //         reply.status(INTERNAL_ERROR).send(errResponse);
    //     }
    // }

    // // ENQUIRY RESPONSE UPDATE
    // updateEnquiryResponse = async (request:FastifyRequest<{Body:EnquiryResponseToUpdate}>,reply:FastifyReply)=>{
    //     try {
    //         const enquiryResponseData = request.body;
    //         if(enquiryResponseData.enq_res_id) {
    //             const appDataSource = await getDataSource();
    //             const enquiryResponseRepository = appDataSource.getRepository(EnquiryResponse);
    
    //             const existingEnquiryResponse = await enquiryResponseRepository.findOneBy({
    //                 enq_res_id: enquiryResponseData.enq_res_id
    //             })
    //             if(existingEnquiryResponse) {
    //                 await enquiryResponseRepository.createQueryBuilder()
    //                 .update(EnquiryResponse)
    //                 .set({
    //                     enquiry_response:enquiryResponseData.enquiry_response? enquiryResponseData.enquiry_response : existingEnquiryResponse.enquiry_response
    //                 })
    //                 .where("enq_res_id=:enq_res_id",{enq_res_id:enquiryResponseData.enq_res_id})
    //                 .execute();

    //                 logger.info("Enquiry response updated successfully");
    //                 const response = Success<string>("Enquiry response updated successfully")
    //                 reply.status(SUCCESS_CREATE).send(response)
    //             } else{
    //                 logger.error(`Enquiry response does not exist!`);
    //                 const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry response does not exist! please create a new one");
    //                 reply.status(BAD_REQUEST).send(errResponse);
    //             }
    //         } else{
    //             logger.error(`All fields are compulsorry!`);
    //             const errResponse = CustomError<string>(BAD_REQUEST, "All fields are compulsorry!");
    //             reply.status(BAD_REQUEST).send(errResponse);
    //         }
    //     } catch (error) {
    //         logger.error(`Internal server error`);
    //         const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
    //         reply.status(INTERNAL_ERROR).send(errResponse);
    //     }
    // }

    // // ENQUIRY RESPONSE DELETE
    // deleteEnquiryResponse = async (request:FastifyRequest<{Querystring:{enq_response_id:number}}>,reply:FastifyReply)=>{
    //     try {
    //         const enquiryResponseId = request.query.enq_response_id
    //         if(enquiryResponseId){
    //             const appDataSource = await getDataSource();
    //             const enquiryResponseRepository = appDataSource.getRepository(EnquiryResponse);
    
    //             const existingEnquiryResponse = await enquiryResponseRepository.findOneBy({
    //                 enq_res_id: enquiryResponseId
    //             })
    //             if(existingEnquiryResponse){
    //                 await enquiryResponseRepository.delete(existingEnquiryResponse);

    //                 logger.info("Enquiry response deleted successfully");
    //                 const response = Success<string>("Enquiry response deleted successfully");
    //                 reply.status(SUCCESS_CREATE).send(response);
    //             } else{
    //                 logger.error("Enquiry response doest not exist or not found!");
    //                 const errResponse = CustomError<string>(NOT_FOUND, "Enquiry response doest not exist or not found!");
    //                 reply.status(NOT_FOUND).send(errResponse);
    //             }
    //         } else{
    //             logger.error(`Enquiry response id is missing in the querystring!`);
    //             const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry response id is missing in the querystring!");
    //             reply.status(BAD_REQUEST).send(errResponse);
    //         }
    //     } catch (error) {
    //         logger.error(`Internal server error`);
    //         const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
    //         reply.status(INTERNAL_ERROR).send(errResponse);
    //     }
    // }


    // CREATING ENQUIRY
    createEnquiry = async (request:FastifyRequest<{Body:EnquiryDataInput}>,reply:FastifyReply)=>{
        try {
            const enquiryInputs = request.body;
            const userDetails = (request as any).user_details;            

            if (!enquiryInputs.name || !enquiryInputs.contact_number || !enquiryInputs.enquiry_date) {
                logger.error("Necessary data is missing");
                const errResponse = CustomError<string>(BAD_REQUEST, "Mandatory fields are compulsory!");
                return reply.status(BAD_REQUEST).send(errResponse);
            }

            const appDataSource = await getDataSource();
            const enquiryRepository = appDataSource.getRepository(Enquiries);
            const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);
            const courseRepository = appDataSource.getRepository(Courses);
            const userRepositiory = appDataSource.getRepository(Users);
            const frequencyRepository = appDataSource.getRepository(Frequency);

        
                const [existingEnquiryType, existingCourse, existingUser] = await Promise.all([
                    enquiryInputs.enquiry_type ? enquiryTypeRepository.findOneBy({ enq_type_id: enquiryInputs.enquiry_type }) : null,
                    enquiryInputs.course ? courseRepository.findOneBy({ course_id: enquiryInputs.course }) : null,
                    enquiryInputs.assignee ? userRepositiory.findOneBy({ user_id: enquiryInputs.assignee }) : null
                ]);
            
                if (enquiryInputs.enquiry_type && !existingEnquiryType) {
                    logger.error("Enquiry type does not exist!");
                    const errResponse = CustomError<string>(NOT_FOUND,"Enquiry type does not exist!");
                    return reply.status(NOT_FOUND).send(errResponse);
                }
            
                if (enquiryInputs.course && !existingCourse) {
                    logger.error("Selected course does not exist or not found!");
                    const errResponse = CustomError<string>(NOT_FOUND,"Selected course does not exist or not found!");
                    return reply.status(NOT_FOUND).send(errResponse);
                }
            
                if (enquiryInputs.assignee && !existingUser) {
                    logger.error("Selected user does not exist or not found!");
                    const errResponse = CustomError<string>(NOT_FOUND,"Selected user does not exist or not found!");
                    return reply.status(NOT_FOUND).send(errResponse);
                }
            
                const frequencyQueryBuilder = frequencyRepository.createQueryBuilder();
                const frequencies = await frequencyQueryBuilder
                    .select(["enquiry_1", "enquiry_2", "enquiry_3"])
                    .getRawOne();

                const firstFrequency = frequencies ? frequencies.enquiry_1 : 1;
                const enquiryDate = enquiryInputs.enquiry_date ? new Date(enquiryInputs.enquiry_date) : new Date();
                if(enquiryDate <= new Date()){
                    const lastCallDate = enquiryDate;
                    const followUpDate = new Date();
                    followUpDate.setDate(enquiryDate.getDate() + firstFrequency);
                    
                    const enquiry = new Enquiries();
                    enquiry.name = enquiryInputs.name;
                    enquiry.contact_number = enquiryInputs.contact_number;
                    enquiry.enq_date = enquiryDate;
                    enquiry.enquiryType = enquiryInputs.enquiry_type ? existingEnquiryType : null;
                    enquiry.courses = enquiryInputs.course ? existingCourse : null;
                    enquiry.assignee = enquiryInputs.assignee ? existingUser : null;
                    enquiry.enq_status = enquiryInputs.status ? enquiryInputs.status : "new";
                    enquiry.remarks = enquiryInputs.remarks ? enquiryInputs.remarks:"";
                    enquiry.demo_requested = enquiryInputs.demo_request ? enquiryInputs.demo_request: false;
                    enquiry.last_call = lastCallDate;
                    enquiry.follow_up = followUpDate;
                    
                    await enquiryRepository.save(enquiry);
                    
                    logger.info("Enquiry created successfully");
                    const response = Success<string>("Enquiry created successfully");
                    reply.status(SUCCESS_CREATE).send(response);

                    if(userDetails){
                        recordAudit("Enquiry created", new Date, "enquiry", userDetails.user_id);
                    }
                } else{
                    const errorResponse = CustomError<string>(BAD_REQUEST, 'Enquiry date is must be less than or equal to current date.');
                    return reply.status(BAD_REQUEST).send(errorResponse);
                }
            
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE);  
            const errResponse = CustomError<string>(INTERNAL_ERROR,ERROR_COMMON_MESSAGE,);
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
        
    }


    // LISTING ALL ENQUIRIES
    listAllEnquiry = async (request:FastifyRequest<{Querystring:EnquirySearch}>,reply:FastifyReply)=>{
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 10;
            const offset = (page - 1) * perPage;
    
            const name = request.query.name;
            const enquiryType = request.query.enquiry_type;
            const enquiryStatus = request.query.enquiry_status;
            const demoRequested = request.query.demo_requested;
            const assignee = request.query.assignee;
            const course = request.query.course;
            const followUpNumber = request.query.follow_up;

            const appDataSource = await getDataSource();
            const enquiryRepository = appDataSource.getRepository(Enquiries);

            const enquiryQueryBuilder = enquiryRepository.createQueryBuilder('enquiries');
            enquiryQueryBuilder.leftJoinAndSelect('enquiries.courses','courses');
            enquiryQueryBuilder.leftJoinAndSelect('enquiries.enquiryType','enquiryType');
            enquiryQueryBuilder.leftJoin('enquiries.assignee','assignee')
                .addSelect(["assignee.user_id","assignee.user_name"]);
            enquiryQueryBuilder.where('LOWER(enquiries.name) LIKE LOWER(:name)', { name:  name? `%${name}%`: '%%'})
            if(request.query.from && request.query.to) {
                const startDate:Date = new Date(request.query.from);
                const endDate:Date = new Date(request.query.to);

                enquiryQueryBuilder.andWhere('enquiries.follow_up BETWEEN :startDate AND :endDate',{startDate, endDate});
            }
            if(request.query.enquiry_date){
                const enquiryDate: Date = new Date(request.query.enquiry_date);
                enquiryQueryBuilder.andWhere("enquiries.enq_date = :enq_date",{enq_date: enquiryDate});
            }
            if(request.query.last_call){
                const lastCallDate: Date = new Date(request.query.last_call);
                enquiryQueryBuilder.andWhere("enquiries.last_call = :last_call_date",{last_call_date: lastCallDate});
            }
            if(assignee){
                enquiryQueryBuilder.andWhere("enquiries.assignee_id = :assignee_id",{assignee_id: assignee});
            }
            if(course){
                enquiryQueryBuilder.andWhere("enquiries.course_id = :course_id",{course_id: course});
            }
            if(followUpNumber){                
                if(followUpNumber == 1){
                    enquiryQueryBuilder.andWhere("enquiries.first_follow_up = :first_follow_up",{first_follow_up:"true"});
                    enquiryQueryBuilder.andWhere("enquiries.second_follow_up = :second_follow_up",{second_follow_up:"false"});
                    enquiryQueryBuilder.andWhere("enquiries.third_follow_up = :third_follow_up",{third_follow_up:"false"});
                } else if(followUpNumber == 2){
                    enquiryQueryBuilder.andWhere("enquiries.second_follow_up = :second_follow_up",{second_follow_up:"true"});
                    enquiryQueryBuilder.andWhere("enquiries.third_follow_up = :third_follow_up",{third_follow_up:"false"});
                } else if(followUpNumber == 3){
                    enquiryQueryBuilder.andWhere("enquiries.third_follow_up = :third_follow_up",{third_follow_up:"true"});
                }
            }
            if(enquiryType) {
                enquiryQueryBuilder.andWhere('enquiries.enq_type_id = :enq_type_id', { enq_type_id: enquiryType})
            }
            if(enquiryStatus) {
                enquiryQueryBuilder.andWhere('enquiries.enq_status =:enq_status', { enq_status: enquiryStatus})
            }
            if(demoRequested) {
                enquiryQueryBuilder.andWhere('enquiries.demo_requested =:demo_requested', { demo_requested: demoRequested})
            }
            let enquiryData;
            let totalCount;

            enquiryQueryBuilder.orderBy('enquiries.follow_up','DESC');
            totalCount = await enquiryQueryBuilder.getCount();

            if(request.query.pagenation=="none"){
                enquiryData = await enquiryQueryBuilder.getMany()
              } else{
                  enquiryData = await enquiryQueryBuilder.skip(offset).take(perPage).getMany();
            }
            
            if(request.query.download){
                if(request.query.save){
                    enquiryData = await enquiryQueryBuilder.getMany();
                } 
            } 
            
            let resObj :any = { metadata: {
                total_count: totalCount
             }, data: []};

            resObj.data.push(...enquiryData);
            if(request.query.download){
                return resObj;
            } else{
                if(request.query.save){
                    const data: any[] = [];
                    const enquiries = resObj.data;
                    for(let i in enquiries){
                        const enquiry = enquiries[i];
                        const courseName = enquiry.courses ? enquiry.courses.course_name : "";
                        const enqType = enquiry.enquiryType ? enquiry.enquiryType.enq_type : "";
                        const fullName = enquiry.assignee ? enquiry.assignee.user_name : "";
                        const enqData = [
                            enquiry.name,
                            enquiry.contact_number,
                            enquiry.enq_date,
                            enquiry.enq_status,
                            enquiry.remarks,
                            enquiry.demo_requested,
                            enquiry.last_call,
                            enquiry.follow_up,
                            courseName,
                            enqType,
                            fullName
                        ]
                        data.push(enqData);       
                    }
                    const book = await createExcel(["Name", "Contact Number","Enquiry Date","Enquiry Status","Remarks","Demo Requested","Last Call Date","Follow-up Date","Course Name","Enquiry Type","Assignee Name"], data);
                    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    reply.header('Content-Disposition', 'attachment; filename="enquiryList.xlsx"');
                    
                    const file_buffer = await book.xlsx.writeBuffer();
                    reply.send(file_buffer);
                } else{
                    logger.info("Enquiry listed successfully")
                    const response = Success<any>(resObj)
                    reply.status(SUCCESS_GET).send(response);
                }
            }
        } catch (error) {
            logger.error(`Internal server error`,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse); 
        }
    }


    // LIST INDIVIDUAL ENQUIRY
    listEnquiry = async (request:FastifyRequest<{Params:{enquiry_id:number}}>,reply:FastifyReply) => {
        try {
            const enquiryId:number = request.params.enquiry_id;    

            const appDataSource = await getDataSource();
            const enquiryRepository = appDataSource.getRepository(Enquiries);   

            if(enquiryId){
                const existingEnquiry = await enquiryRepository.findOne({
                    where: {enq_id: enquiryId}
                });
                if(existingEnquiry){
                    const enquiryQueryBuilder = enquiryRepository.createQueryBuilder('enquiries');
                    enquiryQueryBuilder.leftJoinAndSelect('enquiries.courses','courses');
                    enquiryQueryBuilder.leftJoinAndSelect('enquiries.enquiryType','enquiryType');
                    enquiryQueryBuilder.leftJoin('enquiries.assignee','assignee')
                        .addSelect(["assignee.user_id","assignee.user_name"]);
                    enquiryQueryBuilder.where('enquiries.enq_id = :enq_id', {enq_id:enquiryId})
                    const enquiry= await enquiryQueryBuilder.getMany();

                    logger.info("All Enquiry listed successfully")
                    const response = Success<any>(enquiry)
                    reply.status(SUCCESS_GET).send(response);
                } else{
                    logger.error("Enquiry does not exist!");
                    const errResponse = CustomError<string>(NOT_FOUND,"Enquiry does not exist!");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            } else{
                logger.error("Enquiry id is missing!");
                const data = CustomError<string>(BAD_REQUEST,"Enquiry id is missing!");
                return reply.status(BAD_REQUEST).send(data);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse); 
        }
    }


    // UPDATING ENQUIRY
    updateEnquiry = async (request:FastifyRequest<{Body:EnquiryUpdateData}>,reply:FastifyReply)=>{
        try {
            const enquiryUpdateData = request.body;
            const userDetails = (request as any).user_details;

            if(enquiryUpdateData.enq_id){
                const appDataSource = await getDataSource();
                const enquiryRepository = appDataSource.getRepository(Enquiries);

                const existingEnquiry = await enquiryRepository.findOneBy({
                    enq_id: enquiryUpdateData.enq_id
                })
                if(existingEnquiry){
                    await enquiryRepository.createQueryBuilder()
                    .update(Enquiries)
                    .set({
                        name:enquiryUpdateData.name? enquiryUpdateData.name:existingEnquiry.name,
                        contact_number:enquiryUpdateData.contact_number? enquiryUpdateData.contact_number:existingEnquiry.contact_number 
                    })
                    .where("enq_id = :enq_id", {enq_id:enquiryUpdateData.enq_id}).execute();
                    logger.info("Enquiry updated successfully");
                    const response = Success<string>("Enquiry updated successfully")
                    reply.status(SUCCESS_CREATE).send(response)

                    if(userDetails){
                        recordAudit("Enquiry updated", new Date, "enquiry", userDetails.user_id);
                    }     
                } else{
                    logger.error('Enquiry does not exist not found!');
                    const errResponse = CustomError<string>(NOT_FOUND, "Enquiry does not exist or not found!");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    // UPDATE FOLLOW UP DATE
    updateFollowUpDate = async (request:FastifyRequest<{Body:FollowUpUpdateInput}>, reply:FastifyReply) => {
        try {
            const bodyData= request.body;
            const userDetails = (request as any).user_details;

            if(bodyData.enq_id && bodyData.follow_up_no){
                const appDataSource = await getDataSource();
                const enquiryRepository = appDataSource.getRepository(Enquiries);
                const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);
                const courseRepository = appDataSource.getRepository(Courses);
                const userRepositiory = appDataSource.getRepository(Users);
                const frequencyRepository = appDataSource.getRepository(Frequency);

                const existingEnquiry = await enquiryRepository.createQueryBuilder('enquiries')
                .leftJoinAndSelect('enquiries.courses','courses')
                .leftJoinAndSelect('enquiries.enquiryType','enquiryType')
                .leftJoin('enquiries.assignee','assignee').addSelect(["assignee.user_id","assignee.user_name"])
                .where('enquiries.enq_id = :enq_id', {enq_id:bodyData.enq_id})
                .getOne();

                if(existingEnquiry){
                    const [existingEnquiryType, existingCourse, existingUser] = await Promise.all([
                        bodyData.enquiry_type ? enquiryTypeRepository.findOneBy({ enq_type_id: bodyData.enquiry_type }) : null,
                        bodyData.course ? courseRepository.findOneBy({ course_id: bodyData.course }) : null,
                        bodyData.assignee ? userRepositiory.findOneBy({ user_id: bodyData.assignee }) : null
                    ]);
                
                    if (bodyData.enquiry_type && !existingEnquiryType) {
                        logger.error("Enquiry type does not exist!");
                        const errResponse = CustomError<string>(NOT_FOUND,"Enquiry type does not exist!");
                        return reply.status(NOT_FOUND).send(errResponse);
                    }
                
                    if (bodyData.course && !existingCourse) {
                        logger.error("Selected course does not exist or not found!");
                        const errResponse = CustomError<string>(NOT_FOUND,"Selected course does not exist or not found!");
                        return reply.status(NOT_FOUND).send(errResponse);
                    }
                
                    if (bodyData.assignee && !existingUser) {
                        logger.error("Selected user does not exist or not found!");
                        const errResponse = CustomError<string>(NOT_FOUND,"Selected user does not exist or not found!");
                        return reply.status(NOT_FOUND).send(errResponse);
                    }

                    const frequencyQueryBuilder = frequencyRepository.createQueryBuilder();
                    const frequencies = await frequencyQueryBuilder
                    .select(["enquiry_1", "enquiry_2", "enquiry_3"]) 
                    .getRawOne();
                    
                    const firstFrequency = frequencies ? frequencies.enquiry_1 : 1;
                    const secondFrequency = frequencies ? frequencies.enquiry_2 : 3;
                    const thirdFrequency = frequencies ? frequencies.enquiry_3 : 5;
                    
                    let firstFollowUp = existingEnquiry.first_follow_up;
                    let secondFollowUp = existingEnquiry.second_follow_up;
                    let thirdFollowUp = existingEnquiry.third_follow_up;

                    const currentFollowUpDate = new Date(existingEnquiry.follow_up);
                    const currentLastCallDate = new Date(existingEnquiry.last_call);
                    let newLastCallDate: Date;
                    let newFollowUpDate: Date;
                    const followUpDateFromInput = new Date(bodyData.follow_up_date).getDate();
                    
                    switch (bodyData.follow_up_no) {
                        case 1:
                            if(!firstFollowUp){
                                firstFollowUp = true;
                                newLastCallDate = currentFollowUpDate;
                                newFollowUpDate = new Date();
                                newFollowUpDate.setDate(bodyData.follow_up_date ? followUpDateFromInput : newLastCallDate.getDate() + secondFrequency);
                                break;
                            } else{
                                logger.error('First follow-up is already completed!');
                                const errResponse = CustomError<string>(BAD_REQUEST, "First Follow-up is already completed!");
                                return reply.status(BAD_REQUEST).send(errResponse);
                            }
                        case 2:
                            if(firstFollowUp) {
                                if(!secondFollowUp){
                                    secondFollowUp = true;
                                    newLastCallDate = currentFollowUpDate;
                                    newFollowUpDate = new Date();
                                    newFollowUpDate.setDate(bodyData.follow_up_date ? followUpDateFromInput : newLastCallDate.getDate() + thirdFrequency);
                                    break;
                                } else{
                                    logger.error('Second follow-up is already completed!');
                                    const errResponse = CustomError<string>(BAD_REQUEST, "Second Follow-up is already completed!");
                                    return reply.status(BAD_REQUEST).send(errResponse);
                                }
                            } else{
                                logger.error('First Follow-up is not completed!');
                                const errResponse = CustomError<string>(BAD_REQUEST, "First Follow-up is not completed!");
                                return reply.status(BAD_REQUEST).send(errResponse);
                            }
                        case 3:
                            if(firstFollowUp && secondFollowUp) {
                                if(!thirdFollowUp){
                                    thirdFollowUp = true;
                                    newLastCallDate = currentFollowUpDate;
                                    newFollowUpDate = new Date();
                                    newFollowUpDate.setDate(bodyData.follow_up_date ? followUpDateFromInput : newLastCallDate.getDate() + firstFrequency);
                                    break;
                                } else{
                                    logger.error('Third follow-up is already completed!');
                                    const errResponse = CustomError<string>(BAD_REQUEST, "Third Follow-up is already completed!");
                                    return reply.status(BAD_REQUEST).send(errResponse);
                                }
                            } else{
                                logger.error('First & second follow-up is not completed!');
                                const errResponse = CustomError<string>(BAD_REQUEST, "First & second follow-up is not completed!");
                                return reply.status(BAD_REQUEST).send(errResponse);
                            }
                        case 4:
                            newLastCallDate = currentLastCallDate;
                            newFollowUpDate = bodyData.follow_up_date ? (currentLastCallDate < new Date(bodyData.follow_up_date) ? new Date(bodyData.follow_up_date) : currentFollowUpDate) : currentFollowUpDate;
                            break;
                        default:
                            logger.error('Incorrect follow-up count');
                            const errResponse = CustomError<string>(BAD_REQUEST, "Incorrect follow-up count");
                            return reply.status(BAD_REQUEST).send(errResponse);
                    }

                    // Saving new changes                    
                    await enquiryRepository.createQueryBuilder()
                    .update(Enquiries)
                    .set({
                        courses: bodyData.course ? existingCourse : existingEnquiry.courses,
                        assignee: bodyData.assignee ? existingUser : existingEnquiry.assignee,
                        enquiryType: bodyData.enquiry_type ? existingEnquiryType : existingEnquiry.enquiryType,
                        enq_status:bodyData.status ? bodyData.status : existingEnquiry.enq_status,
                        demo_requested : bodyData.demo_request !== undefined ? bodyData.demo_request : existingEnquiry.demo_requested,
                        remarks: 'remarks' in bodyData ? bodyData.remarks : existingEnquiry.remarks,
                        last_call: newLastCallDate,
                        follow_up: newFollowUpDate,
                        first_follow_up:firstFollowUp,
                        second_follow_up:secondFollowUp,
                        third_follow_up:thirdFollowUp,
                    })
                    .where("enq_id = :enq_id",{enq_id:bodyData.enq_id})
                    .execute();
                
                    const enquiryQuiryBuilder = enquiryRepository.createQueryBuilder('enquiries');
                    enquiryQuiryBuilder.leftJoinAndSelect('enquiries.courses','courses');
                    enquiryQuiryBuilder.leftJoin('enquiries.assignee','assignee')
                        .addSelect(["assignee.user_id","assignee.user_name"]);
                    enquiryQuiryBuilder.leftJoinAndSelect('enquiries.enquiryType','enquiryType');
                    enquiryQuiryBuilder.where("enq_id = :enq_id", {enq_id:bodyData.enq_id})
                    const enquiryData = await enquiryQuiryBuilder.getOne();
                
                    logger.info("Enquiry follow-up updated successfully");
                    const response = Success<any>(enquiryData);
                    reply.status(SUCCESS_GET).send(response);

                    if(userDetails){
                        recordAudit("Enquiry follow-up updated", new Date, "enquiry", userDetails.user_id);
                    }
                } else{
                    logger.error('Enquiry does not exist');
                    const errResponse = CustomError<string>(NOT_FOUND, "Enquiry does not exist");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            } else{
                logger.error("neccessary datas are not available");
                const errResponse = CustomError<string>(BAD_REQUEST, "All fields are compulsory!");
                reply.status(BAD_REQUEST).send(errResponse);
            }

        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    // DELETE ENQUIRY
    deleteEnquiry = async (request:FastifyRequest<{Querystring:{enquiry_id:number}}>,reply:FastifyReply)=>{
        try {
            const enquiryId = request.query.enquiry_id;
            const userDetails = (request as any).user_details;

            if(enquiryId){
                const appDataSource = await getDataSource();
                const enquiryRepository = appDataSource.getRepository(Enquiries);

                const existingEnquiry = await enquiryRepository.findOneBy({
                    enq_id: enquiryId
                })
                if(existingEnquiry){
                    await enquiryRepository.createQueryBuilder("enquiries")
                        .delete()
                        .where("enquiries.enq_id = :enq_id", { enq_id: enquiryId })
                        .execute();
                    // await enquiryRepository.delete(existingEnquiry);
                    logger.info("Enquiry deleted successfully");
                    const response = Success<string>("Enquiry deleted successfully");
                    reply.status(SUCCESS_CREATE).send(response);

                    if(userDetails){
                        recordAudit("Enquiry deleted", new Date, "enquiry", userDetails.user_id)
                    }
                } else{
                    logger.error("Enquiry doest not exist or not found!");
                    const errResponse = CustomError<string>(NOT_FOUND, "Enquiry doest not exist or not found!");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            } else{
                logger.error(`Enquiry id is missing in the querystring!`);
                const errResponse = CustomError<string>(BAD_REQUEST, "Enquiry id is missing in the querystring!");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE,error);            
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

}