import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import AuditController from "../services/audit.services";
import { Middlewares } from "../../middlewares/middlewares";

async function auditRoute(app: FastifyInstance) {
    const auditRoutes = new AuditController();
    const auditMiddlewares = new Middlewares();

    app.get("/", { preHandler: [auditMiddlewares.authorize, auditMiddlewares.superAdminAccess] }, auditRoutes.viewAuditLog as RouteHandlerMethod);
}

export default auditRoute;
