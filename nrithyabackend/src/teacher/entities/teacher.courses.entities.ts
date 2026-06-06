import {
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Courses } from "../../course/entities/course.entities";
import { Teachers } from "./teachers.entities";


@Entity()
export class TeacherCourses {
  @PrimaryGeneratedColumn()
  _id: number;

  @ManyToOne(() => Teachers)
  @JoinColumn({ name: "teacher_id" })
  teachers: Teachers;

  @ManyToOne(() => Courses)
  @JoinColumn({ name: "course_id" })
  courses: Courses;

  constructor() {
    this._id = 0;
    this.teachers = new Teachers();
    this.courses = new Courses();
  }
}