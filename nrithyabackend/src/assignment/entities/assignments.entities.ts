import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "../../teacher/entities/teachers.entities";

@Entity()
export class Assignments {
  @PrimaryGeneratedColumn()
  assignment_id: number;

  @Column({
    nullable: false,
  })
  assignment_name: string;

  @Column({
    nullable: false,
  })
  assignment_desc: string;

  @Column({
    nullable: false,
  })
  url: string;

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

  @ManyToOne(() => Courses)
  @JoinColumn({ name: "course_id" })
  courses: Courses;

  @ManyToOne(() => Teachers)
  @JoinColumn({ name: "teacher_id" })
  teachers: Teachers;

  constructor() {
    this.assignment_id = 0;
    this.assignment_name = "";
    this.assignment_desc = "";
    this.url = "";
    this.created_at = new Date();
    this.updated_at = new Date(); 
    this.courses = new Courses();
    this.teachers = new Teachers();
  }
}
