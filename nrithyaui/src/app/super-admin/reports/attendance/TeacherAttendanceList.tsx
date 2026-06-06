"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/app/table/data-table";
import { individualTeacherAttendance } from "@/api/attendanceReport";
import { useQuery } from "@tanstack/react-query";
import { individualteacherAttendanceRootObject } from "@/Interfaces/attendancReport";
import { Check, CircleX } from "lucide-react";
interface DataType {
  date: string;
  isAttended: boolean;
}

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          {new Date(data.date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </>
      );
    },
  },
  {
    accessorKey: "isAttended",
    header: "Attendance",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          {data.isAttended ? (
            <Check className="text-green-600" />
          ) : (
            <CircleX className="text-red-600" />
          )}
        </>
      );
    },
  },
];

interface TeacherDataType {
  id: number;
  name: string;
  whatsapp_number: string;
  Total_classes: number;
  attendance: number;
  percentage: string;
}
type props = {
  data: TeacherDataType;
  from: string;
  to: string;
};
const TeacherAttendanceList = ({ data, from, to }: props) => {
  const { data: teacherAttendance } = useQuery({
    queryKey: ["individualTeacher", data.id, from, to],
    queryFn: () => individualTeacherAttendance(data.id, from, to),
    enabled: !!data.id,
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <div className="text-left">{data.name}</div>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] overflow-y-scroll max-h-[90vh]">
          {teacherAttendance && teacherAttendance.length > 0 ? (
            teacherAttendance?.map((item, index) => (
              <div key={index} className="">
                <DialogHeader>
                  <DialogTitle className="text-sm mb-2">
                    {item.batch_name}
                  </DialogTitle>
                </DialogHeader>
                <Card className="p-4 min-w-[100%]">
                  <CardContent>
                    <DataTable columns={columns} data={item.attendance} />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-center max-h-[90vh] flex justify-center items-center text-xl">
              No Attendance Available
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAttendanceList;
