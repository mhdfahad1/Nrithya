import { FastifyReply, FastifyRequest } from "fastify";
import { Batch, Course, CourseWithBatches, Teacher, TeacherBatchData, TeacherCourse, teacherCourse, TeacherDataInput, TeacherSearch, TeacherUpdateData, TeacherWithCourses, TeacherWithCoursesAndBatches } from "../types/teacher.types";
import { getDataSource } from "../../utils/data-source";
import { Teachers } from "../entities/teachers.entities";
import { CustomError, Success } from "../../utils/response";
import {
  BAD_REQUEST,
  createExcel,
  ERROR_COMMON_MESSAGE,
  INTERNAL_ERROR,
  NOT_FOUND,
  recordAudit,
  SUCCESS_CREATE,
  SUCCESS_GET,
} from "../../utils/common";
import { TeacherCourses } from "../entities/teacher.courses.entities";
import { Courses } from "../../course/entities/course.entities";
import { Batches } from "../../batch/entities/batch.entities";
import { TeacherStatus } from "../types/teacher.enums";
import logger from "../../utils/logger";
import { Query } from "pg";
import { BatchStatus } from "../../batch/types/batch.enums";

export class TeacherControllers {
  // CREATING TEACHERS
  async createTeacher( request: FastifyRequest<{ Body: TeacherDataInput }>, reply: FastifyReply) {
    try {
      const bodyData = request.body;
      const user_details = (request as any).user_details;
      if (bodyData.courses.length === 0) {
        logger.error("Bad request, Course is mandatory!");
        const data = CustomError<string>(BAD_REQUEST, "Bad request, Course is mandatory!");
        return reply.status(BAD_REQUEST).send(data);
      }    
      if (
        bodyData.first_name &&
        bodyData.date_of_birth &&
        bodyData.date_of_joining &&
        bodyData.whatsapp_number &&
        bodyData.gender == "male" || bodyData.gender == "female" || bodyData.gender == "other" 
      ) {
          const appDatasource = await getDataSource();
          const existingTeacher = await appDatasource.manager.findOne(Teachers, {
            where: { whatsapp_number: bodyData.whatsapp_number, status: TeacherStatus.ACTIVE },
          });
          if (existingTeacher) {
            logger.error("Teacher with the same whatsapp number already exists!");
            const errorData = CustomError<string>(BAD_REQUEST,"Bad request: Teacher with the same whatsapp number already exists!");
            return reply.status(BAD_REQUEST).send(errorData);
          } else {
            const teacher = new Teachers();
            teacher.first_name =bodyData.first_name;
            teacher.last_name =bodyData.last_name ? bodyData.last_name : "";
            teacher.gender =bodyData.gender;
            teacher.date_of_birth =bodyData.date_of_birth;
            teacher.date_of_joining =bodyData.date_of_joining;
            teacher.address =bodyData.address ?bodyData.address : "";
            teacher.place =bodyData.place ?bodyData.place : "";
            teacher.city =bodyData.city ?bodyData.city : "";
            teacher.state =bodyData.state ?bodyData.state : "";
            teacher.email =bodyData.email ?bodyData.email : "";
            teacher.qualification =bodyData.qualification ?bodyData.qualification : "";
            teacher.whatsapp_number =bodyData.whatsapp_number;
            teacher.alternative_number =bodyData.alternative_number ?bodyData.alternative_number : "";
            teacher.bio =bodyData.bio ?bodyData.bio : "";
            teacher.created_at = new Date();
            teacher.updated_at = new Date();
            
            const teacherCourseRepository = appDatasource.getRepository(TeacherCourses);
            const teacherCoursePromises = bodyData.courses.map(async (courseId) => {
              const existingCourse = await appDatasource.manager.findOne(Courses, {
                where: { course_id: courseId },
              });
              if (existingCourse) {
                if(existingCourse.is_active){
                  const teacherSaveResponse = await appDatasource.manager.save(teacher);
                  const teacherCourse = new TeacherCourses();
                  teacherCourse.teachers = teacherSaveResponse;
                  teacherCourse.courses = existingCourse;
                  await teacherCourseRepository.save(teacherCourse);
                } else{
                  logger.error(`Course "${existingCourse.course_name}" is not active hence teacher not assigned to "${existingCourse.course_name}"`);
                  const errorData = CustomError<string>(BAD_REQUEST, `Course "${existingCourse.course_name}" is not active hence teacher not assigned to "${existingCourse.course_name}"`);
                  return reply.status(BAD_REQUEST).send(errorData);
                }
              } else{
                logger.error(`Course with ID ${courseId} not found`)
                const errorData = CustomError<string>(NOT_FOUND, `Course with ID ${courseId} not found`);
                return reply.status(NOT_FOUND).send(errorData);
              }
            });
            await Promise.all(teacherCoursePromises);
            logger.info("Teacher registered successfully");
            const resData = Success<string>("Teacher registered successfully");
            reply.status(SUCCESS_CREATE).send(resData);

            if(user_details) {
              recordAudit("teacher created", new Date, "teachers", user_details.user_id)
            }
          }
        } else {
          logger.error("Bad request, Mandatory fields are compulsory!");
          const data = CustomError<string>(BAD_REQUEST,"Bad request, Mandatory fields are compulsory!");
          return reply.status(BAD_REQUEST).send(data);
        }
      } catch (error) {
        logger.error(ERROR_COMMON_MESSAGE);
        const errorData = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
        return reply.status(INTERNAL_ERROR).send(errorData);
      }
  }


