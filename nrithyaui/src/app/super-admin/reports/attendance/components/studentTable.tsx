import { DataTable } from "@/app/table/data-table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StudentAttendancePayload } from "@/Interfaces/attendancReport";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import StudentAttendanceList from "../StudentAttendanceList";
import PaginationDemo from "@/app/table/Pagination";
interface StudentAttendanceDatum {
  id: number;
  name: string;
  whatsapp_number: string;
  total_attendance: number;
  attendance: number;
  percentage: string;
}
type Props = {
  from: string;
  to: string;
  StudentAttendanceListData: StudentAttendancePayload;
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
};

const StudentTable = ({
  from,
  to,
  StudentAttendanceListData,
  pageNum,
  setPageNum,
}: Props) => {
  const columnsStudent: ColumnDef<StudentAttendanceDatum>[] = [
    {
      accessorKey: "name",
      header: "Student Name",
      cell: ({ row }) => {
        const data = row.original;
        return <StudentAttendanceList data={data} from={from} to={to} />;
      },
    },
    {
      accessorKey: "whatsapp_number",
      header: "Whatsapp Number",
    },
    {
      accessorKey: "total_attendance",
      header: "Total Attendance",
    },
    {
      accessorKey: "attendance",
      header: "Attendance",
    },
    {
      accessorKey: "percentage",
      header: "Percentage",
    },
  ];
  return (
    <div>
      <Card className="p-4 mt-4 min-w-[100%]">
        <CardContent>
          <DataTable
            columns={columnsStudent}
            data={StudentAttendanceListData?.data}
          />
          <CardFooter className="flex justify-center mt-2">
            <PaginationDemo
              pageCount={StudentAttendanceListData?.metadata.totalcount}
              pageNum={pageNum}
              setPageNum={setPageNum}
            />
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTable;
