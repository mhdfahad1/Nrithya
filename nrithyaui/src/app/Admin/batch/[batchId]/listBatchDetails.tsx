"use client";
import { BatchDetail, BatchStudentList } from "@/api/batch";
import Navbar from "@/app/Components/Navbar";
import { DataTable } from "@/app/table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Payload } from "@/Interfaces/batchDetail";
import { Datum } from "@/Interfaces/BatchStudents";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Clock, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { getCalendar } from "@/api/batchAttendance";

interface DataType {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  registration_date: string;
  status: string;
}

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "first_name",
    header: "Student Name",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Link href={`/Admin/students/${data.student_id}`}>
          <div
            key={data.student_id}
            className="text-left cursor-pointer hover:text-blue-600 hover:underline"
          >
            {data.first_name} {data.last_name}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "whatsapp_number",
    header: "Whatsapp No",
  },
  {
    accessorKey: "alternative_number",
    header: "Alternative No",
  },
  {
    accessorKey: "percentage",
    header: "Attendance (%)",
  },
];
type Props = {
  batchId: string;
  calendar_id?: string;
};
const Page = ({ batchId, calendar_id }: Props) => {
  const [students, setStudents] = useState<Datum[]>([]);
  const [calendarById, setCalendarById] = useState(calendar_id);

  // const date = "2024-03-15";
console.log(calendarById)
  const { data: batchDetails, error: batcherror } = useQuery<Payload>({
    queryKey: ["batchDetails", batchId],
    queryFn: () => BatchDetail(batchId),
  });
  const { data: calendarDataById } = useQuery({
    queryKey: ["calendarById", calendarById],
    queryFn: async () => await getCalendar(String(calendarById)),
    enabled: !!calendarById,
  });
  const {
    data: batchStudentslist,
    isLoading,
    error: studenterror,
    refetch,
  } = useQuery({
    queryKey: ["batchstudents", batchId,calendarDataById,calendarById,calendar_id],
    queryFn: () => BatchStudentList(batchId,calendarDataById?.date),  
    enabled: !!batchId,
  });
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (batchStudentslist) {
      setStudents(batchStudentslist.data);
    }
  }, [batchStudentslist]);
  useEffect(() => {
    if (calendar_id) {
      setCalendarById(calendar_id);
    } 
  }, [calendar_id]);
  if (batcherror) {
    return (
      <div>
        <ErrorHandling error={batcherror} />
      </div>
    );
  }
  if (studenterror) {
    return (
      <div>
        <ErrorHandling error={studenterror} />
      </div>
    );
  }

  function convertToAMPM(time24: string) {
    var hour = parseInt(time24.substring(0, 2));
    var minute = time24.substring(3, 5);
    var AMPM = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return hour + ":" + minute + AMPM;
  }

  var time24: string = "11:00:00";
  var timeAMPM = convertToAMPM(time24);

  return (
    <>
      <Navbar name="Batch Detail" />

      {!isLoading ? (
        <div className="p-10">
          <div className="bg-white shadow rounded p-3">
            <div className="flex  px-3 pr-24 items-center">
              <div className="flex gap-1">
                <p className="text-2xl font-bold text-[#75172F]">
                  {batchDetails?.batch_name}
                </p>
                {batchDetails?.status === "ongoing" ? (
                  <button className="h-6 mt-1 px-2 rounded-lg bg-[#04E7AE] text-white text-xs">
                    Ongoing
                  </button>
                ) : (
                  <button className="h-6 mt-1 px-2 rounded-lg bg-[#CF0D0E] text-white text-xs">
                    Expired
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between p-3 ">
              <div className="flex flex-col gap-3">
                <Link
                  href={`/Admin/teachers/${batchDetails?.teachers.teacher_id}`}
                >
                  <p className="text-xl font-bold">{`${batchDetails?.teachers.first_name} ${batchDetails?.teachers.last_name}`}</p>
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex gap-2">
                      <Users />:
                      <p>
                        {batchStudentslist?batchStudentslist?.metadata?.totalcount:batchDetails?.current_strength}/
                        {batchDetails?.max_strength}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Strength</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex gap-2">
                      <i className="fa-brands fa-whatsapp text-2xl font-semibold"></i>
                      :
                      <a
                        href={batchDetails?.whatsapp_link}
                        target="_blank"
                        className="text-blue-700 pb-1 text-base"
                      >
                        {batchDetails?.whatsapp_link}
                      </a>{" "}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Whatsapp</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex gap-2">
                      <Calendar />:
                      <p>
                        {new Date(
                          batchDetails?.batch_started
                            ? batchDetails?.batch_started
                            : ""
                        ).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Batch Started Date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-col gap-2">
                {batchDetails?.batch_timings.map((item) => (
                  <p key={item.timing_id} className="font-bold text-sm">
                    {item.day}-
                    <span
                      className="font-normal text-sm"
                      style={{ marginLeft: "5px", color: "#333" }}
                    >
                      {convertToAMPM(item.start_time)}:
                      {convertToAMPM(item.end_time)}
                    </span>
                  </p>
                ))}
              </div>
              <div className="flex justify-center items-center gap-5">
                {calendar_id ? (
                  <div>
                    {batchDetails?.current_strength === 0&&batchStudentslist?.metadata?.totalcount===0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex gap-2">
                            <Button className="bg-[#75172F]" disabled>
                              Attendance
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Batch is empty</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Link
                        href={`/Admin/batch/${batchId}/attendance?calendar_id=${calendar_id}`}
                      >
                        <Button className="bg-[#75172F]">Attendance</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  ""
                )}
                <Link href={`/Admin/batch/${batchId}/assignment`}>
                  <Button
                    variant={"violetFill"}
                    className="bg-white text-[#75172F] border-[#75172F] hover:text-white"
                  >
                    Assignment
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Card className="p-4 mt-4 min-w-[100%]">
            <CardContent>
              <DataTable columns={columns} data={students} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[100vh]">
          <Loader2 className="  animate-spin " />
        </div>
      )}
    </>
  );
};

export default Page;
