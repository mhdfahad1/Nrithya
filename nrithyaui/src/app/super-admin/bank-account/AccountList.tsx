import { getBankAccounts } from "@/api/bankAccount";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import AddbankAccount from "./AddbankAccount";
import DeleteBankAccount from "./deleteBank";
type DataType = {
  bank_id: number;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "account_holder",
    header: "Account Holder Name",
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
  },
  {
    accessorKey: "bank_name",
    header: "Bank Name",
  },
  {
    accessorKey: "branch",
    header: "Branch Name",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <AddbankAccount AccountDetails={data} />
              <DropdownMenuItem className="text-red-500 ">
                <DeleteBankAccount bank_id={data.bank_id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const AccountList = () => {
  const [pageNum, setPageNum] = useState(1);

  const [searchKey, setSearchKey] = useState("");

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["bankaccount", searchKey],
    queryFn: () => getBankAccounts(searchKey),
  });
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 mt-2">
        <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-0  ">
          <div className="flex justify-end gap-3 ">
            <div className=" relative   md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                onChange={(e) => {
                  setPageNum(1);
                  setSearchKey(e.target.value);
                }}
                type="search"
                placeholder="Account holder name"
                className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
              />
            </div>
            <div className="flex items-center ">
              <AddbankAccount />
            </div>
          </div>
          <div>
            {!isLoading ? (
              <Card className="p-4 min-w-[100%]">
                {bankAccounts && (
                  <CardContent>
                    <DataTable columns={columns} data={bankAccounts?.data} />

                    <CardFooter className="flex justify-center mt-2">
                      {bankAccounts !== undefined ? (
                        <PaginationDemo
                          pageNum={pageNum}
                          setPageNum={setPageNum}
                          pageCount={bankAccounts.metadata.total_count}
                        />
                      ) : null}
                    </CardFooter>
                  </CardContent>
                )}
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[100vh]">
                <Loader2 className="  animate-spin " />
              </div>
            )}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountList;
