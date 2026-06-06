import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
  } from "typeorm";
  import { Batches } from "./batch.entities";


  @Entity()
  export class BatchActivity {
    @PrimaryGeneratedColumn()
    activity_id: number;
  
    @Column({
      nullable: false,
      type: "date",
    })
    date: Date;
  
    @ManyToOne(() => Batches, { nullable: false })
    @JoinColumn({
        name: "batch_id",
     })
    batch: Batches;

    @Column({
        nullable: true,
        type: "text"
    })
    task: string;

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
      this.activity_id = 0;
      this.date = new Date();
      this.batch = new Batches();
      this.task = "";
      this.created_at = new Date();
      this.updated_at = new Date();
    }
  }