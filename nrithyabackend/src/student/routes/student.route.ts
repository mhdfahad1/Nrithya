import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import StudentController from "../services/student.services";
import { Middlewares } from "../../middlewares/middlewares";

async function studentRoutes(app: FastifyInstance) {
  const studentController = new StudentController();
  const studentsMiddlewares = new Middlewares();
 
  app.post("/", { preHandler: [studentsMiddlewares.authorize,studentsMiddlewares.adminAccess] },studentController.createStudent as RouteHandlerMethod);
  app.get("/", { preHandler: [studentsMiddlewares.authorize] },studentController.listStudents as RouteHandlerMethod);
  app.patch("/", { preHandler: [studentsMiddlewares.authorize,studentsMiddlewares.adminAccess] },studentController.updateStudent as RouteHandlerMethod);
  app.get("/:student_id", { preHandler: [studentsMiddlewares.authorize] },studentController.singleStudentlist as RouteHandlerMethod);
  app.delete("/", { preHandler: [studentsMiddlewares.authorize,studentsMiddlewares.adminAccess] },studentController.deleteStudent as RouteHandlerMethod);
  app.get("/batchhistory", { preHandler: [studentsMiddlewares.authorize] },studentController.getStudentBatchHistory as RouteHandlerMethod);
}

export default studentRoutes;
