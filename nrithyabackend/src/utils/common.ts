export const BAD_REQUEST = 400;
export const SUCCESS_CREATE = 201;
export const SUCCESS_GET = 200;
export const NOT_FOUND = 404;
export const FORBIDDEN = 403;
export const NOT_AUTHORIZED = 401;
export const INTERNAL_ERROR = 500;
export const NOT_ACCEPTABLE = 406;
export const ERROR_COMMON_MESSAGE = "Internal Server Error";
import bcrypt from "bcryptjs";
import { AuditLog } from "../audit/entities/audit.entities";
import { Users } from "../users/entities/user.entities";
import { getDataSource } from "./data-source";
import logger from "./logger";
import * as Exceljs from "exceljs";
import multer from "fastify-multer";
import path from "path";
import { Role } from "../users/types/users.enums";

const baseDir =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../src/uploads")
    : path.join(__dirname, "../../src/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, baseDir);
  },
  filename: function (req, file, cb) {
    const time = new Date().valueOf();
    cb(null, time + "_" + file.originalname);
  },
});

export const upload = multer({ storage: storage });

export async function validateEmail(email: String) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email) return re.test(String(email).toLowerCase());
  return false;
}

export async function hashPassword(plain: string): Promise<string> {
  try {
    const hash = (await bcrypt.hash(plain, 10)) as string;
    return hash;
  } catch (error) {
    return "error";
  }
}

export async function camparePassword(
  plain: string,
  hashPassword: string
): Promise<boolean> {
  try {
    const is_match = await bcrypt.compare(plain, hashPassword);
    return is_match;
  } catch (error) {
    return false;
  }
}

export async function recordAudit(
  action: string,
  date: Date,
  relation: string,
  user_id: number
): Promise<void> {
  const audit = new AuditLog();
  const appDatasourse = await getDataSource();
  const userRepository = appDatasourse.getRepository(Users);
  const auditRepository = appDatasourse.getRepository(AuditLog);
  const existingUser = await userRepository.findOneBy({
    user_id: user_id,
  });
  if (existingUser) {
    audit.action = action;
    audit.relation = relation;
    audit.date = new Date();
    audit.users = existingUser;
    await auditRepository.save(audit);
    logger.info("Audit saved");
  } else {
    logger.error("Audit adding failed invalid user");
  }
}

export async function createExcel(headings: string[], data: Array<string[]>) {
  const workbook = new Exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Users");
  worksheet.addRow([...headings]);

  const columnWidths = headings.map((_, columnIndex) => {
    const maxWidth = Math.max(
      ...data.map((row) => row[columnIndex]?.toString().length || 0)
    );
    return Math.min(100, Math.max(10, maxWidth * 1.2));
  });

  worksheet.columns.forEach((column, columnIndex) => {
    column.width = columnWidths[columnIndex];
  });

  const row = worksheet.getRow(1);
  row.font = { bold: true };

  for (const i in data) {
    const row = data[i];
    worksheet.addRow([...row]);
  }

  const performanceColumnIndex = headings.indexOf("Performance");
  if (performanceColumnIndex >= 0) {
    const performanceColumn = worksheet.getColumn(performanceColumnIndex + 1);

    worksheet.eachRow({ includeEmpty: true }, function (rows, rowNumber) {
      rows.eachCell({ includeEmpty: true }, function (cell, cellno) {
        if (
          rowNumber > 1 &&
          performanceColumn.values &&
          cellno === performanceColumnIndex + 1
        ) {
          if (parseFloat(performanceColumn.values[rowNumber] + "") < 60) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: "f54040",
              },
            };
          } else if (
            parseFloat(performanceColumn.values[rowNumber] + "") >= 60 &&
            parseFloat(performanceColumn.values[rowNumber] + "") <= 80
          ) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: "d7ff38",
              },
            };
          } else if (
            parseFloat(performanceColumn.values[rowNumber] + "") > 80
          ) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: "38ff4c",
              },
            };
          }
        }
      });
    });
  }

  return workbook;
}

export const createAdminUser = async () => {
  logger.info("createAdminUser");
  try {
    if (!process.env.ADMINUSERNAME|| !process.env.ADMINPASSWORD) {
      logger.error(`Admin email or password not found`);
      return false;
    }
    const appDatasourse = await getDataSource();
    const userRepository = appDatasourse.getRepository(Users);
    const exitingUser = await userRepository.findOneBy({user_name: process.env.ADMINUSERNAME});
    if (exitingUser) {
      logger.info(`Superadmin user already exists`);
      return false;
    }
    const user = new Users();
    user.password = await hashPassword(process.env.ADMINPASSWORD);
    user.user_name = process.env.ADMINUSERNAME || "superadmin";
    user.user_role = Role.SUPERADMIN;
    await userRepository.save(user);
    logger.info(`Admin user created successfully`);
    return true;
  } catch (error) {
    logger.error(`Failed to create admin user: ${error}`);
    return false;
  }
};


export interface Pagination {
  page: number;
  limit: number;
}

export const TOKEN_EXPIRY = "1d";
export const REFRESH_TOKEN_EXPIRY = "2d";
