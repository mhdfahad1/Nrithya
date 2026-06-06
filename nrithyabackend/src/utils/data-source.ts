import dotenv from 'dotenv';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "../users/entities/user.entities";
import { Courses } from "../course/entities/course.entities";
import { Teachers } from "../teacher/entities/teachers.entities";
import { TeacherCourses } from "../teacher/entities/teacher.courses.entities";
import { Batches } from "../batch/entities/batch.entities";
import { BatchHistory } from "../batch/entities/batch.history";
import logger from "./logger";
import { Students } from "../student/entities/students.entities";
import { StudentBatch } from "../student/entities/student.batch.entities";
import { Assignments } from "../assignment/entities/assignments.entities";
import { BatchAssignments } from "../assignment/entities/batches.assignments.entities";
import { StudentAssignments } from "../assignment/entities/students.assignment.entities";
import { Payments } from "../fee/entities/fee.entities";
import { Calendar } from "../calender/entities/calender.entities";
import { CompensationBatchHistory } from "../compensation/entities/batch.compensation.history.entities";
import { CompensationStudentHistory } from "../compensation/entities/student.compensation.history.entities";
import { StudentCompensation } from "../compensation/entities/student.compensation.entities";
import { StudentAttendance } from "../attendance/entities/student.attendance.entities";
import { TeacherAttendance } from "../attendance/entities/teacher.attendance.entities";
import { Enquiries } from "../enquiries/entities/enquiries.entities";
import { EnquiryResponse } from "../enquiries/entities/enquiryresponse.entities";
import { EnquiryType } from "../enquiries/entities/enquirytype.entities";
import { AuditLog } from "../audit/entities/audit.entities";
import { Frequency } from "../frequency/entities/frequency.entities";
import { BatchesTimings } from "../batch/entities/batch.timitings";
import { BatchActivity } from '../batch/entities/batch.activity';
import { BankDetail } from '../bank/entites/bank.detail';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  ssl: process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false }
    : false,
  entities: [
    Users,
    Courses,
    Teachers,
    TeacherCourses,
    Batches,
    BatchesTimings,
    Students,
    StudentBatch,
    Assignments,
    BatchAssignments,
    StudentAssignments,
    BatchHistory,
    Payments,
    Calendar,
    StudentCompensation,
    TeacherAttendance,
    StudentAttendance,
    Enquiries,
    EnquiryType,
    EnquiryResponse,
    CompensationStudentHistory,
    CompensationBatchHistory,
    AuditLog,
    Frequency,
    BatchActivity,
    BankDetail
  ],
  subscribers: [],
  migrations: ["dist/migrations/*.js"],
});

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connection established");
  })
  .catch((error: Error) =>
    logger.error("Failed to initialize database connection", error)
  );

export const getDataSource = (delay = 3000): Promise<DataSource> => {
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (AppDataSource.isInitialized) resolve(AppDataSource);
      else reject("Failed to create connection with database");
    }, delay);
  });
};
