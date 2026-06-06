import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { DashboardControllers } from "../services/dashboard.services";

async function dashboardRoutes(app:FastifyInstance) {
    const dashboardMiddlewares =new Middlewares()
    const dashboardControllers = new DashboardControllers()

    app.get("/enquiry",{preHandler:[dashboardMiddlewares.authorize]},dashboardControllers.getEnquiryStats as RouteHandlerMethod);
    app.get("/students",{preHandler:[dashboardMiddlewares.authorize]},dashboardControllers.newStudentsstats as RouteHandlerMethod)
    app.get("/revenue",{preHandler:[dashboardMiddlewares.authorize]},dashboardControllers.revenueGrowth as RouteHandlerMethod)
    app.get("/coursestudents",{preHandler:[dashboardMiddlewares.authorize]},dashboardControllers.courseAndStudents as RouteHandlerMethod)
    app.get("/teachers",{preHandler:[dashboardMiddlewares.authorize]},dashboardControllers.teacherWiserevenue as RouteHandlerMethod)
}

export default dashboardRoutes;