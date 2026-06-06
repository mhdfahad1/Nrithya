import * as dotenv from "dotenv";
import app from "./app";
import fastifyCors from "@fastify/cors";
import logger from "./utils/logger";
import fs from "fs";
import path from "path";
import { UserController } from "./users/services/user.service";
import { createAdminUser } from "./utils/common";

dotenv.config();

const baseDir = process.env.NODE_ENV === 'production' ? path.join(__dirname, 'src/uploads') : path.join(__dirname, '../src/uploads');
app.decorateRequest("app", app);

app.register(fastifyCors, {
  origin: "*",
});


if(!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

app.register(require("@fastify/static"), {
  root: baseDir,
  prefix: '/uploads/'
})

const start = async (): Promise<void> => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4001;
    await app
      .listen({
        port: PORT,
        host: "0.0.0.0",
      })
      .then(async (address) => {
        await createAdminUser();
        app.cron.startAllJobs();
        logger.info(`server listening on ${address}`);
        app.log.info(`server listening on ${address}`);
      })
      .catch((err) => {
        logger.error(`Error starting server:  ${err}`);
        app.log.error(`Error starting server:  ${err}`);
        process.exit(1);
      });
  } catch (error) {
    logger.error(`Failed to start server ${error}`);
    app.log.error(`Failed to start server ${error}`);
    process.exit(1);
  }
};

start();
