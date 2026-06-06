import {
  FastifyReply,
  FastifyRequest,
  RequestQuerystringDefault,
} from "fastify";
import { Assignments } from "../entities/assignments.entities";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import {
  SUCCESS_CREATE,
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  NOT_FOUND,
  recordAudit,
  ERROR_COMMON_MESSAGE,
} from "../../utils/common";
// import { StudentDataInput } from "../types/student.types";
import {
  AssignmentDataInput,
  AssignmentSearch,
  AssignmentUpdate,
} from "../types/assignment.types";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import logger from "../../utils/logger";
import { Batches } from "../../batch/entities/batch.entities";
import { BatchAssignments } from "../entities/batches.assignments.entities";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { StudentAssignments } from "../entities/students.assignment.entities";
import { Students } from "../../student/entities/students.entities";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";

class assignmentController {
  //CREATE ASSIGNMENT
  async createAssignment(
    request: FastifyRequest<{ Body: AssignmentDataInput }>,
    reply: FastifyReply
  ) {
    const data = request.body;
    const user_details = (request as any).user_details;

    if (
      data.assignment_name &&
      data.assignment_desc &&
      data.url &&
      data.course_id &&
      data.teacher_id
    ) {
      try {
        const appDatasource = await getDataSource();  
        const assignmentRepository = appDatasource.getRepository(Assignments);
        const existingAssignment = await assignmentRepository.findOne({
          where: {
            assignment_name: data.assignment_name
          }
        });
        if (existingAssignment) {
          const errorData = CustomError<string>(404, "Assignment with the same name already exists");
          return reply.status(404).send(errorData);
        }
        const courseRepository = appDatasource.getRepository(Courses);
        const existingCourse = await courseRepository.findOneBy({
          course_id: data.course_id,
        });
        if (existingCourse) {
          const teacherRepository = appDatasource.getRepository(Teachers);
          const existingTeacher = await teacherRepository.findOneBy({
            teacher_id: data.teacher_id,
          });
          if (existingTeacher) {
            const assignment = new Assignments();
            assignment.assignment_name = data.assignment_name;
            assignment.assignment_desc = data.assignment_desc;
            assignment.url = data.url;
            assignment.courses = existingCourse;
            assignment.teachers = existingTeacher;
            assignment.created_at = new Date();
            assignment.updated_at = new Date();

            const newAssignment = await appDatasource.manager.save(assignment);

            request.body.batches.forEach(async (batch) => {
              const batchRepository = appDatasource.getRepository(Batches);
              const existingBatch = await batchRepository.findOne({
                where: { batch_id: batch.batch_id },
              });
              if (existingBatch) {
                const batchAssignment = new BatchAssignments();
                batchAssignment.assignment = newAssignment;
                batchAssignment.batch = existingBatch;
                batchAssignment.assigning_date = new Date();
                batchAssignment.submission_deadline = batch.submission_deadline;

                const batchAssignmentRepository = appDatasource.getRepository(BatchAssignments);
                const savedBatchAssigment = await batchAssignmentRepository.save(batchAssignment);


                const studentBatchRepository = appDatasource.getRepository(StudentBatch);
                const students = await studentBatchRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:batch_id", { batch_id: existingBatch.batch_id }).execute();

                const studentAssignmentRepository = appDatasource.getRepository(StudentAssignments);
                const studentRepository = appDatasource.getRepository(Students);

                for (const i in students) {
                  const student = students[i];
                  const existingStudent = await studentRepository.findOneBy({
                    student_id: student.student_batch_student_id,
                  })
                  if (existingStudent) {
                    const studentAssignment = new StudentAssignments();
                    studentAssignment.batchAssignments = savedBatchAssigment;
                    studentAssignment.student = existingStudent;
                    studentAssignment.submission_date = null as any;
                    await studentAssignmentRepository.save(studentAssignment);

                    const studentAttendanceRepository = appDatasource.getRepository(StudentAttendance);
                    const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                    const attendedAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_assignments.status = :attended", { attended: true }).getCount();
                    const percentage = ((attendedAssignments / totalAssignments) * 100).toFixed(2);
                    const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                    const performance = (totalAttendace > 0 ? 0.75 * existingStudent.attendance + 0.25 * parseFloat(percentage) : 100 * 0.75 + 0.25 * parseFloat(percentage)).toFixed(2);
                    
                    await studentRepository.createQueryBuilder()
                        .update(Students)
                        .set({ 
                            assignment: parseFloat(percentage),
                            performance: parseFloat(performance),
                        })
                        .where("student_id = :id", { id: existingStudent.student_id })
                        .execute();
                  }
                }
              }
            })

            logger.info(`Assignment created successfully`);
            const response = Success<string>("Assignment created successfully");
            reply.status(SUCCESS_CREATE).send(response);

            if (user_details) {
              recordAudit("assignment created", new Date, "assignments", user_details.user_id)
            }
          } else {
            const errorData = CustomError<string>(NOT_FOUND, "Teacher not found");
            return reply.status(NOT_FOUND).send(errorData);
          }
        } else {
          const errorData = CustomError<string>(NOT_FOUND, "Course not found");
          return reply.status(NOT_FOUND).send(errorData);
        }
      } catch (error) {
        logger.error(`Internal server error while creating new batches`);
        const errResponse = CustomError<string>(
          INTERNAL_ERROR,
          "Internal server error"
        );
        reply.status(INTERNAL_ERROR).send(errResponse);
      }
    } else {
      logger.error("data is not available");
      const errResponse = CustomError<string>(
        BAD_REQUEST,
        "Insufficient data provided"
      );
      reply.status(BAD_REQUEST).send(errResponse);
    }
  }

