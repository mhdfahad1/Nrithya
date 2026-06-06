import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Column,
    ManyToOne
  } from "typeorm";
import { Batches } from "../../batch/entities/batch.entities";
import { Calendar } from "../../calender/entities/calender.entities";

@Entity()
export class CompensationBatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: "date",
  })
  old_date: Date;

  @Column({
    nullable: false,
    type: "date",
  })
  new_date: Date;

  @Column({
    nullable: false,
    type: "time",
  })
  start_time: string;

  @Column({
    nullable: false,
    type: "time",
  })
  end_time: string;

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

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batches: Batches;

  @ManyToOne(() => Calendar)
  @JoinColumn({ name: "cal_id" })
  calendar: Calendar;

  constructor() {
    this.id = 0;
    this.old_date = new Date();
    this.new_date = new Date();
    this.batches = new Batches();
    this.start_time = "";
    this.end_time = "";
    this.created_at = new Date();
    this.updated_at = new Date();
    this.calendar = new Calendar();
  }
}