  //   LIST INDIVIDUAL TEACHER
  async getTeacher( request: FastifyRequest<{Params:{teacher_id:number}} >, reply: FastifyReply) {
    try {
      const teacherId:number = request.params.teacher_id;

      const appDatasource = await getDataSource();
      const teacherRepository = appDatasource.getRepository(Teachers)
      const teacherCoursesRepository = appDatasource.getRepository(TeacherCourses)
      const batchRepository = appDatasource.getRepository(Batches);

      if (teacherId) {
        const existingTeacher = await teacherRepository.findOneBy({teacher_id : teacherId})
        if(existingTeacher) {
          const queryBuilder =teacherCoursesRepository.createQueryBuilder('teacher_courses')
          queryBuilder.leftJoinAndSelect("teacher_courses.courses","courses")
          queryBuilder.leftJoinAndSelect("teacher_courses.teachers","teachers")
          queryBuilder.where("teacher_courses.teacher_id = :teacher_id",{teacher_id: teacherId})
          const teacherDatas=await queryBuilder.getMany();
          
          let transformedData;
          if(teacherDatas.length>0){
            transformedData = Object.values(teacherDatas.reduce<{ [key: number]: { teacher: TeacherCourse} }>((acc,{teachers,courses})=>{
              const teacherId =teachers.teacher_id
              if (!acc[teacherId]) {
                acc[teacherId] = { 
                  teacher: { ...teachers, coursesAndBatches: [] },
                };
              }

              const courseWithBatches: CourseWithBatches = {
                course_id: courses.course_id,
                course_name: courses.course_name,
                is_active: courses.is_active,
                batches: [], // Initialize batches array
              };
              
              acc[teacherId].teacher.coursesAndBatches.push(courseWithBatches);
              return acc;
            },{}))
          } else{
            transformedData = [{ teacher: { ...existingTeacher, coursesAndBatches: [] } }];
          }
          
          await Promise.all(Object.values(transformedData).map(async (teacherData) => {
            await Promise.all(teacherData.teacher.coursesAndBatches.map(async (courseWithBatches: CourseWithBatches) => {
                const courseBatchesQueryBuilder = batchRepository.createQueryBuilder('batches')
                    .select([
                        'batch_id', 'batch_name', 'fee', 'max_strength',
                        'current_strength', 'whatsapp_link', 'status', 'batch_started'
                    ])
                    .where('batches.teacher_id = :teacher_id', { teacher_id: teacherData.teacher.teacher_id })
                    .andWhere('batches.course_id = :course_id', { course_id: courseWithBatches.course_id });
        
                const batches = await courseBatchesQueryBuilder.getRawMany();
                courseWithBatches.batches = batches;
            }));
          }));
        
          
          logger.info("Teacher listed successfully");
          const resData = Success<any>(transformedData);
          return reply.status(SUCCESS_GET).send(resData);
        } else {
          logger.error("Teacher does not exist!");
          const data = CustomError<string>(NOT_FOUND,"Teacher does not exist!");
          return reply.status(NOT_FOUND).send(data);
        } 
      } else{
        logger.error("Teacher id is missing!");
        const data = CustomError<string>(BAD_REQUEST,"Teacher id is missing!");
        return reply.status(BAD_REQUEST).send(data);

      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const data = CustomError<string>(INTERNAL_ERROR,ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(data);
    }
  }


// LIST ALL TEACHERS
async getAllTeacher(request: FastifyRequest<{ Querystring:TeacherSearch }>,reply: FastifyReply){
  try {
    const page = request.query.page || 1;
    const perPage = request.query.limit || 10;
    const offset = (page - 1) * perPage;
  
    const teacherName = request.query.teacher_name;
    const courseId = request.query.course_id;
    const batchId = request.query.batch_id;

    const appDataSource = await getDataSource();
    const teacherRepository = appDataSource.getRepository(Teachers);
    const teacherCourseRepository = appDataSource.getRepository(TeacherCourses);
    const batchRepository = appDataSource.getRepository(Batches);    
    
    let teachersQueryBuilder =teacherRepository.createQueryBuilder("teachers").where("teachers.status=:status",{status:"active"});
    
    // Date filter
    if(request.query.from && request.query.to){
      const startDate:Date = new Date(request.query.from);
      const endDate:Date = new Date(request.query.to);
      
      if(endDate > startDate){
        teachersQueryBuilder.andWhere('teachers.date_of_joining BETWEEN :startDate AND :endDate',{startDate, endDate});
      } else{
        logger.error("Invalid date!");
        const errResponse = CustomError<string>(BAD_REQUEST,"Invalid date!");
        reply.status(BAD_REQUEST).send(errResponse);
      }
    }

    // course filter
    if(courseId){
      const teacherCourses = await teacherCourseRepository.createQueryBuilder('teacher_courses')
      .where('teacher_courses.course_id = :course_id',{course_id: courseId})
      .execute();
      
      const ids:any =[];
      for(let i in teacherCourses){
        const teacherCourse = teacherCourses[i];
        ids.push(teacherCourse.teacher_courses_teacher_id);
      }

      if(ids.length > 0){
        teachersQueryBuilder.andWhere('teachers.teacher_id IN (:...ids)', { ids: ids })
      } else{
        teachersQueryBuilder.andWhere('teachers.teacher_id IN (:...ids)', { ids: [0] })
      }
    }
    
    // batch filter
    if(batchId){
      const batchTeachers = await batchRepository.createQueryBuilder('batches')
      .where('batches.batch_id = :batch_id',{batch_id: batchId})
      .execute();

      const ids:any =[];
      for(let i in batchTeachers){
        const batchTeacher = batchTeachers[i];
        ids.push(batchTeacher.batches_teacher_id);
      }

      if(ids.length > 0){
        teachersQueryBuilder.andWhere('teachers.teacher_id IN (:...ids)', { ids: ids })
      } else{
        teachersQueryBuilder.andWhere('teachers.teacher_id IN (:...ids)', { ids: [0] })
      }
    } 
    
    // Teacher searching 
    if (teacherName) {
      const teacherNameArray = teacherName.split(" ");
      if (teacherNameArray.length === 1) {
          teachersQueryBuilder.andWhere('(teachers.status = :status AND (LOWER(teachers.first_name) LIKE LOWER(:name) OR LOWER(teachers.last_name) LIKE LOWER(:name)))', { status: "active", name: `%${teacherNameArray[0]}%` });
      } else if (teacherNameArray.length === 2) {
          teachersQueryBuilder.andWhere('(teachers.status = :status AND LOWER(teachers.first_name) LIKE LOWER(:first_name) AND LOWER(teachers.last_name) LIKE LOWER(:last_name))', { status: "active", first_name: `%${teacherNameArray[0]}%`, last_name: `%${teacherNameArray[1]}%` });
      }
    }
    
    if (request.query.sortorder == "desc") {
      teachersQueryBuilder.addOrderBy('LOWER(teachers.first_name)', 'DESC');
    } else {
      teachersQueryBuilder.addOrderBy('LOWER(teachers.first_name)', 'ASC');
    }
    
      let count;
      let teachers
      count = await teachersQueryBuilder.getCount();

      if(request.query.pagenation=="none"){
        teachers = await teachersQueryBuilder.getMany();
      }else{
        teachers = await teachersQueryBuilder.offset(offset).take(perPage).getMany(); 
      }

      if(request.query.download){
        if(request.query.save){
          teachers = await teachersQueryBuilder.getMany();
        } 
      }
    // Setting total count of data
    const resobj: any = {metadata: {
      total_count: count
    }, data: []};
    
    const teachersWithCoursesAndBatches: TeacherWithCoursesAndBatches[] = [];
    for(let i in teachers){
      let coursesWithBatches: CourseWithBatches[] = [];
      const teacher = teachers[i];
      const obj: any = {...teacher, coursesAndBatches: []}
      const teacherCourses:TeacherWithCourses[] = await teacherCourseRepository.createQueryBuilder('teacher_courses')
      .leftJoinAndSelect("teacher_courses.courses","courses")
      .leftJoinAndSelect("teacher_courses.teachers", "teachers")
      .where('teacher_courses.teacher_id = :teacher_id', { teacher_id: teacher.teacher_id})
      .getMany();
      
      for(let j in teacherCourses){
        const teacherCourse = teacherCourses[j];
          const teacherBatches:any[] = await batchRepository.createQueryBuilder("batches")
          .select(["batch_id", "batch_name", "fee", "max_strength", "current_strength", "whatsapp_link", "status", "batch_started"])
          .where('batches.teacher_id = :teacher_id', { teacher_id: teacherCourse.teachers.teacher_id })
          .andWhere('batches.course_id = :course_id', { course_id: teacherCourse.courses.course_id })
          .getRawMany();

          const courseWithBatches = {
            ...teacherCourse.courses,
            batches: teacherBatches
          };

          coursesWithBatches.push(courseWithBatches);
      }
      obj.coursesAndBatches = coursesWithBatches;
      teachersWithCoursesAndBatches.push(obj);
    }
    resobj.data.push(...teachersWithCoursesAndBatches);

    if(request.query.download){
      return resobj;
    } else{
      if(request.query.save){
        const teachers = resobj.data;
        const data: any[] = [];

        for (let i in teachers) {
            const teacherData = teachers[i];
            let teacherCourses: string[] = [];
            const coursesAndBatches = teacherData.coursesAndBatches;
            for (let j in coursesAndBatches) {
                const courseBatchData = coursesAndBatches[j];
                let courseBatches: string[] = [];
            
                const batches = courseBatchData.batches;
                for (let k in batches) {
                    const batchesData = batches[k];
                    courseBatches.push(batchesData.batch_name);
                }
                // Concatenate course name with its batches
                teacherCourses.push(`${courseBatchData.course_name}: ${courseBatches.join(', ')}`);
            }
        
            // Push teacher's data as an array
            data.push([
                teacherData.first_name,
                teacherData.last_name,
                teacherData.whatsapp_number,
                teacherCourses.join(', ')
            ]);
        } 
        const book = await createExcel(["First Name","Last Name","Whatsapp Number","Courses-Batches"], data);
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename="tecaherList.xlsx"')
        const file_buffer = await book.xlsx.writeBuffer();
        reply.send(file_buffer);

      } else{
        logger.info("All Teachers listed successfully");
        const response = Success<any>(resobj);
        reply.status(SUCCESS_GET).send(response);
      }
    }

   } catch (error) {
    logger.error(ERROR_COMMON_MESSAGE);
    const data = CustomError<string>(INTERNAL_ERROR,ERROR_COMMON_MESSAGE);
    reply.status(INTERNAL_ERROR).send(data);
   }
}


  //   UPDATE TEACHERS
  async updateTeacher( request: FastifyRequest<{ Body: TeacherUpdateData & { teacher_id: number }}>,reply: FastifyReply) {
    try {
      const { teacher_id, ...updateData } = request.body;
      const user_details = (request as any).user_details

      if (teacher_id ) {
          const appDatasource = await getDataSource();
          const teacherRepository = appDatasource.getRepository(Teachers);
          const courseRepository = appDatasource.getRepository(Courses)
          const teacherCourseRepository = appDatasource.getRepository(TeacherCourses);
      
          const existingTeacherToUpdate = await teacherRepository.findOne({
            where: { teacher_id: teacher_id }
          });

          if(updateData.whatsapp_number){
            const existingTeacher = await teacherRepository.createQueryBuilder('teachers')
            .where('teachers.whatsapp_number = :whatsapp_number', { whatsapp_number: updateData.whatsapp_number })
            .andWhere('teachers.teacher_id != :teacher_id', { teacher_id: teacher_id })
            .andWhere('teachers.status = :status', { status: TeacherStatus.ACTIVE })
            .getOne();
            if (existingTeacher) {
              const errResponse = CustomError<string>(BAD_REQUEST, "Teacher already exist with this whatsapp number");
              return reply.status(BAD_REQUEST).send(errResponse);
            }
          }

          if (existingTeacherToUpdate) {
            await teacherRepository.createQueryBuilder()
            .update(Teachers)
            .set({
              first_name:updateData.first_name? updateData.first_name : existingTeacherToUpdate.first_name,
              last_name:'last_name' in updateData? updateData.last_name : existingTeacherToUpdate.last_name,
              gender:updateData.gender? updateData.gender : existingTeacherToUpdate.gender,
              date_of_birth:updateData.date_of_birth? updateData.date_of_birth : existingTeacherToUpdate.date_of_birth,
              date_of_joining:updateData.date_of_joining? updateData.date_of_joining: existingTeacherToUpdate.date_of_joining,
              address: 'address' in updateData? updateData.address : existingTeacherToUpdate.address,
              place:'place' in updateData? updateData.place: existingTeacherToUpdate.place,
              city:'city' in updateData? updateData.city: existingTeacherToUpdate.city,
              state:'state' in updateData? updateData.state: existingTeacherToUpdate.state,
              whatsapp_number:updateData.whatsapp_number? updateData.whatsapp_number: existingTeacherToUpdate.whatsapp_number,
              alternative_number: 'alternative_number' in updateData? updateData.alternative_number: existingTeacherToUpdate.alternative_number,
              email:'email' in updateData? updateData.email: existingTeacherToUpdate.email,
              bio:'bio' in updateData? updateData.bio: existingTeacherToUpdate.bio,
              qualification: 'qualification' in updateData? updateData.qualification: existingTeacherToUpdate.qualification,
              updated_at:new Date(),
            })
            .where("teacher_id = :teacher_id", { teacher_id: teacher_id })
            .execute();

            if(updateData.courses){
              const teachercoursePromises = updateData.courses.map(async (courseId) =>{
                const existingCourse = await courseRepository.findOne({
                  where: { course_id: courseId },
                });
                if(existingCourse){
                  if(existingCourse.is_active){
                    const existingTeacherCourse = await teacherCourseRepository.createQueryBuilder('teacher_courses')
                    .leftJoinAndSelect("teacher_courses.teachers", "teachers")
                    .leftJoinAndSelect("teacher_courses.courses","courses")
                    .where('teacher_courses.teacher_id = :teacher_id', { teacher_id: existingTeacherToUpdate.teacher_id})
                    .andWhere('teacher_courses.course_id = :course_id', { course_id: existingCourse.course_id})
                    .getOne();
                    
                    if(existingTeacherCourse){
                      await teacherCourseRepository.createQueryBuilder('teacher_courses')
                      .delete()
                      .where('teacher_id = :teacher_id',{teacher_id:existingTeacherCourse.teachers.teacher_id})
                      .execute()

                      const teacherCourses = new TeacherCourses();
                      teacherCourses.teachers = existingTeacherToUpdate;
                      teacherCourses.courses = existingCourse;
                      await teacherCourseRepository.save(teacherCourses)

                    } else{
                      const newTeacherCourse = teacherCourseRepository.create({
                        teachers: existingTeacherToUpdate,
                        courses: existingCourse
                      });
                      await teacherCourseRepository.save(newTeacherCourse);
                    }
                  } else{
                    logger.error( `Course "${existingCourse.course_name}" is not active hence teacher not assigned to "${existingCourse.course_name}"`);
                    const errorData = CustomError<string>(BAD_REQUEST, `Course "${existingCourse.course_name}" is not active hence teacher not assigned to "${existingCourse.course_name}"`);
                    reply.status(BAD_REQUEST).send(errorData);
                    return;
                  }
                } else{
                  logger.error(`No course found with ID${courseId}`);
                  const errorData = CustomError<string>(NOT_FOUND, `No course found with ID${courseId}`);
                  reply.status(NOT_FOUND).send(errorData);
                  return
                }
              });  
              await Promise.all(teachercoursePromises);
            } 
            // If no courses is coming 
            if(updateData.courses?.length===0){          
              await teacherCourseRepository.delete({teachers:existingTeacherToUpdate})
            }
        
            logger.info("Teacher updated sucessfully");
            const successData = Success<string>("Teacher updated sucessfully");
            reply.status(SUCCESS_GET).send(successData);

            if(user_details) {
              recordAudit("teacher updated", new Date, "teachers", user_details.user_id)
            }
          } else{
            logger.error("Teacher not found")
            const errorData = CustomError<string>(NOT_FOUND, "Teacher not found");
            reply.status(NOT_FOUND).send(errorData);
            return;
          }
      } else {
        logger.info("Bad request, all fields are compulsory!");
        const data = CustomError<string>( BAD_REQUEST,"Bad request, all fields are compulsory!");
        reply.status(BAD_REQUEST).send(data);
      }
    } catch (error) {
      logger.error(ERROR_COMMON_MESSAGE);
      const errorData = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }

  
  // DELETE TEACHERS
  async deleteTeacher (request:FastifyRequest<{Querystring:{teacher_id:number}}>, reply:FastifyReply) {
    try {
      const teacherId = request.query.teacher_id
      const user_details = (request as any).user_details

      const appDatasource = await getDataSource();
      const teacherRepository = appDatasource.getRepository(Teachers);
      const batchRepository = appDatasource.getRepository(Batches);

      if(teacherId){
        const existingTeacher = await teacherRepository.findOneBy({teacher_id:teacherId});
        if(existingTeacher){
          const existingTeacherBatch = await batchRepository.findOneBy({teachers:existingTeacher, status:BatchStatus.ONGOING});
          if(existingTeacherBatch){
            logger.error(`Teacher already linked to a batch! please update the batch first.`);
            const errResponse = CustomError<string>(BAD_REQUEST, "Teacher already linked to a batch! please update the batch first.");
            return reply.status(BAD_REQUEST).send(errResponse);
          } else{
            existingTeacher.status = TeacherStatus.INACTIVE;
            await teacherRepository.save(existingTeacher);

            logger.info("Teacher deleted successfully");
            const successData = Success<string>("Teacher deleted sucessfully");
            reply.status(SUCCESS_CREATE).send(successData);

            if(user_details) {
              recordAudit("teacher deleted", new Date, "teachers", user_details.user_id)
            }
          }
        } else{
          logger.error(`No teacher related to this teacher id!`);
          const errResponse = CustomError<string>(NOT_FOUND, "No teacher related to this teacher id!");
          reply.status(NOT_FOUND).send(errResponse);
        }
      } else{
          logger.error(`Teacher id is missing!`);
          const errResponse = CustomError<string>(BAD_REQUEST, "Teacher id is missing!");
          reply.status(BAD_REQUEST).send(errResponse);
      }
    } catch (error) {
      logger.error(`Internal server error`);
      const errorData = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }
}
