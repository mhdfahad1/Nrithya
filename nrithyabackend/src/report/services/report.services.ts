import { FastifyReply, FastifyRequest } from "fastify";
import { BAD_REQUEST, createExcel, ERROR_COMMON_MESSAGE, INTERNAL_ERROR, NOT_FOUND, SUCCESS_GET } from "../../utils/common";
import { getDataSource } from "../../utils/data-source";
import { FeeController } from "../../fee/services/fee.services";
import { StudentSearch, StudentStatus } from "../../student/types/student.types";
import StudentController from "../../student/services/student.services";
import { StudentAssignments } from "../../assignment/entities/students.assignment.entities";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";
import { TeacherControllers } from "../../teacher/services/teacher.service";
import { TeacherSearch } from "../../teacher/types/teacher.types";
import { CustomError, Success } from "../../utils/response";
import logger from "../../utils/logger";
import { EnquiriesControllers } from "../../enquiries/services/enquiries.services";
import { EnquirySearch } from "../../enquiries/types/enquiries.types";
import { AttendanceController } from "../../attendance/services/attendance.services";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { TeacherAttendance } from "../../attendance/entities/teacher.attendance.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { BatchAssignments } from "../../assignment/entities/batches.assignments.entities";
import { level } from "winston";

export class ReportControllers{
    getFeeUnpaid= async (request:FastifyRequest<{Querystring: { 
        status?: boolean
        limit?: number
        page?: number
        batch_id?: number
        student_name?: string
        download: boolean
        save?:boolean
    }}>,reply:FastifyReply) => {
        const feeRoute = new FeeController();
        request.query.download = true;
        const feeData = await feeRoute.listFee(request,reply);
        const data: any[] = []
        const downloadata: any[] = []
        
        if(feeData) {
            feeData.data.map((payment) => {
                const row = []
                row.push(payment.students.reg_no)
                row.push(payment.students.first_name)
                row.push(payment.students.last_name)
                row.push(payment.students.gender)
                row.push(payment.students.whatsapp_number)
                row.push(payment.students.alternative_number)
                row.push(payment.batches.batch_name)
                row.push(payment.batches.whatsapp_link)
                row.push(payment.amount)
                row.push(payment.due_date)
                row.push(payment.bank?payment.bank.bank_name:"")
                row.push(payment.bank?payment.bank.account_number:"")
                row.push(payment.payment_receipt_url)
                row.push(payment.remarks)
                data.push(row)
            })            
            data.sort((a, b) => {
                const dateA = new Date(a[9]);
                const dateB = new Date(b[9]);
                return dateA.getTime() - dateB.getTime();
            })
            feeData.data.map((payments):void => {
                downloadata.push({
                    reg_no: payments.students.reg_no,
                    first_name: payments.students.first_name,
                    last_name: payments.students.last_name,
                    gender: payments.students.gender,
                    whatsapp_number: payments.students.whatsapp_number,
                    alternative_number: payments.students.alternative_number,
                    batch_name: payments.batches.batch_name,
                    whatsapp_link: payments.batches.whatsapp_link,
                    amount: payments.amount,
                    due_date: payments.due_date,
                })
            })
        }

        if(request.query.save) {
            const book = await createExcel(["Reg No.", "First Name", "Last Name", "Gender", "Whatsapp Number", "Alternative Number", "Batch Name", "Whatsapp Link", "Amount", "Due Date", "Bank name", "Account number", "Paid receipt url", "Remarks"], data);
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            reply.header('Content-Disposition', 'attachment; filename="feepayment.xlsx"');

            const file_buffer = await book.xlsx.writeBuffer();
            reply.send(file_buffer);
        }
        else {
            const response = Success<any>({ metadata: { totalcount: feeData?.count }, data: [...downloadata] })
            return reply.status(SUCCESS_GET).send(response)
        }
    }


