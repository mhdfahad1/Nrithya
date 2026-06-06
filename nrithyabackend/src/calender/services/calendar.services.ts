import { FastifyReply, FastifyRequest } from "fastify";
import { Batches } from "../../batch/entities/batch.entities";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import logger from "../../utils/logger";
import {
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  NOT_FOUND,
  ERROR_COMMON_MESSAGE,
  recordAudit,
  createExcel
} from "../../utils/common";
import { Calendar } from "../../calender/entities/calender.entities";
import { BatchesTimings } from "../../batch/entities/batch.timitings";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";
import { StudentBatchStatus } from "../../student/types/student.batch.enums";
import { StudentStatus } from "../../student/types/student.types";
import { CompensationStudentHistory } from "../../compensation/entities/student.compensation.history.entities";

export class CalendarController {

    getCalendar = async ( request: FastifyRequest< {Body: {dates: Array<{date: Date}>},Querystring:{save?:boolean, teacher_id?: number}}>, reply: FastifyReply ) => {
        try {
            const dateArray = request.body.dates;
            if(dateArray) {
                const appDataSource = await getDataSource();
                const calendarRepository = appDataSource.getRepository(Calendar);
                const batchesRepository = appDataSource.getRepository(Batches);
                const studentBatchRepository = appDataSource.getRepository(StudentBatch);
                const batchesQueryBuilder = batchesRepository.createQueryBuilder("batches").leftJoinAndSelect("batches.teachers", "teachers")
                const batches = await batchesQueryBuilder.getMany();
                const ids = [];
                if(request.query.teacher_id) {
                    const teacher_batch = await batchesRepository.createQueryBuilder("batches").where("batches.teacher_id = :teacher_id", { teacher_id: request.query.teacher_id }).getMany();
                    for(let j in teacher_batch) {
                        const batch = teacher_batch[j];
                        ids.push(batch.batch_id);
                    }
                } 
                const resArray = []
                for (const i in dateArray) {
                    const date = dateArray[i]
                    // Create new query builder for each date to avoid condition overlap
                    const dateQueryBuilder = calendarRepository.createQueryBuilder("calendar")
                        .leftJoinAndSelect("calendar.batches", "batch");
                    
                    if(request.query.teacher_id) {
                        dateQueryBuilder.where('calendar.batch_id IN (:...ids)', { ids: ids.length > 0? ids: [0] })
                    }
                    
                    // Add date condition
                    const calendarEntries = await dateQueryBuilder
                        .andWhere("calendar.date = :date", { date: date.date })
                        .getMany();
                        
                    resArray.push(calendarEntries);
                }     
                resArray.forEach(innerArray => {
                    innerArray.sort((a, b) => {
                        const timeA = a.start_time;
                        const timeB = b.start_time;
                        if (timeA < timeB) return -1;
                        if (timeA > timeB) return 1;
                        return 0;
                    });
                });
                  
                for (const i in resArray) {
                    const calendars = resArray[i]
                    for (const batch in batches) {
                        const currentBatch = batches[batch];
                        for (const calendar in calendars) {
                            const currentCalendar = calendars[calendar];
                            if(currentCalendar.batches.batch_id === currentBatch.batch_id) {
                                // Create fresh query builder for student count
                                const regularStudents = await studentBatchRepository.createQueryBuilder("student_batch")
                                    .leftJoinAndSelect("student_batch.students", "students")
                                    .select("DISTINCT student_batch.student_id", "student_id")
                                    .where("student_batch.batch_id = :batch_id", {batch_id: currentBatch.batch_id})
                                    .andWhere("student_batch.status = :status", {status: StudentBatchStatus.ACTIVE})
                                    .andWhere("students.status = :studentStatus", {studentStatus: StudentStatus.ACTIVE})
                                    .getRawMany();

                                const regularStudentsCount = regularStudents.length;

                                // Create fresh query for compensation students
                                const compensationStudents = await appDataSource.getRepository(CompensationStudentHistory)
                                    .createQueryBuilder("compensation")
                                    .select("DISTINCT compensation.student_id", "student_id")
                                    .where("compensation.new_batch = :batchId", { batchId: currentBatch.batch_id })
                                    .andWhere("compensation.new_date = :date", { date: currentCalendar.date })
                                    .getRawMany();

                                const compensationStudentsCount = compensationStudents.length;

                                // Set total current strength for this specific calendar entry
                                currentCalendar.batches = {
                                    ...currentBatch,
                                    current_strength: regularStudentsCount + compensationStudentsCount
                                };
                            }
                        }
                    }
                }
                if(dateArray.length == 1){
                    if(request.query.save){
                        const data: any[] = [];
                        const [batchScheduled] = resArray;
                        // converting to 12 hours
                        function convertTo12HourFormat(time: string): string {
                            const [hours, minutes] = time.split(':').map(Number);
                            const date = new Date();
                            date.setHours(hours, minutes);
                            return date.toLocaleTimeString([], { hour12: true });
                        }

                        for (let i in batchScheduled){
                            const batch = batchScheduled[i];
                            const batchName = batch.batches.batch_name;
                            const startTime = convertTo12HourFormat(batch.start_time);
                            const endTime = convertTo12HourFormat(batch.end_time);
                            const whatsappLink = batch.batches.whatsapp_link;
                            const batchArr = [
                                batchName,
                                startTime,
                                endTime,
                                whatsappLink,
                            ];

                            data.push(batchArr);
                        }                        
                        const book = await createExcel(["Batch Name","Start Time","End Time","Whatsapp Link"], data);
                        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        reply.header('Content-Disposition', 'attachment; filename="Scheduled-classes.xlsx"');
                                
                        const file_buffer = await book.xlsx.writeBuffer();
                        return reply.send(file_buffer);
                    }
                }
                const response = Success<any>(resArray)
                reply.status(SUCCESS_GET).send(response) 
            }
            else {
                const errResponse = CustomError<string>(BAD_REQUEST, "date is required")
                reply.status(BAD_REQUEST).send(errResponse)
            }   
        }
        catch( error ) {
            logger.error("Internal server error",error);
            const errorResponse = CustomError<string>( INTERNAL_ERROR, ERROR_COMMON_MESSAGE );
            reply.status( INTERNAL_ERROR ).send( errorResponse );
        }
    }

