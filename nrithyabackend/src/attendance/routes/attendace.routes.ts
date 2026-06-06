import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { AttendanceController } from "../services/attendance.services";
import { Middlewares } from "../../middlewares/middlewares";

async function routes(app: FastifyInstance) {
  const attendanceRoutes = new AttendanceController();
  const attendanceMiddlewares = new Middlewares();

  app.post("/students", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.createStudentAttendace as RouteHandlerMethod);
  app.post("/teachers", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.createTeacherAttendace as RouteHandlerMethod);
  app.get("/teachers", { preHandler: [attendanceMiddlewares.authorize] },attendanceRoutes.listTeacherAttendace as RouteHandlerMethod);
  app.get("/students", { preHandler: [attendanceMiddlewares.authorize] },attendanceRoutes.listStudentAttendace as RouteHandlerMethod);
  app.get("/teachersattendance", { preHandler: [attendanceMiddlewares.authorize] },attendanceRoutes.listTeacherAttendaceReport as RouteHandlerMethod);
  app.get("/studentsattendance", { preHandler: [attendanceMiddlewares.authorize] },attendanceRoutes.listStudentAttendaceReport as RouteHandlerMethod);
  app.patch("/students", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.updateStudentAttendace as RouteHandlerMethod);
  app.patch("/teachers", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.updateTeacherAttendace as RouteHandlerMethod);
  app.get("/streak/teachers", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.listTeacherStreak as RouteHandlerMethod);
  app.get("/streak/students", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.listStudentStreak as RouteHandlerMethod);
  app.get("/class", { preHandler: [attendanceMiddlewares.authorize,attendanceMiddlewares.adminAccess] },attendanceRoutes.listDayattendance as RouteHandlerMethod);
}

export default routes;