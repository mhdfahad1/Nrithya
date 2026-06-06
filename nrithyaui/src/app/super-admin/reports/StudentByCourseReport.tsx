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
import { StudentByCoursePayload } from "../dashboard/StudentsByCourse";
import { useQuery } from "@tanstack/react-query";
import { getStudentByCourse } from "@/api/StudentsByCourse";
import { ColumnDef } from "@tanstack/react-table";

type DataType = {
  course_name: string;
  no_of_students: number;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "course_name",
    header: "Course",
  },
  {
    accessorKey: "no_of_students",
    header: "Student No",
  },
];
type StudentByCourseReportProps = {
  from: string;
  to: string;
};
function StudentByCourseReport({ from, to }: StudentByCourseReportProps) {
  const {
    data: StudentByCourseData,
    isLoading: isStudentByCourseLoading,
    error,
  } = useQuery({
    queryKey: ["studentByCourseReport", from, to],
    queryFn: async () => await getStudentByCourse(from, to),
    enabled: !!{ from, to },
  });
  const [getData, setGetData] = useState<StudentByCoursePayload[]>([]);
  useEffect(() => {
    if (StudentByCourseData) {
      setGetData(StudentByCourseData);
    }
  }, [StudentByCourseData]);

  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <p className="text-sm text-[#75172F] flex items-center hover:underline">
            View Details <ArrowRightIcon className="h-3.5 w-3.5" />
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] max-h-[90%]  overflow-y-auto ">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Courses by registered students
            </DialogTitle>
          </DialogHeader>
          <div>
            {isStudentByCourseLoading ? (
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

export default StudentByCourseReport;
