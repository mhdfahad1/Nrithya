import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";
import { BatchStatus } from "../types/batch.enums";

@Entity()
export class Batches {
  @PrimaryGeneratedColumn()
  batch_id: number;

  @Column({
    nullable: false
  })
  batch_name: string;

  @Column({
    nullable: false,
  })
  fee: number;

  @Column({
    nullable: false,
  })
  max_strength: number;

  @Column({
    nullable: false,
    default: 0
  })
  current_strength: number;

  @Column({
    nullable: true,
  })
  whatsapp_link: string;

  @Column({
    type: "enum",
    enum: BatchStatus,
    nullable: false,
    default: BatchStatus.ONGOING,
  })
  status: string;

  @Column({
    nullable: false,
    type: "date",
  })
  batch_started: Date;

  @Column({
    nullable: true,
    default: new Date()
  })
  created_at: Date;

  @Column({
    nullable: true,
    default: new Date()
  })
  updated_at: Date;

  @ManyToOne(() => Courses, { nullable: false })
  @JoinColumn({ name: "course_id" })
  courses: Courses;

  @ManyToOne(() => Teachers, { nullable: false })
  @JoinColumn({ name: "teacher_id" })
  teachers: Teachers;

  constructor() {
    this.batch_id = 0;
    this.courses = new Courses();
    this.teachers = new Teachers();
    this.batch_name = "";
    this.fee = 0;
    this.max_strength = 0;
    this.current_strength = 0;
    this.whatsapp_link = "";
    this.status = BatchStatus.ONGOING;
    this.batch_started = new Date();
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