    studentPerformance = async (request:FastifyRequest<{Querystring: StudentSearch}>,reply:FastifyReply) => {
        try {
            const studentRoute = new StudentController();
            if(request.query.performance) {
                request.query.pagenation = "none";
            }
            request.query.status = StudentStatus.ACTIVE;
            request.query.download = true;

            const appDataSource = await getDataSource();
            const studentBatchRepository = appDataSource.getRepository(StudentBatch)
            const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance);
            const studentAssignmentRepository = appDataSource.getRepository(StudentAssignments);
            const batchAssignmentRepository = appDataSource.getRepository(BatchAssignments);

            const objs= await studentRoute.listStudents(request, reply);

            const data: any[] = []
            const downloadata: any[] = [];
            if(objs) {
                if(objs.students) {
                    for(let i in objs.students) {
                        const student = objs.students[i];
                        const batches = await studentBatchRepository.createQueryBuilder("student_batch").where("student_batch.student_id=:student_id", {student_id: student.student_id}).leftJoinAndSelect("student_batch.batches", "batches").getMany();
                        const ids: any = [];
                        batches.forEach((batch:any) => {
                            ids.push(batch.batches.batch_id)
                        })
                        const batchAssignments = await batchAssignmentRepository.createQueryBuilder("batch_assignments").where('batch_assignments.batch_id IN (:...ids)', { ids: ids.length>0? ids:[0] }).getMany();
                        const batchAssignmentId: any = [];
                        batchAssignments.forEach((assignment)=> {
                            batchAssignmentId.push(assignment.id);
                        })
                        const total = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", {student_id: student.student_id}).andWhere('student_attendance.batch_id IN (:...ids)', { ids: ids.length>0? ids:[0] }).getCount()
                        const attended = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", {student_id: student.student_id}).andWhere("student_attendance.attended=:attended", {attended: true}).andWhere('student_attendance.batch_id IN (:...ids)', { ids: ids.length>0? ids:[0] }).getCount()
                        const assignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", {student_id: student.student_id}).andWhere('student_assignments.batch_assignments_id IN (:...ids)', { ids: batchAssignmentId.length>0? batchAssignmentId:[0] }).getCount();
                        const trueassignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", {student_id: student.student_id}).andWhere("student_assignments.status=:status", {status: true}).andWhere('student_assignments.batch_assignments_id IN (:...ids)', { ids: batchAssignmentId.length>0? batchAssignmentId:[0] }).getCount();
                        const leaves = total - attended;
                        const attendace_percent = parseFloat(String(student.attendance)).toFixed(2);
                        const assignment_percent = parseFloat(String(student.assignment)).toFixed(2);
                        const obj = [
                            student.reg_no,
                            student.first_name,
                            student.last_name,
                            student.gender,
                            student.level,
                            total,
                            attended,
                            leaves,
                            attendace_percent,
                            assignments,
                            trueassignments,
                            assignment_percent,
                            student.performance
                        ]
                        const downloadobj = {
                            reg_no: student.reg_no,
                            first_name: student.first_name,
                            last_name: student.last_name,
                            gender: student.gender,
                            level: student.level,
                            total: total,
                            attended: attended,
                            leaves: leaves,
                            attendace_percent: attendace_percent,
                            assignments: assignments,
                            trueassignments: trueassignments,
                            assignment_percent: assignment_percent,
                            performance: student.performance
                        }
            
                        downloadata.push(downloadobj)
                        data.push(obj)
                    }
                }
            }
            
            if(request.query.save){
                const book = await createExcel(["Reg No.", "First Name", "Last Name", "Gender", "Level", "Total Classes", "Attended", "Leaves", "Attendance Percentage", "Total Assignments", "Submitted Assignments", "Assignment Percentage", "Performance"], data);

                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                reply.header('Content-Disposition', 'attachment; filename="studentperformance.xlsx"');

                const file_buffer = await book.xlsx.writeBuffer();
                reply.send(file_buffer);
            }
            else {
                const response = Success<any>({ metadata: { totalcount: objs?.count }, data: [...downloadata] })
                return reply.status(SUCCESS_GET).send(response)
            }
        }
        catch(error) {
            logger.error(ERROR_COMMON_MESSAGE)
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    teacherReportDownload = async (request:FastifyRequest<{Querystring:TeacherSearch}>,reply:FastifyReply) => {
        try {
            request.query.download = true;
            const teacherControllers = new TeacherControllers();
            const teacherDatas = await teacherControllers.getAllTeacher(request,reply);
            const teachers =teacherDatas.data;
            
            const data: any[] = [];
            const viewData: any[] = [];

            for (let i in teachers) {
                const teacherData = teachers[i];
                let teacherCourses: string[] = [];

                let teacher : any = {
                    first_name: teacherData.first_name,
                    last_name: teacherData.last_name,
                    whatsapp_number: teacherData.whatsapp_number,
                    coursesAndBatches: []
                };
            
                const coursesAndBatches = teacherData.coursesAndBatches;
                for (let j in coursesAndBatches) {
                    const courseBatchData = coursesAndBatches[j];
                    let courseBatches: string[] = [];

                    let course : any = {
                        courseName: courseBatchData.course_name,
                        batch: []
                    };
                
                    const batches = courseBatchData.batches;
                    for (let k in batches) {
                        const batchesData = batches[k];
                        courseBatches.push(batchesData.batch_name);
                        course.batch.push(batchesData.batch_name);
                    }

                    teacher.coursesAndBatches.push(course);
                    // Concatenate course name with its batches
                    teacherCourses.push(`${courseBatchData.course_name}- ${courseBatches.join(', ')}`);
                }
            
                // Push teacher's data as an array
                data.push([
                    teacherData.first_name,
                    teacherData.last_name,
                    teacherData.whatsapp_number,
                    teacherCourses.join('; ')
                ]);

                viewData.push(teacher);
            }        

            if(request.query.save){
                const book = await createExcel(["First Name","Last Name","Whatsapp Number","Courses-Batches"], data);

                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                reply.header('Content-Disposition', 'attachment; filename="tecaherList.xlsx"');

                const file_buffer = await book.xlsx.writeBuffer();
                reply.send(file_buffer);
            }
            else {
                const response = Success<any>({ metadata: { totalcount: teacherDatas?.metadata.total_count }, data: [...viewData] })
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE);
            const errResponse = CustomError<string>(BAD_REQUEST,ERROR_COMMON_MESSAGE);
            return reply.status(BAD_REQUEST).send(errResponse);
        }
    }
    

    enquiryReportDownload = async (request:FastifyRequest<{Querystring:EnquirySearch}>,reply:FastifyReply) => {
        try {
            request.query.download = true;
            const enquiriesControllers = new EnquiriesControllers();
            const enquiryDatas = await enquiriesControllers.listAllEnquiry(request, reply);

            const data: any[] = [];
            const viewData: any[] = [];
            const enquiries = enquiryDatas.data;
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
                const enqViewData = [{
                    name: enquiry.name,
                    contact_number: enquiry.contact_number,
                    enquiry_date: enquiry.enq_date,
                    enquiry_status: enquiry.enq_status,
                    demo_requested: enquiry.demo_requested,
                    last_call: enquiry.last_call,
                    follow_up: enquiry.follow_up,
                    course_name: courseName,
                    enquiry_type: enqType,
                    assignee: fullName,
                }]
                data.push(enqData);       
                viewData.push(...enqViewData);  
            }
            if(request.query.save){
                const book = await createExcel(["Name", "Contact Number","Enquiry Date","Enquiry Status","Remarks","Demo Requested","Last Call Date","Follow-up Date","Course Name","Enquiry Type","Assignee Name"], data);

                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                reply.header('Content-Disposition', 'attachment; filename="enquiryList.xlsx"');

                const file_buffer = await book.xlsx.writeBuffer();
                reply.send(file_buffer);
            }
            else {
                const response = Success<any>({ metadata: { totalcount: enquiryDatas?.metadata.total_count }, data: [...viewData] })
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE);
            const errResponse = CustomError<string>(BAD_REQUEST,ERROR_COMMON_MESSAGE);
            return reply.status(BAD_REQUEST).send(errResponse);
        }
    }

