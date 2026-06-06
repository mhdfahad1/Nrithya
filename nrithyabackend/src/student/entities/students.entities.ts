import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Gender, StudentStatus } from "../types/student.types";
import { StudentLevels } from "../types/student.enums";

@Entity()
export class Students {
  @PrimaryGeneratedColumn()
  student_id: number;

  @Column({
    nullable: false,
  })
  reg_no: string;

  @Column({
    nullable: false,
  })
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: Gender,
  })
  gender: string;

  @Column({
    nullable: false,
  })
  date_of_birth: Date;

  @Column({
    nullable: false,
  })
  address: string;

  @Column({
    nullable: false,
  })
  place: string;

  @Column({
    nullable: false,
  })
  city: string;

  @Column({
    nullable: false,
  })
  state: string;

  @Column({
    nullable: false,
  })
  alternative_number: string;

  @Column({
    nullable: false,
  })
  whatsapp_number: string;

  @Column({
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: string;

  @Column({
    nullable: false,
    type: "date",
    default: () => "CURRENT_TIMESTAMP",
  })
  registration_date: Date;

  @Column({
    nullable: true,
    type: "enum",
    enum: StudentLevels,
    default: StudentLevels.DEFAULT
  })
  level: string

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

  @Column({
    type:"float",
    nullable: false,
    default: 0
  })
  performance: number;

  @Column({
    type:"float",
    nullable: false,
    default: 0
  })
  assignment: number;

  @Column({
    type:"float",
    nullable: false,
    default: 0
  })
  attendance: number;


  constructor() {
    this.reg_no = "";
    this.student_id = 0;
    this.first_name = "";
    this.last_name = "";
    this.gender = "";
    this.date_of_birth = new Date();
    this.address = "";
    this.place = "";
    this.city = "";
    this.state = "";
    this.alternative_number = "";
    this.whatsapp_number = "";
    this.email = "";
    this.registration_date = new Date();
    this.status = ""
    this.level = "";
    this.created_at = new Date(); 
    this.updated_at = new Date(); 
    this.performance = 0;
    this.assignment = 0;
    this.attendance = 0;
  }
}
