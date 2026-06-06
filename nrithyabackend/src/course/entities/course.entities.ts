import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Courses {

  @PrimaryGeneratedColumn()
  course_id: number;

  @Column({
    nullable: false,
  })
  course_name: string;

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
    this.course_id = 0;
    this.course_name = "";
    this.is_active = true;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

}
