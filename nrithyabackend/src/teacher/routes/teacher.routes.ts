import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { TeacherControllers } from "../services/teacher.service";

async function teacherRoutes(app: FastifyInstance) {
  const teacherMiddlewares = new Middlewares();
  const TeacherController = new TeacherControllers();

  app.post(
    "/",
    {
      preHandler: [
        teacherMiddlewares.authorize,
        teacherMiddlewares.adminAccess,
      ],
    },
    TeacherController.createTeacher as RouteHandlerMethod
  );

  app.get(
    "/:teacher_id",
    {
      preHandler: [
        teacherMiddlewares.authorize
      ],
    },
    TeacherController.getTeacher as RouteHandlerMethod
  );

  app.get(
    "/",
    {
      preHandler: [
        teacherMiddlewares.authorize
      ],
    },
    TeacherController.getAllTeacher as RouteHandlerMethod
  );

  app.put(
    "/",
    {
      preHandler: [
        teacherMiddlewares.authorize,
        teacherMiddlewares.adminAccess,
      ],
    },
    TeacherController.updateTeacher as RouteHandlerMethod
  );

  app.delete(
    "/",
    {
      preHandler: [
        teacherMiddlewares.authorize,
        teacherMiddlewares.adminAccess,
      ],
    },
    TeacherController.deleteTeacher as RouteHandlerMethod
  );
}

export default teacherRoutes;