    studentsAttendancereport = async (request: FastifyRequest<{ Querystring: { page?: number, limit?: number, from?: Date, to?: Date, download: boolean, save: boolean } }>, reply: FastifyReply) => {
        try {
            const AttendanceControllers = new AttendanceController();
            request.query.download = true;
    
            const studentAttendances = await AttendanceControllers.listStudentAttendaceReport(request, reply);
    
            if (!studentAttendances) {
                const errorMessage = "No student attendance data found.";
                const errorResponse = CustomError<string>(NOT_FOUND, errorMessage);
                return reply.status(NOT_FOUND).send(errorResponse);
            }
    
            const data: any[] = [];
            const downloadata: any[] = [];
    
            studentAttendances.data.forEach(detail => {
                const row = [
                    detail.name,
                    detail.whatsapp_number,
                    detail.Total_classes,
                    detail.attended,
                    detail.percentage
                ];
                data.push(row);
    
                downloadata.push({
                    id:detail.id,
                    name: detail.name,
                    whatsapp_number: detail.whatsapp_number,
                    total_attendance: detail.Total_classes,
                    attendance: detail.attended,
                    percentage: detail.percentage
                });
            });
    
            if (request.query.save) {
                const book = await createExcel(["Name", "Whatsapp Number", "Total Attendance", "Attendance", "Percentage"], data);
                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                reply.header('Content-Disposition', 'attachment; filename="studenetattendace.xlsx"');
    
                const file_buffer = await book.xlsx.writeBuffer();
                reply.send(file_buffer);
            } else {
                const response = Success<any>({ metadata: { totalcount: studentAttendances.count }, data: downloadata });
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            return reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    };
    teacherAttendancereport = async (request: FastifyRequest<{ Querystring: { 
        page?: number,
        limit?: number,
        from?: Date, 
        to?: Date, 
        download: boolean, 
        save: boolean } 
    }>, reply: FastifyReply) => {
        try {
            const AttendanceControllers = new AttendanceController();
            request.query.download = true;
    
            const teacherAttendances = await AttendanceControllers.listTeacherAttendaceReport(request, reply);
    
            if (!teacherAttendances) {
                const errorMessage = "No teacher attendance data found.";
                const errorResponse = CustomError<string>(NOT_FOUND, errorMessage);
                return reply.status(NOT_FOUND).send(errorResponse);
            }
    
            const data: any[] = [];
            const downloadata: any[] = [];
    
            teacherAttendances.data.forEach(detail => {
                const row = [
                    detail.name,
                    detail.whatsapp_number,
                    detail.Total_classes,
                    detail.attended,
                    detail.percentage
                ];
                data.push(row);
    
                downloadata.push({
                    id:detail.id,
                    name: detail.name,
                    whatsapp_number: detail.whatsapp_number,
                    Total_classes: detail.Total_classes,
                    attendance: detail.attended,
                    percentage: detail.percentage
                });
            });
    
            if (request.query.save) {
                const book = await createExcel(["Name", "Whatsapp Number", "Total Attendance", "Attendance", "Percentage"], data);
                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                reply.header('Content-Disposition', 'attachment; filename="teacherattendace.xlsx"');
    
                const file_buffer = await book.xlsx.writeBuffer();
                reply.send(file_buffer);
            } else {
                const response = Success<any>({ metadata: { totalcount: teacherAttendances.count }, data: downloadata });
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            return reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    }

    individualStudentAttendenceReport = async (request: FastifyRequest<{ Params: { student_id: number }, Querystring: { from: Date, to: Date } }>, reply: FastifyReply) => {
        try {
            const studentId = request.params.student_id;
            if (studentId) {
                let fromDate;
                let toDate;
                if (request.query.from && request.query.to) {
                    fromDate = new Date(request.query.from);
                    toDate = new Date(request.query.to);
                    if(fromDate > toDate){
                        const errorResponse = CustomError<string>(BAD_REQUEST, 'date format is not correct');
                        reply.status(BAD_REQUEST).send(errorResponse);
                    }
                    
                }
                const appDatasource = await getDataSource();
                const studentBatchRepository = appDatasource.getRepository(StudentBatch);

                const studentBatches = await studentBatchRepository.createQueryBuilder('student_batch')
                    .leftJoinAndSelect('student_batch.batches','batch')
                    .where('student_batch.student_id = :id',{id:studentId})
                    .getMany();

                const studentAttendanceRepository = appDatasource.getRepository(StudentAttendance)
                                        
                let data = [];
                for (const batch of studentBatches) {

                    let batchAttendanceQuery = studentAttendanceRepository.createQueryBuilder('student_attendance')
                    .where('student_attendance.student_id = :studentId', { studentId: studentId })
                    .andWhere('student_attendance.batch_id = :batchId', { batchId: batch.batches.batch_id });
    
                if (fromDate && toDate) {
                    batchAttendanceQuery = batchAttendanceQuery.andWhere('student_attendance.date BETWEEN :startDate AND :endDate', {
                        startDate: fromDate,
                        endDate: toDate
                    });
                }
    
                const batchAttendanceRecords = await batchAttendanceQuery.getMany();
        
                    const batchAttendance = batchAttendanceRecords.map(record => ({
                        id: record.id,
                        attended: record.attended,
                        late_by: record.late_by,
                        reason: record.reason,
                        date: record.date
                    }));
        
                    const batchData = {
                        batch_name: batch.batches.batch_name,
                        attendance_records: batchAttendance
                    };
                    data.push(batchData);
                }
                const response = Success<any>(data)
                return reply.status(SUCCESS_GET).send(response)
            }
        } catch (error) {
            console.error("Error processing student attendance:", error);
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    };


    // INDIVIDUAL TEACHER REPORT LIST
    individualTeacherAttendenceReport = async (request:FastifyRequest<{Params:{teacher_id:number},Querystring:{from:Date,to:Date}}>, reply:FastifyReply) => {
        try {
            const teacherId:number = request.params.teacher_id;
            if(teacherId){
                const appDatasource = await getDataSource();
                const teacherRepository = appDatasource.getRepository(Teachers);
                const teacherAttendanceRepository = appDatasource.getRepository(TeacherAttendance);

                let startDate;
                let endDate;
                if (request.query.from && request.query.to) {
                    startDate = new Date (request.query.from);
                    endDate = new Date (request.query.to);
                    if(startDate > endDate){
                        const errorResponse = CustomError<string>(BAD_REQUEST, 'date format is not correct');
                        return reply.status(BAD_REQUEST).send(errorResponse);
                    }
                }

                const existingTeacher = await teacherRepository.findOneBy({teacher_id : teacherId})
                if(existingTeacher){
                    const attendenceTeacherData = await teacherAttendanceRepository.createQueryBuilder('teacher_attendance')
                        .select('DISTINCT(teacher_attendance.batch_id) as batch_id , batch_name')
                        .leftJoin('teacher_attendance.batch',"batches")
                        .where('teacher_attendance.teacher_id = :teacher_id',{teacher_id:existingTeacher.teacher_id})
                        .getRawMany();
                        
                    const allAttendenceData: any = [];
                    for(let batch of attendenceTeacherData){
                        const batchId:number = batch.batch_id;
                        const batchName:string = batch.batch_name;

                    
                        const batchAttendenceQuery = teacherAttendanceRepository.createQueryBuilder('teacher_attendance')
                        .where("teacher_attendance.batch_id = :batch_id", { batch_id: batchId })
                        .andWhere("teacher_attendance.teacher_id = :teacher_id", { teacher_id: existingTeacher.teacher_id });
                    
                    if (startDate && endDate) {
                        batchAttendenceQuery.andWhere('teacher_attendance.date BETWEEN :startDate AND :endDate', {
                            startDate: startDate,
                            endDate: endDate
                        });
                    }
                    
                    const batchAttendence = await batchAttendenceQuery.getMany();
                    
            
                        const attendenceData= batchAttendence.map(data=>({
                            isAttended: data.attended,
                            date : data.date
                        }));                        
                        const obj = {
                            batch_name: batchName,
                            attendance: [...attendenceData]
                        }
                        allAttendenceData.push(obj);
                    }
                    const response = Success<any>(allAttendenceData);
                    return reply.status(SUCCESS_GET).send(response);
                } else{
                    logger.error("Teacher does not exist!");
                    const data = CustomError<string>(NOT_FOUND,"Teacher does not exist!");
                    return reply.status(NOT_FOUND).send(data);
                }
            }
        } catch (error) {
            logger.error(error);
            const errResponse = CustomError<string>(INTERNAL_ERROR,ERROR_COMMON_MESSAGE);
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    
}

    
    