    getSpecificCalendar = async ( request: FastifyRequest<{ Params: { calendar_id: number } }>, reply: FastifyReply ) => {
        try {
            const appDataSource = await getDataSource();
            const calendatRepository = appDataSource.getRepository(Calendar)
            const calendar = await calendatRepository.createQueryBuilder('calendar').leftJoinAndSelect("calendar.batches", "batches").where('calendar.calendar_id = :calendar_id', { calendar_id: request.params.calendar_id }).getOne();
            if (calendar) {
                const batchRepository = appDataSource.getRepository(Batches);
                const batch = await batchRepository.createQueryBuilder("batches")
                    .leftJoinAndSelect("batches.courses", "course")
                    .leftJoinAndSelect("batches.teachers", "teacher")
                    .where("batches.batch_id = :batch_id", { batch_id: calendar.batches.batch_id }).getOne();
                if(batch) {
                    const response = { ...calendar }
                    response.batches = { ...batch }
                    const resObj = Success<any>(response)
                    reply.status(SUCCESS_GET).send(resObj) 
                }
                else {
                    const errResponse = CustomError<string>( NOT_FOUND, "batch not found" );
                    reply.status( NOT_FOUND ).send( errResponse );
                }
            }
            else {
                const errorResponse = CustomError<string>( BAD_REQUEST, "Invalid calendar id" );
                reply.status( INTERNAL_ERROR ).send( errorResponse );
            }
        }
        catch( error ) {
            logger.error("Internal server error");
            const errorResponse = CustomError<string>( INTERNAL_ERROR, ERROR_COMMON_MESSAGE );
            reply.status( INTERNAL_ERROR ).send( errorResponse );
        }
    }

