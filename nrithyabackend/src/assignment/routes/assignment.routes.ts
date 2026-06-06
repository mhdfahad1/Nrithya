import { FastifyInstance, RouteHandlerMethod } from "fastify";
import assignmentController from "../services/assignment.services";
import { Middlewares } from "../../middlewares/middlewares";

async function routes(app: FastifyInstance) {
  const assignmentrouter = new assignmentController();
  const assignmentMiddlewares = new Middlewares();
  app.post(
    "/",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.createAssignment as RouteHandlerMethod
  );
  app.get(
    "/",
    {
      preHandler: [
        assignmentMiddlewares.authorize
      ],
    },
    assignmentrouter.listAllAssignment as RouteHandlerMethod
  );
  app.get(
    "/:assignment_id",
    {
      preHandler: [
        assignmentMiddlewares.authorize
      ],
    },
    assignmentrouter.getAssignment as RouteHandlerMethod
  );
  app.patch(
    "/",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.updateAssignment as RouteHandlerMethod
  );
  app.delete(
    "/",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.deleteAssignment as RouteHandlerMethod
  );
  app.post(
    "/batch",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.batchAssignments as RouteHandlerMethod
  );
  app.get(
    "/batch",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
      ],
    },
    assignmentrouter.getBatchAssignments as RouteHandlerMethod
  );
  app.delete(
    "/batch",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.deleteBatchAssignment as RouteHandlerMethod
  );
  app.patch(
    "/students",
    {
      preHandler: [
        assignmentMiddlewares.authorize,
        assignmentMiddlewares.adminAccess,
      ],
    },
    assignmentrouter.updateStudentAssignment as RouteHandlerMethod
  );
  app.get(
    "/students",
    {
      preHandler: [
        assignmentMiddlewares.authorize
      ],
    },
    assignmentrouter.getStudentAssignments as RouteHandlerMethod
  );
}

export default routes;
