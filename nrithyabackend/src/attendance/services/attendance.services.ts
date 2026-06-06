import { FastifyReply, FastifyRequest } from "fastify";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import { BAD_REQUEST, ERROR_COMMON_MESSAGE, INTERNAL_ERROR, SUCCESS_CREATE, SUCCESS_GET, camparePassword, recordAudit } from "../../utils/common";
import { StudentAttendace, TeacherAttendace } from "../types/attendance.types";
import logger from "../../utils/logger";
import { StudentAttendance } from "../entities/student.attendance.entities";
import { Students } from "../../student/entities/students.entities";
import { Batches } from "../../batch/entities/batch.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { TeacherAttendance } from "../entities/teacher.attendance.entities";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { CompensationStudentHistory } from "../../compensation/entities/student.compensation.history.entities";
import { StudentBatchStatus } from "../../student/types/student.batch.enums";
import { StudentAssignments } from "../../assignment/entities/students.assignment.entities";
import { StudentStatus } from "../../student/types/student.types";

export class AttendanceController {

    // POST STUDENT ATTENDANCE
    createStudentAttendace = async (request: FastifyRequest<{ Body: StudentAttendace }>, reply: FastifyReply) => {
        try {
            const dataBody = request.body;
            const user_details = (request as any).user_details;

            if (dataBody.batch_id && dataBody.attendance.length > 0 && dataBody.date) {
                const appDatasourse = await getDataSource();
                const studentRepository = appDatasourse.getRepository(Students);
                const batchRepository = appDatasourse.getRepository(Batches);
                const compensationHistoryRepository = appDatasourse.getRepository(CompensationStudentHistory);
                const existingOldBatch = await batchRepository.findOneBy({
                    batch_id: dataBody.batch_id
                })
                if (existingOldBatch) {
                    const studentAttendanceRepository = appDatasourse.getRepository(StudentAttendance);
                    const attendanceAlreadyExist = await studentAttendanceRepository.createQueryBuilder("student_attendance")
                        .where("student_attendance.date = :date", { date: dataBody.date })
                        .andWhere("student_attendance.batch_id = :batch_id", { batch_id: dataBody.batch_id })
                        .andWhere("student_attendance.start_time = :start_time", { start_time: dataBody.start_time })
                        .andWhere("student_attendance.end_time = :end_time", { end_time: dataBody.end_time })
                        .getMany();

                    if (attendanceAlreadyExist.length > 0) {
                        logger.error("Attendance Already Marked");
                        const errResponse = CustomError<string>(BAD_REQUEST, "Attendance Already Marked");
                        return reply.status(BAD_REQUEST).send(errResponse);
                    }

                    dataBody.attendance.map(async (att, index) => {
                        if ('attended' in att && att.student_id) {
                            const existingStudent = await studentRepository.findOneBy({
                                student_id: att.student_id
                            })
                            if (existingStudent) {
                                const studentAttendance = new StudentAttendance();
                                studentAttendance.attended = att.attended;
                                if (att.late_by) {
                                    studentAttendance.late_by = att.late_by;
                                }

                                if (att.reason) {
                                    studentAttendance.reason = att.reason;
                                }

                                studentAttendance.date = dataBody.date;
                                studentAttendance.students = existingStudent;
                                studentAttendance.batch = existingOldBatch;
                                studentAttendance.start_time = dataBody.start_time;
                                studentAttendance.end_time = dataBody.end_time;
                                await studentAttendanceRepository.save(studentAttendance);

                                const studentAssignmentRepository = appDatasourse.getRepository(StudentAssignments);
                                const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                                const totalAttended = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_attendance.attended = :attended", { attended: true }).getCount();
                                const percentage = ((totalAttended / totalAttendace) * 100).toFixed(2);
                                const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                                const performance = totalAssignments > 0 ? (0.75 * parseFloat(percentage) + 0.25 * existingStudent.assignment).toFixed(2) : (0.75 * parseFloat(percentage) + 0.25 * 100).toFixed(2);
                                await studentRepository.createQueryBuilder()
                                    .update(Students)
                                    .set({
                                        attendance: parseFloat(percentage),
                                        performance: parseFloat(performance)
                                    })
                                    .where("student_id = :id", { id: existingStudent.student_id })
                                    .execute();
                            } else {
                                logger.error("Invalid data")
                                const errResponse = CustomError<string>(BAD_REQUEST, "Invalid data");
                                return reply.status(BAD_REQUEST).send(errResponse)
                            }
                        }
                    })
                    logger.error("Student attendace saved")
                    const response = Success<string>("Student attendace saved");
                    reply.status(SUCCESS_CREATE).send(response)

                    if (user_details) {
                        recordAudit("student attendance created", new Date, "students attendance", user_details.user_id)
                    }
                }
                else {
                    logger.error("Invalid batch")
                    const data = CustomError<string>(BAD_REQUEST, "Invalid batch id provided")
                    return reply.status(BAD_REQUEST).send(data)
                }
            }
            else {
                logger.error("Invalid student")
                const data = CustomError<string>(BAD_REQUEST, "More data required provided")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    // POST TEACHER ATTENDANCE
    createTeacherAttendace = async (request: FastifyRequest<{ Body: TeacherAttendace }>, reply: FastifyReply) => {
        try {
            const dataBody = request.body;
            const user_details = (request as any).user_details;

            if ('attended' in dataBody && dataBody.date && dataBody.teacher_id && dataBody.batch_id && dataBody.start_time && dataBody.end_time) {
                const appDatasourse = await getDataSource();
                const teacherRepository = appDatasourse.getRepository(Teachers);
                const existingTeacher = await teacherRepository.findOneBy({
                    teacher_id: dataBody.teacher_id
                })
                if (existingTeacher) {
                    const batchRepository = appDatasourse.getRepository(Batches);
                    const existingOldBatch = await batchRepository.findOneBy({
                        batch_id: dataBody.batch_id
                    })
                    if (existingOldBatch) {
                        const teacherAttendanceRepository = appDatasourse.getRepository(TeacherAttendance);
                        const teacherAttendance = new TeacherAttendance();
                        teacherAttendance.attended = dataBody.attended;
                        teacherAttendance.batch = existingOldBatch;
                        teacherAttendance.date = dataBody.date;
                        teacherAttendance.teachers = existingTeacher;
                        teacherAttendance.late_by = dataBody.late_by ? dataBody.late_by : "",
                            teacherAttendance.reason = dataBody.reason ? dataBody.reason : "",
                            teacherAttendance.start_time = dataBody.start_time;
                        teacherAttendance.end_time = dataBody.end_time;
                        await teacherAttendanceRepository.save(teacherAttendance);

                        logger.error("Teacher attendace saved")
                        const response = Success<string>("Teacher attendace saved");
                        reply.status(SUCCESS_CREATE).send(response)

                        if (user_details) {
                            recordAudit("teacher attendance created", new Date, "teacher attendance", user_details.user_id)
                        }
                    }
                    else {
                        logger.error("Invalid batch")
                        const data = CustomError<string>(BAD_REQUEST, "Invalid batch id provided")
                        reply.status(BAD_REQUEST).send(data)
                    }
                }
                else {
                    logger.error("Invalid student")
                    const data = CustomError<string>(BAD_REQUEST, "Invalid teacher id provided")
                    reply.status(BAD_REQUEST).send(data)
                }
            }
            else {
                logger.error("More data required")
                const data = CustomError<string>(BAD_REQUEST, "More data required!")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    // LIST TEACHER ATTENDANCE
    listTeacherAttendace = async (request: FastifyRequest<{
        Querystring: {
            batch_id: number,
            date: Date
        }
    }>, reply: FastifyReply) => {
        try {
            if (request.query.batch_id && request.query.date) {
                const appDatasourse = await getDataSource();
                const teacherAttendanceRepository = appDatasourse.getRepository(TeacherAttendance);
                const queryBuilder = teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                queryBuilder
                    .leftJoinAndSelect("teacher_attendance.teachers", "teachers")
                    .leftJoinAndSelect("teacher_attendance.batch", "batches")
                    .where("teacher_attendance.batch_id = :batch_id", { batch_id: request.query.batch_id })
                    .andWhere("teacher_attendance.date = :date", { date: request.query.date })
                const attendance = await queryBuilder.getOne();
                logger.info("Teacher attendance")
                const response = Success<any>(attendance);
                reply.status(SUCCESS_GET).send(response)
            }
            else {
                logger.error("More data required")
                const data = CustomError<string>(BAD_REQUEST, "batch id and date is a required field")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }


    // LIST STUDENT ATTENDANCE
    listStudentAttendace = async (request: FastifyRequest<{
        Querystring: {
            batch_id: number,
            date: Date,
        }
    }>, reply: FastifyReply) => {
        try {
            if (request.query.batch_id && request.query.date) {
                const appDatasourse = await getDataSource();
                const studentAttendanceRepository = appDatasourse.getRepository(StudentAttendance);
                const queryBuilder = studentAttendanceRepository.createQueryBuilder("student_attendance")
                queryBuilder
                    .leftJoinAndSelect("student_attendance.students", "students")
                    .leftJoinAndSelect("student_attendance.batch", "batches")
                    .where("student_attendance.batch_id = :batch_id", { batch_id: request.query.batch_id })
                    .andWhere("student_attendance.date = :date", { date: request.query.date })
                const attendance = await queryBuilder.getMany();
                logger.info("Student attendance")
                const response = Success<any>(attendance);
                reply.status(SUCCESS_GET).send(response)
            }
            else {
                logger.error("More data required")
                const data = CustomError<string>(BAD_REQUEST, "batch id and date is a required field")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }


    updateStudentAttendace = async (request: FastifyRequest<{
        Body: {
            id: number,
            attended?: boolean,
            reason?: string,
            late_by?: string
        }
    }>, reply: FastifyReply) => {
        try {

            const updateBody = request.body;
            const user_details = (request as any).user_details;

            if (request.body.id) {
                const appDatasourse = await getDataSource();
                const studentAttendanceRepository = appDatasourse.getRepository(StudentAttendance);
                const studentRepository = appDatasourse.getRepository(Students);
                const existingAttendance = await studentAttendanceRepository.createQueryBuilder("student_attendance").leftJoinAndSelect("student_attendance.students", "students").where("student_attendance.id=:student_id", { student_id: request.body.id }).getOne();
                if (existingAttendance) {
                    await studentAttendanceRepository.createQueryBuilder()
                        .update(StudentAttendance)
                        .set({
                            attended: 'attended' in updateBody ? updateBody.attended : existingAttendance.attended,
                            reason: updateBody.reason ? updateBody.reason : existingAttendance.reason,
                            late_by: updateBody.late_by ? updateBody.late_by : existingAttendance.late_by
                        })
                        .where("id = :id", { id: updateBody.id })
                        .execute();

                    const existingStudent = await studentRepository.findOneBy({
                        student_id: existingAttendance.students.student_id
                    });

                    if (existingStudent) {
                        const studentAssignmentRepository = appDatasourse.getRepository(StudentAssignments);
                        const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                        const totalAttended = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_attendance.attended = :attended", { attended: true }).getCount();
                        const percentage = ((totalAttended / totalAttendace) * 100).toFixed(2);
                        const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                        const performance = totalAssignments > 0 ? (0.75 * parseFloat(percentage) + 0.25 * existingStudent.assignment).toFixed(2) : (0.75 * parseFloat(percentage) + 0.25 * 100).toFixed(2);
                        await studentRepository.createQueryBuilder()
                            .update(Students)
                            .set({
                                attendance: parseFloat(percentage),
                                performance: parseFloat(performance)
                            })
                            .where("student_id = :id", { id: existingStudent.student_id })
                            .execute();

                        logger.info("Student attendance updated")
                    }

                    const response = Success<any>("Student attendance updated");
                    reply.status(SUCCESS_GET).send(response)

                    if (user_details) {
                        recordAudit("student attendance updated", new Date, "student attendance", user_details.user_id)
                    }
                }
                else {
                    logger.error("Attendance does not exist")
                    const data = CustomError<string>(BAD_REQUEST, "Attendance does not exist")
                    reply.status(BAD_REQUEST).send(data)
                }
            }
            else {
                logger.error("More data required")
                const data = CustomError<string>(BAD_REQUEST, "id is a required field")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    updateTeacherAttendace = async (request: FastifyRequest<{
        Body: {
            id: number,
            attended?: boolean,
            reason?: string,
            late_by?: string
        }
    }>, reply: FastifyReply) => {
        try {

            const updateBody = request.body;
            const user_details = (request as any).user_details;

            if (request.body.id) {
                const appDatasourse = await getDataSource();
                const teacherAttendanceRepository = appDatasourse.getRepository(TeacherAttendance);
                const existingAttendance = await teacherAttendanceRepository.findOneBy({
                    id: request.body.id
                })
                if (existingAttendance) {
                    await teacherAttendanceRepository.createQueryBuilder()
                        .update(TeacherAttendance)
                        .set({
                            attended: 'attended' in updateBody ? updateBody.attended : existingAttendance.attended,
                            reason: updateBody.reason ? updateBody.reason : existingAttendance.reason,
                            late_by: updateBody.late_by ? updateBody.late_by : existingAttendance.late_by
                        })
                        .where("id = :id", { id: updateBody.id })
                        .execute();
                    logger.info("Teacher attendance updated")
                    const response = Success<any>("teacher attendance updated");
                    reply.status(SUCCESS_GET).send(response)

                    if (user_details) {
                        recordAudit("teacher attendance updated", new Date, "teacher attendance", user_details.user_id)
                    }
                }
                else {
                    logger.error("Attendance does not exist")
                    const data = CustomError<string>(BAD_REQUEST, "Attendance does not exist")
                    reply.status(BAD_REQUEST).send(data)
                }
            }
            else {
                logger.error("More data required")
                const data = CustomError<string>(BAD_REQUEST, "id is a required field")
                reply.status(BAD_REQUEST).send(data)
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }


    listTeacherStreak = async (request: FastifyRequest<{
        Querystring: {
            batch_id: number,
            date: Date,
            limit?: number,
            page?: number,
            teacher_name: string,
            from?: Date,
            to?: Date,
            sortorder?: string
        }
    }>, reply: FastifyReply) => {

        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;

        try {
            const appDataSource = await getDataSource();
            const batchesRepository = appDataSource.getRepository(Batches)
            const queryBuilder = batchesRepository.createQueryBuilder("batches");
            queryBuilder
                .leftJoinAndSelect("batches.teachers", "teachers")
                .addSelect('LOWER("teachers"."first_name")', 'firstname')
            if (request.query.sortorder == 'desc') {
                queryBuilder.addOrderBy('firstname', 'DESC')
            } else {
                queryBuilder.addOrderBy('firstname', 'ASC')
            }
            if (request.query.teacher_name) {
                const teacherRepository = appDataSource.getRepository(Teachers)
                const teacherNameArray = request.query.teacher_name.split(" ");
                const teachersQuery = teacherRepository.createQueryBuilder("teachers")
                if (teacherNameArray.length === 1) {
                    teachersQuery.where('LOWER(teachers.first_name) LIKE LOWER(:name) OR LOWER(teachers.last_name) LIKE LOWER(:name)', { name: `%${teacherNameArray[0]}%` });
                } else if (teacherNameArray.length === 2) {
                    teachersQuery.andWhere('LOWER(teachers.first_name) LIKE LOWER(:first_name) AND LOWER(teachers.last_name) LIKE LOWER(:last_name)', { first_name: `%${teacherNameArray[0]}%`, last_name: `%${teacherNameArray[1]}%` });
                }
                const teachers = await teachersQuery.getMany();

                const ids: any = []
                teachers.forEach((teacher) => ids.push(teacher.teacher_id))
                if (ids.length > 0) {
                    queryBuilder.where('batches.teachers.teacher_id IN (:...ids)', { ids: ids })
                }
                else {
                    queryBuilder.where('batches.teachers.teacher_id IN (:...ids)', { ids: [0] })
                }
            }
            if (request.query.batch_id) {
                queryBuilder.where('batches.batch_id = :batch_id', { batch_id: request.query.batch_id })
            }
            const dates: string[] = []
            if (request.query.from && request.query.to) {
                const fromDate = new Date(request.query.from)
                const toDate = new Date(request.query.to)

                while (fromDate < toDate) {
                    const year = fromDate.getFullYear();
                    const month = ('0' + (fromDate.getMonth() + 1)).slice(-2);
                    const day = ('0' + fromDate.getDate()).slice(-2);
                    dates.push(`${year}-${month}-${day}`);
                    fromDate.setDate(fromDate.getDate() + 1)
                }
            }

            const count = await queryBuilder.getCount();
            const data = await queryBuilder.skip(offset).take(perPage).getMany();
            const responseObj: any = { metadata: { totalcount: count }, data: [] }

            for (const batch in data) {
                const batches = data[batch]
                const obj: any = { ...batches, attendance: [] }
                const teacherAttendanceRepository = appDataSource.getRepository(TeacherAttendance)
                const teacherAttendancedataquery = teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                teacherAttendancedataquery.where("teacher_attendance.batch_id=:batch_id", { batch_id: batches.batch_id })
                teacherAttendancedataquery.andWhere("teacher_attendance.teacher_id=:teacher_id", { teacher_id: batches.teachers.teacher_id })
                teacherAttendancedataquery.orderBy('teacher_attendance.id', "DESC")
                const totalquery = teacherAttendanceRepository.createQueryBuilder("teacher_attendance").where("teacher_attendance.batch_id=:batch_id", { batch_id: batches.batch_id }).andWhere("teacher_attendance.teacher_id=:teacher_id", { teacher_id: batches.teachers.teacher_id })
                const attendanded_query = teacherAttendanceRepository.createQueryBuilder("teacher_attendance").where("teacher_attendance.attended = :attended", { attended: true }).andWhere("teacher_attendance.batch_id=:batch_id", { batch_id: batches.batch_id }).andWhere("teacher_attendance.teacher_id=:teacher_id", { teacher_id: batches.teachers.teacher_id })
                if (dates.length > 0) {
                    attendanded_query.andWhere('teacher_attendance.date IN (:...ids)', { ids: dates })
                    totalquery.andWhere('teacher_attendance.date IN (:...ids)', { ids: dates })
                    teacherAttendancedataquery.andWhere('teacher_attendance.date IN (:...ids)', { ids: dates })
                }
                const attendance = await teacherAttendancedataquery.take(5).getMany()
                obj.total_class = await totalquery.getCount()
                obj.attended = await attendanded_query.getCount()
                if (obj.total_class == 0) {
                    obj.percentage = 0
                }
                else {
                    obj.percentage = parseFloat(((obj.attended / obj.total_class) * 100).toFixed(2));
                }
                obj.attendance = [...attendance]
                responseObj.data.push(obj)
            }
            const response = Success<any>(responseObj)
            return reply.status(SUCCESS_GET).send(response)
        }
        catch (error) {
            logger.error("Internal server error", error);
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }


    listStudentStreak = async (request: FastifyRequest<{
        Querystring: {
            batch_id: number,
            date: Date,
            limit?: number,
            page?: number,
            student_name: string,
            from?: Date,
            to?: Date,
            sortorder?: string,
            status?: 'active' | 'dismissed' | 'suspended' | 'all'
        }
    }>, reply: FastifyReply) => {

        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;

        try {
            const appDataSource = await getDataSource();
            const studentbatchesRepository = appDataSource.getRepository(StudentBatch)
            const studentRepository = appDataSource.getRepository(Students);

            const queryBuilder = studentbatchesRepository.createQueryBuilder("student_batch")
            queryBuilder.innerJoinAndSelect("student_batch.batches", "batches")
                .innerJoinAndSelect("student_batch.students", "students")
                .addSelect('LOWER("students"."first_name")', 'firstname')

            // Add status filter - directly to the main queryBuilder
            if (request.query.status === "active") {
                queryBuilder.andWhere("students.status = :status", { status: 'active' });
            } else if (request.query.status === "suspended") {
                queryBuilder.andWhere("students.status = :status", { status: 'suspended' });
            } else if (request.query.status === "dismissed") {
                queryBuilder.andWhere("students.status = :status", { status: 'dismissed' });
            }

            if (request.query.sortorder == 'desc') {
                queryBuilder.addOrderBy('firstname', 'DESC')
            } else {
                queryBuilder.addOrderBy('firstname', 'ASC')
            }

            if (request.query.student_name) {
                const studentRepository = appDataSource.getRepository(Students);
                const studentNameArray = request.query.student_name.split(" ");
                let studentsQuery = studentRepository.createQueryBuilder("students");

                if (studentNameArray.length === 1) {
                    studentsQuery.where('LOWER(students.first_name) LIKE LOWER(:name) OR LOWER(students.last_name) LIKE LOWER(:name)', { name: `%${studentNameArray[0]}%` });
                } else if (studentNameArray.length === 2) {
                    studentsQuery.andWhere('LOWER(students.first_name) LIKE LOWER(:first_name) AND LOWER(students.last_name) LIKE LOWER(:last_name)', { first_name: `%${studentNameArray[0]}%`, last_name: `%${studentNameArray[1]}%` });
                }

                const students = await studentsQuery.getMany();
                const ids: any = []
                students.forEach((student) => ids.push(student.student_id))
                if (ids.length > 0) {
                    queryBuilder.andWhere('student_batch.students.student_id IN (:...ids)', { ids: ids })
                }
            }

            if (request.query.batch_id) {
                queryBuilder.andWhere('student_batch.batches.batch_id = :id', { id: request.query.batch_id })
            }

            const dates: string[] = []
            if (request.query.from && request.query.to) {
                const fromDate = new Date(request.query.from)
                const toDate = new Date(request.query.to)

                while (fromDate <= toDate) {
                    const year = fromDate.getFullYear();
                    const month = ('0' + (fromDate.getMonth() + 1)).slice(-2);
                    const day = ('0' + fromDate.getDate()).slice(-2);
                    dates.push(`${year}-${month}-${day}`);
                    fromDate.setDate(fromDate.getDate() + 1)
                }
            }

            if (request.query.sortorder == 'desc') {
                queryBuilder.addOrderBy('students.first_name', 'DESC');
            } else {
                queryBuilder.addOrderBy('students.first_name', 'ASC');
            }

            const count = await queryBuilder.getCount();
            const data = await queryBuilder.skip(offset).take(perPage).getMany();
            const responseObj: any = { metadata: { totalcount: count }, data: [] }

            for (const batch in data) {
                const batches = data[batch]
                const obj: any = { ...batches, attendance: [] }
                const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance)
                const studentAttendancedataquery = studentAttendanceRepository.createQueryBuilder("student_attendance")
                    .leftJoinAndSelect("student_attendance.students", "students")
                    .leftJoinAndSelect("student_attendance.batch", "batch")
                    .where("student_attendance.batch_id = :batch_id", { batch_id: batches.batches.batch_id })
                    .andWhere("student_attendance.student_id = :student_id", { student_id: batches.students.student_id })
                    .orderBy('student_attendance.id', "DESC")

                const total = studentAttendanceRepository.createQueryBuilder("student_attendance")
                    .where("student_attendance.batch_id = :batch_id", { batch_id: batches.batches.batch_id })
                    .andWhere("student_attendance.student_id = :student_id", { student_id: batches.students.student_id })

                const attended = studentAttendanceRepository.createQueryBuilder("student_attendance")
                    .where("student_attendance.batch_id = :batch_id", { batch_id: batches.batches.batch_id })
                    .andWhere("student_attendance.attended = :attended", { attended: true })
                    .andWhere("student_attendance.student_id = :student_id", { student_id: batches.students.student_id })

                if (dates.length > 0) {
                    studentAttendancedataquery.andWhere('student_attendance.date IN (:...ids)', { ids: dates })
                    attended.andWhere('student_attendance.date IN (:...ids)', { ids: dates })
                    total.andWhere('student_attendance.date IN (:...ids)', { ids: dates })
                }

                const attendance = await studentAttendancedataquery.take(5).getMany()

                // Verify that we have valid student data before including in response
                if (batches.students && batches.students.student_id && batches.students.status) {
                    obj.total_class = await total.getCount()
                    obj.attended = await attended.getCount()
                    if (obj.total_class == 0) {
                        obj.percentage = 0
                    }
                    else {
                        obj.percentage = parseFloat(((obj.attended / obj.total_class) * 100).toFixed(2));
                    }
                    obj.attendance = [...attendance]
                    responseObj.data.push(obj)
                }
            }
            const response = Success<any>(responseObj)
            return reply.status(SUCCESS_GET).send(response)
        }
        catch (error) {
            logger.error("Error processing student attendance:", error);
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    }


    listDayattendance = async (request: FastifyRequest<{
        Querystring: {
            batch_id: number,
            date: Date,
            start_time: string,
            end_time: string
        }
    }>, reply: FastifyReply) => {
        try {
            const data = request.query;

            if (data.batch_id && data.date) {
                const appDataSource = await getDataSource();
                const batchRepository = appDataSource.getRepository(Batches)
                const batch = await batchRepository.findOneBy({ batch_id: data.batch_id })
                let first = true;
                if (batch) {
                    let teacher: any = {}
                    let attendstudents: any[] = []
                    let batch: any = {}

                    const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance)
                    const teacherAttendanceRepository = appDataSource.getRepository(TeacherAttendance)
                    const studentAttendancedataquery = studentAttendanceRepository.createQueryBuilder("student_attendance")
                    studentAttendancedataquery.where("student_attendance.batch_id=:batch_id", { batch_id: data.batch_id }).andWhere("student_attendance.date=:date", { date: data.date }).andWhere("student_attendance.start_time=:start_time", { start_time: data.start_time }).andWhere("student_attendance.end_time=:end_time", { end_time: data.end_time })
                    studentAttendancedataquery.leftJoinAndSelect("student_attendance.students", "students")
                    const attendedStudents = await studentAttendancedataquery.getMany()

                    const teaherAttendancedataquery = teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                    teaherAttendancedataquery.where("teacher_attendance.batch_id=:batch_id", { batch_id: data.batch_id }).andWhere("teacher_attendance.date=:date", { date: data.date }).andWhere("teacher_attendance.start_time=:start_time", { start_time: data.start_time }).andWhere("teacher_attendance.end_time=:end_time", { end_time: data.end_time })
                    teaherAttendancedataquery.leftJoinAndSelect("teacher_attendance.teachers", "teachers")
                    const attendedTeacher = await teaherAttendancedataquery.getOne()

                    if (!attendedStudents.length) {
                        const studentBatchRepository = appDataSource.getRepository(StudentBatch)
                        const studentRepository = appDataSource.getRepository(Students)
                        const studentBatches = await studentBatchRepository.createQueryBuilder("student_batch")
                            .leftJoinAndSelect("student_batch.students", "students")
                            .where("student_batch.batch_id = :batch_id", { batch_id: data.batch_id })
                            .andWhere("students.status = :student_status", { student_status: StudentStatus.ACTIVE })
                            .andWhere("student_batch.status = :batch_status", { batch_status: StudentBatchStatus.ACTIVE })
                            .getMany();

                        const ids: any = []
                        let students: any = []
                        studentBatches.forEach(student => {
                            ids.push(student.students.student_id)
                        })
                        const studentCompensationRepository = appDataSource.getRepository(CompensationStudentHistory)
                        const studentCompensations = await studentCompensationRepository.createQueryBuilder("compensation_student_history").leftJoinAndSelect("compensation_student_history.student", "students").where("compensation_student_history.new_date=:date", { date: data.date }).andWhere("compensation_student_history.new_batch=:batch", { batch: data.batch_id }).getMany()
                        studentCompensations.forEach(student => {
                            ids.push(student.student.student_id)
                        })
                        if (ids.length > 0) {
                            students = await studentRepository.createQueryBuilder("students").where('students.student_id IN (:...ids)', { ids: ids }).getMany()
                        }
                        attendstudents = students
                    }
                    else {
                        first = false
                        attendstudents = attendedStudents
                    }

                    if (!attendedTeacher) {
                        const batchRepository = appDataSource.getRepository(Batches)
                        const batches = await batchRepository.createQueryBuilder("batches").leftJoinAndSelect("batches.teachers", "teachers").leftJoinAndSelect("batches.courses", "courses").where("batches.batch_id=:id", { id: data.batch_id }).getOne()
                        teacher = batches?.teachers
                        batch = batches
                    }
                    else {
                        first = false
                        teacher = attendedTeacher;
                        const batchRepository = appDataSource.getRepository(Batches)
                        const batches = await batchRepository.createQueryBuilder("batches").leftJoinAndSelect("batches.teachers", "teachers").leftJoinAndSelect("batches.courses", "courses").where("batches.batch_id=:id", { id: data.batch_id }).getOne()
                        batch = batches
                    }

                    const response = Success<any>({ batch: batch, teacher: teacher, students: attendstudents, is_first: first })
                    return reply.status(SUCCESS_GET).send(response)
                }
                else {
                    const data = CustomError<string>(BAD_REQUEST, "batch not found");
                    reply.status(BAD_REQUEST).send(data);
                }
            }
            else {
                const data = CustomError<string>(BAD_REQUEST, "date and batch id are required");
                reply.status(BAD_REQUEST).send(data);
            }
        }
        catch (error) {
            logger.error("Internal server error");
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }

    listStudentAttendaceReport = async (request: FastifyRequest<{
        Querystring:
        {
            page?: number,
            limit?: number,
            from?: Date,
            to?: Date,
            download: boolean,
            save: boolean,
            sortorder?: string
        }
    }>, reply: FastifyReply) => {
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 10;
            const offset = (page - 1) * perPage;
            let fromDate: Date, toDate: Date;
            const appDatasource = await getDataSource();
            const studentAttendanceRepository = appDatasource.getRepository(StudentAttendance);
            const studentBatchRepository = appDatasource.getRepository(StudentBatch);
            const studentRepository = appDatasource.getRepository(Students);

            let students = await studentRepository.createQueryBuilder('students')
                .where("students.status = :status", { status: 'active' })
                .getMany();
            let data: any[] = [];

            for (const student of students) {
                let studentBatches = await studentBatchRepository.createQueryBuilder('student_batch')
                    .leftJoinAndSelect("student_batch.batches", "batches")
                    .where("student_batch.student_id = :id", { id: student.student_id })
                    .getMany();

                let totalClasses = 0;
                let totalAttended = 0;

                for (const batch of studentBatches) {
                    let query = studentAttendanceRepository.createQueryBuilder("student_attendance")
                        .where("student_attendance.student_id = :studentId", { studentId: student.student_id })
                        .andWhere("student_attendance.batch_id = :batchId", { batchId: batch.batches.batch_id });


                    if (request.query.from && request.query.to) {
                        fromDate = new Date(request.query.from);
                        toDate = new Date(request.query.to);
                        if (fromDate >= toDate) {
                            const errorMessage = "Invalid date range: 'from' date should be earlier than 'to' date.";
                            logger.error(errorMessage);
                            const errorResponse = CustomError<string>(BAD_REQUEST, errorMessage);
                            return reply.status(BAD_REQUEST).send(errorResponse);
                        }
                        if (fromDate && toDate) {
                            query = query.andWhere('student_attendance.date BETWEEN :startDate AND :endDate', {
                                startDate: fromDate,
                                endDate: toDate
                            });
                        }

                    }

                    const count = await query.getCount();

                    const attendedQuery = query.andWhere("student_attendance.attended = :status", { status: true });
                    const attended = await attendedQuery.getCount();

                    totalClasses += count;
                    totalAttended += attended;
                }

                const attendancePercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

                data.push({
                    id: student.student_id,
                    name: `${student.first_name} ${student.last_name}`,
                    whatsapp_number: student.whatsapp_number,
                    Total_classes: totalClasses,
                    attended: totalAttended,
                    percentage: attendancePercentage.toFixed(0) + "%"
                });
            }
            if (request.query.sortorder === 'desc') {
                data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1);
            } else {
                data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
            }


            const count = data.length;

            if (request.query.download) {
                let detail: any[] = [];
                if (request.query.save) {
                    detail = data;
                } else {
                    const paginatedData = data.slice(offset, offset + perPage);
                    return { count: count, data: paginatedData };
                }
                return { count: count, data: detail };
            } else {
                const paginatedData = data.slice(offset, offset + perPage);
                const response = { count: count, data: paginatedData };
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            logger.error("Error processing student attendance:", error);
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            return reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    }


    listTeacherAttendaceReport = async (request: FastifyRequest<{
        Querystring:
        {
            page?: number,
            limit?: number,
            from?: Date,
            to?: Date,
            download: boolean,
            save: boolean,
            sortorder?: string
        }
    }>, reply: FastifyReply) => {
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 10;
            const offset = (page - 1) * perPage;

            if (request.query.from && request.query.to) {
                let fromDate = new Date(request.query.from);
                let toDate = new Date(request.query.to);
                if (fromDate >= toDate) {
                    const errorMessage = "Invalid date range: 'from' date should be earlier than 'to' date.";
                    logger.error(errorMessage);
                    const errorResponse = CustomError<string>(BAD_REQUEST, errorMessage);
                    reply.status(BAD_REQUEST).send(errorResponse);
                    return;
                }
            }

            const appDatasource = await getDataSource();
            const teacherAttendanceRepository = appDatasource.getRepository(TeacherAttendance);
            const teacherRepository = appDatasource.getRepository(Teachers);

            let teachers = await teacherRepository.createQueryBuilder('teachers')
                .where("teachers.status = :status", { status: 'active' })
                .getMany();

            let data: any[] = [];
            let count;
            let attended;

            if (request.query.from && request.query.to) {
                for (const teacher of teachers) {
                    count = await teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                        .where("teacher_attendance.teacher_id = :id", { id: teacher.teacher_id })
                        .andWhere('teacher_attendance.date BETWEEN :startDate AND :endDate', {
                            startDate: request.query.from,
                            endDate: request.query.to
                        })
                        .getCount();
                    attended = await teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                        .where("teacher_attendance.teacher_id = :id", { id: teacher.teacher_id })
                        .andWhere("teacher_attendance.attended = :status", { status: true })
                        .andWhere('teacher_attendance.date BETWEEN :startDate AND :endDate', {
                            startDate: request.query.from,
                            endDate: request.query.to
                        })
                        .getCount();

                    const attendancePercentage = count > 0 ? (attended / count) * 100 : 0;

                    data.push({
                        id: teacher.teacher_id,
                        name: `${teacher.first_name} ${teacher.last_name}`,
                        whatsapp_number: teacher.whatsapp_number,
                        Total_classes: count,
                        attended: attended,
                        percentage: attendancePercentage.toFixed(0) + "%"
                    });
                }
            } else {
                for (const teacher of teachers) {
                    count = await teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                        .where("teacher_attendance.teacher_id = :id", { id: teacher.teacher_id })
                        .getCount();

                    attended = await teacherAttendanceRepository.createQueryBuilder("teacher_attendance")
                        .where("teacher_attendance.teacher_id = :id", { id: teacher.teacher_id })
                        .andWhere("teacher_attendance.attended = :status", { status: true })
                        .getCount();

                    const attendancePercentage = count > 0 ? (attended / count) * 100 : 0;

                    data.push({
                        id: teacher.teacher_id,
                        name: `${teacher.first_name} ${teacher.last_name}`,
                        whatsapp_number: teacher.whatsapp_number,
                        Total_classes: count,
                        attended: attended,
                        percentage: attendancePercentage.toFixed(0) + "%"
                    });
                }
            }
            if (request.query.sortorder === 'desc') {
                data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1);
            } else {
                data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
            }


            const totalCount = data.length;
            if (request.query.download) {
                let detail: any[] = [];
                if (request.query.save) {
                    detail = data;
                } else {
                    const paginatedData = data.slice(offset, offset + perPage);
                    return { count: totalCount, data: paginatedData };
                }
                return { count: totalCount, data: detail };
            } else {
                const paginatedData = data.slice(offset, offset + perPage);
                const response = { count: totalCount, data: paginatedData };
                return reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            logger.error("Error processing teacher attendance:", error);
            const errorResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errorResponse);
        }
    }
}