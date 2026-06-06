import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Batches } from "../../batch/entities/batch.entities";
import { Students } from "./students.entities";
import { StudentBatchStatus } from "../types/student.batch.enums";

@Entity()
export class StudentBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: "enum",
    enum: StudentBatchStatus,
    default: StudentBatchStatus.ACTIVE,
  })
  status: string;

  @Column({
    nullable: false,
    type: "date",
  })
  joining_date: Date;

  @Column({
    nullable: false,
    default: 0,
  })
  pending_fee: number;

  @ManyToOne(() => Students)
  @JoinColumn({ name: "student_id" })
  students: Students;

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batches: Batches;

  constructor() {
    this.id = 0;
    this.status = StudentBatchStatus.ACTIVE;
    this.joining_date = new Date();
    this.pending_fee = 0;
    this.students = new Students();
    this.batches = new Batches();
  }
}
