import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "../types/users.enums";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({
    nullable: false,
    unique: true,
  })
  user_name: string;

  @Column({
    nullable: false,
  })
  user_role: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: string;

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
    this.user_id = 0;
    this.user_name = "";
    this.user_role = "";
    this.password = "";
    this.created_at = new Date();
    this.updated_at = new Date(); 
    this.status = UserStatus.ACTIVE;
  }
}
