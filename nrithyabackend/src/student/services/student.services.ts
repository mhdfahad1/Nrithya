import { FastifyReply, FastifyRequest } from "fastify";
import { Students } from "../entities/students.entities";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import {
  SUCCESS_CREATE,
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  NOT_FOUND,
  ERROR_COMMON_MESSAGE,
  recordAudit,
  createExcel,
} from "../../utils/common";
import {
  StudentDataInput,
  StudentDeleteData,
  StudentSearch,
  StudentStatus,
  studentUpdate,
} from "../types/student.types";
import { StudentBatch } from "../entities/student.batch.entities";
import { Batches } from "../../batch/entities/batch.entities";
import logger from "../../utils/logger";
import { StudentBatchStatus } from "../types/student.batch.enums";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { BatchAssignments } from "../../assignment/entities/batches.assignments.entities";
import { StudentAssignments } from "../../assignment/entities/students.assignment.entities";
import { BatchHistory } from "../../batch/entities/batch.history";
import { Payments } from "../../fee/entities/fee.entities";
import { CompensationStudentHistory } from "../../compensation/entities/student.compensation.history.entities";
import { StudentLevels } from "../types/student.enums";
import { BatchesTimings } from "../../batch/entities/batch.timitings";

class StudentController {
  //CREATE STUDENT
  createStudent = async (
    request: FastifyRequest<{ Body: StudentDataInput }>,
    reply: FastifyReply
  ) => {
    try {
      const body = request.body;
      const user_details = (request as any).user_details;

      if (
        body.first_name &&
        body.gender &&
        body.date_of_birth &&
        body.whatsapp_number
      ) {
        const appDatasourse = await getDataSource();
        const studentRepository = appDatasourse.getRepository(Students);
        const batchAssignmentRepository =
          appDatasourse.getRepository(BatchAssignments);
        const studentAssignmentRepository =
          appDatasourse.getRepository(StudentAssignments);
        const batchHistoryRepository =
          appDatasourse.getRepository(BatchHistory);
        const studentBatchRepository =
          appDatasourse.getRepository(StudentBatch);
        const batchRepository = appDatasourse.getRepository(Batches);

        if (body.batches) {
          for (const batch of body.batches) {
            const existingBatch = await batchRepository.findOneBy({
              batch_id: batch.batch_id,
            });

            const currentStrength = await studentBatchRepository
              .createQueryBuilder("student_batch")
              .leftJoinAndSelect("student_batch.batches", "batches")
              .where("student_batch.batch_id = :batch_id", {
                batch_id: batch.batch_id,
              })
              .andWhere("student_batch.status != :status", {
                status: StudentBatchStatus.REMOVED,
              })
              .getMany();
            const currentStrengthCount = currentStrength.length;

            if (existingBatch) {
              if (currentStrengthCount >= existingBatch.max_strength) {
                logger.error(`Batch ${existingBatch.batch_name} is full`);
                const errResponse = CustomError<string>(
                  BAD_REQUEST,
                  `Batch ${existingBatch.batch_name} is full`
                );
                return reply.status(BAD_REQUEST).send(errResponse);
              }
            } else {
              logger.error("Batch Not Found");
              const errResponse = CustomError<string>(
                BAD_REQUEST,
                "Batch Not Found"
              );
              return reply.status(BAD_REQUEST).send(errResponse);
            }
          }
        }

        const latestStudent = await studentRepository
          .createQueryBuilder("student")
          .orderBy("student.student_id", "DESC")
          .getOne();

        let regno;
        try {
          if (latestStudent) {
            regno = parseInt(latestStudent?.reg_no);
            regno++;
          } else {
            regno = 2000;
          }
        } catch (error) {
          regno = 2000;
        }

        const student = new Students();
        student.reg_no = regno.toString();
        student.first_name = body.first_name;
        student.last_name = body.last_name ? body.last_name : "";
        student.gender = body.gender;
        student.date_of_birth = body.date_of_birth;
        student.address = body.address ? body.address : "";
        student.place = body.place ? body.place : "";
        student.city = body.city ? body.city : "";
        student.state = body.state ? body.state : "";
        student.status = StudentStatus.ACTIVE;
        student.level = body.level ? body.level : StudentLevels.DEFAULT;
        student.alternative_number = body.alternative_number
          ? body.alternative_number
          : "";
        student.whatsapp_number = body.whatsapp_number;
        student.email = body.email ? body.email : "";
        student.created_at = new Date();
        student.updated_at = new Date();
        const newStudent = await studentRepository.save(student);

        if (body.batches) {
          body.batches.forEach(async (batch) => {
            const existingBatch = await batchRepository.findOneBy({
              batch_id: batch.batch_id,
            });

            if (existingBatch) {
              const studentBatch = new StudentBatch();
              studentBatch.joining_date = batch.joining_date;
              studentBatch.pending_fee = existingBatch.fee;
              (studentBatch.students = newStudent),
                (studentBatch.batches = existingBatch);

              await studentBatchRepository.save(studentBatch);

              await batchRepository
                .createQueryBuilder()
                .update(Batches)
                .set({
                  current_strength: existingBatch.current_strength + 1,
                })
                .where("batch_id = :id", { id: batch.batch_id })
                .execute();

              const batchAssignments = await batchAssignmentRepository
                .createQueryBuilder("batch_assignments")
                .where("batch_assignments.batch_id = :batch_id", {
                  batch_id: batch.batch_id,
                })
                .getMany();

              batchAssignments.forEach(async (assignment) => {
                const studentAssignment = new StudentAssignments();
                studentAssignment.batchAssignments = assignment;
                studentAssignment.grade = 0;
                studentAssignment.status = false;
                studentAssignment.student = newStudent;

                await studentAssignmentRepository.save(studentAssignment);
              });
              const batchHistoryQueryBuilder =
                batchHistoryRepository.createQueryBuilder("batch_history");
              const existingBatchHistory = await batchHistoryQueryBuilder
                .where("batch_history.student_id = :student_id", {
                  student_id: newStudent.student_id,
                })
                .andWhere("batch_history.batch_id = :batch_id", {
                  batch_id: existingBatch.batch_id,
                })
                .getOne();

              if (!existingBatchHistory) {
                const batchHistory = new BatchHistory();
                batchHistory.student.student_id = newStudent.student_id;
                batchHistory.batch.batch_id = existingBatch.batch_id;
                await batchHistoryRepository.save(batchHistory);
              }
            } else {
              const data = CustomError<string>(
                BAD_REQUEST,
                "Provide a valid batch id"
              );
              return reply.status(BAD_REQUEST).send(data);
            }
          });
        }

        if (user_details) {
          recordAudit(
            "student created",
            new Date(),
            "students",
            user_details.user_id
          );
        }

        const response = Success<any>("Student created successfully");
        return reply.status(SUCCESS_CREATE).send(response);
      } else {
        logger.error("More data required");
        const data = CustomError<string>(BAD_REQUEST, "More data required");
        reply.status(BAD_REQUEST).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE, error);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };

  listStudents = async (
    request: FastifyRequest<{ Querystring: StudentSearch }>,
    reply: FastifyReply
  ) => {
    try {
      const page = request.query.page || 1;
      const perPage = request.query.limit || 10;
      const offset = (page - 1) * perPage;

      const appDatasourse = await getDataSource();

      const studentRepository = appDatasourse.getRepository(Students);
      const batchRepository = appDatasourse.getRepository(Batches);
      const studentBatchRepository = appDatasourse.getRepository(StudentBatch);
      const studentAttendanceRepository =
        appDatasourse.getRepository(StudentAttendance);
      const teacherRepository = appDatasourse.getRepository(Teachers);

      const studentsBuilder = studentRepository.createQueryBuilder("students");

      if (!request.query.download) {
        if (request.query.status === "active") {
          studentsBuilder.where("students.status = :status", {
            status: "active",
          });
        } else if (request.query.status === "suspended") {
          studentsBuilder.where("students.status = :status", {
            status: "suspended",
          });
        } else if (request.query.status === "dismissed") {
          studentsBuilder.where("students.status = :status", {
            status: "dismissed",
          });
        }
      } else {
        if (request.query.status === "active") {
          studentsBuilder.where("students.status = :status", {
            status: "active",
          });
        }
      }

      if (request.query.from && request.query.to) {
        if (request.query.from < request.query.to) {
          const from: Date = new Date(request.query.from);
          const to: Date = new Date(request.query.to);
          studentsBuilder.andWhere(
            "students.registration_date BETWEEN :fromDate AND :toDate",
            {
              fromDate: from,
              toDate: to,
            }
          );
        }
      }

      if (request.query.teacher_id && !(request.query.status === "suspended")) {
        const teacher = await teacherRepository
          .createQueryBuilder("teacher")
          .where("teacher.teacher_id = :id", { id: request.query.teacher_id })
          .getOne();

        if (!teacher) {
          studentsBuilder.andWhere("1=0");
        }
        const teacher_Batch: number[] = [];
        const batches = await batchRepository
          .createQueryBuilder("batch")
          .leftJoinAndSelect("batch.teachers", "teachers")
          .where("batch.teacher_id = :id", { id: request.query.teacher_id })
          .getMany();

        for (const batch of batches) {
          teacher_Batch.push(batch.batch_id);
        }

        const studentBatchBuilder =
          studentBatchRepository.createQueryBuilder("student_batch");

        if (teacher_Batch.length > 0) {
          const student_batches = await studentBatchBuilder
            .leftJoinAndSelect("student_batch.students", "students")
            .where("student_batch.batch_id IN (:...ids)", {
              ids: teacher_Batch,
            })
            .where("student_batch.batch_id IN (:...ids)", {
              ids: teacher_Batch,
            })
            .getMany();

          const studentIds: number[] = student_batches.map(
            (student_batch) => student_batch.students.student_id
          );
          const distinctStudentIds: number[] = [...new Set(studentIds)];

          if (distinctStudentIds.length > 0) {
            studentsBuilder.andWhere("students.student_id IN (:...ids)", {
              ids: distinctStudentIds,
            });
          } else {
            studentsBuilder.andWhere("students.student_id IN (:...ids)", {
              ids: [0],
            });
          }
        } else {
          studentsBuilder.andWhere("students.student_id IN (:...ids)", {
            ids: [0],
          });
        }
      }

      if (request.query.batch_id && !(request.query.status === "suspended")) {
        const batch_students = await studentBatchRepository
          .createQueryBuilder("student_batch")
          .where("student_batch.batch_id = :batch_id", {
            batch_id: request.query.batch_id,
          })
          .andWhere("student_batch.status != :status", {
            status: StudentBatchStatus.REMOVED,
          })
          .execute();
        const ids: any = [];
        for (const i in batch_students) {
          const batch_student = batch_students[i];
          ids.push(batch_student.student_batch_student_id);
        }
        if (ids.length > 0) {
          studentsBuilder.andWhere("students.student_id IN (:...ids)", {
            ids: ids,
          });
        } else {
          studentsBuilder.andWhere("students.student_id IN (:...ids)", {
            ids: [0],
          });
        }
      } else {
        if (request.query.student_name) {
          if (request.query.status) {
            const studentNameArray = request.query.student_name.split(" ");
            if (studentNameArray.length == 1) {
              studentsBuilder.andWhere(
                "LOWER(students.first_name) LIKE LOWER(:name) OR LOWER(students.last_name) LIKE LOWER(:name)",
                { name: `%${studentNameArray[0]}%` }
              );
            } else if (studentNameArray.length == 2) {
              studentsBuilder.andWhere(
                "LOWER(students.first_name) LIKE LOWER(:first_name) AND LOWER(students.last_name) LIKE LOWER(:last_name)",
                {
                  first_name: `%${studentNameArray[0]}%`,
                  last_name: `%${studentNameArray[1]}%`,
                }
              );
            }
          } else {
            const studentNameArray = request.query.student_name.split(" ");
            if (studentNameArray.length == 1) {
              studentsBuilder.andWhere(
                "LOWER(students.first_name) LIKE LOWER(:name) OR LOWER(students.last_name) LIKE LOWER(:name)",
                { name: `%${studentNameArray[0]}%` }
              );
            } else if (studentNameArray.length == 2) {
              studentsBuilder.andWhere(
                "LOWER(students.first_name) LIKE LOWER(:first_name) AND LOWER(students.last_name) LIKE LOWER(:last_name)",
                {
                  first_name: `%${studentNameArray[0]}%`,
                  last_name: `%${studentNameArray[1]}%`,
                }
              );
            }
          }
        }
      }

      if (request.query.sortorder == "desc") {
        studentsBuilder.addOrderBy("LOWER(students.first_name)", "DESC");
      } else {
        studentsBuilder.addOrderBy("LOWER(students.first_name)", "ASC");
      }

      let students;
      let count;

      if (request.query.performance) {
        studentsBuilder.where("students.performance >= :performance", {
          performance: request.query.performance,
        });
      }

      if (request.query.attendance) {
        studentsBuilder.andWhere("students.attendance >= :performance", {
          performance: request.query.attendance,
        });
      }

      if (request.query.assignment) {
        studentsBuilder.andWhere("students.assignment >= :performance", {
          performance: request.query.assignment,
        });
      }

      if (request.query.pagenation == "none") {
        count = await studentsBuilder.getCount();
        students = await studentsBuilder.getMany();
      } else {
        count = await studentsBuilder.getCount();
        students = await studentsBuilder.skip(offset).take(perPage).getMany();
      }

      if (request.query.download) {
        return { count: count, students: students };
      }

      if (request.query.batch_id && request.query.percent) {
        for (const i in students) {
          const student = students[i] as any;
          const total = await studentAttendanceRepository
            .createQueryBuilder("student_attendance")
            .where("student_attendance.batch_id =:id", {
              id: request.query.batch_id,
            })
            .andWhere("student_attendance.student_id=:student_id", {
              student_id: student.student_id,
            })
            .getCount();
          const attended = await studentAttendanceRepository
            .createQueryBuilder("student_attendance")
            .where("student_attendance.batch_id =:id", {
              id: request.query.batch_id,
            })
            .andWhere("student_attendance.student_id=:student_id", {
              student_id: student.student_id,
            })
            .andWhere("student_attendance.attended=:attended", {
              attended: true,
            })
            .getCount();
          let percentage =
            total == 0 ? "0.00" : ((attended / total) * 100).toFixed(2);
          student.percentage = parseFloat(percentage);
        }
      }
      const resobj: any = { metadata: { totalcount: count }, data: [] };
      let totalNewStudentsCount = 0;
      if (request.query.batch_id && request.query.calendar_date) {
        const compensationHistoryRepository = appDatasourse.getRepository(
          CompensationStudentHistory
        );
        const compensationBatches = await compensationHistoryRepository
          .createQueryBuilder("compensation")
          .leftJoinAndSelect("compensation.student", "student")
          .leftJoinAndSelect("compensation.new_batches", "new_batches")
          .leftJoinAndSelect("compensation.own_batches", "own_batches")
          .leftJoinAndSelect("new_batches.courses", "courses")
          .leftJoinAndSelect("new_batches.teachers", "teachers")
          .where("compensation.new_batch = :batch", {
            batch: request.query.batch_id,
          })
          .andWhere("compensation.new_date = :date", {
            date: new Date(request.query.calendar_date),
          })
          .getMany();
        // Add compensation students to the response
        for (const compensation of compensationBatches) {
          const studentData = {
            reg_no: compensation.student.reg_no,
            student_id: compensation.student.student_id,
            first_name: compensation.student.first_name,
            last_name: compensation.student.last_name,
            gender: compensation.student.gender,
            date_of_birth: compensation.student.date_of_birth,
            address: compensation.student.address,
            place: compensation.student.place,
            city: compensation.student.city,
            state: compensation.student.state,
            alternative_number: compensation.student.alternative_number,
            whatsapp_number: compensation.student.whatsapp_number,
            email: compensation.student.email,
            registration_date: compensation.student.registration_date,
            status: compensation.student.status,
            level: compensation.student.level,
            created_at: compensation.student.created_at,
            updated_at: compensation.student.updated_at,
            performance: compensation.student.performance,
            assignment: compensation.student.assignment,
            attendance: compensation.student.attendance,
            batches: [
              {
                batch_id: compensation.new_batches.batch_id,
                courses: compensation.new_batches.courses,
                teachers: compensation.new_batches.teachers,
                batch_name: compensation.new_batches.batch_name,
                fee: compensation.new_batches.fee,
                max_strength: compensation.new_batches.max_strength,
                current_strength: compensation.new_batches.current_strength,
                whatsapp_link: compensation.new_batches.whatsapp_link,
                status: compensation.new_batches.status,
                batch_started: compensation.new_batches.batch_started,
                created_at: compensation.new_batches.created_at,
                updated_at: compensation.new_batches.updated_at,
                joining_date: compensation.new_date,
                batch_status: "ongoing",
                is_compensation: true,
                original_batch_id: compensation.own_batches.batch_id,
              },
            ],
          };
          // Add student to response if not already present
          const existingStudentIndex = resobj.data.findIndex(
            (s: any) => s.student_id === studentData.student_id
          );

          if (existingStudentIndex === -1) {
            resobj.data.push(studentData);
            totalNewStudentsCount++;
          } else {
            // If student exists, add compensation batch to their batches array
            resobj.data[existingStudentIndex].batches.push(
              studentData.batches[0]
            );
          }
        }
      }
      for (const i in students) {
        const student = students[i];
        const obj: any = { ...student, batches: [] };
        const studentbatches = await studentBatchRepository
          .createQueryBuilder("student_batch")
          .leftJoinAndSelect("student_batch.batches", "batches")
          .addSelect("student_batch.joining_date", "student_batch.status")
          .where("student_batch.student_id = :student_id", {
            student_id: student.student_id,
          })
          .andWhere("student_batch.status != :status", {
            status: StudentBatchStatus.REMOVED,
          })
          .getMany();

        for (const j in studentbatches) {
          const studentbatch = studentbatches[j];
          const builder = batchRepository
            .createQueryBuilder("batches")
            .leftJoinAndSelect("batches.courses", "courses")
            .leftJoinAndSelect("batches.teachers", "teachers");

          const batch = await builder
            .where("batches.batch_id = :batch_id", {
              batch_id: studentbatch.batches.batch_id,
            })
            .getMany();

          if (batch) {
            const batchde = batch[0];
            const batchWithJoiningDate = {
              ...batchde,
              joining_date: studentbatch.joining_date,
              batch_status: studentbatch.status,
              is_compensation: false,
            };
            obj.batches.push(batchWithJoiningDate);
          }
        }
        resobj.data.push(obj);
      }

      resobj.metadata.totalcount = count + totalNewStudentsCount;
      if (request.query.save) {
        const data: any[] = [];

        for (let i in resobj.data) {
          const row = resobj.data[i];
          let batches = "";
          for (let j in row.batches) {
            const batch = row.batches[j];
            batches += batch.batch_name + ", ";
          }
          const rowarr = [
            row.reg_no,
            row.first_name,
            row.last_name,
            row.gender,
            row.date_of_birth,
            row.address,
            row.place,
            row.city,
            row.state,
            row.whatsapp_number,
            row.alternative_number,
            row.level,
            batches,
          ];
          data.push(rowarr);
        }

        const book = await createExcel(
          [
            "Reg No.",
            "First Name",
            "Last Name",
            "Gender",
            "Date of Birth",
            "Address",
            "Place",
            "City",
            "State",
            "Whatsapp Number",
            "Alternative Number",
            "Level",
            "Batches",
          ],
          data
        );
        reply.header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        reply.header(
          "Content-Disposition",
          'attachment; filename="studentslist.xlsx"'
        );

        const file_buffer = await book.xlsx.writeBuffer();
        return reply.send(file_buffer);
      } else {
        const response = Success<any>(resobj);
        return reply.status(SUCCESS_GET).send(response);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };

  updateStudent = async (
    request: FastifyRequest<{ Body: studentUpdate }>,
    reply: FastifyReply
  ) => {
    try {
      const data = request.body;
      const user_details = (request as any).user_details;

      const appDatasourse = await getDataSource();

      const studentRepository = appDatasourse.getRepository(Students);
      const batchRepository = appDatasourse.getRepository(Batches);
      const studentBatchRepository = appDatasourse.getRepository(StudentBatch);
      const batchAssignmentRepository =
        appDatasourse.getRepository(BatchAssignments);
      const studentAssignmentRepository =
        appDatasourse.getRepository(StudentAssignments);
      const batchHistoryRepository = appDatasourse.getRepository(BatchHistory);
      const studentPaymentRepository = appDatasourse.getRepository(Payments);
      const studentAttendanceRepository =
        appDatasourse.getRepository(StudentAttendance);
      const batchTimingsRepository =
        appDatasourse.getRepository(BatchesTimings);

      const existingStudent = await studentRepository.findOneBy({
        student_id: request.body.student_id,
      });
      if (!existingStudent) {
        logger.error("Student not found");
        return reply
          .status(NOT_FOUND)
          .send(CustomError<string>(NOT_FOUND, "Student not found"));
      }

      if (
        request.body.batches !== undefined &&
        request.body.batches.length > 0 &&
        request.body.batches !== null
      ) {
        const existingBatches = await studentBatchRepository
          .createQueryBuilder("student_batch")
          .leftJoinAndSelect("student_batch.batches", "batches")
          .where("student_batch.batch_id IN (:...batch_ids)", {
            batch_ids: request.body.batches.map((batch) => batch.batch_id),
          })
          .andWhere("student_batch.student_id = :student_id", {
            student_id: data.student_id,
          })
          .getMany();

        // Update status for existing batches
        for (const existingBatch of existingBatches) {
          const updatedBatch = request.body.batches.find(
            (batch) => batch.batch_id === existingBatch.batches.batch_id
          );

          if (updatedBatch && updatedBatch.status !== existingBatch.status) {
            await studentBatchRepository
              .createQueryBuilder()
              .update(StudentBatch)
              .set({
                status: updatedBatch.status,
                joining_date:
                  updatedBatch.joining_date || existingBatch.joining_date,
              })
              .where("id = :id", { id: existingBatch.id })
              .execute();
          }
        }

        // Rest of the existing code for handling new batches...
        const existingBatchIds = existingBatches.map(
          (batch) => batch.batches.batch_id
        );
        const newBatchesOnly = request.body.batches.filter(
          (batch) => !existingBatchIds.includes(batch.batch_id)
        );

        for (const batch of newBatchesOnly) {
          const existingBatch = await batchRepository.findOneBy({
            batch_id: batch.batch_id,
          });
          if (existingBatch) {
            const currentStrength = await studentBatchRepository
              .createQueryBuilder("student_batch")
              .leftJoinAndSelect("student_batch.batches", "batches")
              .where("student_batch.batch_id = :batch_id", {
                batch_id: batch.batch_id,
              })
              .getMany();
            const currentStrengthCount = currentStrength.length;

            if (currentStrengthCount >= existingBatch.max_strength) {
              logger.error(`Batch ${existingBatch.batch_name} is full`);
              const errResponse = CustomError<string>(
                BAD_REQUEST,
                `Batch ${existingBatch.batch_name} is full`
              );
              return reply.status(BAD_REQUEST).send(errResponse);
            }

            // --- Attendance creation for new student in batch ---
            // 1. Get all unique attendance dates for this batch after joining_date
            const attendanceDates = await studentAttendanceRepository
              .createQueryBuilder("student_attendance")
              .select([
                "student_attendance.date AS date",
                "student_attendance.start_time AS start_time",
                "student_attendance.end_time AS end_time"
              ])              
              .where("student_attendance.batch_id = :batch_id", {
                batch_id: batch.batch_id,
              })
              .andWhere("student_attendance.date >= :joining_date", {
                joining_date: batch.joining_date,
              })
              .orderBy("student_attendance.date", "ASC")
              .getRawMany();
              console.log(attendanceDates,'dvh')
              for (const attendanceDateObj of attendanceDates) {
                const attendanceDate = attendanceDateObj.date;
              // Check if attendance already exists for this student, batch, and date
              const alreadyExists = await studentAttendanceRepository
                .createQueryBuilder("student_attendance")
                .where("student_attendance.batch_id = :batch_id", {
                  batch_id: batch.batch_id,
                })
                .andWhere("student_attendance.students = :student_id", {
                  student_id: data.student_id,
                })
                .andWhere("student_attendance.date = :date", {
                  date: attendanceDate,
                })
                .getOne();
                console.log(existingStudent)

                if (!alreadyExists) {
                    // Create attendance record (default: attended = false, late_by = '', reason = '')
                    const newAttendance = new StudentAttendance();
                    newAttendance.attended = false;
                    newAttendance.date = attendanceDate;
                    newAttendance.students = existingStudent;
                    newAttendance.batch = existingBatch;
                    newAttendance.start_time=attendanceDateObj.start_time;
                    newAttendance.end_time=attendanceDateObj.end_time;
                    // Optionally set start_time/end_time if needed
                    await studentAttendanceRepository.save(newAttendance);
                  }
            }
            // --- End attendance creation ---
          } else {
            logger.error("Batch Not Found");
            const errResponse = CustomError<string>(
              BAD_REQUEST,
              "Batch Not Found"
            );
            return reply.status(BAD_REQUEST).send(errResponse);
          }
        }
        const currentBatches = await studentBatchRepository
          .createQueryBuilder("student_batch")
          .leftJoinAndSelect("student_batch.batches", "batches")
          .where("student_batch.student_id = :student_id", {
            student_id: data.student_id,
          })
          .getMany();
        const newBatchIds = request.body.batches.map((batch) => batch.batch_id);
        const batchesToRemove = currentBatches.filter(
          (currentBatch) => !newBatchIds.includes(currentBatch.batches.batch_id)
        );
        // Set status as REMOVED for old batches
        for (const batchToRemove of batchesToRemove) {
          await studentBatchRepository
            .createQueryBuilder()
            .update(StudentBatch)
            .set({ status: StudentBatchStatus.REMOVED })
            .where("id = :id", { id: batchToRemove.id })
            .execute();
        }
      }

      if (data.student_id) {
        if (existingStudent) {
          await studentRepository
            .createQueryBuilder()
            .update(Students)
            .set({
              first_name: data.first_name
                ? data.first_name
                : existingStudent.first_name,
              last_name:
                "last_name" in data
                  ? data.last_name
                  : existingStudent.last_name,
              gender: data.gender ? data.gender : existingStudent.gender,
              date_of_birth: data.date_of_birth
                ? data.date_of_birth
                : existingStudent.date_of_birth,
              address:
                "address" in data ? data.address : existingStudent.address,
              place: "place" in data ? data.place : existingStudent.place,
              city: "city" in data ? data.city : existingStudent.city,
              state: "state" in data ? data.state : existingStudent.state,
              alternative_number:
                "alternative_number" in data
                  ? data.alternative_number
                  : existingStudent.alternative_number,
              whatsapp_number: data.whatsapp_number
                ? data.whatsapp_number
                : existingStudent.whatsapp_number,
              email: "email" in data ? data.email : existingStudent.email,
              status: "active",
              level: "level" in data ? data.level : existingStudent.level,
              updated_at: new Date(),
            })
            .where("student_id = :id", { id: data.student_id })
            .execute();

          if (data.batches) {
            for (let i in data.batches) {
              const batch = data.batches[i];

              const existingbatch = await batchRepository.findOneBy({
                batch_id: batch.batch_id,
              });

              if (existingbatch) {
                if (batch.status == StudentBatchStatus.ACTIVE) {
                  const existingStudentInBatch = await studentBatchRepository
                    .createQueryBuilder("student_batch")
                    .where("student_batch.batch_id = :batch_id", {
                      batch_id: existingbatch.batch_id,
                    })
                    .andWhere("student_batch.student_id = :student_id", {
                      student_id: existingStudent.student_id,
                    })
                    .getOne();

                  if (
                    existingStudentInBatch?.status ==
                    StudentBatchStatus.SUSPENDED
                  ) {
                    const lastPayment = await studentPaymentRepository
                      .createQueryBuilder("payments")
                      .where("payments.student_id = :student_id", {
                        student_id: existingStudent.student_id,
                      })
                      .andWhere("payments.batch_id = :batch_id", {
                        batch_id: existingbatch.batch_id,
                      })
                      .orderBy("payments.payment_id", "DESC")
                      .getOne();

                    if (lastPayment) {
                      await studentPaymentRepository
                        .createQueryBuilder()
                        .update(Payments)
                        .set({
                          due_date: new Date(),
                        })
                        .where("payment_id = :id", {
                          id: lastPayment.payment_id,
                        })
                        .execute();
                    }
                  }
                }
              }
            }

            const studentBatches = await studentBatchRepository
              .createQueryBuilder("student_batch")
              .leftJoinAndSelect("student_batch.batches", "batches")
              .where("student_batch.student_id = :student_id", {
                student_id: existingStudent.student_id,
              })
              .getMany();
            for (let i in studentBatches) {
              const batch = studentBatches[i];

              const existingbatch = await batchRepository.findOneBy({
                batch_id: batch.batches.batch_id,
              });

              if (existingbatch) {
                // await studentBatchRepository.createQueryBuilder("student_batch")
                //   .delete()
                //   .where("student_batch.student_id = :student_id", { student_id: existingStudent.student_id })
                //   .andWhere("student_batch.batch_id = :batch_id", { batch_id: existingbatch.batch_id })
                //   .execute();

                await batchRepository
                  .createQueryBuilder()
                  .update(Batches)
                  .set({
                    current_strength: existingbatch.current_strength - 1,
                  })
                  .where("batch_id = :id", { id: batch.batches.batch_id })
                  .execute();
              }
            }

            for (let i in data.batches) {
              const batch = data.batches[i];

              const existingbatch = await batchRepository.findOneBy({
                batch_id: batch.batch_id,
              });

              if (existingbatch) {
                const existingStudentInBatch = await studentBatchRepository
                  .createQueryBuilder("student_batch")
                  .where("student_batch.batch_id = :batch_id", {
                    batch_id: existingbatch.batch_id,
                  })
                  .andWhere("student_batch.student_id = :student_id", {
                    student_id: existingStudent.student_id,
                  })
                  .getOne();

                const batchTimings = await batchTimingsRepository.findOneBy({
                  batch: { batch_id: batch.batch_id },
                });

                if (!existingStudentInBatch) {
                  const batchStudent = new StudentBatch();
                  batchStudent.batches = existingbatch;
                  batchStudent.students = existingStudent;
                  batchStudent.status = batch.status
                    ? batch.status
                    : StudentBatchStatus.ACTIVE;
                  batchStudent.joining_date = batch.joining_date;
                  batchStudent.pending_fee = existingbatch.fee;
                  await studentBatchRepository.save(batchStudent);

                  // const studentAttendents = new StudentAttendance()
                  // studentAttendents.batch = existingbatch
                  // studentAttendents.students = existingStudent
                  // studentAttendents.attended = false
                  // studentAttendents.date = new Date()
                  // studentAttendents.start_time = batchTimings?.start_time ?? ''
                  // studentAttendents.end_time = batchTimings?.end_time ?? ''
                  // await studentAttendanceRepository.save(studentAttendents)

                  await batchRepository
                    .createQueryBuilder()
                    .update(Batches)
                    .set({
                      current_strength: existingbatch.current_strength + 1,
                    })
                    .where("batch_id = :id", { id: existingbatch.batch_id })
                    .execute();

                  const batchAssignments = await batchAssignmentRepository
                    .createQueryBuilder("batch_assignments")
                    .where("batch_assignments.batch_id = :batch_id", {
                      batch_id: batch.batch_id,
                    })
                    .getMany();

                  batchAssignments.forEach(async (assignment) => {
                    const existingAssignment = await studentAssignmentRepository
                      .createQueryBuilder("student_assignment")
                      .where("student_assignment.student_id = :student_id", {
                        student_id: existingStudent.student_id,
                      })
                      .andWhere(
                        "student_assignment.batch_assignments_id = :id",
                        { id: assignment.id }
                      )
                      .getOne();

                    if (!existingAssignment) {
                      const studentAssignment = new StudentAssignments();
                      studentAssignment.batchAssignments = assignment;
                      studentAssignment.grade = 0;
                      studentAssignment.status = false;
                      studentAssignment.student = existingStudent;
                      await studentAssignmentRepository.save(studentAssignment);
                    }
                  });
                }

                const batchHistoryQueryBuilder =
                  batchHistoryRepository.createQueryBuilder("batch_history");
                const existingBatchHistory = await batchHistoryQueryBuilder
                  .where("batch_history.student_id = :student_id", {
                    student_id: existingStudent.student_id,
                  })
                  .andWhere("batch_history.batch_id = :batch_id", {
                    batch_id: existingbatch.batch_id,
                  })
                  .getOne();

                if (!existingBatchHistory) {
                  const batchHistory = new BatchHistory();
                  batchHistory.student = existingStudent;
                  batchHistory.batch = existingbatch;
                  await batchHistoryRepository.save(batchHistory);
                }
              }
            }
            const studentBatch = await studentBatchRepository
              .createQueryBuilder("student_batch")
              .leftJoinAndSelect("student_batch.batches", "batches")
              .where("student_batch.student_id = :student_id", {
                student_id: existingStudent.student_id,
              })
              .getMany();

            const activeBatchIds = studentBatch.map(
              (sb) => sb.batches.batch_id
            );
            const today = new Date();
            const compensationHistoryRepository = appDatasourse.getRepository(
              CompensationStudentHistory
            );
            const compensationRecords = await compensationHistoryRepository
              .createQueryBuilder("compensation_student_history")
              .leftJoinAndSelect(
                "compensation_student_history.own_batches",
                "own_batches"
              )
              .where("compensation_student_history.student_id = :student_id", {
                student_id: existingStudent.student_id,
              })
              .andWhere("compensation_student_history.new_date >= :date", {
                date: today,
              })
              .getMany();

            const studentAttendaceRemovedBatch =
              await studentAttendanceRepository
                .createQueryBuilder("student_attendance")
                .leftJoinAndSelect("student_attendance.batch", "batch")
                .where("student_attendance.student_id = :student_id", {
                  student_id: existingStudent.student_id,
                })
                .getMany();

            const compensationRecordsToDelete = compensationRecords.filter(
              (record) => !activeBatchIds.includes(record.own_batches.batch_id)
            );

            const studentAttendaceRecordsToDelete =
              studentAttendaceRemovedBatch.filter(
                (record) => !activeBatchIds.includes(record.batch.batch_id)
              );

            //if a batch is removed from the student editing phase then the attendace for the student should be deleted
            if (studentAttendaceRecordsToDelete.length > 0) {
              await studentAttendanceRepository
                .createQueryBuilder()
                .delete()
                .from(StudentAttendance)
                .whereInIds(
                  studentAttendaceRecordsToDelete.map((record) => record.id)
                )
                .execute();
            }

            if (compensationRecordsToDelete.length > 0) {
              await compensationHistoryRepository
                .createQueryBuilder()
                .delete()
                .from(CompensationStudentHistory)
                .whereInIds(
                  compensationRecordsToDelete.map((record) => record.id)
                )
                .execute();
            }
          }
          const response = Success<any>("student data updated successfully");
          reply.status(SUCCESS_GET).send(response);

          if (user_details) {
            recordAudit(
              "student updated",
              new Date(),
              "students",
              user_details.user_id
            );
          }
        } else {
          logger.error("student id is not available");
          const data = CustomError<string>(NOT_FOUND, "student is unavailable");
          reply.status(NOT_FOUND).send(data);
        }
      } else {
        logger.error("student id is not available");
        const data = CustomError<string>(
          NOT_FOUND,
          "student id is not available"
        );
        reply.status(NOT_FOUND).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };

  singleStudentlist = async (
    request: FastifyRequest<{
      Params: {
        student_id: number;
      };
    }>,
    reply: FastifyReply
  ) => {
    try {
      if (request.params.student_id) {
        const appDataSource = await getDataSource();
        const studentRepository = appDataSource.getRepository(Students);
        const batchRepository = appDataSource.getRepository(Batches);
        const studentBatchRepository =
          appDataSource.getRepository(StudentBatch);

        const existingStudent = await studentRepository
          .createQueryBuilder("student")
          .where("student.student_id = :student_id", {
            student_id: request.params.student_id,
          })
          .andWhere("student.status != :status", {
            status: StudentStatus.DISMISSED,
          })
          .getOne();

        if (existingStudent) {
          // Fixed the query to properly select status
          const batches = await studentBatchRepository
            .createQueryBuilder("student_batch")
            .leftJoinAndSelect("student_batch.batches", "batches")
            .select([
              "student_batch.id",
              "student_batch.joining_date",
              "student_batch.status", // Explicitly select status
              "batches",
            ])
            .where("student_batch.student_id = :student_id", {
              student_id: existingStudent.student_id,
            })
            .andWhere("student_batch.status != :status", {
              status: StudentBatchStatus.REMOVED,
            })
            .getMany();

          const studentbatches: any = [];

          for (const batch of batches) {
            const batchDetails = await batchRepository
              .createQueryBuilder("batches")
              .leftJoinAndSelect("batches.courses", "courses")
              .leftJoinAndSelect("batches.teachers", "teachers")
              .where("batches.batch_id = :id", { id: batch.batches.batch_id })
              .getOne();

            if (batchDetails) {
              // Add the correct status from student_batch
              studentbatches.push({
                ...batchDetails,
                joining_date: batch.joining_date,
                batch_status: batch.status, // Use the actual status from student_batch
              });
            }
          }

          const responseObj: any = {
            ...existingStudent,
            batches: studentbatches,
          };
          const response = Success<any>(responseObj);
          return reply.status(SUCCESS_GET).send(response);
        } else {
          logger.error("student is not exist or not found!");
          const data = CustomError<string>(
            BAD_REQUEST,
            "student is not exist or not found!"
          );
          reply.status(BAD_REQUEST).send(data);
        }
      } else {
        logger.error("student id is not available");
        const data = CustomError<string>(
          BAD_REQUEST,
          "student id is not available"
        );
        reply.status(BAD_REQUEST).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };

  deleteStudent = async (
    request: FastifyRequest<{ Querystring: StudentDeleteData }>,
    reply: FastifyReply
  ) => {
    try {
      const user_details = (request as any).user_details;
      const dismissed = request.query.dismiss;

      if (request.query.student_id) {
        const appDataSource = await getDataSource();

        const studentRepository = appDataSource.getRepository(Students);
        const batchRepository = appDataSource.getRepository(Batches);
        const studentAssignmentRepository =
          appDataSource.getRepository(StudentAssignments);
        const batchAssignmentRepository =
          appDataSource.getRepository(BatchAssignments);

        const existingStudent = await studentRepository.findOneBy({
          student_id: request.query.student_id,
        });

        if (existingStudent) {
          const studentBatchRepository =
            appDataSource.getRepository(StudentBatch);

          const batches = await studentBatchRepository
            .createQueryBuilder("student_batch")
            .leftJoinAndSelect("student_batch.batches", "batches")
            .where("student_batch.student_id = :student_id", {
              student_id: existingStudent.student_id,
            })
            .getMany();

          if (dismissed) {
            await studentBatchRepository
              .createQueryBuilder("student_batch")
              .delete()
              .where("student_batch.student_id = :student_id", {
                student_id: existingStudent.student_id,
              })
              .execute();

            await studentRepository
              .createQueryBuilder()
              .update(Students)
              .set({ status: StudentStatus.DISMISSED })
              .where("student_id = :id", { id: existingStudent.student_id })
              .execute();
            const studentAssignmentQueryBuilder =
              studentAssignmentRepository.createQueryBuilder(
                "student_assignments"
              );
            const batchAssignmentQueryBuilder =
              batchAssignmentRepository.createQueryBuilder("batch_assignments");

            const batchAssignments = [];
            for (let i in batches) {
              const batchId = batches[i].batches.batch_id;

              const existingBatchAssignments = await batchAssignmentQueryBuilder
                .where("batch_assignments.batch_id = :id", { id: batchId })
                .getMany();
              batchAssignments.push(...existingBatchAssignments);
            }

            const studentAssignmentIds = [];
            for (let i in batchAssignments) {
              const batchAssignment = batchAssignments[i];
              studentAssignmentIds.push(batchAssignment.id);
            }
            if (studentAssignmentIds.length > 0) {
              await studentAssignmentQueryBuilder
                .delete()
                .where(
                  "student_assignments.batch_assignments_id IN (:...ids)",
                  { ids: studentAssignmentIds }
                )
                .andWhere("student_assignments.student_id =:id", {
                  id: existingStudent.student_id,
                })
                .execute();
            }

            for (let i in batches) {
              const batch = batches[i];
              await batchRepository
                .createQueryBuilder()
                .update(Batches)
                .set({
                  current_strength: batch.batches.current_strength - 1,
                })
                .where("batch_id = :id", { id: batch.batches.batch_id })
                .execute();
            }
          } else {
            await studentRepository
              .createQueryBuilder()
              .update(Students)
              .set({
                status: StudentStatus.SUSPENDED,
              })
              .where("student_id = :id", { id: existingStudent.student_id })
              .execute();
          }

          const response = Success<any>("student deleted");
          reply.status(SUCCESS_GET).send(response);

          if (user_details) {
            recordAudit(
              "student deleted",
              new Date(),
              "students",
              user_details.user_id
            );
          }
        } else {
          logger.error("Student not  available");
          const data = CustomError<string>(NOT_FOUND, "Student not available");
          reply.status(NOT_FOUND).send(data);
        }
      } else {
        logger.error("student id is not available");
        const data = CustomError<string>(
          NOT_FOUND,
          "student id is not available"
        );
        reply.status(NOT_FOUND).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };

  getStudentBatchHistory = async (
    request: FastifyRequest<{ Querystring: { student_id: number } }>,
    reply: FastifyReply
  ) => {
    try {
      const studentId = request.query.student_id;

      const appDataSource = await getDataSource();
      const batchHistoryRepository = appDataSource.getRepository(BatchHistory);
      const batchHistoryQueryBuilder =
        batchHistoryRepository.createQueryBuilder("batch_history");

      const studentRepository = appDataSource.getRepository(Students);

      if (studentId) {
        const existingStudent = await studentRepository.findOneBy({
          student_id: request.query.student_id,
        });
        if (existingStudent) {
          const resData = await batchHistoryQueryBuilder
            .leftJoinAndSelect("batch_history.student", "student")
            .leftJoinAndSelect("batch_history.batch", "batch")
            .leftJoinAndSelect("batch.teachers", "teachers")
            .leftJoinAndSelect("batch.courses", "courses")
            .where("batch_history.student_id = :student_id", {
              student_id: existingStudent.student_id,
            })
            .getRawMany();

          const dataArr: any[] = [];
          for (let i in resData) {
            const data = resData[i];
            dataArr.push({
              id: data.batch_history_id,
              student_id: data.batch_history_student_id,
              student_name:
                data.student_first_name + " " + data.student_last_name,
              batch_id: data.batch_history_batch_id,
              batch_name: data.batch_batch_name,
              teacher_name:
                data.teachers_first_name + " " + data.teachers_last_name,
              course: data.courses_course_name,
            });
          }

          const count = await batchHistoryQueryBuilder.getCount();
          const resobj: any = { metadata: { totalcount: count }, data: [] };
          resobj.data.push(...dataArr);

          const response = Success<any>(resobj);
          return reply.status(SUCCESS_GET).send(response);
        } else {
          logger.error("student not exist or not found!");
          const data = CustomError<string>(
            BAD_REQUEST,
            "student not exist or not found!"
          );
          reply.status(BAD_REQUEST).send(data);
        }
      } else {
        logger.error("student id is missing!");
        const data = CustomError<string>(BAD_REQUEST, "student id is missing!");
        reply.status(BAD_REQUEST).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE, error);
      const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  };
}

export default StudentController;
