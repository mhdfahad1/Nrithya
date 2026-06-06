import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { CompensationController } from "../services/compensation.services";

async function routes(app: FastifyInstance) {
    const compensationRoutes = new CompensationController();
    const compensationMiddlewares = new Middlewares();
  
    app.post("/batches", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.createBatchCompensation as RouteHandlerMethod);
    app.post("/students", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.createStudentCompensation as RouteHandlerMethod);
    app.get("/batches", { preHandler: [compensationMiddlewares.authorize] },compensationRoutes.listBatchCompensation as RouteHandlerMethod);
    app.get("/students", { preHandler: [compensationMiddlewares.authorize] },compensationRoutes.listStudentCompensation as RouteHandlerMethod);
    app.patch("/students", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.updateStudentCompensation as RouteHandlerMethod);
    app.patch("/batches", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.updateBatchCompensation as RouteHandlerMethod);
    app.delete("/students", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.deleteStudentCompensation as RouteHandlerMethod);
    app.delete("/batches", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.deleteBatchCompensation as RouteHandlerMethod);
    app.get("/students/:id", { preHandler: [compensationMiddlewares.authorize] },compensationRoutes.listSingleStudentCompensation as RouteHandlerMethod);
    app.get("/batches/:id", { preHandler: [compensationMiddlewares.authorize,compensationMiddlewares.adminAccess] },compensationRoutes.getBatchCompensation as RouteHandlerMethod);
}
  
export default routes;
