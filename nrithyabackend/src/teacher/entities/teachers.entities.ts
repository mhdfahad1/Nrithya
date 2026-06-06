import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Gender, TeacherStatus } from "../types/teacher.enums";

@Entity()
export class Teachers {
  @PrimaryGeneratedColumn()
  teacher_id: number;

  @Column({
    nullable: false,
  })
  first_name: string;

  @Column({
    nullable:true
  })
  last_name: string;

  @Column({
    nullable:false,
    type: "enum",
    enum: Gender,
  })
  gender: string;
  
  @Column({
    nullable:false
  })
  date_of_birth: Date;

  @Column({
    nullable:false
  })
  date_of_joining: Date;

  @Column({
    nullable:true
  })
  address: string;

  @Column({
    nullable: true,
  })
  place: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: false,
  })
  whatsapp_number: string;

  @Column({
    nullable: true,
  })
  alternative_number: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  bio: string;

  @Column({
    nullable: true,
  })
  qualification: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: TeacherStatus,
    default: TeacherStatus.ACTIVE,
  })
  status: string;
  
  @Column({
    nullable: true,
    default: new Date(),
  })
  created_at: Date;


  @Column({
    nullable: true,
    default:new Date(),
  })
  updated_at: Date;

  constructor() {
    this.teacher_id = 0;
    this.first_name = "";
    this.last_name = "";
    this.gender = "";
    this.date_of_birth = new Date();
    this.date_of_joining = new Date();
    this.address = "";
    this.place = "";
    this.city = "";
    this.state = "";
    this.alternative_number = "";
    this.whatsapp_number = "";
    this.email = "";
    this.bio = "";
    this.qualification = "";
    this.status = TeacherStatus.ACTIVE;
    this.created_at = new Date();
    this.updated_at = new Date(); 
  }
}
