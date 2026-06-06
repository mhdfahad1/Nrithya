import { FastifyReply, FastifyRequest } from "fastify";
import { Courses } from "../entities/course.entities";
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
import { CourseDataInput, CourseSearch, courseUpdate } from "../types/course.types";
import { BatchStatus } from "../../batch/types/batch.enums";
import { Batches } from "../../batch/entities/batch.entities";
import { TeacherCourses } from "../../teacher/entities/teacher.courses.entities";

export class CourseController {

  // CREATE COURSE
  createCourse = async ( request: FastifyRequest<{ Body: CourseDataInput }>, reply: FastifyReply) => {
    
    try {
      const courseData = request.body;
      const user_details = (request as any).user_details

      if(courseData.course_name) {
        const appDatasourse = await getDataSource();
        const courseRepository = appDatasourse.getRepository(Courses);
        const existingCourse = await courseRepository.findOneBy({
          course_name: courseData.course_name, is_active: true
        })
        if(existingCourse) {
          logger.error(`Course already exists: ${courseData.course_name}`)
          const errorResponse = CustomError<string>(BAD_REQUEST, "Course name already exists consider using a another Name");
          reply.status(BAD_REQUEST).send(errorResponse);
        }
        else {
          const newCourse = new Courses();
          newCourse.course_name = courseData.course_name;
          newCourse.created_at = new Date();
          newCourse.updated_at = new Date();  
          await courseRepository.save(newCourse);
          const response = Success<string>("Course created successfully!")
          reply.status(SUCCESS_CREATE).send(response)
          if(user_details) {
            recordAudit("course created", new Date, "courses", user_details.user_id)
          }
        }
      }
      else {
        logger.error("Course name is not available");
        const errResponse = CustomError<string>(BAD_REQUEST, "Course name is required");
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }
    catch (error) {      
      logger.error(`Internal server error while creating new course`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }

  // LIST COURSE
  listCourse = async ( request: FastifyRequest<{ Querystring: CourseSearch }>, reply: FastifyReply) => {

    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;
    
    try {
      const courseData = request.query;
      const appDatasourse = await getDataSource();
      const courseRepository = appDatasourse.getRepository(Courses);
      const queryBuilder = courseRepository.createQueryBuilder('courses');
      queryBuilder.where('LOWER(courses.course_name) LIKE LOWER(:course_name)', { course_name: courseData.course_name ? `%${courseData.course_name}%`: '%%'})
      queryBuilder.andWhere('courses.is_active = :is_active', { is_active: true });
      if (courseData.sortorder == "desc") {
        queryBuilder.addOrderBy('LOWER(courses.course_name)', 'DESC');
      } else {
        queryBuilder.addOrderBy('LOWER(courses.course_name)', 'ASC');
      }

      let count;
      let response;
      let data;
      count = await queryBuilder.getCount();

      request.query.pagenation == "none" ? data = await queryBuilder.getMany() : data = await queryBuilder.skip(offset).take(perPage).getMany();
      response = Success<any>({ metadata: { totalcount: count }, data: [...data] })
      reply.status(SUCCESS_GET).send(response)
    }
    catch (error) {
      logger.error(`Internal server error while creating new course`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }

  
  // UPDATE COURSE
  updateCourse = async (request: FastifyRequest<{ Body: courseUpdate }>, reply: FastifyReply) => {
    const updateBody = request.body;  
    const user_details = (request as any).user_details;

    if(updateBody.course_id) {
        const appDatasourse = await getDataSource();
        const courseRepository = appDatasourse.getRepository(Courses);
        const existingCourse = await courseRepository.findOneBy({
            course_id: updateBody.course_id, is_active :true
        })
        if(existingCourse) {
          const courseName = await courseRepository.createQueryBuilder('course')
          .where('course.course_id != :courseId',{courseId:updateBody.course_id})
          .andWhere('LOWER(course.course_name) = LOWER(:courseName)',{courseName:updateBody.course_name})
          .andWhere('course.is_active = :isActive',{isActive: true})
          .getOne();          
          if(courseName){
            logger.error("course name already exists")
            return reply.code(BAD_REQUEST).send(CustomError(BAD_REQUEST, "course name already exists"));
          }

          existingCourse.course_name = request.body.course_name ? request.body.course_name : existingCourse.course_name
          existingCourse.updated_at = new Date();
          await courseRepository.save(existingCourse)
          logger.info(`course data updated successfully`);
          const response = Success<string>("course data updated")
          reply.status(SUCCESS_GET).send(response)
          if(user_details) {
            recordAudit("course updated", new Date, "courses", user_details.user_id)
          }
        }
        else {
            logger.error(`Course not found`);
            const errResponse = CustomError<string>(NOT_FOUND, "Course not found");
            reply.status(NOT_FOUND).send(errResponse);
        }
    }
    else {
        logger.error(`Internal server error while updating course`);
        const errResponse = CustomError<string>(BAD_REQUEST, "course id is not provided")
        reply.status(BAD_REQUEST).send(errResponse)
    }
  }


  deleteCourse = async (request: FastifyRequest<{ Params: {
    course_id: number
  } }>, reply: FastifyReply) => {
    const courseId = request.params.course_id;
    const user_details = (request as any).user_details;

    try {
      if(courseId) {
        const appDatasourse = await getDataSource();
        const courseRepository = appDatasourse.getRepository(Courses);
        const batchRepository = appDatasourse.getRepository(Batches);
        const teacherCourseRepository = appDatasourse.getRepository(TeacherCourses);

        const existingCourse = await courseRepository.findOneBy({
            course_id: courseId, is_active : true
        })

        if(existingCourse) {
          const existingBatch = await batchRepository.findOneBy({
            courses: existingCourse, status: BatchStatus.ONGOING
          })
  
          if(existingBatch) {
            logger.error(`This course is ongoing`);
            const errResponse = CustomError<string>(BAD_REQUEST, "This Course is ongoing");
            return reply.status(BAD_REQUEST).send(errResponse);
          }

          await teacherCourseRepository
            .createQueryBuilder()
            .delete()
            .from(TeacherCourses)
            .where("courses = :id", { id: courseId })
            .execute();

          await courseRepository
            .createQueryBuilder()
            .update(Courses)
            .set({ 
                is_active: false,
            })
            .where("course_id = :id", { id: courseId })
            .execute();
          logger.info(`Course deleted successfully`);
          const response = Success<string>("Course deleted successfully")
          reply.status(SUCCESS_GET).send(response)
          if(user_details) {
            recordAudit("course deleted", new Date, "courses", user_details.user_id)
          }
        }
        else {
            logger.error(`Course not found`);
            const errResponse = CustomError<string>(NOT_FOUND, "Course not found");
            reply.status(NOT_FOUND).send(errResponse);
        }
      }
      else {
        logger.error(`course id is not provided`);
        const errResponse = CustomError<string>(BAD_REQUEST, "course id is not provided")
        reply.status(BAD_REQUEST).send(errResponse)
      }
    }
    catch (error) {      
      logger.error(`Internal server error`);
      const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
      reply.status(INTERNAL_ERROR).send(errResponse);
    }
  }
}