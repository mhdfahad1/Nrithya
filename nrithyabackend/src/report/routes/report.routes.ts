import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { ReportControllers } from "../services/report.services";

async function reportRoutes(app:FastifyInstance) {
    const reportMiddlewares =new Middlewares()
    const reportControllers = new ReportControllers
    app.get("/fee", {preHandler: [reportMiddlewares.authorize]},reportControllers.getFeeUnpaid as RouteHandlerMethod)
    app.get("/performance", {preHandler: [reportMiddlewares.authorize]},reportControllers.studentPerformance as RouteHandlerMethod)
    app.get("/teachers",{preHandler:[reportMiddlewares.authorize]}, reportControllers.teacherReportDownload as RouteHandlerMethod);
    app.get("/enquiries",{preHandler:[reportMiddlewares.authorize]}, reportControllers.enquiryReportDownload as RouteHandlerMethod);
    app.get("/studentattendance",{preHandler:[reportMiddlewares.authorize]}, reportControllers.studentsAttendancereport as RouteHandlerMethod);
    app.get("/teacherattendance",{preHandler:[reportMiddlewares.authorize]}, reportControllers.teacherAttendancereport as RouteHandlerMethod);
    app.get("/teacherattendance/:teacher_id",{preHandler:[reportMiddlewares.authorize]}, reportControllers.individualTeacherAttendenceReport as RouteHandlerMethod);
    app.get("/studentattendance/:student_id",{preHandler:[reportMiddlewares.authorize]}, reportControllers.individualStudentAttendenceReport as RouteHandlerMethod);
}

export default reportRoutes;