import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
  } from "typeorm";

import { Calendar } from "../../calender/entities/calender.entities";
import { Students } from "../../student/entities/students.entities";
import { Batches } from "../../batch/entities/batch.entities";

@Entity()
export class StudentAttendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    default: false,
  })
  attended: Boolean;

  @Column({
    nullable: false,
  })
  late_by: string;

  @Column()
  reason: string;

  @Column({
    nullable: false,
    type: 'date'
  })
  date: Date;

  @ManyToOne(() => Students)
  @JoinColumn({ name: "student_id" })
  students: Students;

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batch: Batches;

  @Column({
    nullable: true,
    type: 'time'
  })
  start_time: string;

  @Column({
    nullable: true,
    type: 'time'
  })
  end_time: string;

  constructor() {
    this.id = 0;
    this.attended = false;
    this.late_by = "";
    this.reason = "";
    this.students = new Students();
    this.batch = new Batches();
    this.date = new Date();
    this.start_time = "";
    this.end_time = "";
  }
}
