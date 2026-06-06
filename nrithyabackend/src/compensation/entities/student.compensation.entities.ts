import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Students } from "../../student/entities/students.entities";
import { Calendar } from "../../calender/entities/calender.entities";
import { CompensationStudentHistory } from "./student.compensation.history.entities";

@Entity()
export class StudentCompensation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Students)
  @JoinColumn({ name: "student_id" })
  students: Students;

  @ManyToOne(() => CompensationStudentHistory)
  @JoinColumn({ name: "comp_id" })
  history: CompensationStudentHistory;

  constructor() {
    this.id = 0;
    this.students = new Students();
    this.history = new CompensationStudentHistory();
  }
}
