export interface BankDataInput {
        account_holder:string;
        bank_name: string;
        account_number: string;
        branch?: string;
}

export interface BankSearch{
        bank_name?:string;
        account_holder?:string;
        account_number?:string;
        page?:number;
        limit?:number;
        sortorder?:string;
        pagenation?:string;
}

export interface BankEdit{
        bank_id:number;
        account_holder?:string;
        bank_name?:string;
        account_number?:string;
        branch?:string;
}