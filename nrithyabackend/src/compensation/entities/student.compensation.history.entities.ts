import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Column,
    ManyToOne,
  } from "typeorm";
import { Batches } from "../../batch/entities/batch.entities";
import { Students } from "../../student/entities/students.entities";


  @Entity()
  export class CompensationStudentHistory {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
      nullable: false,
      type: "date",
    })
    old_date: Date;
  
    @Column({
      nullable: false,
      type: "date",
    })
    new_date: Date;

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
  
    @ManyToOne(() => Batches)
    @JoinColumn({ name: "own_batch" })
    own_batches: Batches;
  
    @ManyToOne(() => Batches)
    @JoinColumn({ name: "new_batch" })
    new_batches: Batches;

    @ManyToOne(() => Students)
    @JoinColumn({ name: "student_id" })
    student: Students;
  
    constructor() {
      this.id = 0;
      this.old_date = new Date();
      this.new_date = new Date();
      this.own_batches = new Batches();
      this.new_batches = new Batches();
      this.student = new Students();
      this.created_at = new Date();
      this.updated_at = new Date();
    }
  }