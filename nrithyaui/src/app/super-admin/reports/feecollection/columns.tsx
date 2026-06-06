import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Viewscreenshot from "./Viewscreenshot";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DataType = {
  payment_id: number;
  date: string;
  due_date: string;

  remarks: string;
  status: boolean;
  amount: number;
  transaction_id: string;
  batches: {
    fee: number;
    batch_name: string;
  };
  students: {
    reg_no: string;
    first_name: string;
    last_name: string;
    whatsapp_number: string;
  };
  paid_date: string;
  payment_receipt_url: string;
  bank: {
    bank_name: string;
  };
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "students.reg_no",
    header: "Reg No",
  },
  {
    accessorKey: "student_name",
    header: "Student Name",
    cell: ({ row }) => {
      return `${row?.original?.students?.first_name} ${row?.original?.students?.last_name}`;
    },
  },
  {
    accessorKey: "students.whatsapp_number",
    header: "Contact No",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex gap-3">
              <div
                onClick={() =>
                  navigator.clipboard.writeText(data.students.whatsapp_number)
                }
                className="cursor-pointer hover:"
              >
                {data.students.whatsapp_number}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-gray-500">Click to copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  {
    accessorKey: "batches.batch_name",
    header: "Batch",
  },
  {
    accessorKey: "batches.fee",
    header: "Batch Fees",
  },
  {
    accessorKey: "amount",
    header: "Amount Paid",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div>
          {!data.status ? <div className="text-center">...</div> : data.amount}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    cell: ({ row }) => {
      return (
        <button
          className={
            row?.original?.status
              ? "bg-green-500 text-white px-2 py-1 rounded-md font-semibold  ml-4"
              : "bg-red-500 text-white px-2 py-1 rounded-md font-semibold  ml-4"
          }
        >
          {row?.original?.status ? "Paid" : "Unpaid"}
        </button>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = new Date(row.original.due_date);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "paid_date",
    header: "Paid Date",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div>
          {data.paid_date === null ? (
            <div className="text-center">...</div>
          ) : (
            new Date(data.paid_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "bank.bank_name",
    header: "Bank Name",
  },
  {
    accessorKey: "payment_receipt_url",
    header: "Screenshot",
    cell: ({ row }) => {
      const imageUrl = row?.original?.payment_receipt_url;

      return (
        <>
          {row.original.status ? (
            <Viewscreenshot imageUrl={imageUrl} />
          ) : (
            "No Screenshot"
          )}
        </>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
  },
];
