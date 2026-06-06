import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Courses } from "../../course/entities/course.entities";
import { EnquiryType } from "./enquirytype.entities";
import { EnquiryStatus } from "../types/enquiries.enums";
import { Users } from "../../users/entities/user.entities";

@Entity()
export class Enquiries {
  @PrimaryGeneratedColumn()
  enq_id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  contact_number: string;

  @Column({
    nullable: false,
    type:"date"
  })
  enq_date: Date;

  @Column({
    nullable: false,
    type: "enum",
    enum: EnquiryStatus,
    default: EnquiryStatus.NEW,
  })
  enq_status: string;

  @Column({
    nullable:true,
  })
  remarks: string;

  @Column({
    nullable:false,
    default: false,
  })
  demo_requested: boolean;

  @Column({
    nullable: true,
    type: "date",
  })
  last_call: Date;

  @Column({
    nullable: true,
    type: "date",
  })
  follow_up: Date;

  @Column({
    nullable: false,
    default: false,
  })
  first_follow_up: boolean;

  @Column({
    nullable: false,
    default: false,
  })
  second_follow_up: boolean;

  @Column({
    nullable: false,
    default: false,
  })
  third_follow_up: boolean;

  @ManyToOne(() => Courses, {nullable: true})
  @JoinColumn({ name: "course_id" })
  courses?: Courses | null;
  
  @ManyToOne(() => Users, {nullable: true})
  @JoinColumn({ name: "assignee_id" })
  assignee?: Users | null;

  @ManyToOne(() => EnquiryType, {nullable: true})
  @JoinColumn({ name: "enq_type_id"})
  enquiryType?: EnquiryType | null;

  constructor() {
    this.enq_id = 0;
    this.name = "";
    this.contact_number = "";
    this.enq_date = new Date();
    this.enq_status = EnquiryStatus.NEW;
    this.remarks = "";
    this.demo_requested = false;
    this.last_call = new Date();
    this.follow_up = new Date();
    this.first_follow_up= false;
    this.second_follow_up = false;
    this.third_follow_up = false;
    this.courses = new Courses();
    this.enquiryType = new EnquiryType();
    this.assignee = new Users();
  }
}
