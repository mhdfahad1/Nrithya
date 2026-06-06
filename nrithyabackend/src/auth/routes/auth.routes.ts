import fastify, { FastifyInstance,  } from "fastify";
import { AuthController } from "../services/auth.service";

async function routes(app:FastifyInstance) {
    const authRoutes = new AuthController();
    app.post("/", authRoutes.login);
    app.post("/refresh", authRoutes.refresh_token);
}

export default routes;

