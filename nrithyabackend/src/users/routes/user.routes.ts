import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { UserController } from '../services/user.service';
import { Middlewares } from "../../middlewares/middlewares";

const app: FastifyInstance = fastify({
    logger: true,
});

async function routes(app:FastifyInstance) {
    const usersRoutes = new UserController();
    const userMiddlewares = new Middlewares();
    app.post("/",{ preHandler: [userMiddlewares.authorize, userMiddlewares.superAdminAccess] },usersRoutes.createUser as RouteHandlerMethod)
    app.get("/", { preHandler: [userMiddlewares.authorize] }, usersRoutes.getUsers as RouteHandlerMethod)
    app.patch("/", { preHandler: [userMiddlewares.authorize, userMiddlewares.superAdminAccess] }, usersRoutes.updateUser as RouteHandlerMethod)
    app.get("/profile", { preHandler: [userMiddlewares.authorize] }, usersRoutes.getUserDetail as RouteHandlerMethod)
    app.post("/changepassword", { preHandler: [userMiddlewares.authorize] }, usersRoutes.changePassword as RouteHandlerMethod)
    app.get("/:user_id", { preHandler: [userMiddlewares.authorize, userMiddlewares.superAdminAccess] }, usersRoutes.getUser as RouteHandlerMethod)
}

export default routes;