import { FastifyReply, FastifyRequest } from "fastify";
import { getDataSource } from "../../utils/data-source";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import logger from "../../utils/logger";
import {
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  ERROR_COMMON_MESSAGE,
  recordAudit,
  NOT_FOUND
} from "../../utils/common";
import { StudentBatch } from "../../student/entities/student.batch.entities";
import { Payments } from "../entities/fee.entities";
import { Students } from "../../student/entities/students.entities";
import { BankDetail } from "../../bank/entites/bank.detail";
import { StudentAttendance } from "../../attendance/entities/student.attendance.entities";
import { StudentBatchStatus } from "../../student/types/student.batch.enums";


export class FeeController {
    createDue = async () => {
        try {
            const appDataSource = await getDataSource();
            const batchStudentRepository = appDataSource.getRepository(StudentBatch);
            const paymentRepository = appDataSource.getRepository(Payments);
            const batchStudentdData = await batchStudentRepository.createQueryBuilder('student_batch').where("student_batch.status = :status", {status: StudentBatchStatus.ACTIVE}).leftJoinAndSelect("student_batch.students", "students").leftJoinAndSelect("student_batch.batches", "batches").select().getMany();
            const studentAttendanceRepository = appDataSource.getRepository(StudentAttendance);
            batchStudentdData.forEach(async (student) => {
                const last_fees = await paymentRepository.createQueryBuilder('payments').where('payments.student_id = :student_id', {student_id: student.students.student_id}).andWhere('payments.batch_id = :batch_id', {batch_id: student.batches.batch_id}).orderBy('payments.payment_id', "DESC").getOne();
                if(last_fees) {
                    const today = new Date(last_fees.due_date);
                    if(new Date() >= new Date(last_fees.due_date)) {
                        const payment = new Payments();
                        const fiveDayfromNow = new Date(today)
                        fiveDayfromNow.setMonth(fiveDayfromNow.getMonth() + 1);
                        payment.batches = student.batches;
                        payment.students = student.students;
                        payment.amount = student.batches.fee;
                        payment.bank = null as any;
                        payment.date = new Date();
                        payment.paid_date = null as any;
                        payment.due_date = fiveDayfromNow;
                        await paymentRepository.save(payment)
                    }
                }
                else {
                    const first_attendance = await studentAttendanceRepository.createQueryBuilder("student_attendance").where("student_attendance.student_id = :student_id", {student_id: student.students.student_id}).andWhere("student_attendance.batch_id = :batch_id", {batch_id: student.batches.batch_id}).orderBy('student_attendance.date', "ASC").getOne();
                    if(first_attendance) {
                        const attendanceDate = new Date(first_attendance.date);
                        const payment = new Payments();
                        const fiveDayfromNow = new Date(attendanceDate)
                        fiveDayfromNow.setMonth(fiveDayfromNow.getMonth() + 1);
                        payment.batches = student.batches;
                        payment.students = student.students;
                        payment.amount = student.batches.fee;
                        payment.bank = null as any;
                        payment.date = new Date();
                        payment.paid_date = null as any;
                        payment.due_date = fiveDayfromNow;
                        await paymentRepository.save(payment);
                    }
                }
            })
            logger.info("Payments updated successfully")
        }
        catch(error) {
            logger.error(`Internal server error`);
        }
    }


