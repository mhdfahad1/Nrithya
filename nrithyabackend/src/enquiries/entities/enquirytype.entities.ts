import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";

@Entity()
export class EnquiryType {
  @PrimaryGeneratedColumn()
  enq_type_id: number;

  @Column({
    nullable: false,
  })
  enq_type: string;

  @Column({
    nullable: false,
    default: true,
  })
  is_active: boolean;

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

  constructor() {
    this.enq_type_id = 0;
    this.enq_type = "";
    this.is_active = true;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}