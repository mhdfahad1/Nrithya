import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { CourseController } from "../services/course.services";
import { Middlewares } from "../../middlewares/middlewares";

async function routes(app: FastifyInstance) {
  const courseRoutes = new CourseController();
  const courseMiddlewares = new Middlewares();

  app.post("/", { preHandler: [courseMiddlewares.authorize,courseMiddlewares.adminAccess] },courseRoutes.createCourse as RouteHandlerMethod);
  app.get("/", { preHandler: [courseMiddlewares.authorize] },courseRoutes.listCourse as RouteHandlerMethod);
  app.patch("/", { preHandler: [courseMiddlewares.authorize,courseMiddlewares.adminAccess] },courseRoutes.updateCourse as RouteHandlerMethod);
  app.delete("/:course_id", { preHandler: [courseMiddlewares.authorize,courseMiddlewares.adminAccess] },courseRoutes.deleteCourse as RouteHandlerMethod);
}

export default routes;
