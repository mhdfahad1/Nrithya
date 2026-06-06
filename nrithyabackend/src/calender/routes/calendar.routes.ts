import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { CalendarController } from "../services/calendar.services";

async function routes(app: FastifyInstance) {
    const calendarRoutes = new CalendarController();
    const calendarMiddlewares = new Middlewares();
  
    app.post("/", { preHandler: [calendarMiddlewares.authorize,calendarMiddlewares.adminAccess] },calendarRoutes.getCalendar as RouteHandlerMethod);
    app.patch("/", { preHandler: [calendarMiddlewares.authorize,calendarMiddlewares.adminAccess] },calendarRoutes.updateCalendar as RouteHandlerMethod);
    app.delete("/", { preHandler: [calendarMiddlewares.authorize,calendarMiddlewares.adminAccess] },calendarRoutes.deleteCalendar as RouteHandlerMethod);
    app.get("/:calendar_id", { preHandler: [calendarMiddlewares.authorize,calendarMiddlewares.adminAccess] },calendarRoutes.getSpecificCalendar as RouteHandlerMethod);
}
  
export default routes;