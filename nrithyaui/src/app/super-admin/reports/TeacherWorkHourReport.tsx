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
import { getStudentsHandledByTeacher } from "@/api/studentsHandledByTeacher";
import { StudentsHandledByTeacherPayload } from "../dashboard/StudentsHandledByTeacher";

type DataType = {
  first_name: string;
  last_name: string;
  working_hours: number;
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
    accessorKey: "working_hours",
    header: "Working Hours",
  },
];
type TeacherWorkHourReportProps = {
  from: string;
  to: string;
};
function TeacherWorkHourReport({ from, to }: TeacherWorkHourReportProps) {
  const {
    data: TeacherWorkHourData,
    isLoading: isTeacherWorkHHourLoading,
    error,
  } = useQuery({
    queryKey: ["TeacherWorkHour", from, to],
    queryFn: async () => await getStudentsHandledByTeacher(from, to),
    enabled: !!{ from, to },
  });
  const [getData, setGetData] = useState<StudentsHandledByTeacherPayload[]>([]);
  useEffect(() => {
    if (TeacherWorkHourData) {
      setGetData(TeacherWorkHourData);
    }
  }, [TeacherWorkHourData]);
  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <p className="text-sm text-[#75172F] flex items-center hover:underline">
            View Details <ArrowRightIcon className="h-3.5 w-3.5" />
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] max-h-[90%]  overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Teacher work hour/week
            </DialogTitle>
          </DialogHeader>
          <div>
            {isTeacherWorkHHourLoading ? (
              <div className="flex justify-center items-center h-[100%] w-[100%]">
                <Loader2 className="  animate-spin " />
              </div>
            ) : (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={getData} />
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeacherWorkHourReport;
