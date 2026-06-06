import { FastifyReply, FastifyRequest } from "fastify";
import { BankDataInput, BankEdit, BankSearch } from "../types/bank.types";
import { getDataSource } from "../../utils/data-source";
import { BankDetail } from "../entites/bank.detail";
import logger from "../../utils/logger";
import { CustomError, Success } from "../../utils/response";
import { BAD_REQUEST, INTERNAL_ERROR, NOT_FOUND, recordAudit, SUCCESS_CREATE, SUCCESS_GET } from "../../utils/common";

export class BankController{
    createBankActivity = async (request:FastifyRequest<{Body:BankDataInput}>, reply:FastifyReply) => {
        try {
            const bankData = request.body;
            const user_details = (request as any).user_details
            if(bankData.account_holder && bankData.bank_name && bankData.account_number){
                const appDatasourse = await getDataSource();
                const bankRepository = appDatasourse.getRepository(BankDetail);
                const existingBank = await bankRepository.createQueryBuilder("bank")
                .where("bank.account_number = :number", { number: bankData.account_number })
                .andWhere("bank.status = :status", { status: true })
                .getOne();                
                if(existingBank){
                    logger.error(`Bank already exists`);
                    const errorResponse = CustomError<string>(BAD_REQUEST, "Bank already exist");
                    reply.status(BAD_REQUEST).send(errorResponse);
                }else{
                    const bankActivity  = new BankDetail();
                    bankActivity.account_holder = bankData.account_holder;
                    bankActivity.bank_name = bankData.bank_name;
                    bankActivity.account_number = bankData.account_number;
                    bankData.branch?bankActivity.branch = bankData.branch:bankActivity.branch = "";
                    bankActivity.created_at = new Date();
                    bankActivity.updated_at = new Date();
                    await bankRepository.save(bankActivity);
                    logger.info(`BankAccount added successfully`);
                    const response = Success<string>("BankAccount added successfully");
                    reply.status(SUCCESS_CREATE).send(response);
                    if(user_details) {
                        recordAudit("bank created", new Date, "bank", user_details.user_id)
                      }
                }
            }else{
                logger.error("Required fields are missing");
                const errResponse = CustomError<string>(BAD_REQUEST, "Required fields are missing");
                return reply.status(BAD_REQUEST).send(errResponse);
            }
        } catch (error) {
            logger.error(`Internal server error while creating new BankActivity`,error);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    viewBankActivity = async (request:FastifyRequest<{Querystring:BankSearch}>,reply:FastifyReply) => {
        try {
            const page = request.query.page || 1;
            const perPage = request.query.limit || 25;
            const offset = (page - 1) * perPage;

            const bankActivityData = request.query;
            const appDatasource = await getDataSource();
            const bankActivityRepository = await appDatasource.getRepository(BankDetail);
            const queryBuilder = bankActivityRepository.createQueryBuilder("bankdetail")
            .where("status = :status", { status: true });

            if (bankActivityData.account_holder) {
                const holderName = bankActivityData.account_holder.toLowerCase();
                queryBuilder.andWhere("LOWER(bankdetail.account_holder) LIKE :name", { name: `%${holderName}%` });
            }

            if (bankActivityData.bank_name) {
                const bankName = bankActivityData.bank_name.toLowerCase();
                queryBuilder.andWhere("LOWER(bankdetail.account_name) LIKE :name", { name: `%${bankName}%` });
            }

            if (bankActivityData.sortorder == "desc") {
                queryBuilder.addOrderBy('LOWER(bankdetail.account_holder)', 'DESC');
            } else {
                queryBuilder.addOrderBy('LOWER(bankdetail.account_holder)', 'ASC');
            }
            
            let data
            const totalcount = await queryBuilder.getCount();
            if(request.query.pagenation=="none"){
                data = await queryBuilder.getMany();
            }else{
                data = await queryBuilder.skip(offset).take(perPage).getMany();
            }

            for(let i in data){
                const account_number = data[i].account_number;
                let converted_account_number = "";
                for(let j=0; j<account_number.length; j++){
                    if(j>=account_number.length-4){
                        converted_account_number += account_number[j];
                    }else{
                        converted_account_number += "*";
                    }
                }
                data[i].account_number = converted_account_number;
            }
            const resobj: any = {
              metadata: {
                total_count: totalcount
              }, data: data
            }
            const response = Success<any>(resobj);
            reply.status(SUCCESS_GET).send(response);
        } catch (error) {
            logger.error(`Internal server error while viewing banks list`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    viewIndvidualBankActivity = async (request:FastifyRequest<{Params:{bank_id:number}}>,reply:FastifyReply) => {
        try {
            const user_details = (request as any).user_details
            const bankId = request.params.bank_id;
            if (!bankId) {
                logger.error("Bank ID is not available");
                const data = CustomError<string>(NOT_FOUND, "Bank ID is not available");
                return reply.status(NOT_FOUND).send(data);
            }
    
            const appDatasource = await getDataSource();
            const bankRepository = appDatasource.getRepository(BankDetail);
    
            const existingBank = await bankRepository.findOne({
                where: {
                    bank_id: bankId,
                    status: true
                }
            });
            if(!existingBank){
                logger.error("Bank not found");
                const data = CustomError<string>(NOT_FOUND, "Bank not found");
                return reply.status(NOT_FOUND).send(data);
            }
            const data = existingBank;
            const resobj:any = data
            const response = Success<any>(resobj);
            reply.status(SUCCESS_GET).send(response);
        } catch (error) {
            logger.error(`Internal server error while viewing bank`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    editBankActivity = async (request:FastifyRequest<{Body:BankEdit}>,reply:FastifyReply) => {
        try {
            const bankData = request.body;
            const user_details = (request as any).user_details
            if (!bankData.bank_id) {
                logger.error("Bank ID is not available");
                const data = CustomError<string>(NOT_FOUND, "Bank ID is not available");
                return reply.status(NOT_FOUND).send(data);
            }
        
            const appDatasource = await getDataSource();
            const bankRepository = appDatasource.getRepository(BankDetail);
            const bank = await bankRepository.findOne({where:{ bank_id:bankData.bank_id, status:true }})
            if(bank){
                const existingBank = await bankRepository.createQueryBuilder("bankdetail")
                .where("bankdetail.bank_id != :bankId", { bankId: bankData.bank_id })
                .andWhere("bankdetail.account_number = :accountNumber", {accountNumber: bankData.account_number})
                .andWhere("bankdetail.status = :status", { status: true })
                .getOne();
        
                if (existingBank) {
                    logger.error("Bank data already exist");
                    const data = CustomError<string>(NOT_FOUND, "Bank data already exist");
                    return reply.status(NOT_FOUND).send(data);
                }
            
                bank.account_holder = bankData.account_holder ? bankData.account_holder : bank.account_holder;
                bank.account_number = bankData.account_number ? bankData.account_number : bank.account_number;
                bank.bank_name = bankData.bank_name ? bankData.bank_name : bank.bank_name;
                bank.branch = bankData.branch ? bankData.branch : bank.branch;
                bank.updated_at = new Date();
                await bankRepository.save(bank); 
            
                logger.info("Bank updated");
                const response = Success<string>("Bank data updated");
                reply.status(SUCCESS_GET).send(response);
            
                if (user_details) {
                    recordAudit("bank updated", new Date(), "bank", user_details.user_id);
                }
            }else{
                logger.error("Bank data not found");
                const data = CustomError<string>(NOT_FOUND, "Bank data not found");
                return reply.status(NOT_FOUND).send(data);
            }
        } catch (error) {
            logger.error(`Internal server error while updating bank`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
        
    }
        
    deleteBankActivity = async (request: FastifyRequest<{ Params: { bank_id: number } }>, reply: FastifyReply) => {
        try {
            const user_details = (request as any).user_details
            const bankId = request.params.bank_id;
            if (!bankId) {
                logger.error("Bank ID is not available");
                const data = CustomError<string>(NOT_FOUND, "Bank ID is not available");
                return reply.status(NOT_FOUND).send(data);
            }
    
            const appDatasource = await getDataSource();
            const bankRepository = appDatasource.getRepository(BankDetail);
    
            const existingBank = await bankRepository.findOne({
                where: {
                    bank_id: bankId,
                    status: true
                }
            });
    
            if (!existingBank) {
                logger.error("Bank not found");
                const data = CustomError<string>(NOT_FOUND, "Bank not found");
                return reply.status(NOT_FOUND).send(data);
            }
    
            await bankRepository.update(
                { bank_id: bankId },
                { status: false, updated_at: new Date() }
            );
    
            logger.info("Bank Deleted");
            const response = Success<string>("Bank data deleted");
            reply.status(SUCCESS_GET).send(response);
    
            if (user_details) {
                recordAudit("bank deleted", new Date(), "bank", user_details.user_id);
            }
        } catch (error) {
            logger.error(`Internal server error while deleting bank`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, "Internal server error");
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }
    
}