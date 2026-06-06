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
import { Payload } from "@/Interfaces/teacherWiseRevenue";
import { teacherWiseRevenueReportApi } from "@/api/teacherWiseRevenueReport";

type DataType = {
  first_name: string;
  last_name: string;
  revenue: number;
};
export const columns: ColumnDef<DataType>[] = [
  {
    id: "teacher_name",
    header: "Teacher Name",
    cell: ({ row }) => {
      const data = row.original;
      return <div>{`${data.first_name} ${data.last_name}`}</div>;
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
  },
];
type TeacherWiseRevenueProps = {
  from: string;
  to: string;
};

function TeacherWiseRevenueReport({ from, to }: TeacherWiseRevenueProps) {
  const [listfee, setListFee] = useState<Payload[]>([]);

  const {
    data: teacherwiserevenue,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["revenuereportteacher", from, to],
    queryFn: async () => teacherWiseRevenueReportApi(from, to),
  });

  useEffect(() => {
    if (teacherwiserevenue) {
      setListFee(teacherwiserevenue);
    }
  }, [teacherwiserevenue]);
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
            <DialogTitle className="text-sm">Teacher wise revenue</DialogTitle>
          </DialogHeader>
          <div>
            {isUserListLoading ? (
              <div className="flex justify-center items-center h-[100%] w-[100%]">
                <Loader2 className="  animate-spin " />
              </div>
            ) : (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={listfee} />
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeacherWiseRevenueReport;
