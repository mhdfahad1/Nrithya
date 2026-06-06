import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { FeeController } from "../services/fee.services";
import { Middlewares } from "../../middlewares/middlewares";
import { upload } from "../../utils/common";

async function routes(app: FastifyInstance) {
  const feeRoutes = new FeeController();
  const feeMiddlewares = new Middlewares();

  app.get("/", { preHandler: [feeMiddlewares.authorize] },feeRoutes.listFee as RouteHandlerMethod);
  app.patch("/", { preHandler: [feeMiddlewares.authorize, feeMiddlewares.adminAccess, upload.single("file")] }, feeRoutes.updateFee as RouteHandlerMethod);
  app.patch("/:id",{preHandler: [feeMiddlewares.authorize]}, feeRoutes.updateDate as RouteHandlerMethod)};

export default routes;
