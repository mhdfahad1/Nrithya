import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Batches } from "../../batch/entities/batch.entities";

@Entity()
export class Calendar {
  @PrimaryGeneratedColumn()
  calendar_id: number;

  @Column({
    nullable: false,
    type: "date",
  })
  date: Date;

  @Column({
    type: "time",
  })
  start_time: string;

  @Column({
    type: "time",
  })
  end_time: string;

  @ManyToOne(() => Batches)
  @JoinColumn({ name: "batch_id" })
  batches: Batches;

  @Column({
    default: false
  })
  compensated: Boolean;

  constructor() {
    this.calendar_id = 0;
    this.start_time = "",
    this.end_time = "",
    this.date = new Date();
    this.batches = new Batches();
    this.compensated = false;
  }
}
