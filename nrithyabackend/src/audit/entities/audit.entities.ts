import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "../../users/entities/user.entities";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  action: string;

  @Column({
    nullable: false,
    default: new Date()
  })
  date: Date;

  @Column({
    nullable: false,
  })
  relation: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "user_id" })
  users: Users;

  constructor() {
    this.id = 0;
    this.action = "";
    this.date = new Date();
    this.relation = "";
    this.users = new Users();
  }
}
