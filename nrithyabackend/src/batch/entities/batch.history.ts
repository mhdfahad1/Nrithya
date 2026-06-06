import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Batches } from "./batch.entities";
import { Students } from "../../student/entities/students.entities";

@Entity()
export class BatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Students, { nullable: false })
  @JoinColumn({ name: "student_id" })
  student: Students;

  @ManyToOne(() => Batches, { nullable: false })
  @JoinColumn({ name: "batch_id" })
  batch: Batches;

  constructor() {
    this.id = 0;
    this.student = new Students();
    this.batch = new Batches();
  }
}