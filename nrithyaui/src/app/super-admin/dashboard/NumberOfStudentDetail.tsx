"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/app/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getNumberOfStudents } from "@/api/numberOfStudents";
interface DataType {
  month: string;
  year: number;
  students: number;
}

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const data = row.original;
      return <div>{`${data.month} ${data.year}`}</div>;
    },
  },
  {
    accessorKey: "students",
    header: "Number of Students",
  },
];
type NumberOfStudentDetailProps = {
  from: string;
  to: string;
};

function NumberOfStudentDetail({ from, to }: NumberOfStudentDetailProps) {
  const {
    data: NoOfStudentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["numberOfStudents", from, to],
    queryFn: async () => getNumberOfStudents(from, to),
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <p className="text-sm text-[#75172F] flex items-center hover:underline">
            View Details <ArrowRightIcon className="h-3.5 w-3.5" />
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Number of Students Registered
            </DialogTitle>
          </DialogHeader>
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-[100%] w-[100%]">
                <Loader2 className="  animate-spin " />
              </div>
            ) : (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      {" "}
                      <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                    </div>
                  ) : NoOfStudentsData !== undefined ? (
                    <DataTable columns={columns} data={NoOfStudentsData} />
                  ) : (
                    "No data to show"
                  )}{" "}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NumberOfStudentDetail;
