import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";

@Entity()
export class EnquiryResponse {
  @PrimaryGeneratedColumn()
  enq_res_id: number;

  @Column({
    nullable: false,
  })
  enquiry_response: string;

  constructor() {
    this.enq_res_id = 0;
    this.enquiry_response = "";
  }
}
