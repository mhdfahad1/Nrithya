import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { BatchController } from "../services/batch.services";
import { Middlewares } from "../../middlewares/middlewares";

async function routes(app: FastifyInstance) {
  const batchRoutes = new BatchController();
  const batchMiddlewares = new Middlewares();

  app.post("/", { preHandler: [batchMiddlewares.authorize,batchMiddlewares.adminAccess] },batchRoutes.createBatch as RouteHandlerMethod);
  app.get("/", { preHandler: [batchMiddlewares.authorize] },batchRoutes.listBatch as RouteHandlerMethod);
  app.patch("/", { preHandler: [batchMiddlewares.authorize,batchMiddlewares.adminAccess] },batchRoutes.updateBatch as RouteHandlerMethod);
  app.get("/:batch_id", { preHandler: [batchMiddlewares.authorize] },batchRoutes.getBatch as RouteHandlerMethod);
  app.delete("/", { preHandler: [batchMiddlewares.authorize,batchMiddlewares.adminAccess] },batchRoutes.deleteBatch as RouteHandlerMethod);
  app.get("/history", { preHandler: [batchMiddlewares.authorize] },batchRoutes.getBatchChange as RouteHandlerMethod);

  app.post("/activity", { preHandler: [batchMiddlewares.authorize,batchMiddlewares.adminAccess] },batchRoutes.createBatchActivity as RouteHandlerMethod);
  app.get("/activity", { preHandler: [batchMiddlewares.authorize] },batchRoutes.viewBatchActivity as RouteHandlerMethod);
  app.patch("/activity", { preHandler: [batchMiddlewares.authorize,batchMiddlewares.adminAccess] },batchRoutes.editBatchActivity as RouteHandlerMethod);
  app.get("/activity/:activity_id", { preHandler: [batchMiddlewares.authorize] },batchRoutes.getBatchActivity as RouteHandlerMethod);
  app.delete("/activity/:activity_id", { preHandler: [batchMiddlewares.authorize] },batchRoutes.deleteBatchActivity as RouteHandlerMethod);

}

export default routes;