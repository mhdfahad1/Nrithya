import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from "typeorm";

  @Entity()
  export class BankDetail {
    @PrimaryGeneratedColumn()
    bank_id: number;

    @Column({
      nullable: false,
    })
    account_holder: string;
  
    @Column({
      nullable: false,
    })
    bank_name: string;

    @Column({
        nullable: false,
    })
    account_number: string;

    @Column({
        nullable: true,
    })
    branch: string;

    @Column({
        nullable: true,
    })
    status: boolean;

    @Column({
      nullable: true,
    })
    created_at: Date;
  
    @Column({
      nullable: true,
      default: new Date()
    })
    updated_at: Date;
  
    constructor() {
      this.bank_id = 0;
      this.account_holder = "";
      this.bank_name = "";
      this.account_number = "";
      this.branch = "";
      this.status = true;
      this.created_at = new Date();
      this.updated_at = new Date();
    }
  }