import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Assignments } from "./assignments.entities";
import { Batches } from "../../batch/entities/batch.entities";

@Entity()
export class BatchAssignments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: "date",
  })
  assigning_date: Date;

  @Column({
    nullable: false,
    type: "date",
  })
  submission_deadline: Date;

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batch: Batches;

  @ManyToOne(() => Assignments)
  @JoinColumn({ name: "assignment_id" })
  assignment: Assignments;

  constructor() {
    this.id = 0;
    this.assigning_date = new Date();
    this.submission_deadline = new Date();
    this.batch = new Batches();
    this.assignment = new Assignments();
  }
}
