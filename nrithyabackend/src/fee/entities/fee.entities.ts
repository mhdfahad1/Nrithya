import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Students } from "../../student/entities/students.entities";
import { Batches } from "../../batch/entities/batch.entities";
import { BankDetail } from "../../bank/entites/bank.detail";

@Entity()
export class Payments {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column({
    nullable: false,
    type: "date",
  })
  date: Date;

  @Column({
    nullable: false,
    type: "date",
  })
  due_date: Date;

  @Column({
    nullable: true,
  })
  remarks: string;

  @Column({
    nullable: false,
    default: false,
  })
  status: Boolean;

  @Column({
    nullable: false,
  })
  amount: number;

  @Column({
    nullable: true,
  })
  transaction_id: string;

  @Column({
    nullable: true
  })
  paid_date: Date;

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batches: Batches;

  @ManyToOne(() => Students)
  @JoinColumn({ name: "student_id" })
  students: Students;

  @Column({
    nullable: true
  })
  payment_receipt_url: string;

  @ManyToOne(() => BankDetail, {
    nullable: true
  })
  @JoinColumn({ name: "bank_id" })
  bank: BankDetail;


  constructor() {
    this.payment_id = 0;
    this.date = new Date();
    this.due_date = new Date();
    this.remarks = "";
    this.status = false;
    this.amount = 0;
    this.transaction_id = "";
    this.batches = new Batches();
    this.students = new Students();
    this.paid_date = new Date();
    this.payment_receipt_url = "";
    this.bank = new BankDetail();
  }
}
