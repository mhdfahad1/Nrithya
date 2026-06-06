import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import FrequencyController from "../services/frequency.services";
import { Middlewares } from "../../middlewares/middlewares";

async function superAdminRoutes(app: FastifyInstance) {
  const frequencyRoutes = new FrequencyController();
  const frequencyMiddlewares = new Middlewares();

  app.get(
    "/",
    {
      preHandler: [
        frequencyMiddlewares.authorize,
      ],
    },
    frequencyRoutes.listAllFrequency as RouteHandlerMethod
  );
  app.patch(
    "/",
    {
      preHandler: [
        frequencyMiddlewares.authorize,
        frequencyMiddlewares.superAdminAccess,
      ],
    },
    frequencyRoutes.updateFrequency as RouteHandlerMethod
  );
}

export default superAdminRoutes;
