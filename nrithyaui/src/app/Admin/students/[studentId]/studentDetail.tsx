"use client";
import { PreviosBatch, StudentDetails } from "@/api/studentDetailPage";
import Navbar from "@/app/Components/Navbar";
import { DataTable } from "@/app/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Payload } from "@/Interfaces/StudentDetail";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookUser,
  Calendar,
  Copy,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface Batch {
  batch_id: number;
  courses: {
    course_name: string;
  };
  teachers: {
    first_name: string;
    last_name: string;
  };
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
  joining_date: string;
  batch_status: string;
}

interface Datum {
  id: number;
  student_id: number;
  student_name: string;
  batch_id: number;
  batch_name: string;
  teacher_name: string;
  course: string;
}

export const columns: ColumnDef<Batch>[] = [
  {
    accessorKey: "courses.course_name",
    header: "Course",
  },
  {
    accessorKey: "batch_name",
    header: "Batch",
  },
  {
    accessorKey: "teachers.first_name",
    header: "Teacher",
    cell: ({ row }) => {
      return `${row.original.teachers.first_name} ${row.original.teachers.last_name}`;
    },
  },
  {
    accessorKey: "joining_date",
    header: "Date of joining",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          {new Date(data.joining_date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </>
      );
    },
  },

  {
    accessorKey: "batch_status",
    header: "Batch Status",
  },
];

export const columns1: ColumnDef<Datum>[] = [
  {
    accessorKey: "batch_name",
    header: "Batch",
  },
  {
    accessorKey: "teacher_name",
    header: "Teacher Name",
  },
];

type Props = {
  studentId: string;
};

const Page = ({ studentId }: Props) => {
  const [eachstudent, setEachStudent] = useState<Payload>();

  const {
    data: individualStudentData,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["studentdetailpage", studentId],
    queryFn: async () => StudentDetails(Number(studentId)),
  });

  useEffect(() => {
    if (individualStudentData) {
      setEachStudent(individualStudentData);
    }
  }, [individualStudentData]);

  const { data: previousBatch, isLoading: isUserListLoading2 } = useQuery({
    queryKey: ["previosbatch", studentId],
    queryFn: async () => PreviosBatch(Number(studentId)),
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Navbar name="Student Detail" />

      {!isUserListLoading ? (
        eachstudent && (
          <div className="p-10 flex flex-col gap-10">
            <div
              key={eachstudent.student_id}
              className="bg-white rounded-xl shadow p-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex">
                  <p className="text-base font-bold">{eachstudent?.reg_no}</p>
                </div>
                <div className="flex gap-1">
                <p className="text-xl font-bold">{`${eachstudent.first_name} ${eachstudent.last_name}`}</p>
                <Badge variant="outline"color=""className="text-xs">{eachstudent.level}</Badge>
                </div>
              </div>

              <div className="flex gap-20">
                <div className="p-3">
                  <div className=" py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          <Mail />
                          <p>{eachstudent?.email}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          <BookUser />
                          <p>{`${eachstudent?.address} ${eachstudent.place} ${eachstudent.city} ${eachstudent.state}`}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          <User />
                          <p>{eachstudent?.gender}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Gender</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-8 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3 items-center">
                          <i className="fa-brands fa-whatsapp text-2xl font-semibold"></i>
                          <p>{eachstudent?.whatsapp_number}</p>
                          <Copy
                            className="h-3.5 w-3.5 text-gray-500"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                eachstudent.whatsapp_number
                              )
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Whatsapp</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          <Calendar />
                          <p>
                            {new Date(
                              eachstudent?.date_of_birth
                            ).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Date of Birth</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3 items-center">
                          <Phone />
                          <p>{eachstudent?.alternative_number}</p>
                          <Copy
                            className="h-3.5 w-3.5 text-gray-500"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                eachstudent.alternative_number
                              )
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Phone Number</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="p-4 mt-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={eachstudent.batches} />
                </CardContent>
              </Card>

              <p className="text-lg text-[#75172F] font-bold p-3">
                Batch History
              </p>

              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  {previousBatch?.data ? (
                    <DataTable columns={columns1} data={previousBatch?.data} />
                  ) : (
                    <p className="text-sm text-center font-bold">
                      No Previous Batches Available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center h-[100vh]">
          <Loader2 className="  animate-spin " />
        </div>
      )}
    </>
  );
};

export default Page;