  //LISTING ALL ASSIGNMENT
  async listAllAssignment(
    request: FastifyRequest<{ Querystring: AssignmentSearch }>,
    reply: FastifyReply
  ) {
    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;

    try {
      const assignmentData = request.query;
      const appDatasourse = await getDataSource();
      const assignmentRepositoriy = appDatasourse.getRepository(Assignments);
      const queryBuilder = assignmentRepositoriy.createQueryBuilder("assignment")
      .addSelect('LOWER("assignment"."assignment_name")', 'assignmentname')
      if(request.query.sortorder == 'desc') {
       queryBuilder.addOrderBy('assignmentname', 'DESC')
      }else{
       queryBuilder.addOrderBy('assignmentname', 'ASC')
      }
      queryBuilder.leftJoinAndSelect("assignment.courses", "courses");
      queryBuilder.leftJoinAndSelect("assignment.teachers", "teachers");

      queryBuilder.where(
        "LOWER(assignment.assignment_name) LIKE LOWER(:assignment_name)",
        {
          assignment_name: assignmentData.assignment_name
            ? `%${assignmentData.assignment_name}%`
            : "%%",
        }
      );

      if (assignmentData.course_id) {
        queryBuilder.andWhere("assignment.course_id = :course_id", {
          course_id: assignmentData.course_id,
        });
      }

      if (assignmentData.teacher_id) {
        queryBuilder.andWhere("assignment.teacher_id = :teacher_id", {
          teacher_id: assignmentData.teacher_id,
        });
      }
    
      let count;
      let response;
      count = await queryBuilder.getCount();

      if (request.query.pagenation=="none") {
        const data = await queryBuilder.getMany();
        response = Success<any>({ metadata: { totalcount: count }, data: [...data] });
      } else {
        const data = await queryBuilder.skip(offset).take(perPage).getMany();
        response = Success<any>({ metadata: { totalcount: count }, data: [...data] });
      }
      reply.status(SUCCESS_GET).send(response);
    } catch (error) {
      logger.error("Internal server error while listing assignments",error);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  }

  // LIST A ASSIGNMENT
  async getAssignment(
    request: FastifyRequest<{ Params: { assignment_id: number } }>,
    reply: FastifyReply
  ) {

    try {
      const assignmentId: number = request.params.assignment_id;
      const appDatasourse = await getDataSource();
      const assignmentRepositoriy = await appDatasourse.getRepository(Assignments);
      if (assignmentId) {
        const existingAssignment = await assignmentRepositoriy.findOneBy({ assignment_id: assignmentId })
        if (existingAssignment) {
          const queryBuilder = assignmentRepositoriy.createQueryBuilder("assignment");
          queryBuilder.leftJoinAndSelect("assignment.courses", "courses");
          queryBuilder.leftJoinAndSelect("assignment.teachers", "teachers");
          queryBuilder.where("assignment.assignment_id = :assignmentId", { assignmentId })
          const assignmentData = await queryBuilder.getOne();
          const batchAssignmentRepository = appDatasourse.getRepository(BatchAssignments);
          const batchAssignments = await batchAssignmentRepository.createQueryBuilder("batch_assignment").leftJoinAndSelect("batch_assignment.batch", "batches").where("batch_assignment.assignment_id=:assignment_id", { assignment_id: assignmentId }).getMany();
          (assignmentData as any).batches = batchAssignments;
          const response = Success<any>(assignmentData);
          reply.status(SUCCESS_GET).send(response);
        } else {
          logger.error("Assignment does not exist!");
          const data = CustomError<string>(NOT_FOUND, "Assignment does not exist!");
          return reply.status(NOT_FOUND).send(data);
        }
      } else {
        logger.error("Assignment id is missing!");
        const data = CustomError<string>(BAD_REQUEST, "Assignment id is missing!");
        return reply.status(BAD_REQUEST).send(data);
      }
    } catch (error) {
      logger.error(error);
      const data = CustomError<string>(INTERNAL_ERROR, "Bad request");
      reply.status(INTERNAL_ERROR).send(data);
    }
  }

  //UPDATE ASSIGNMENT
  async updateAssignment(
    request: FastifyRequest<{
      Body: AssignmentUpdate;
    }>,
    reply: FastifyReply
  ) {
    const assignmentData = request.body;
    const user_details = (request as any).user_details

    if (assignmentData.assignment_id) {
      const appDatasourse = await getDataSource();
      const assignmentRepository = appDatasourse.getRepository(Assignments);
      const batchAssignmentRepository = appDatasourse.getRepository(BatchAssignments);
      const batchRepository = appDatasourse.getRepository(Batches);
      const studentBatchRepository = appDatasourse.getRepository(StudentAssignments);
      const existingAssignment = await assignmentRepository.findOneBy({
        assignment_id: assignmentData.assignment_id,
      });
      if (existingAssignment) {
        let existingCourse = {} as Courses | null;
        let existingTeacher = {} as Teachers | null;

        if (existingAssignment.courses.course_id != assignmentData.course_id) {
          const courseRepository = appDatasourse.getRepository(Courses);
          existingCourse = await courseRepository.findOneBy({
            course_id: assignmentData.course_id,
          });
          if (!existingCourse) {
            logger.error("course is not available");
            const errResponse = CustomError<string>(
              BAD_REQUEST,
              "course is not correct"
            );
            reply.status(BAD_REQUEST).send(errResponse);
          }
        }
        if (
          existingAssignment.teachers.teacher_id != assignmentData.teacher_id
        ) {
          const teacherRepository = appDatasourse.getRepository(Teachers);
          existingTeacher = await teacherRepository.findOneBy({
            teacher_id: assignmentData.teacher_id,
          });
          if (!existingTeacher) {
            logger.error("teacher is not available");
            const errResponse = CustomError<string>(
              BAD_REQUEST,
              "Teacher is not correct"
            );
            reply.status(BAD_REQUEST).send(errResponse);
          }
        }

        await assignmentRepository
          .createQueryBuilder()
          .update(Assignments)
          .set({
            assignment_name: assignmentData.assignment_name
              ? assignmentData.assignment_name
              : existingAssignment.assignment_name,
            assignment_desc: assignmentData.assignment_desc
              ? assignmentData.assignment_desc
              : existingAssignment.assignment_desc,
            url: assignmentData.url
              ? assignmentData.url
              : existingAssignment.url,
            teachers: existingTeacher
              ? existingTeacher
              : existingAssignment.teachers,
            courses: existingCourse
              ? existingCourse
              : existingAssignment.courses,
              updated_at: new Date(),
          })
          .where("assignment_id = :id", {
            id: assignmentData.assignment_id,
          })
          .execute();

          const batchAssignments = await batchAssignmentRepository.createQueryBuilder("batch_assignment").leftJoinAndSelect("batch_assignment.batch", "batches").where("batch_assignment.assignment_id=:assignment_id", { assignment_id: assignmentData.assignment_id }).getMany();

          const oldids: any = [];

          for (const i in batchAssignments) {
            const batchAssignment = batchAssignments[i];
            oldids.push(batchAssignment.batch.batch_id)
          }

          const newids:any = [];
          
          for (const i in assignmentData.batches){
            const batch = assignmentData.batches[i];
            newids.push(batch.batch_id)
          }

          const todelete = oldids.filter((element: number) => !newids.includes(element));

          todelete.forEach(async (element: number) => {
            const batchAssignments = await batchAssignmentRepository.createQueryBuilder("batch_assignments").where("batch_assignments.batch_id = :batch_id", { batch_id: element }).andWhere("batch_assignments.assignment_id = :assignment_id", { assignment_id: assignmentData.assignment_id }).getOne();
            if(batchAssignments) {
              await studentBatchRepository.createQueryBuilder("student_assignments")
                  .delete()
                  .from(StudentAssignments)
                  .where('student_assignments.batch_assignments_id IN (:...ids)', { ids: [batchAssignments.id]})
                  .execute();

              await batchAssignmentRepository.createQueryBuilder("batch_assignments")
                  .delete()
                  .from(BatchAssignments)
                  .where("batch_assignments.id IN (:...ids)", { ids: [batchAssignments.id] })
                  .execute();
            }
          });

          request.body.batches.forEach(async (element) => {
            const existingBatches = await batchRepository.findOneBy({
              batch_id: element.batch_id,
            })
            const alreadyAssignment = await batchAssignmentRepository.createQueryBuilder("batch_assignments").leftJoinAndSelect("batch_assignments.assignment", "assignments").where("batch_assignments.batch_id=:batch_id", { batch_id: element.batch_id }).andWhere("batch_assignments.assignment_id=:assignment_id", { assignment_id: assignmentData.assignment_id }).getOne();
            if(!alreadyAssignment && existingBatches) {
                const batchAssignment = new BatchAssignments();
                batchAssignment.assignment = existingAssignment;
                batchAssignment.batch = existingBatches;
                batchAssignment.assigning_date = new Date();
                batchAssignment.submission_deadline = element.submission_deadline;

                const batchAssignmentRepository = appDatasourse.getRepository(BatchAssignments);
                const savedBatchAssigment = await batchAssignmentRepository.save(batchAssignment);


                const studentBatchRepository = appDatasourse.getRepository(StudentBatch);
                const students = await studentBatchRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:batch_id", { batch_id: existingBatches.batch_id }).execute();

                const studentAssignmentRepository = appDatasourse.getRepository(StudentAssignments);
                const studentRepository = appDatasourse.getRepository(Students);

                for (const i in students) {
                  const student = students[i];
                  const existingStudent = await studentRepository.findOneBy({
                    student_id: student.student_batch_student_id,
                  })
                  if (existingStudent) {
                    const studentAssignment = new StudentAssignments();
                    studentAssignment.batchAssignments = savedBatchAssigment;
                    studentAssignment.student = existingStudent;
                    studentAssignment.submission_date = null as any;
                    await studentAssignmentRepository.save(studentAssignment);

                    const studentAttendanceRepository = appDatasourse.getRepository(StudentAttendance);
                    const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                    const attendedAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_assignments.status = :attended", { attended: true }).getCount();
                    const percentage = ((attendedAssignments / totalAssignments) * 100).toFixed(2);
                    const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                    const performance = (totalAttendace > 0 ? 0.75 * existingStudent.attendance + 0.25 * parseFloat(percentage) : 100 * 0.75 + 0.25 * parseFloat(percentage)).toFixed(2);
                    await studentRepository.createQueryBuilder()
                        .update(Students)
                        .set({ 
                            assignment: parseFloat(percentage),
                            performance: parseFloat(performance),
                        })
                        .where("student_id = :id", { id: existingStudent.student_id })
                        .execute();
                  }
                }
              }
              else if(alreadyAssignment && existingBatches){
                await batchAssignmentRepository.createQueryBuilder()
                        .update(BatchAssignments)
                        .set({ 
                            submission_deadline: element.submission_deadline
                        })
                        .where("id = :id", { id: alreadyAssignment.id })
                        .execute();
              }
          })

          const response = Success<string>("assignment data updated");
          reply.status(SUCCESS_GET).send(response);

        if (user_details) {
          recordAudit("assignment update", new Date, "assignments", user_details.user_id)
        }
      }
    } else {
      logger.error("assignment id is not available");
      const errResponse = CustomError<string>(
        BAD_REQUEST,
        "assignment is not provided"
      );
      reply.status(BAD_REQUEST).send(errResponse);
    }
  }

  //DELETE ASSIGNMENT
  async deleteAssignment(
    request: FastifyRequest<{ Querystring: { assignment_id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const assignmentId = request.query.assignment_id;
      const user_details = (request as any).user_details;

      const appDatasource = await getDataSource();
      const AssignmentRepository = appDatasource.getRepository(Assignments);
      const BatchAssignmentRepository = appDatasource.getRepository(BatchAssignments)
      const studentAssignmentRepository = appDatasource.getRepository(StudentAssignments)

      if (assignmentId) {
        const existingAssignment = await AssignmentRepository.createQueryBuilder("assignments").leftJoinAndSelect("assignments.teachers", "teachers").where("assignments.assignment_id=:id", { id: assignmentId }).getOne()

        if (existingAssignment) {
          const batchAssinments = await BatchAssignmentRepository.createQueryBuilder("batch_assignment").where("batch_assignment.assignment_id=:id", { id: request.query.assignment_id }).getMany();
          let ids: any = []

          batchAssinments.forEach((batch) => {
            ids.push(batch.id)
          })

            await studentAssignmentRepository.createQueryBuilder("student_assignments")
              .delete()
              .from(StudentAssignments)
              .where('student_assignments.batch_assignments_id IN (:...ids)', { ids: ids.length != 0? ids: [0] })
              .execute();


            await BatchAssignmentRepository.createQueryBuilder("batch_assignments")
              .delete()
              .from(BatchAssignments)
              .where("batch_assignments.id IN (:...ids)", { ids: ids.length != 0? ids: [0] })
              .execute();

            await AssignmentRepository.createQueryBuilder("assignments")
              .delete()
              .from(Assignments)
              .where("assignments.assignment_id = :student_id", { student_id: assignmentId })
              .execute();

          const response = Success<string>("assignment data deleted");
          reply.status(SUCCESS_GET).send(response);

          if (user_details) {
            recordAudit("assignments deleted", new Date, "assignments", user_details.user_id)
          }
        }
        else {
          logger.error("assignment is not available");
          const errResponse = CustomError<string>(
            BAD_REQUEST,
            "assignment is not available"
          );
          reply.status(BAD_REQUEST).send(errResponse);
        }
      }
      else {
        logger.error("assignment id is not available");
        const errResponse = CustomError<string>(
          BAD_REQUEST,
          "assignment is not provided"
        );
        reply.status(BAD_REQUEST).send(errResponse);
      }
    } catch (error) {      
      console.error("Error deleting assignment:", error);
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }


  batchAssignments = async (
    request: FastifyRequest<{
      Body: {
        assignment_id: number;
        batch_id: number;
        deadline: Date
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const body = request.body;
      const user_details = (request as any).user_details;

      if (body.assignment_id && body.batch_id && body.deadline) {
        const appDatasourse = await getDataSource();
        const assignmentRepository = appDatasourse.getRepository(Assignments);
        const existingAssignment = await assignmentRepository.findOne({
          where: { assignment_id: body.assignment_id },
        });
        if (existingAssignment) {
          const batchRepository = appDatasourse.getRepository(Batches);
          const existingBatch = await batchRepository.findOne({
            where: { batch_id: body.batch_id },
          });
          if (existingBatch) {
            const batchAssignment = new BatchAssignments();
            batchAssignment.assignment = existingAssignment;
            batchAssignment.batch = existingBatch;
            batchAssignment.assigning_date = new Date();
            batchAssignment.submission_deadline = body.deadline;

            const batchAssignmentRepository = appDatasourse.getRepository(BatchAssignments);
            const savedBatchAssigment = await batchAssignmentRepository.save(batchAssignment);


            const studentBatchRepository = appDatasourse.getRepository(StudentBatch);
            const students = await studentBatchRepository.createQueryBuilder("student_batch").where("student_batch.batch_id=:batch_id", { batch_id: existingBatch.batch_id }).execute();

            const studentAssignmentRepository = appDatasourse.getRepository(StudentAssignments);
            const studentRepository = appDatasourse.getRepository(Students);

            for (const i in students) {
              const student = students[i];
              const existingStudent = await studentRepository.findOneBy({
                student_id: student.student_batch_student_id,
              })
              if (existingStudent) {
                const studentAssignment = new StudentAssignments();
                studentAssignment.batchAssignments = savedBatchAssigment;
                studentAssignment.student = existingStudent;
                studentAssignment.submission_date = null as any;
                await studentAssignmentRepository.save(studentAssignment);

                const studentAttendanceRepository = appDatasourse.getRepository(StudentAttendance);
                const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                const attendedAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_assignments.status = :attended", { attended: true }).getCount();
                const percentage =  ((attendedAssignments / totalAssignments) * 100).toFixed(2);
                const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
                const performance = (totalAttendace > 0 ? 0.75 * existingStudent.attendance + 0.25 * parseFloat(percentage) : 100 * 0.75 + 0.25 * parseFloat(percentage)).toFixed(2);

                await studentRepository.createQueryBuilder()
                    .update(Students)
                    .set({ 
                        assignment: parseFloat(percentage),
                        performance: parseFloat(performance),
                    })
                    .where("student_id = :id", { id: existingStudent.student_id })
                    .execute();
              }
            }

            const successData = Success<string>(
              "Batch assignment saved successfully"
            );
            reply.status(SUCCESS_GET).send(successData);

            if (user_details) {
              recordAudit("batch assignment created", new Date, "batch assignment", user_details.user_id)
            }

          }
          else {
            const errResponse = CustomError<string>(
              BAD_REQUEST,
              "Batch not found"
            );
            reply.status(BAD_REQUEST).send(errResponse);
          }
        }
        else {
          const errResponse = CustomError<string>(
            BAD_REQUEST,
            "Assignment not found"
          );
          reply.status(BAD_REQUEST).send(errResponse);
        }
      }
      else {
        const errResponse = CustomError<string>(
          BAD_REQUEST,
          "Insufficient data provided"
        );
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }
    catch (error) {
      console.error("Error deleting assignment:", error);
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }

    updateStudentAssignment = async (
    request: FastifyRequest<{
      Body: {
        id: number;
        status?: boolean;
        grade?: number,
        date?: Date;
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const body = request.body;
      const user_details = (request as any).user_details;

      const appDataSource = await getDataSource();


      if (body.id) {
        const studentAssignmentRepository = appDataSource.getRepository(StudentAssignments);
        const studentRepository = appDataSource.getRepository(Students);
        const existingStudentAssignment = await studentAssignmentRepository.createQueryBuilder("student_assignments").leftJoinAndSelect("student_assignments.student", "students").leftJoinAndSelect("student_assignments.batchAssignments", "batch_assignments").where("student_assignments.id=:id", { id: body.id }).getOne();
        
        if (existingStudentAssignment) {
          if(body.date) {
            let bodyDate = new Date(body.date);
              if(bodyDate < new Date(existingStudentAssignment.batchAssignments.assigning_date)) {
                const errResponse = CustomError<string>(BAD_REQUEST,`Date must be greater than the assigning date.`);
                return reply.status(BAD_REQUEST).send(errResponse);                
              }
            }
          
          await studentAssignmentRepository
            .createQueryBuilder()
            .update(StudentAssignments)
            .set({
              status:'status' in body? body.status: true,
              grade: body.grade ? body.grade : existingStudentAssignment.grade,
              submission_date: body.date? body.date: existingStudentAssignment.submission_date
            })
            .where("id = :id", {
              id: body.id
            })
            .execute();

          const existingStudent = await studentRepository.findOneBy({
            student_id: existingStudentAssignment.student.student_id,
          });

          if(existingStudent) {
            const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance);
            const totalAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
            const attendedAssignments = await studentAssignmentRepository.createQueryBuilder("student_assignments").where("student_assignments.student_id=:student_id", { student_id: existingStudent.student_id }).andWhere("student_assignments.status = :attended", { attended: true }).getCount();
            const percentage =  ((attendedAssignments / totalAssignments) * 100).toFixed(2);
            const totalAttendace = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id=:student_id", { student_id: existingStudent.student_id }).getCount();
            const performance = (totalAttendace > 0 ? 0.75 * existingStudent.attendance + 0.25 * parseFloat(percentage) : 100 * 0.75 + 0.25 * parseFloat(percentage)).toFixed(2);

            await studentRepository.createQueryBuilder()
                .update(Students)
                .set({ 
                    assignment: parseFloat(percentage),
                    performance: parseFloat(performance),
                })
                .where("student_id = :id", { id: existingStudent.student_id })
                .execute();
          }

          const successData = Success<string>(
            "Student assignment updated successfully"
          );
          reply.status(SUCCESS_GET).send(successData);

          if (user_details) {
            recordAudit("student assignment updated", new Date, "student assignment", user_details.user_id)
          }
        }
        else {
          const errResponse = CustomError<string>(
            BAD_REQUEST,
            "Assignment not found"
          );
          reply.status(BAD_REQUEST).send(errResponse);
        }
      }
      else {
        const errResponse = CustomError<string>(
          BAD_REQUEST,
          "Insufficient data provided"
        );
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }
    catch (error) {
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }

  getStudentAssignments = async (
    request: FastifyRequest<{
      Querystring: {
        limit?: number;
        page?: number;
        id?: number
        pagenation?: string;
      }
    }>,
    reply: FastifyReply
  ) => {

    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;

    try {
      const appDataSource = await getDataSource();
      
      const studentAssignmentRepository = appDataSource.getRepository(StudentAssignments);
      const studentAssignmentQueryBuilder = studentAssignmentRepository.createQueryBuilder('student_assignments');

      studentAssignmentQueryBuilder.orderBy('student_assignments.submission_date','DESC')
      const existingStudentAssignments = studentAssignmentQueryBuilder.leftJoinAndSelect("student_assignments.student", "students")

      if(request.query.id) {
        existingStudentAssignments.where("student_assignments.batch_assignments_id=:id", { id: request.query.id })
      }

      const count = await existingStudentAssignments.getCount()

      if(request.query.pagenation == "none") {
        const data = await existingStudentAssignments.getMany()

        const successData = Success<any>({
          metadata: {
            totalcount: count
          },
          data: [...data]
        });
        reply.status(SUCCESS_GET).send(successData);
      }
      else {
        const data = await existingStudentAssignments.skip(offset).take(perPage).getMany()

        const successData = Success<any>({
          metadata: {
            totalcount: count
          },
          data: [...data]
        });
        reply.status(SUCCESS_GET).send(successData);
      }
    }
    catch (error) {
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }


  getBatchAssignments = async (
    request: FastifyRequest<{
      Querystring: {
        batch_id: number,
        page: number,
        limit: number,
        pagenattion: string
      }
    }>,
    reply: FastifyReply
  ) => {
    try {

      const page = request.query.page || 1;
      const perPage = request.query.limit || 10;
      const offset = (page - 1) * perPage;

      const appDataSource = await getDataSource()

      if(request.query.batch_id) {
        const batchAssignmentRepository = appDataSource.getRepository(BatchAssignments);

        const count = await batchAssignmentRepository.createQueryBuilder("batch_assignment").where("batch_assignment.batch_id=:batch_id", { batch_id: request.query.batch_id }).getCount()
        let data: any[] =[];

        if(request.query.pagenattion === "none") {
          data = await batchAssignmentRepository.createQueryBuilder("batch_assignment").leftJoinAndSelect("batch_assignment.assignment", "assignments").where("batch_assignment.batch_id=:batch_id", { batch_id: request.query.batch_id }).getMany()
        }
        else {
          data = await batchAssignmentRepository.createQueryBuilder("batch_assignment").leftJoinAndSelect("batch_assignment.assignment", "assignments").where("batch_assignment.batch_id=:batch_id", { batch_id: request.query.batch_id }).skip(offset).take(perPage).getMany()
        }

        const successData = Success<any>({
          metadata: {
            totalcount: count
          },
          data: [...data]
        });
        reply.status(SUCCESS_GET).send(successData);
      }
      else {
        const errorData = CustomError<string>(
          BAD_REQUEST,
          "batch id required"
        );
        reply.status(BAD_REQUEST).send(errorData);
      }
    }
    catch(error) {
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }


  deleteBatchAssignment = async (
    request: FastifyRequest<{
      Querystring: {
        id: number,
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const appDataSource = await getDataSource()

      if(request.query.id) {
        const batchAssignmentRepository = appDataSource.getRepository(BatchAssignments);
        const studentBatchRepository = appDataSource.getRepository(StudentAssignments);

        await studentBatchRepository.createQueryBuilder("student_assignments")
                  .delete()
                  .from("student_assignments")
                  .where("student_assignments.batch_assignments_id = :timing_id", { timing_id: request.query.id })
                  .execute();

        await batchAssignmentRepository.createQueryBuilder("batch_assignments")
                  .delete()
                  .from("batch_assignments")
                  .where("batch_assignments.id = :timing_id", { timing_id: request.query.id })
                  .execute();

        const successData = Success<any>("batch assignment deleted");
        reply.status(SUCCESS_GET).send(successData);
      }
      else {
        const errorData = CustomError<string>(
          BAD_REQUEST,
          "id required"
        );
        reply.status(BAD_REQUEST).send(errorData);
      }
    }
    catch(error) {
      const errorData = CustomError<string>(
        INTERNAL_ERROR,
        "Internal server error"
      );
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }

}




export default assignmentController;