    listFee = async (request: FastifyRequest<{ Querystring: {
        status?: boolean,
        limit?: number,
        page?: number,
        batch_id?: number,
        bank_id?: number,
        student_name?: string,
        download?: boolean,
        save?: boolean,
        sortorder?: string,
        dueto?: Date,
        duefrom?: Date,
        paidto?: Date,
        paidfrom?: Date,
    }}>, reply: FastifyReply) => {
    
        const page = request.query.page || 1;
        const perPage = request.query.limit || 10;
        const offset = (page - 1) * perPage;
    
        try {
            const getQuery = request.query;
            const appDataSource = await getDataSource();
            const paymentRepository = appDataSource.getRepository(Payments);
            const queryBuilder = paymentRepository.createQueryBuilder('payments')
                .leftJoinAndSelect('payments.batches', 'batches')
                .leftJoinAndSelect('payments.students', 'students')
                .leftJoinAndSelect('payments.bank', 'bank')
                .select();
                
            if (getQuery.status !== undefined && getQuery.status !== null && getQuery.status) {
                queryBuilder.where('payments.status = :status', { status: getQuery.status });
            }
    
            if (getQuery.batch_id) {
                queryBuilder.andWhere('payments.batch_id = :batch_id', { batch_id: getQuery.batch_id });
            }
    
            if (getQuery.bank_id) {
                queryBuilder.andWhere('payments.bank_id = :bank_id', { bank_id: getQuery.bank_id });
            }
    
            if (getQuery.paidto && getQuery.paidfrom) {
                queryBuilder.andWhere('payments.paid_date BETWEEN :paidfrom AND :paidto', { paidfrom: getQuery.paidfrom, paidto: getQuery.paidto });
            }
    
            if (getQuery.dueto && getQuery.duefrom) {
                queryBuilder.andWhere('payments.due_date BETWEEN :duefrom AND :dueto', { duefrom: getQuery.duefrom, dueto: getQuery.dueto });
            }
    
            if (getQuery.student_name) {
                const studentsRepository = appDataSource.getRepository(Students);
                const studentQueryBuilder = studentsRepository.createQueryBuilder('students');
                const studentNameArray = getQuery.student_name.split(" ");
                if (studentNameArray.length == 1) {
                    studentQueryBuilder.andWhere('LOWER(students.first_name) LIKE LOWER(:name) OR LOWER(students.last_name) LIKE LOWER(:name)', { name: `%${studentNameArray[0]}%` });
                } else if (studentNameArray.length == 2) {
                    studentQueryBuilder.andWhere('LOWER(students.first_name) LIKE LOWER(:first_name) AND LOWER(students.last_name) LIKE LOWER(:last_name)', { first_name: `%${studentNameArray[0]}%`, last_name: `%${studentNameArray[1]}%` });
                }
                const students = await studentQueryBuilder.getMany();
                const ids = students.map((student) => student.student_id);
                queryBuilder.andWhere('payments.student_id IN (:...ids)', { ids: ids.length > 0 ? ids : [0] });
            }
    
            queryBuilder.orderBy('payments.due_date', 'DESC');
            const count = await queryBuilder.getCount();
    
            if (request.query.download) {
                let payments: any[] = [];
                if (request.query.save) {
                    payments = await queryBuilder.getMany();
                } else {
                    payments = await queryBuilder.skip(offset).take(perPage).getMany();
                }
    
                for (let i in payments) {
                    if (payments[i].bank) {
                        const accountNumber = payments[i].bank.account_number;
                        let convertedAccountNumber = "";
                        for (let j = 0; j < accountNumber.length; j++) {
                            if (j >= accountNumber.length - 4) {
                                convertedAccountNumber += accountNumber[j];
                            } else {
                                convertedAccountNumber += "*";
                            }
                        }
                        payments[i].bank.account_number = convertedAccountNumber;
                    }
                }
    
                return { count: count, data: payments };
            } else {
                const paymentsData = await queryBuilder.skip(offset).take(perPage).getMany();
                for (let i in paymentsData) {
                    const payment = paymentsData[i];
                    if (payment.payment_receipt_url) {
                        payment.payment_receipt_url = `${process.env.SERVER_URL}${payment.payment_receipt_url}`;
                    }
                    if (payment.bank) {
                        const accountNumber = payment.bank.account_number;
                        let convertedAccountNumber = "";
                        for (let j = 0; j < accountNumber.length; j++) {
                            if (j >= accountNumber.length - 4) {
                                convertedAccountNumber += accountNumber[j];
                            } else {
                                convertedAccountNumber += "*";
                            }
                        }
                        payment.bank.account_number = convertedAccountNumber;
                    }
                }
    
                const response = Success<any>({ metadata: { totalcount: count }, data: [...paymentsData] });
                reply.status(SUCCESS_GET).send(response);
            }
        } catch (error) {
            logger.error(`Internal server error`, error);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }

    updateFee = async ( request: FastifyRequest< { Body:{ 
        payment_id: number,
        paid_date: Date,
        transaction_id?: string,
        remarks?: string,
        bank_id?: number,
     }}>, reply: FastifyReply) => {
        try {
            const file_data = (request as any).file;
            const data = request.body

            if(data) {
                const user_details = (request as any).user_details;
                if(data.payment_id && data.paid_date && data.bank_id) {
                    const updateBody = {
                        payment_id: parseInt(data.payment_id +""),
                        paid_date: data.paid_date,
                        remarks: data.remarks,
                        bank_id: parseInt(data.bank_id + ""),
                    }
                    const appDataSource = await getDataSource();
                    const paymentRepository = appDataSource.getRepository(Payments);
                    const bankRepository = appDataSource.getRepository(BankDetail)
                    const existingPayment = await paymentRepository.findOneBy ({
                        payment_id: updateBody.payment_id
                    })
                    const existingBank = await bankRepository.findOneBy ({
                        bank_id: updateBody.bank_id
                    })
                    if(existingPayment && existingBank) {
                        await paymentRepository.createQueryBuilder()
                        .update(Payments)
                        .set({
                            status: true,
                            transaction_id: data.transaction_id? data.transaction_id: existingPayment.transaction_id,
                            remarks: updateBody.remarks? updateBody.remarks: existingPayment.remarks,
                            bank: existingBank,
                            paid_date: updateBody.paid_date? updateBody.paid_date: existingPayment.paid_date,
                            payment_receipt_url: `/uploads/${(file_data as any).filename}`
                        })
                        .where("payment_id = :id", { id: updateBody.payment_id })
                        .execute();
                        const response = Success<any>("payments updated successfully")
                        if(user_details) {
                            recordAudit("fees updated", new Date, "payments", user_details.user_id)
                        }
                        await reply.status(SUCCESS_GET).send(response)
                    }
                    else {
                        const errResponse = CustomError<string>(BAD_REQUEST, "Invalid bank or payment")
                        reply.status(BAD_REQUEST).send(errResponse)
                    }
                }
                else {
                    const errResponse = CustomError<string>(BAD_REQUEST, "insufficient data")
                    reply.status(BAD_REQUEST).send(errResponse)
                }
            }
            else {
                logger.error(`Invalid payload`);
                const errResponse = CustomError<string>(BAD_REQUEST, "Invalid payload");
                reply.status(BAD_REQUEST).send(errResponse);
            }
        }
        catch(error) {
            logger.error(`Internal server error`);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            reply.status(INTERNAL_ERROR).send(errResponse);
        }
    } 
    updateDate = async (request: FastifyRequest<{ Params: { id: number }, Body: { due_date: Date } }>, reply: FastifyReply) => {
        try {
            if (!request.body.due_date) {
                logger.error('due date not found');
                const errResponse = CustomError<string>(BAD_REQUEST, "due date not found");
                return reply.status(BAD_REQUEST).send(errResponse);
            }
    
            const payment_id = request.params.id;
            const newDate = new Date(request.body.due_date);
            const appDataSource = await getDataSource();
            const paymentRepository = appDataSource.getRepository(Payments);
            const payment = await paymentRepository.findOneBy({ payment_id: payment_id });
            if(payment) {
                const studentsRepository = appDataSource.getRepository(Students);
                const student = await studentsRepository.findOneBy({ student_id: payment.students.student_id });
                if(student){
                    if (newDate > student.registration_date) {
                        const errResponse = CustomError<string>(BAD_REQUEST, "due date cannot be greater than registration date");
                        return reply.status(BAD_REQUEST).send(errResponse);
                    }
                }
            }
            if (payment) {
                    const result = await paymentRepository.createQueryBuilder()
                    .update(Payments)
                    .set({ 
                        due_date: newDate
                    })
                    .where("payment_id = :id", { id: payment.payment_id })
                    .execute();                    
                    const response = Success<any>("due date updated successfully")
                    return reply.status(SUCCESS_GET).send(response)
            }else{
                const errResponse = CustomError<string>(NOT_FOUND, "payment not found");
                return reply.status(NOT_FOUND).send(errResponse);
            }
                   
        } catch (error) {
            logger.error(`Internal server error`,error);
            const errResponse = CustomError<string>(INTERNAL_ERROR, ERROR_COMMON_MESSAGE);
            return reply.status(INTERNAL_ERROR).send(errResponse);
        }
    }    
}