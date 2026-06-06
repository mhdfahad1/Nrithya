import { FastifyReply, FastifyRequest } from "fastify";
import { Batches } from "../../batch/entities/batch.entities";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { compensationBatchInput, compensationStudentInput } from "../types/compensation.types";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import logger from "../../utils/logger";
import {
  SUCCESS_CREATE,
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  NOT_FOUND,
  ERROR_COMMON_MESSAGE,
  recordAudit
} from "../../utils/common";
import { Calendar } from "../../calender/entities/calender.entities";
import { CompensationBatchHistory } from "../entities/batch.compensation.history.entities";
import { Students } from "../../student/entities/students.entities";
import { CompensationStudentHistory } from "../entities/student.compensation.history.entities";
import { Query } from "pg";


export class CompensationController {

    // CREATE BATCH COMPENSATION
    createBatchCompensation = async ( request: FastifyRequest<{ Body: compensationBatchInput }>, reply: FastifyReply ) => {
        try {
            const batchData = request.body;
            const user_details = (request as any).user_details;

            if(batchData.batch_id && batchData.new_date && batchData.old_date && batchData.start_time && batchData.end_time) {
                const appDatasourse = await getDataSource();
                const batchRepository = appDatasourse.getRepository(Batches);
                const compensationHistoryRepository = appDatasourse.getRepository(CompensationBatchHistory);
                const existingBatch = await batchRepository.findOneBy({
                    batch_id: batchData.batch_id
                })
                if(existingBatch) {
                    const alreadyCompensatedBatch = await compensationHistoryRepository.createQueryBuilder("compensation_batch_history")
                    .where('compensation_batch_history.batches = :batches', { batches: existingBatch.batch_id })
                    .andWhere('compensation_batch_history.old_date = :old_date', { old_date: batchData.old_date })
                    .getOne();

                    if (alreadyCompensatedBatch) {
                        logger.error(`batch already compensated on another date`);
                        const errResponse = CustomError<string>(BAD_REQUEST, "batch already compensated on another date");
                        return reply.status(BAD_REQUEST).send(errResponse);
                        
                    }

                    const calendarRepository = appDatasourse.getRepository(Calendar);
                    const calendar = new Calendar();
                    
                    calendar.batches = existingBatch;
                    calendar.date = batchData.new_date;
                    calendar.start_time = batchData.start_time;
                    calendar.end_time = batchData.end_time;
                    calendar.compensated = true;
                    const compensatedCalendar = await calendarRepository.save(calendar);
                    
                    const batchHistory = new CompensationBatchHistory();
                    
                    batchHistory.batches = existingBatch;
                    batchHistory.old_date = batchData.old_date;
                    batchHistory.new_date = batchData.new_date;
                    batchHistory.start_time = batchData.start_time;
                    batchHistory.end_time = batchData.end_time
                    batchHistory.created_at =  new Date();
                    batchHistory.updated_at = new Date();
                    batchHistory.calendar = compensatedCalendar;

                    await compensationHistoryRepository.save(batchHistory)

                    const response = Success<string>("batch compensation successfull")
                    reply.status(SUCCESS_CREATE).send(response);

                    if(user_details) {
                        recordAudit("batch compensation created ", new Date, "batch compensation", user_details.user_id)
                    }
                }
                else {
                    logger.error(`invalid batch id provided`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "invalid batch id provided");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`more data required`);
                const errResponse = CustomError<string>(BAD_REQUEST, "more data required");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error while creating new course`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    deleteBatchCompensation = async ( request: FastifyRequest<{ Querystring: {
        compensation_id: number
    } }>, reply: FastifyReply ) => {
        try{
            const id = request.query.compensation_id;
            const user_details = (request as any).user_details;

            if(id) {
                const appDatasourse = await getDataSource();
                const batchCompensationRepository = appDatasourse.getRepository(CompensationBatchHistory);
                const calendarRepository = appDatasourse.getRepository(Calendar);

                const existingCompensation = await batchCompensationRepository.createQueryBuilder("compensation_batch_history").leftJoinAndSelect("compensation_batch_history.calendar", "calendar").where("compensation_batch_history.id=:id", {id: id}).getOne()
                const existingCalendar = await calendarRepository.findOneBy({
                    calendar_id: existingCompensation?.calendar.calendar_id
                })

                if(existingCompensation && existingCalendar) {

                    await batchCompensationRepository.createQueryBuilder("compensation_batch_history")
                        .delete()
                        .where("compensation_batch_history.id = :id", { id: existingCompensation.id })
                        .execute();

                    await calendarRepository.createQueryBuilder("calendar")
                        .delete()
                        .where("calendar.calendar_id = :id", { id: existingCalendar.calendar_id })
                        .execute();

                    const response = Success<string>("batch compensation deleted successfully")
                    reply.status(SUCCESS_CREATE).send(response);

                    if(user_details) {
                        recordAudit("batch compensation deleted ", new Date, "batch compensation", user_details.user_id)
                    }
                }
                else {
                    logger.error(`more data required`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Invalid compensation or calendar");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`more data required`);
                const errResponse = CustomError<string>(BAD_REQUEST, "compensation id not provided");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }
    

    updateBatchCompensation = async ( request: FastifyRequest<{ Body: {
        compensation_id: number;
        start_time: string;
        end_time: string;
        new_date: Date;
        old_date: Date;
    } }>, reply: FastifyReply ) => {
        try{
            const id = request.body
            const user_details = (request as any).user_details;

            if(id.compensation_id) {
                const appDataSource = await getDataSource();
                const batchCompensationRepository = appDataSource.getRepository(CompensationBatchHistory);
                const calendarRepository = appDataSource.getRepository(Calendar);

                const existingCompensation = await batchCompensationRepository.createQueryBuilder("compensation_batch_history").leftJoinAndSelect("compensation_batch_history.calendar", "calendar").where("compensation_batch_history.id=:id", {id: id.compensation_id}).getOne()
                const existingCalendar = await calendarRepository.findOneBy({
                    calendar_id: existingCompensation?.calendar.calendar_id
                })

                if(existingCalendar && existingCompensation) {
                    await batchCompensationRepository.createQueryBuilder()
                        .update(CompensationBatchHistory)
                        .set({ 
                            start_time: id.start_time? id.start_time: existingCompensation.start_time,
                            end_time: id.end_time? id.end_time: existingCompensation.end_time,
                            new_date: id.new_date? id.new_date: existingCompensation.new_date,
                            old_date: id.old_date? id.old_date: existingCompensation.old_date
                        })
                        .where("id = :id", { id: existingCompensation.id })
                        .execute();

                    await calendarRepository.createQueryBuilder()
                        .update(Calendar)
                        .set({ 
                            start_time: id.start_time? id.start_time: existingCalendar.start_time,
                            end_time: id.end_time? id.end_time: existingCalendar.end_time,
                            date: id.new_date? id.new_date: existingCalendar.date
                        })
                        .where("calendar_id = :id", { id: existingCalendar.calendar_id })
                        .execute();

                    const response = Success<string>("batch compensation updated successfully")
                    reply.status(SUCCESS_CREATE).send(response);

                    if(user_details) {
                        recordAudit("batch compensation updated", new Date, "batch compensation", user_details.user_id)
                    }
                }
                else {
                    logger.error(`more data required`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Invalid compensation or calendar");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`more data required`);
                const errResponse = CustomError<string>(BAD_REQUEST, "compensation id not provided");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }   
    }


    // CREATE STUDENT COMPENSATION
    createStudentCompensation = async ( request: FastifyRequest<{ Body: compensationStudentInput }>, reply: FastifyReply ) => {
        try {
            const batchData = request.body;
            const user_details = (request as any).user_details;

            if( batchData.student_id && batchData.new_date && batchData.old_date && batchData.new_batch && batchData.old_batch ) {
                const appDatasourse = await getDataSource();
                const studentRepository = appDatasourse.getRepository(Students);
                const studentCompensationHistoryReposiory = appDatasourse.getRepository(CompensationStudentHistory);
                const existingStudent = await studentRepository.findOneBy({
                    student_id: batchData.student_id
                })
                if(existingStudent) {

                    const batchRepository = appDatasourse.getRepository(Batches);
                    const existingOldBatch = await batchRepository.findOneBy({
                        batch_id: batchData.old_batch
                    })

                    if(existingOldBatch) {
                        const alreadyCompensated = await studentCompensationHistoryReposiory.createQueryBuilder("compensation_student_history")
                        .where("compensation_student_history.student = :student_id", {student_id: existingStudent.student_id})
                        .andWhere("compensation_student_history.own_batches = :own_batch_id", {own_batch_id: existingOldBatch.batch_id})
                        .andWhere("compensation_student_history.old_date = :old_date", {old_date: batchData.old_date})
                        .getOne();
                        
                        if(alreadyCompensated) {
                            logger.error(`student already compensated on another batch on same date`);
                            const errResponse = CustomError<string>(BAD_REQUEST, "student already compensated on another batch on same date");
                            return reply.status(BAD_REQUEST).send(errResponse);
                        }    
                    }
            
                    const existingNewBatch = await batchRepository.findOneBy({
                        batch_id: batchData.new_batch
                    })

                    if(existingOldBatch && existingNewBatch) {
                        const studentCompensationHistory = new CompensationStudentHistory();
                        studentCompensationHistory.old_date = batchData.old_date;
                        studentCompensationHistory.new_date = batchData.new_date;
                        studentCompensationHistory.own_batches = existingOldBatch;
                        studentCompensationHistory.new_batches = existingNewBatch;
                        studentCompensationHistory.student = existingStudent;
                        studentCompensationHistory.created_at = new Date();
                        studentCompensationHistory.updated_at = new Date();
                        await studentCompensationHistoryReposiory.save(studentCompensationHistory)

                        const response = Success<string>("student compensation successfull")
                        reply.status(SUCCESS_CREATE).send(response);

                        if(user_details) {
                            recordAudit("student compensation created ", new Date, "student compensation", user_details.user_id)
                        }
                    }
                    else {
                        logger.error(`invalid batch id provided`);
                        const errResponse = CustomError<string>(BAD_REQUEST, "invalid batch id provided");
                        reply.status(BAD_REQUEST).send(errResponse);
                    }
                }
                else {
                    logger.error(`invalid student id provided`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "invalid student id provided");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`more data required`);
                const errResponse = CustomError<string>(BAD_REQUEST, "more data required");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`,error);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    // LIST BATCH COMPENSATION
    listBatchCompensation = async ( request: FastifyRequest<{ Querystring: { 
        batch_name?: string,
        limit?: number,
        page?: number
        to?:Date,
        from?:Date
     } }>, reply: FastifyReply ) => {

        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;

        try {
            const appDatasourse = await getDataSource();
            const compensationBatchRepository = appDatasourse.getRepository(CompensationBatchHistory);
            const queryBuilder = compensationBatchRepository.createQueryBuilder('compensation_batch_history')
                .leftJoinAndSelect("compensation_batch_history.batches", "batches")
            if (request.query.batch_name && request.query.batch_name.trim() !== '') {
                queryBuilder.where('LOWER(batches.batch_name) LIKE LOWER(:batch_name)', { batch_name: `%${request.query.batch_name}%` });
            }
            if(request.query.from && request.query.to) {
                queryBuilder.andWhere('compensation_batch_history.new_date BETWEEN :startDate AND :endDate',{startDate: request.query.from, endDate: request.query.to});
            }
            queryBuilder.orderBy('compensation_batch_history.updated_at', 'DESC');
            const count = await queryBuilder.getCount()
            const batchCompensation = await queryBuilder.skip(offset).take(perPage).getMany(); 
            const response = Success<any>({ metadata: { totalcount: count }, data: [...batchCompensation] })
            reply.status(SUCCESS_GET).send(response);
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    // LIST BATCH COMPENSATION
    getBatchCompensation = async ( request: FastifyRequest<{Params: {
        id: number
    }}>, reply: FastifyReply ) => {
        try {
            if(request.params.id) {
                const appDatasourse = await getDataSource();
                const compensationBatchRepository = appDatasourse.getRepository(CompensationBatchHistory);
                const data = await compensationBatchRepository.findOneBy({
                    id: request.params.id
                })
                const response = Success<any>(data)
                reply.status(SUCCESS_GET).send(response);
            }
            else {
                logger.error(`Internal server error`);
                const errResponse = CustomError<string>(INTERNAL_ERROR, "Compensaton id not specified");
                reply.status(INTERNAL_ERROR).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    // LIST STUDENT COMPENSATION
    listStudentCompensation = async ( request: FastifyRequest<{ Querystring: { 
        student_name?: string,
        limit?: number,
        page?: number,
        batch_id?: number,
        date?: Date,
        sortorder?:string,
        from?: Date,
        to?: Date
    } }>, reply: FastifyReply ) => {

        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;

        try {
            const appDatasourse = await getDataSource();
            const compensationStudentRepository = appDatasourse.getRepository(CompensationStudentHistory);
            const queryBuilder = compensationStudentRepository.createQueryBuilder('compensation_student_history')
                .leftJoinAndSelect("compensation_student_history.student", "students")
                .leftJoinAndSelect("compensation_student_history.own_batches", "own_batches")
                .leftJoinAndSelect("compensation_student_history.new_batches", "new_batches")

            if (request.query.student_name) {
                const studentNameArray = request.query.student_name.split(" ");
                if(studentNameArray.length == 1) {
                    queryBuilder.andWhere('LOWER(students.first_name) LIKE LOWER(:name) OR LOWER(students.last_name) LIKE LOWER(:name)', { name: `%${studentNameArray[0]}%` });
                } else if(studentNameArray.length ==2){
                    queryBuilder.andWhere('LOWER(students.first_name) LIKE LOWER(:first_name) AND LOWER(students.last_name) LIKE LOWER(:last_name)', { first_name: `%${studentNameArray[0]}%`, last_name: `%${studentNameArray[1]}%` });
                }
            }

            if(request.query.batch_id) {
                if(request.query.date) {
                    queryBuilder.where('compensation_student_history.new_batches.batch_id=:id', { id: request.query.batch_id }).andWhere('compensation_student_history.new_date=:date', { date: request.query.date })
                }
                else {
                    queryBuilder.where('compensation_student_history.new_batches.batch_id=:id', { id: request.query.batch_id })
                }
            }

            if(request.query.from && request.query.to) {
                queryBuilder.andWhere('compensation_student_history.new_date BETWEEN :startDate AND :endDate',{startDate: request.query.from, endDate: request.query.to});
            }

            if (request.query.sortorder == "desc") {
                queryBuilder.orderBy('students.first_name','DESC')
              } else {    
                queryBuilder.orderBy('students.first_name','ASC')
              }
              
            const count = await queryBuilder.getCount()
            const studentCompensation = await queryBuilder.skip(offset).take(perPage).getMany(); 
            const response = Success<any>({ metadata: { totalcount: count }, data: [...studentCompensation] })
            reply.status(SUCCESS_GET).send(response);
        }
        catch(error) {
            logger.error(`Internal server error`,error);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }



    listSingleStudentCompensation = async ( request: FastifyRequest<{ Params: { 
        id: number
    } }>, reply: FastifyReply ) => {

        try {
            const appDatasourse = await getDataSource();
            const compensationStudentRepository = appDatasourse.getRepository(CompensationStudentHistory);
            const queryBuilder = compensationStudentRepository.createQueryBuilder('compensation_student_history')
                .leftJoinAndSelect("compensation_student_history.student", "students")
                .leftJoinAndSelect("compensation_student_history.own_batches", "own_batches")
                .leftJoinAndSelect("compensation_student_history.new_batches", "new_batches")
                .where("compensation_student_history.id=:id", { id: request.params.id })
            const studentCompensation = await queryBuilder.getOne(); 
            const response = Success<any>(studentCompensation)
            reply.status(SUCCESS_GET).send(response);
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    updateStudentCompensation = async ( request: FastifyRequest<{ Body: { 
        id: number,
        old_date?: Date,
        new_date?: Date,
        old_batch_id?: number,
        new_batch_id?: number,
        student_id?: number
    } }>, reply: FastifyReply ) => {
        try {
            const reqBody = request.body;
            const user_details = (request as any).user_details; 
            
            if(reqBody.id){
                const appDataSource = await getDataSource();
                const studentCompensationRepository = appDataSource.getRepository(CompensationStudentHistory);
                const existingStudentCompensation = await studentCompensationRepository.findOneBy({
                    id: reqBody.id
                })

                if(existingStudentCompensation) {
                    let existingStudent: any = {}
                    let existingnewBatch: any = {}
                    let existingoldBatch: any = {}

                    if(reqBody.student_id) {
                        const studentRepository = appDataSource.getRepository(Students);
                        existingStudent = await studentRepository.findOneBy({
                            student_id: reqBody.student_id
                        })

                        if(!existingStudent){
                            logger.error(`invalid student id provided`);
                            const errResponse = CustomError<string>(BAD_REQUEST, "invalid student id provided");
                            return reply.status(BAD_REQUEST).send(errResponse);
                        }
                    }

                    if(reqBody.new_batch_id) {
                        const batchRepository = appDataSource.getRepository(Batches);
                        existingnewBatch = await batchRepository.findOneBy({
                            batch_id: reqBody.new_batch_id
                        })

                        if(!existingnewBatch){
                            logger.error(`invalid batch id provided`);
                            const errResponse = CustomError<string>(BAD_REQUEST, "invalid batch id provided");
                            return reply.status(BAD_REQUEST).send(errResponse);
                        }
                    }

                    if(reqBody.old_batch_id) {
                        const batchRepository = appDataSource.getRepository(Batches);
                        existingoldBatch = await batchRepository.findOneBy({
                            batch_id: reqBody.old_batch_id
                        })

                        if(!existingoldBatch){
                            logger.error(`invalid batch id provided`);
                            const errResponse = CustomError<string>(BAD_REQUEST, "invalid batch id provided");
                            return reply.status(BAD_REQUEST).send(errResponse);
                        }
                    }

                    await studentCompensationRepository.createQueryBuilder()
                        .update(CompensationStudentHistory)
                        .set({
                            old_date: reqBody.old_date ? reqBody.old_date: existingStudentCompensation.old_date,
                            new_date: reqBody.new_date ? reqBody.new_date: existingStudentCompensation.new_date,
                            student: existingStudent? existingStudent: existingStudentCompensation.student,
                            own_batches: existingoldBatch? existingoldBatch: existingStudentCompensation.own_batches,
                            new_batches: existingnewBatch? existingnewBatch: existingStudentCompensation.new_batches,
                            updated_at: new Date(),
                        })
                        .where('id = :id', { id: reqBody.id })
                        .execute();

                    const response = Success<any>("Student compensation updated")
                    reply.status(SUCCESS_GET).send(response);

                    if(user_details) {
                        recordAudit("student compensation updated", new Date, "student compensation", user_details.user_id)
                    }
                }
                else {
                    logger.error(`invalid student coompendation`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "invalid student coompendation");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`Id should be there`);
                const errResponse = CustomError<string>(BAD_REQUEST, "id is not provided");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    deleteStudentCompensation = async ( request: FastifyRequest<{ Querystring: { 
        id: number
    } }>, reply: FastifyReply ) => {
        const user_details = (request as any).user_details;
        try {
            if(request.query.id) {
                const appDataSource = await getDataSource();
                const studentCompensationRepository = appDataSource.getRepository(CompensationStudentHistory);
                const existingStudentCompensation = await studentCompensationRepository.findOneBy({
                    id: request.query.id
                })

                if(existingStudentCompensation) {
                    await studentCompensationRepository.createQueryBuilder()
                    .delete()
                    .from(CompensationStudentHistory)
                    .where('id = :id', { id: request.query.id })
                    .execute();

                    const response = Success<any>("Student compensation deleted")
                    reply.status(SUCCESS_GET).send(response);

                    if(user_details) {
                        recordAudit("student compensation deleted", new Date, "student compensation", user_details.user_id)
                    }
                }
                else {
                    logger.error(`invalid student coompendation`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "invalid student coompendation");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                logger.error(`invalid student coompendation`);
                const errResponse = CustomError<string>(BAD_REQUEST, "student coompendation id not provided");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


}