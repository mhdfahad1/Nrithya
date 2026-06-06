"use client";
import { individualStudentAttendance } from "@/api/attendanceReport";
import { DataTable } from "@/app/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Check, CircleX } from "lucide-react";

interface DataType {
  id: number;
  date: string;
  attended: boolean;
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
    accessorKey: "attended",
    header: "Attendance",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          {data.attended ? (
            <Check className="text-green-600" />
          ) : (
            <CircleX className="text-red-600" />
          )}
        </>
      );
    },
  },
];

interface StudentAttendanceDatum {
  id: number;
  name: string;
  whatsapp_number: string;
  total_attendance: number;
  attendance: number;
  percentage: string;
}
type props = {
  data: StudentAttendanceDatum;
  from: string;
  to: string;
};
const StudentAttendanceList = ({ data, from, to }: props) => {
  const { data: studentAttendance } = useQuery({
    queryKey: ["date", data.id, from, to],
    queryFn: () => individualStudentAttendance(data.id, from, to),
    enabled: !!data.id,
  });
  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <div className="text-left">{data.name}</div>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] overflow-y-scroll max-h-[90vh]">
          {studentAttendance && studentAttendance.length > 0 ? (
            studentAttendance.map((item, index) => (
              <div key={index} className="">
                <DialogHeader>
                  <DialogTitle className="text-sm mb-2">
                    {item.batch_name}
                  </DialogTitle>
                </DialogHeader>
                <Card className="p-4 min-w-[100%]">
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={item.attendance_records}
                    />
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

export default StudentAttendanceList;
