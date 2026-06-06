import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn
  } from "typeorm";
import { Students } from "../../student/entities/students.entities";
import { BatchAssignments } from "./batches.assignments.entities";

@Entity()
export class StudentAssignments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    default: false,
  })
  status: Boolean;

  @Column({
    nullable: true
  })
  submission_date?: Date;

  @Column()
  grade: number;

  @ManyToOne(() => Students, { nullable: false })
  @JoinColumn({ name: "student_id" })
  student: Students;

  @ManyToOne(() => BatchAssignments, { nullable: false })
  @JoinColumn({ name: "batch_assignments_id" })
  batchAssignments: BatchAssignments;

  constructor() {
    this.id = 0;
    this.status = false;
    this.submission_date = new Date();
    this.grade = 0;
    this.student = new Students();
    this.batchAssignments = new BatchAssignments();
  }
}