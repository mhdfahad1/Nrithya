import { FastifyReply, FastifyRequest } from "fastify";
import { Batches } from "../entities/batch.entities";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { BatchDataInput, BatchSearch, BatchDataUpdate, singleBatch, updateBatchTimings, addBatchTimings, deleteBatchTimings, BatchActivitySearch, BathActivityAdd, BatchActivityUpdate } from '../types/batch.types';
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
  recordAudit,
  createExcel
} from "../../utils/common";
import { BatchStatus, day_of_week } from "../types/batch.enums";
import { BatchesTimings } from "../entities/batch.timitings";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { BatchActivity } from "../entities/batch.activity";
import { BatchHistory } from "../entities/batch.history";
import { Calendar } from "../../calender/entities/calender.entities";
import { Students } from "../../student/entities/students.entities";
import { StudentStatus } from "../../student/types/student.types";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";
import { StudentBatchStatus } from "../../student/types/student.batch.enums";


export class BatchController {
  // CREATE BATCH
  createBatch = async (request: FastifyRequest<{ Body: BatchDataInput }>, reply: FastifyReply) => {

    try {
      const batchData = request.body;
      const user_details = (request as any).user_details

      if (batchData.batch_name && batchData.fee && batchData.max_strength && batchData.course_id && batchData.teacher_id && batchData.batch_started) {
        const appDatasourse = await getDataSource();
        const batchRepository = appDatasourse.getRepository(Batches);
        const existingBatch = await batchRepository.createQueryBuilder("batches").where("batches.batch_name = :batch_name", { batch_name: batchData.batch_name }).andWhere("batches.status=:status", {status: "ongoing"}).getOne();               
        if (existingBatch) {
          logger.error(`Batch already exists`);
          const errorResponse = CustomError<string>(BAD_REQUEST, "Batch already exists consider using a different name");
          reply.status(BAD_REQUEST).send(errorResponse);
        }
        else {
          const courseRepository = appDatasourse.getRepository(Courses);
          const existingCourse = await courseRepository.findOneBy({
            course_id: batchData.course_id
          })
          if (existingCourse) {
            const teacherRepository = appDatasourse.getRepository(Teachers);
            const existingTeacher = await teacherRepository.findOneBy({
              teacher_id: batchData.teacher_id
            })
            if (existingTeacher) {
              const batch = new Batches();
              batch.batch_name = batchData.batch_name;
              batch.fee = batchData.fee;
              batch.max_strength = batchData.max_strength;
              batch.current_strength = batchData.current_strength? batchData.current_strength : 0;
              batch.whatsapp_link = batchData.whatsapp_link? batchData.whatsapp_link : null as any;
              batch.batch_started = batchData.batch_started;
              batch.courses = existingCourse;
              batch.teachers = existingTeacher;
              batch.created_at = new Date();
              batch.updated_at = new Date();
              const batchTimingRepository = appDatasourse.getRepository(BatchesTimings);
              const savedBatch = await batchRepository.save(batch);
              batchData.day_of_week.forEach(async (day) => {
                const timing = new BatchesTimings();
                timing.day = day.day;
                timing.start_time = day.start_time;
                timing.end_time = day.end_time;
                timing.batch = savedBatch;
                await batchTimingRepository.save(timing)
              })
              logger.info(`Batch created successfully`);
              const response = Success<string>("Batch created successfully")
              reply.status(SUCCESS_CREATE).send(response);

              if(user_details) {
                recordAudit("batch created", new Date, "batches", user_details.user_id)
              }
            }
            else {
              logger.error("Teacher is not available");
              const errResponse = CustomError<string>(NOT_FOUND, "Teacher does not exist");
              reply.status(NOT_FOUND).send(errResponse);
            }
          }
          else {
            logger.error("Course is not available");
            const errResponse = CustomError<string>(NOT_FOUND, "Course does not exist");
            reply.status(NOT_FOUND).send(errResponse);
          }
        }
      }
      else {
        logger.error("data is not available");
        const errResponse = CustomError<string>(BAD_REQUEST, "Insufficient data provided");
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }
    catch (error) {
      logger.error(`Internal server error while creating new batches`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }


  // LIST BATCHES
  listBatch = async (request: FastifyRequest<{ Querystring: BatchSearch}>, reply: FastifyReply) => {

    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;

    const result = new Promise(async (resolve, reject) => {
      try {
        const batchData = request.query;

        const appDatasourse = await getDataSource();
        const batchRepositoriy = appDatasourse.getRepository(Batches);
        const batchTimingRepository = appDatasourse.getRepository(BatchesTimings);
        const studentBatcherRepository = appDatasourse.getRepository(StudentBatch);
        const queryBuilder = batchRepositoriy.createQueryBuilder('batches')
        .addSelect('LOWER("batches"."batch_name")', 'batchname')
        if(request.query.sortorder == 'desc') {
         queryBuilder.addOrderBy('batchname', 'DESC')
        }else{
         queryBuilder.addOrderBy('batchname', 'ASC')
        }
        
        queryBuilder.leftJoinAndSelect('batches.courses', 'courses');
        queryBuilder.leftJoinAndSelect('batches.teachers', 'teachers');
        queryBuilder.where('LOWER(batches.batch_name) LIKE LOWER(:batch_name)', { batch_name: batchData.batch_name ? `%${batchData.batch_name}%` : '%%' })
        if(request.query.from && request.query.to) {
          const startDate:Date = new Date(request.query.from);
          const endDate:Date = new Date(request.query.to);
          queryBuilder.andWhere('batches.batch_started BETWEEN :startDate AND :endDate',{startDate, endDate});
        }
        if (batchData.course_id) {
          queryBuilder.andWhere('batches.courses.course_id = :course_id', { course_id: batchData.course_id })
        }
        if(batchData.teacher_id){
          queryBuilder.andWhere("batches.teachers.teacher_id = :teacher_id", {teacher_id: batchData.teacher_id})
        }
        if(batchData.status) {
          queryBuilder.andWhere('batches.status = :status', { status: batchData.status })
        }
       
        let count;
        let data;
        count = await queryBuilder.getCount();

        if(request.query.pagenation=="none"){
           data = await queryBuilder.getMany();
        }else{
           data = await queryBuilder.skip(offset).take(perPage).getMany();
        }
        const responseObj: any = { metadata: { totalcount: count }, data: [] };
        for (const batch of data) {
          const obj: any = { ...batch }
          const batchQueryBuilder = batchTimingRepository.createQueryBuilder("batches_timings");
          const batchtimings = await batchQueryBuilder.where("batches_timings.batch_id = :batch_id", { batch_id: batch.batch_id }).getMany()
          obj.current_strength = await studentBatcherRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:id", {id: batch.batch_id}).andWhere("student_batch.status!=:status",{status:StudentBatchStatus.REMOVED}).getCount();
          obj.batch_timings = [...batchtimings];
          responseObj.data.push(obj);
        }

        resolve(responseObj);
      }
      catch (error) {
        reject()
      }
    })


    await result.then( async (response: any) => {
      if(request.query.save) {
        const data: any[] = [];

        for(let i in response.data ) {
          const batch = response.data[i];          
          const teacherFirstName = batch.teachers.first_name;
          const teacherLastName = batch.teachers.last_name;
          const teacherName = teacherFirstName + " " + teacherLastName;
          data.push([
            batch.batch_name, batch.fee, batch.max_strength, batch.current_strength, batch.batch_started, batch.status, batch.courses.course_name, teacherName
          ])
        }

        const book = await createExcel(["Batch name", "Batch fee", "Max strength", "Current strength", "Batch started", "Batch status", "Course name", "Teacher"], data);

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename="batchlist.xlsx"');

        const file_buffer = await book.xlsx.writeBuffer();
        reply.send(file_buffer);
      }
      else {
        const responseobj = Success<any>(response)
        reply.status(SUCCESS_GET).send(responseobj);
      }
    })
    .catch((error) => {
      logger.error(`Internal server error while fetching batches`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(errResponse);
    })
  }

  // UPDATE BATCH
  updateBatch = async (request: FastifyRequest<{ Body: BatchDataUpdate }>, reply: FastifyReply) => {

    try {
      const batchData = request.body;
      const user_details = (request as any).user_details

      if(batchData.batch_id) {
        const appDatasourse = await getDataSource();
        const batchRepository = appDatasourse.getRepository(Batches);
        const existingBatch = await batchRepository.findOneBy({
          batch_id: batchData.batch_id
        })
  
        if(existingBatch) {
          if(batchData.teacher_id) {
              const teacherRepository = appDatasourse.getRepository(Teachers);
              const existingTeacher = await teacherRepository.findOneBy({
                  teacher_id: batchData.teacher_id
              })
              if(existingTeacher) {                
                await batchRepository.createQueryBuilder()
                    .update(Batches)
                    .set({ 
                        batch_name: batchData.batch_name? batchData.batch_name: existingBatch.batch_name, 
                        batch_started: batchData.batch_started? batchData.batch_started: existingBatch.batch_started,
                        current_strength: batchData.current_strength? batchData.current_strength: existingBatch.current_strength,
                        max_strength: batchData.max_strength? batchData.max_strength: existingBatch.max_strength,
                        fee: batchData.fee? batchData.fee: existingBatch.fee,
                        whatsapp_link: batchData.whatsapp_link? batchData.whatsapp_link: existingBatch.whatsapp_link,
                        teachers: existingTeacher ? existingTeacher: existingBatch.teachers,
                        updated_at: new Date(),
                    })
                    .where("batch_id = :id", { id: batchData.batch_id })
                    .execute();

                const batchTimingRepository = appDatasourse.getRepository(BatchesTimings)
                const batchTimings = await batchTimingRepository.createQueryBuilder("batches_timings")
                    .where("batches_timings.batch_id=:batch_id", { batch_id: batchData.batch_id })
                    .getMany()

                batchTimings.forEach(async (batchTiming) => {
                    await batchTimingRepository.createQueryBuilder("batches_timings")
                      .delete()
                      .where("batches_timings.timing_id = :timing_id", { timing_id: batchTiming.timing_id })
                      .execute();
                })

                const attendaceRepository = appDatasourse.getRepository(StudentAttendance)
                const attendace = await attendaceRepository.createQueryBuilder("student_attendance")
                  .where("student_attendance.batch_id=:batch_id", { batch_id: batchData.batch_id })
                  .getOne()
                  console.log("attendace", attendace);

                const calendarRepository = appDatasourse.getRepository(Calendar);
                const calendarTimings = await calendarRepository.createQueryBuilder("calendar")
                    .where("calendar.batch_id=:batch_id", { batch_id: batchData.batch_id })
                    .andWhere("calendar.date >=:date", { date: attendace ? new Date() : new Date(new Date().setDate(new Date().getDate() - 7)) })
                    .getMany()        

                calendarTimings.forEach(async (calendarTiming) => {
                    await calendarRepository.createQueryBuilder("calendar")
                      .delete()
                      .where("calendar.calendar_id = :calender_id", { calender_id: calendarTiming.calendar_id })
                      .execute(); 
                })

                batchData.batch_timings.forEach(async (batchTimings) => {
                  const batchTiming = new BatchesTimings();
                  batchTiming.day = batchTimings.day;
                  batchTiming.start_time = batchTimings.start_time;
                  batchTiming.end_time = batchTimings.end_time;
                  batchTiming.batch = existingBatch;
                  await batchTimingRepository.save(batchTiming);
                })

                const response = Success<string>("batch data updated")
                reply.status(SUCCESS_GET).send(response)

                if(user_details) {
                  recordAudit("batch updated ", new Date, "batches", user_details.user_id)
                }
              }
              else {
                  logger.error("Teacher is not available");
                  const errResponse = CustomError<string>(NOT_FOUND, "Teacher does not exist");
                  reply.status(NOT_FOUND).send(errResponse);
              }
          }
          else {
              await batchRepository.createQueryBuilder()
                  .update(Batches)
                  .set({ 
                      batch_name: batchData.batch_name? batchData.batch_name: existingBatch.batch_name, 
                      batch_started: batchData.batch_started? batchData.batch_started: existingBatch.batch_started,
                      current_strength: batchData.current_strength? batchData.current_strength: existingBatch.current_strength,
                      max_strength: batchData.max_strength? batchData.max_strength: existingBatch.max_strength,
                      fee: batchData.fee? batchData.fee: existingBatch.fee,
                      whatsapp_link: batchData.whatsapp_link? batchData.whatsapp_link: existingBatch.whatsapp_link,
                      updated_at: new Date(),
                  })
                  .where("batch_id = :id", { id: batchData.batch_id })
                  .execute();

              const batchTimingRepository = appDatasourse.getRepository(BatchesTimings)
              const batchTimings = await batchTimingRepository.createQueryBuilder("batches_timings")
                .where("batches_timings.batch_id=:batch_id", { batch_id: batchData.batch_id })
                .getMany()

              batchTimings.forEach(async (batchTiming) => {
                await batchTimingRepository.createQueryBuilder("batches_timings")
                  .delete()
                  .where("batches_timings.timing_id = :timing_id", { timing_id: batchTiming.timing_id })
                  .execute();
              })

              const attendaceRepository = appDatasourse.getRepository(StudentAttendance)
              const attendace = await attendaceRepository.createQueryBuilder("student_attendance")
                .where("student_attendance.batch_id=:batch_id", { batch_id: batchData.batch_id })
                .getMany()
                console.log("attendace", attendace);
                

              const calendarRepository = appDatasourse.getRepository(Calendar);
              const calendarTimings = await calendarRepository.createQueryBuilder("calendar")
                  .where("calendar.batch_id=:batch_id", { batch_id: batchData.batch_id })
                  .andWhere("calendar.date >=:date", { date: attendace ? new Date() : new Date().getDate() - 7 })
                  .getMany()        

              calendarTimings.forEach(async (calendarTiming) => {
                  await calendarRepository.createQueryBuilder("calendar")
                    .delete()
                    .where("calendar.calendar_id = :calender_id", { calender_id: calendarTiming.calendar_id })
                    .execute(); 
              })
              
              batchData.batch_timings.forEach(async (batchTimings) => {
                const batchTiming = new BatchesTimings();
                batchTiming.day = batchTimings.day;
                batchTiming.start_time = batchTimings.start_time;
                batchTiming.end_time = batchTimings.end_time;
                batchTiming.batch = existingBatch;
                await batchTimingRepository.save(batchTiming);
              })

              logger.info("Updated batch")
              const response = Success<string>("batch data updated")
              reply.status(SUCCESS_GET).send(response)

              if(user_details) {
                recordAudit("batch updated", new Date, "batches", user_details.user_id)
              }
          }
        }
        else {
          logger.error('batch does not exist');
          const errResponse = CustomError<string>(NOT_FOUND, "batch does not exist");
          reply.status(NOT_FOUND).send(errResponse);
        }
      }
      else {
        logger.error('batch id not available');
        const errResponse = CustomError<string>(BAD_REQUEST, "batch id is not provided");
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }
    catch (error) {
      logger.error(`Internal server error while updating batches`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }

  getBatch = async (request: FastifyRequest<{ Params: singleBatch }>, reply: FastifyReply) => {
    try {
      const appDatasourse = await getDataSource()
      const batchRepository = appDatasourse.getRepository(Batches)
      const studentBatcherRepository = appDatasourse.getRepository(StudentBatch);
      const queryBuilder = batchRepository.createQueryBuilder("batches")
      queryBuilder.leftJoinAndSelect("batches.courses", "courses")
      queryBuilder.leftJoinAndSelect("batches.teachers", "teachers")
      queryBuilder.select()
      queryBuilder.where('batches.batch_id = :batch_id', { batch_id: request.params.batch_id })
      const data = await queryBuilder.getOne();
      if (data) {
        const batchTimingRepository = appDatasourse.getRepository(BatchesTimings);
        const batchQueryBuilder = batchTimingRepository.createQueryBuilder("batches_timings");
        data.current_strength = await studentBatcherRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:id", {id: data.batch_id}).andWhere("student_batch.status!=:status",{status:StudentBatchStatus.REMOVED}).getCount();
        const batchtimings = await batchQueryBuilder.where("batches_timings.batch_id = :batch_id", { batch_id: data.batch_id }).getMany()
        const responseobj: any = { ...data, batch_timings: [...batchtimings] };

        const response = Success<any>(responseobj);
        return reply.status(SUCCESS_GET).send(response)
      }
      else {
        logger.error(`Batch does not exist`);
        const data = CustomError<string>(BAD_REQUEST, "Batch does not exist");
        reply.status(BAD_REQUEST).send(data);
      }
    }
    catch (error) {
      logger.error(`Internal server error`);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  }

  createBatchActivity = async (request: FastifyRequest<{ Body: BathActivityAdd }>, reply: FastifyReply) => {
    try {
      const batchActivityData = request.body;      
      if (batchActivityData.batch_id && batchActivityData.date && batchActivityData.task) {
        
        const appDatasource = await getDataSource();
        const batchRepository = appDatasource.getRepository(Batches);
        const queryBuilder = batchRepository.createQueryBuilder('batches');
        queryBuilder.leftJoinAndSelect('batches.courses', 'courses');
        queryBuilder.leftJoinAndSelect('batches.teachers', 'teachers');
        queryBuilder.where({ batch_id: batchActivityData.batch_id })
          .andWhere({ status: "ongoing" });
        const existingBatch = await queryBuilder.getOne()

        if (existingBatch) {
          const batchActivityRepository = appDatasource.getRepository(BatchActivity);

          const existingBatchActivity = await batchActivityRepository.findOne({
            where: {
              batch: existingBatch,
              date: batchActivityData.date
            }
          });

          if (existingBatchActivity) {
            // If a BatchActivity already exists for the given batch and date, return a conflict response
            logger.error("A BatchActivity already exists for this batch on this date");
            const errResponse = CustomError<string>(404, "A BatchActivity already exists for this batch on this date");
            return reply.status(400).send(errResponse);
          }
          const batchActivity = new BatchActivity();
          batchActivity.date = batchActivityData.date;
          batchActivity.batch = existingBatch;
          batchActivity.task = batchActivityData.task;
          batchActivity.created_at = new Date();
          batchActivity.updated_at = new Date();
          await batchActivityRepository.save(batchActivity);
          logger.info(`BatchActivity created successfully`);
          const response = Success<string>("BatchActivity created successfully");
          return reply.status(SUCCESS_CREATE).send(response);
        } else {
          logger.error("Batch not found");
          const errResponse = CustomError<string>(NOT_FOUND, "Batch not found");
          return reply.status(NOT_FOUND).send(errResponse);
        }
      } else {
        logger.error("Required fields are missing");
        const errResponse = CustomError<string>(BAD_REQUEST, "Required fields are missing");
        return reply.status(BAD_REQUEST).send(errResponse);
      }
    } catch (error) {
      logger.error(`Internal server error while creating new BatchActivity`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      return reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }

  viewBatchActivity = async (request: FastifyRequest<{ Querystring: BatchActivitySearch }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;
    try {
      const batchActivityData = request.query;
      const appDatasource = await getDataSource();
      const batchActivityRepository = await appDatasource.getRepository(BatchActivity);

      const queryBuilder = batchActivityRepository.createQueryBuilder("batchactivity");
      queryBuilder.leftJoinAndSelect("batchactivity.batch", "batches");

      if (request.query.sortorder == "desc") {
        queryBuilder.orderBy('batches.batch_name','DESC')
      } else {    
        queryBuilder.orderBy('batches.batch_name','ASC')
      }

      if (batchActivityData.batch_id) {
        queryBuilder.andWhere("batchactivity.batch_id = :batch_id", {
          batch_id: batchActivityData.batch_id,
        });
      }

      if (batchActivityData.date) {
        queryBuilder.andWhere("batchactivity.date = :date", {
          date: batchActivityData.date,
        });
      }
     
      const totalcount = await queryBuilder.getCount();
      const data = await queryBuilder.skip(offset).take(perPage).getMany();
      const resobj: any = {
        metadata: {
          total_count: totalcount
        }, data: data
      }
      const response = Success<any>(resobj);
      reply.status(SUCCESS_GET).send(response);

    } catch (error) {
      logger.error(`Internal server error while viewing Batchactivity list`,error);

      const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }

  editBatchActivity = async (request: FastifyRequest<{ Body: BatchActivityUpdate }>, reply: FastifyReply) => {
    try {
      const batchActivityData = request.body;

      if (batchActivityData.activity_id) {
        const appDatasource = await getDataSource();
        const batchActivityRepository = appDatasource.getRepository(BatchActivity);
        const queryBuilder = batchActivityRepository.createQueryBuilder("batchActivity")
        queryBuilder.leftJoinAndSelect('batchActivity.batch', 'batches')
        queryBuilder.where({ activity_id: batchActivityData.activity_id })
        const existingBatchActivity = await queryBuilder.getOne()

        if (existingBatchActivity) {
          let existingBatch: Batches | null = null;

          if (batchActivityData.batch_id) {
            const batchRepositoriy = appDatasource.getRepository(Batches)
            const queryBuilder = batchRepositoriy.createQueryBuilder('batches');
            queryBuilder.leftJoinAndSelect('batches.courses', 'courses');
            queryBuilder.where({ batch_id: batchActivityData.batch_id })
            existingBatch = await queryBuilder.getOne()

            if (!existingBatch) {
              logger.error("Batch not found");
              const errResponse = CustomError<string>(NOT_FOUND, "Batch not found");
              return reply.status(NOT_FOUND).send(errResponse);
            }
          }
          await batchActivityRepository
            .createQueryBuilder()
            .update(BatchActivity)
            .set({
              batch: existingBatch
                ? existingBatch
                : existingBatchActivity.batch,
              date: batchActivityData.date
                ? batchActivityData.date
                : existingBatchActivity.date,
              task: batchActivityData.task
                ? batchActivityData.task
                : existingBatchActivity.task,
                updated_at:new Date(),
            })
            .where("activity_id = :id", {
              id: batchActivityData.activity_id,
            })
            .execute();

          logger.info("BatchActivity data updated successfully");
          const response = Success<string>("BatchActivity data updated");
          return reply.status(SUCCESS_GET).send(response);
        } else {
          logger.error("BatchActivity not found");
          const errResponse = CustomError<string>(NOT_FOUND, "BatchActivity not found");
          return reply.status(NOT_FOUND).send(errResponse);
        }
      } else {
        logger.error("Activity ID is missing");
        const errResponse = CustomError<string>(BAD_REQUEST, "Activity ID is missing");
        return reply.status(BAD_REQUEST).send(errResponse);
      }
    } catch (error) {
      logger.error("Error in updating BatchActivity", error);
      const errorData = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      return reply.status(INTERNAL_ERROR).send(errorData);
    }
  }

  getBatchActivity = async (request: FastifyRequest<{ Params: { activity_id: number } }>, reply: FastifyReply) => {
    try {
      const activityId = request.params.activity_id;

      if (activityId) {
        const appDatasource = await getDataSource();
        const batchActivityRepository = appDatasource.getRepository(BatchActivity);
        const queryBuilder = batchActivityRepository.createQueryBuilder("batchActivity");
        queryBuilder.leftJoinAndSelect("batchActivity.batch", "batches");
        queryBuilder.where("batchActivity.activity_id = :activityId", { activityId });
        const existingBatchActivity = await queryBuilder.getOne();

        if (existingBatchActivity) {
          const response = Success<any>(existingBatchActivity);
          return reply.status(SUCCESS_GET).send(response);
        } else {
          logger.error("BatchActivity not found");
          const errResponse = CustomError<string>(NOT_FOUND, "BatchActivity not found");
          return reply.status(NOT_FOUND).send(errResponse);
        }
      }
    } catch (error) {
      logger.error("Error in retrieving BatchActivity", error);
      const errorData = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      return reply.status(INTERNAL_ERROR).send(errorData);
    }
  }


  deleteBatch = async (request: FastifyRequest<{ Querystring: {
    batch_id: number
  } }>, reply: FastifyReply) => {
    try {
      const user_details = (request as any).user_details

      if(request.query.batch_id) {
        const appDataSource = await getDataSource();

        const batchRepository = appDataSource.getRepository(Batches);
        const calendarRepository = appDataSource.getRepository(Calendar);
        const batchStudentsRepository = appDataSource.getRepository(StudentBatch);
        const batchActivityRepository = appDataSource.getRepository(BatchActivity);
        const batchTimingRepository = appDataSource.getRepository(BatchesTimings);

        const existingBatch = await batchRepository.findOneBy({
          batch_id: request.query.batch_id
        })
        
        if(existingBatch) {

          const studentExisting = await batchStudentsRepository.createQueryBuilder("batchStudent")
          .leftJoinAndSelect("batchStudent.students", "student")
          .where("batchStudent.batches = :id", { id: existingBatch.batch_id })
          .andWhere("student.status IN (:...statuses)", { statuses: [StudentStatus.ACTIVE,StudentStatus.ACTIVE] })
          .andWhere("batchStudent.status IN (:...studBatchStatus)", { studBatchStatus: [StudentBatchStatus.ACTIVE,StudentBatchStatus.REMOVED] })
          .getMany();
          
          if(studentExisting.length > 0) {
            logger.error("Batch contains Active or removed students")
            const errResponse = CustomError<string>(BAD_REQUEST, "Batch contains Active or removed students");
            return reply.status(BAD_REQUEST).send(errResponse);
          }

          await batchRepository.createQueryBuilder()
                .update(Batches)
                .set({ 
                  status: BatchStatus.EXPIRED
                })
                .where("batch_id = :id", { id: existingBatch.batch_id })
                .execute();

          await batchActivityRepository.createQueryBuilder()
                .delete()
                .from(BatchActivity)
                .where("batch = :id", { id: existingBatch.batch_id })
                .execute();

          await batchTimingRepository.createQueryBuilder()
                .delete()
                .from(BatchesTimings)
                .where("batch = :id", { id: existingBatch.batch_id })
                .execute();

          await calendarRepository.createQueryBuilder("calendar")
                .delete()
                .from(Calendar)
                .where("calendar.batch_id = :id", { id: existingBatch.batch_id })
                .execute();

          await batchStudentsRepository.createQueryBuilder("student_batch")
                .delete()
                .from(StudentBatch)
                .where("student_batch.batch_id = :id", { id: existingBatch.batch_id })
                .execute();
    
          const response = Success<any>("Batch deleted successfully")
          reply.status(SUCCESS_GET).send(response)

          if(user_details) {
            recordAudit("batch deleted", new Date, "batches", user_details.user_id)
          }
        }
        else {
          logger.error("student id is not available")
          const data = CustomError<string>(BAD_REQUEST, "batch is not available");
          reply.status(BAD_REQUEST).send(data);
        }
      }
      else {
        logger.error("student id is not available")
        const data = CustomError<string>(BAD_REQUEST, "batch id is not available");
        reply.status(BAD_REQUEST).send(data);
      }
    }
    catch(error) {
      logger.error(error)
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  }

  getBatchChange = async (request: FastifyRequest<{ Querystring: {
    student_id: number
  } }>, reply: FastifyReply) => {
    try {
      if(request.query.student_id) {
        const appDataSource = await getDataSource();
        const batchHistoryRepository = appDataSource.getRepository(BatchHistory);

        const count = await batchHistoryRepository.createQueryBuilder().getCount();
        const data = await batchHistoryRepository.createQueryBuilder().getMany()

        const response = Success<any>({ metadata: { totalcount: count }, data: [...data] })
        reply.status(SUCCESS_GET).send(response)
      }
      else {
        logger.error(ERROR_COMMON_MESSAGE)
        const data = CustomError<string>(INTERNAL_ERROR, "student id required");
        reply.status(INTERNAL_ERROR).send(data);
      }
    }
    catch(error) {
      logger.error(ERROR_COMMON_MESSAGE)
        const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
        reply.status(INTERNAL_ERROR).send(data);
    }
  }

  deleteBatchActivity = async (request: FastifyRequest<{ Params: { activity_id: number } }>, reply: FastifyReply) => {
    try {
        const activityId = request.params.activity_id;
        if (!activityId) {
            logger.error("Activity ID is not provided");
            const errResponse = CustomError<string>(BAD_REQUEST, "Activity ID is not provided");
            return reply.status(BAD_REQUEST).send(errResponse);
        }

        const appDatasource = await getDataSource();
        const batchActivityRepository = appDatasource.getRepository(BatchActivity);

        const deleteResult = await batchActivityRepository.createQueryBuilder("batch_activity")
            .delete()
            .where("batch_activity.activity_id = :id", { id: activityId })
            .execute();

        if (deleteResult.affected === 0) {
            logger.error("Activity not found");
            const errResponse = CustomError<string>(NOT_FOUND, "Activity not found");
            return reply.status(NOT_FOUND).send(errResponse);
        }

        logger.info("Batch activity deleted successfully");
        const response = Success<any>("Batch activity deleted successfully");
        reply.status(SUCCESS_GET).send(response);
    } catch (error) {
        logger.error("Internal server error while deleting batch activity");
        const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
        reply.status(INTERNAL_ERROR).send(errResponse);
    }
}

   
}