import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { BankController } from "../services/bank.services";
import { Middlewares } from "../../middlewares/middlewares";

async function routes(app: FastifyInstance) {
  const bankRoutes = new BankController();
  const bankMiddlewares = new Middlewares();

app.post("/", { preHandler: [bankMiddlewares.authorize,bankMiddlewares.superAdminAccess] },bankRoutes.createBankActivity as RouteHandlerMethod);
app.get("/", { preHandler: [bankMiddlewares.authorize] },bankRoutes.viewBankActivity as RouteHandlerMethod);
app.get("/:bank_id", { preHandler: [bankMiddlewares.authorize,bankMiddlewares.superAdminAccess] },bankRoutes.viewIndvidualBankActivity as RouteHandlerMethod);
app.patch("/", { preHandler: [bankMiddlewares.authorize,bankMiddlewares.superAdminAccess] },bankRoutes.editBankActivity as RouteHandlerMethod);
app.delete("/:bank_id", { preHandler: [bankMiddlewares.authorize,bankMiddlewares.superAdminAccess] },bankRoutes.deleteBankActivity as RouteHandlerMethod);
}
export default routes;