import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Frequency {
  @PrimaryGeneratedColumn()
  freq_id: number;

  @Column({
    nullable: false,
  })
  fee_notification: number;

  @Column({
    nullable: false,
  })
  enquiry_1: number;

  @Column({
    nullable: false,
  })
  enquiry_2: number;

  @Column({
    nullable: false,
  })
  enquiry_3: number;

  constructor() {
    this.freq_id = 0;
    this.fee_notification = 0;
    this.enquiry_1 = 0;
    this.enquiry_2 = 0;
    this.enquiry_3 = 0;
  }
}
