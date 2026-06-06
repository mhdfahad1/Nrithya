import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
  } from "typeorm";
import { Batches } from "./batch.entities";
import { day_of_week } from "../types/batch.enums";

@Entity()
export class BatchesTimings {
  @PrimaryGeneratedColumn()
  timing_id: number;

  @Column({
    nullable: false,
    type: "enum",
    enum: day_of_week
  })
  day: string;

  @Column({
    nullable: false,
    type: 'time'
  })
  start_time: string;

  @Column({
    nullable: false,
    type: 'time'
  })
  end_time: string;

  @ManyToOne(() => Batches, { nullable: false })
  @JoinColumn({ name: "batch_id" })
  batch: Batches;

  constructor() {
    this.timing_id = 0;
    this.day = "";
    this.batch = new Batches();
    this.start_time = "";
    this.end_time = "";
  }
}