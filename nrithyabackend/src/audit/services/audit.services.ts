import {
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { auditLogGet } from "../types/audit.types"
import { getDataSource } from "../../utils/data-source";
import { CustomError, Success } from "../../utils/response";
import {
    ERROR_COMMON_MESSAGE,
    INTERNAL_ERROR,
    SUCCESS_GET,
} from "../../utils/common";
import { AuditLog } from "../entities/audit.entities";
import logger from "../../utils/logger";

class AuditController {
    viewAuditLog = async (request: FastifyRequest<{ Querystring: auditLogGet }>, reply: FastifyReply) => {
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 10;
            const offset = (page - 1) * perPage;

            const AuditLogData = request.query;
            const appDatasourse = await getDataSource();
            const AuditLogRepository = appDatasourse.getRepository(AuditLog);
            const queryBuilder = AuditLogRepository.createQueryBuilder("auditlog")
            queryBuilder.leftJoin("auditlog.users", "users")
            .addSelect(["users.user_id", "users.user_name", "users.user_role"]);

            if (AuditLogData.user_id) {
                queryBuilder.andWhere("auditlog.user_id = :user_id", {
                    user_id: AuditLogData.user_id,
                });
            }
            if (AuditLogData.date) {
                const date = new Date(AuditLogData.date);
                date.setUTCHours(0, 0, 0, 0);
                const startOfDay = date.toISOString();
                const endOfDay = new Date(date);
                endOfDay.setUTCHours(23, 59, 59, 999);
                const endOfDayISOString = endOfDay.toISOString();
            
                queryBuilder.andWhere("auditlog.date >= :startOfDay AND auditlog.date <= :endOfDay", {
                    startOfDay: startOfDay,
                    endOfDay: endOfDayISOString,
                });
            }


            queryBuilder.orderBy('auditlog.id','DESC');
            const totalcount = await queryBuilder.getCount();
            const data = await queryBuilder.skip(offset).take(perPage).getMany();   
            const resobj: any = {
                metadata: {
                    total_count: totalcount
                }, data: data
            }
            const response = Success<any>(resobj);
            reply.status(SUCCESS_GET).send(response);

        } catch (error) {
            logger.error(ERROR_COMMON_MESSAGE)
            const data = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(data);
        }
    }
}

export default AuditController