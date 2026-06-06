import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import TeacherAttendanceList from "../TeacherAttendanceList";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Payload } from "@/Interfaces/attendancReport";
interface TeacherDataType {
  id: number;
  name: string;
  whatsapp_number: string;
  Total_classes: number;
  attendance: number;
  percentage: string;
}
type Props = {
  from: string;
  to: string;
  TeacherAttendanceListData: Payload;
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
};
const TeacherTable = ({
  from,
  to,
  TeacherAttendanceListData,
  pageNum,
  setPageNum,
}: Props) => {
  const columnsTeacher: ColumnDef<TeacherDataType>[] = [
    {
      accessorKey: "name",
      header: "Teacher Name",
      cell: ({ row }) => {
        const data = row.original;
        return <TeacherAttendanceList data={data} from={from} to={to} />;
      },
    },
    {
      accessorKey: "whatsapp_number",
      header: "Whatsapp Number",
    },
    {
      accessorKey: "Total_classes",
      header: "Total Classes",
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
            columns={columnsTeacher}
            data={TeacherAttendanceListData?.data}
          />
          <CardFooter className="flex justify-center mt-2">
            <PaginationDemo
              pageCount={TeacherAttendanceListData?.metadata.totalcount}
              pageNum={pageNum}
              setPageNum={setPageNum}
            />
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTable;