    populateCalendar = async () => {

        try {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const appDataSource = await getDataSource();
            const calendarRepository = appDataSource.getRepository(Calendar);
            const batchTimingsRepository = appDataSource.getRepository(BatchesTimings)
            const batchRepository = appDataSource.getRepository(Batches);
            const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance);

            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 7);            

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 8);
        
            const batches = await batchRepository.createQueryBuilder("batches")
            .where("batches.status = :status", { status: "ongoing" })
            .getMany();            

            for(let i in batches) {
                const batch = batches[i];

                const batchTimings = await batchTimingsRepository.createQueryBuilder("batch_timings")
                .where("batch_timings.batch_id=:batch_id", { batch_id: batch.batch_id })
                .getMany();

                const normalizeDate = (date:Date) => {
                    const normalized = new Date(date);
                    normalized.setHours(0, 0, 0, 0);
                    return normalized;
                };

                let normalizedBatchStarted = normalizeDate(new Date(batch.batch_started));
                let normalizedPastDate = normalizeDate(pastDate);
                
                let today = normalizedBatchStarted < normalizedPastDate ? normalizedPastDate : normalizedBatchStarted;

                // if their is attendace marked for the batch then use today onwards populate calendar
                const attendance = await studentAttendanceRepository.createQueryBuilder("student_attendance")
                .where("student_attendance.batch = :batch_id", { batch_id: batch.batch_id })
                .getOne();
            
                today = attendance ? new Date() : today;            
                
                while(today <= futureDate) {
                    for(let j in batchTimings) {
                        const timing = batchTimings[j];
                        const calendarPast = await calendarRepository.createQueryBuilder("calendar")
                        .where("calendar.batch_id=:batch_id", {batch_id: batch.batch_id})
                        .andWhere("calendar.date=:date", {date: today})
                        .andWhere("calendar.start_time=:start_time", {start_time: timing.start_time})
                        .andWhere("calendar.end_time=:end_time", {end_time: timing.end_time})
                        .getOne();
                        
                        if(!calendarPast) {
                            const calendar = new Calendar();
                            if(timing.day == days[today.getDay()]){
                                calendar.date = today;
                                calendar.start_time = timing.start_time;
                                calendar.end_time = timing.end_time;
                                calendar.batches = batch;
                                calendar.compensated = false;
                                await calendarRepository.save(calendar)
                            }
                        }   
                    }
                    today.setDate(today.getDate() + 1)
                }
            }

            await calendarRepository.createQueryBuilder()
                    .delete()
                    .from(Calendar)
                    .where("date = :date", { date: pastDate})
                    .execute();
                    
            logger.info("calendar updated successfully")
        }
        catch( error ) {
            logger.error("Internal server error");
        }
    }

    updateCalendar = async ( request: FastifyRequest<{ Body: { 
        calendar_id: number;
        date?: Date;
        start_time?: string;
        end_time?: string;
     } }>, reply: FastifyReply ) => {
        try {
            const updateBody = request.body;
            if(updateBody.calendar_id) {
                const appDatasourse = await getDataSource();
                const calendarRepository = appDatasourse.getRepository(Calendar);
                const existingCalendar = await calendarRepository.findOneBy({
                    calendar_id: updateBody.calendar_id
                })
                if(existingCalendar) {
                    await calendarRepository
                        .createQueryBuilder()
                        .update(Calendar)
                        .set({ 
                            date: updateBody.date? updateBody.date: existingCalendar.date,
                            start_time: updateBody.start_time? updateBody.start_time: existingCalendar.start_time,
                            end_time: updateBody.end_time? updateBody.end_time: existingCalendar.end_time
                        })
                        .where("calendar_id = :id", { calid: updateBody.calendar_id })
                        .execute();
                        logger.info(`calendar data updated successfully`);
                        const response = Success<string>("calendar data updated")
                        reply.status(SUCCESS_GET).send(response)
                }
                else {
                    logger.error(`Calendar not found`);
                    const errResponse = CustomError<string>(NOT_FOUND, "Calendar not found");
                    reply.status(NOT_FOUND).send(errResponse);
                }
            }
            else {
                logger.error(`Internal server error while updating `);
                const errResponse = CustomError<string>(BAD_REQUEST, "calendar id is not provided")
                reply.status(BAD_REQUEST).send(errResponse)
            }
        }
        catch(error) {
            logger.error("Internal server error");
            const errorResponse = CustomError<string>( INTERNAL_ERROR, ERROR_COMMON_MESSAGE );
            reply.status( INTERNAL_ERROR ).send( errorResponse );
        }
    }

    deleteCalendar = async ( request: FastifyRequest<{ Querystring: { 
        cal_id: number
    } }>, reply: FastifyReply ) => {
        const user_details = (request as any).user_details;
        try {
            if(request.query.cal_id) {
                const appDataSource = await getDataSource();
                const calendarRepository = appDataSource.getRepository(Calendar);
                const existingCalendar = await calendarRepository.findOneBy({
                    calendar_id: request.query.cal_id
                })

                if(existingCalendar) {
                    await calendarRepository.createQueryBuilder()
                    .delete()
                    .from(Calendar)
                    .where('calendar_id = :id', { id: request.query.cal_id })
                    .execute();

                    const response = Success<any>("calendar deleted")
                    reply.status(SUCCESS_GET).send(response);

                    if(user_details) {
                        recordAudit("calendar deleted", new Date, "calendar", user_details.user_id)
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
                const errResponse = CustomError<string>(BAD_REQUEST, "calendar id not provided");
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