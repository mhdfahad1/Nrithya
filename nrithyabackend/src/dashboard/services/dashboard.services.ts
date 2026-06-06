import { FastifyReply, FastifyRequest } from "fastify";
import { CustomError, Success } from "../../utils/response";
import logger from "../../utils/logger";
import { BAD_REQUEST, ERROR_COMMON_MESSAGE, INTERNAL_ERROR, SUCCESS_GET } from "../../utils/common";
import { getDataSource } from "../../utils/data-source";
import { Students } from "../../student/entities/students.entities";
import { Between } from "typeorm";
import { Payments } from "../../fee/entities/fee.entities";
import { Courses } from "../../course/entities/course.entities";
import { Batches } from "../../batch/entities/batch.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { TeacherAttendance } from "../../attendance/entities/teacher.attendance.entities";
import { BatchesTimings } from "../../batch/entities/batch.timitings";
import { Enquiries } from "../../enquiries/entities/enquiries.entities";
import { EnquiryType } from "../../enquiries/entities/enquirytype.entities";
import { Calendar } from "../../calender/entities/calender.entities";
import { StudentBatchStatus } from "../../student/types/student.batch.enums";

export class DashboardControllers{

    getEnquiryStats= async (request:FastifyRequest<{Querystring:{from:Date, to:Date}}>,reply:FastifyReply) => {
        try {
            if(request.query.from && request.query.to) {
                const startDate:Date = new Date(request.query.from);
                const endDate:Date = new Date(request.query.to);
                if(endDate >= startDate){
                    const appDataSource = await getDataSource();
                    const enquiryRepository = appDataSource.getRepository(Enquiries);
                    const enquiryTypeRepository = appDataSource.getRepository(EnquiryType);
                    const enquiryQueryBuilder =  enquiryRepository.createQueryBuilder('enquiries');
                    const enquiryTypeQueryBuilder = enquiryTypeRepository.createQueryBuilder("enquiry_types").andWhere("enquiry_types.is_active = :status", { status: true });
                    
                    // ENQUIRY STATS    
                    // Retrieving total count of enquiries between the date range
                    const totalEnquiry = await enquiryRepository.count({
                        where:{
                            enq_date: Between(startDate, endDate)
                        },
                    });
                    let enqConverionPercent;
                    let enquiryConverion;
                    if(totalEnquiry > 0){
                        // Retrieving converted count of enquiries between the date range
                        enquiryQueryBuilder.where('enquiries.enq_date BETWEEN :startDate AND :endDate',{startDate, endDate});
                        enquiryQueryBuilder.andWhere('enquiries.enq_status =:enq_status',{enq_status:'won'});
                        enquiryConverion = await enquiryQueryBuilder.getCount();
    
                        enqConverionPercent = (enquiryConverion / totalEnquiry) * 100;
                    } else{
                        enqConverionPercent = 0;
                    }
                
                    // DEMO REQUEST STATS
                    enquiryQueryBuilder.where('enquiries.enq_date BETWEEN :startDate AND :endDate',{startDate, endDate});
                    enquiryQueryBuilder.andWhere('enquiries.demo_requested =:demo_requested',{demo_requested: true});
                    const totalDemoRequested = await enquiryQueryBuilder.getCount();

                    let demoConversionPercent;
                    let demoConversion;
                    let demo_percentage;
                    if(totalDemoRequested > 0){
                        enquiryQueryBuilder.where('enquiries.enq_date BETWEEN :startDate AND :endDate',{startDate, endDate});
                        enquiryQueryBuilder.andWhere('enquiries.demo_requested =:demo_requested',{demo_requested: true});
                        enquiryQueryBuilder.andWhere('enquiries.enq_status =:enq_status',{enq_status:'won'});
                        demoConversion = await enquiryQueryBuilder.getCount();
    
                        demoConversionPercent = (demoConversion / totalDemoRequested) * 100;
                        demo_percentage = (totalDemoRequested / totalEnquiry) * 100;
                    } else{
                        demoConversionPercent = 0;
                    }

                    // ENQUIRY TYPES STATS
                    let enquiryTypes: any = [];
                    const enquiryTypeDatas = await enquiryTypeQueryBuilder.getMany();

                    for(let i in enquiryTypeDatas){
                        const enquiryType = enquiryTypeDatas[i];
                        
                        const enquiryTypeName = enquiryType.enq_type;
                        const enquiryTypeId = enquiryType.enq_type_id;
                        enquiryQueryBuilder.where('enquiries.enq_date BETWEEN :startDate AND :endDate',{startDate, endDate});
                        enquiryQueryBuilder.andWhere('enquiries.enq_type_id = :enq_type_id', { enq_type_id: enquiryTypeId});
                        const totalCount = await enquiryQueryBuilder.getCount();
                        
                        let obj ={ enquiryTypeId, enquiryTypeName, totalCount };                        
                        enquiryTypes.push(obj);
                    }
                    enquiryTypes.sort((a:any, b:any) => b.totalCount - a.totalCount);

                    const resObj = {
                        total_enquiry: totalEnquiry,

                        converted_enquiry: enquiryConverion,
                        enquiry_conversion_percentage: enqConverionPercent,

                        total_demo_requested: totalDemoRequested,
                        demo_percentage:demo_percentage,
                        
                        converted_demo_requested: demoConversion,
                        demo_conversion_percentage: demoConversionPercent,
                        
                        enquiry_types: enquiryTypes
                    }

                    logger.info("Enquiry stats listed successfully");
                    const response = Success<any>(resObj);
                    reply.status(SUCCESS_GET).send(response);
                } else{
                    logger.error("Invalid date!");
                    const errResponse = CustomError<string>(BAD_REQUEST,"Invalid date!");
                    reply.status(BAD_REQUEST).send(errResponse);
                }
            } else{
                logger.error("Start & end date are compulsory!");
                const errResponse = CustomError<string>(BAD_REQUEST,"Start & end date are compulsory!");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    newStudentsstats = async (request:FastifyRequest<{ Querystring: {
        to: Date,
        from: Date
    } }>,reply:FastifyReply) => {
        try {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const queryData = request.query;

            if(queryData.from && queryData.to) {

                const appDataSource = await getDataSource();
                const studentRepository = appDataSource.getRepository(Students)

                const toDate = new Date(queryData.to);
                const fromDate = new Date(queryData.from);

                const fromMonth = fromDate.getMonth();
                const toMonth = toDate.getMonth();

                const fromYear = fromDate.getFullYear();
                const toYear = toDate.getFullYear();
                if(fromYear<=toYear) {
                    const dates:any = []

                    for(let i=fromYear; i<=toYear; i++) {
                        for(let j = i==fromYear? fromMonth: 0; j <= (i==toYear? toMonth: 11); j++) {
                            const count = await studentRepository.count({
                                where: {
                                    registration_date: Between(new Date(i, j, 0), new Date(i, j+1, 0))
                                }
                            })
                            const obj = {
                                month: months[j],
                                year: i,
                                students: count
                            }
                            dates.push(obj)
                        }
                    }

                    const response = Success<any>(dates)
                    return reply.status(SUCCESS_GET).send(response)
                }
                else{
                    logger.error(`Internal server error`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Invalid date range");
                    return reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                const errResponse = CustomError<string>(BAD_REQUEST, "invalid request");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    revenueGrowth = async (request:FastifyRequest<{ Querystring: {
        to: Date,
        from: Date
    } }>,reply:FastifyReply) => {
        try {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const queryData = request.query;

            if(queryData.from && queryData.to) {

                const appDataSource = await getDataSource();
                const paymentRepository = appDataSource.getRepository(Payments)

                const toDate = new Date(queryData.to);
                const fromDate = new Date(queryData.from);

                const fromMonth = fromDate.getMonth();
                const toMonth = toDate.getMonth();

                const fromYear = fromDate.getFullYear();
                const toYear = toDate.getFullYear();
                if(fromYear<=toYear) {
                    const dates:any = []

                    for(let i=fromYear; i<=toYear; i++) {
                        for(let j = i==fromYear? fromMonth: 0; j <= (i==toYear? toMonth: 11); j++) {
                            const count = await paymentRepository.createQueryBuilder("payments").where(
                                "payments.paid_date BETWEEN :startDate AND :endDate", { startDate:  new Date(i, j, 0), endDate: new Date(i, j+1, 0)}
                            ).andWhere("payments.status=:status", { status: true }).getMany()
                            let sum = 0;
                            for(let i in count) {
                                const payment = count[i]
                                sum += payment.amount
                            }
                            const obj = {
                                month: months[j],
                                year: i,
                                revenue: sum
                            }
                            dates.push(obj)
                        }
                    }

                    const response = Success<any>(dates)
                    return reply.status(SUCCESS_GET).send(response)
                }
                else{
                    logger.error(`Internal server error`);
                    const errResponse = CustomError<string>(BAD_REQUEST, "Invalid date range");
                    return reply.status(BAD_REQUEST).send(errResponse);
                }
            }
            else {
                const errResponse = CustomError<string>(BAD_REQUEST, "invalid request");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }


    courseAndStudents = async (request:FastifyRequest<{ Querystring: {
        to: Date,
        from: Date
    } }>,reply:FastifyReply) => {
        try {
            const appDataSource = await getDataSource();
            const courseRepository = appDataSource.getRepository(Courses);
            const batchRepository = appDataSource.getRepository(Batches)
            const studentBatchRepository = appDataSource.getRepository(StudentBatch)

            const courses = await courseRepository.find()

            const data: any = []

            for(let i in courses) {
                const course = courses[i]
                const batches = await batchRepository.createQueryBuilder("batches").where("batches.course_id = :id", { id: course.course_id }).getMany();
                let noOfstudents = 0

                for(const i in batches) {
                    const batch = batches[i];
                    noOfstudents += await studentBatchRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:batch_id", { batch_id: batch.batch_id }).getCount();
                }
                const obj = {
                    course_name: course.course_name,
                    no_of_students: noOfstudents
                }
                data.push(obj)
            }
            data.sort((a:any, b:any) => b.no_of_students - a.no_of_students);

            const response = Success<any>(data)
            return reply.status(SUCCESS_GET).send(response)
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    teacherWiserevenue = async (request:FastifyRequest<{ Querystring: {
        to: Date,
        from: Date
    } }>,reply:FastifyReply) => {
        try {
            if(request.query.to && request.query.from) {

                const appDataSource = await getDataSource();
                const teacherRepository = appDataSource.getRepository(Teachers);
                const batchRepository = appDataSource.getRepository(Batches);
                const paymentRepository = appDataSource.getRepository(Payments)
                const studentBatchRepository = appDataSource.getRepository(StudentBatch);
                const calendarRepository = appDataSource.getRepository(Calendar);

                const teachers = await teacherRepository.createQueryBuilder().getMany();

                const teacherIds: any[] = [];

                for (const i in teachers) {
                    const teacher = teachers[i];
                    const obj: any = {
                        teacher_id: teacher.teacher_id,
                        first_name: teacher.first_name,
                        last_name: teacher.last_name,
                    }
                    teacherIds.push(obj)
                }

                for (const i in teacherIds) {
                    const teacher = (teacherIds[i] as any);
                    const batches = await batchRepository.createQueryBuilder("batches").where("batches.teacher_id = :id", { id: teacher.teacher_id }).getMany();
                    let sum = 0;
                    let strength = 0;
                    let hours = 0;
                    for(const j in batches) {
                        const batch = batches[j];
                        strength += await studentBatchRepository.createQueryBuilder("student_batch")
                            .where("student_batch.batch_id=:id", {id: batch.batch_id})
                            .andWhere("student_batch.joining_date <= :endDate", { endDate: request.query.to })
                            .getCount();
                        const payments = await paymentRepository.createQueryBuilder("payment").where("payment.status = :status", { status:true }).andWhere("payment.batch_id=:id", { id: batch.batch_id }).andWhere("payment.paid_date BETWEEN :startDate AND :endDate", { startDate:  request.query.from, endDate: request.query.to}).getMany();
                        payments.forEach(payment => {
                            sum += payment.amount
                        })

                        const today = new Date();
                        const pastWeek = new Date(today);
                        pastWeek.setDate(today.getDate() - 7);

                        while(pastWeek <= today) {
                            let year = pastWeek.getFullYear();
                            let month = (pastWeek.getMonth() + 1).toString().padStart(2, '0');
                            let day = pastWeek.getDate().toString().padStart(2, '0');
                            let formattedDate = year + '-' + month + '-' + day;
                            const workDates = await calendarRepository.createQueryBuilder("calendar").where("calendar.date = :date", { date: formattedDate }).andWhere("calendar.batch_id = :batch_id", { batch_id: batch.batch_id }).getMany()
                            if(workDates.length > 0) {
                                for (const k in workDates) {
                                    const workDate = workDates[k]
                                    const start_time = parseInt(workDate.start_time[0] + workDate.start_time[1]);
                                    const end_time = parseInt(workDate.end_time[0] + workDate.end_time[1]);
                                    if(end_time > start_time) {
                                        const diff = end_time - start_time;
                                        hours += diff;
                                    }
                                }
                            }
                            pastWeek.setDate(pastWeek.getDate() + 1);                      
                        }
                    }
                    teacher.revenue = sum
                    teacher.students = strength;
                    teacher.working_hours = hours;
                }

                const response = Success<any>(teacherIds);
                return reply.status(SUCCESS_GET).send(response)
            }
            else {
                const errResponse = CustomError<string>(BAD_REQUEST, "invalid request");
                reply.status(BAD_REQUEST).send(errResponse);
            }           
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }
}