"use client";

import { IndividualTeacherDetails } from "@/api/teacherManagement";
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
import { Payload } from "@/Interfaces/teacherDetail";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import ErrorHandling from "@/app/Components/ErrorHandling";

import {
  BookUser,
  Calendar,
  CalendarCheck,
  Captions,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
type DataType = {
  course_id: number;
  course_name: string;
  batches: {
    batch_name: string;
  }[];
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "course_name",
    header: "Course",
  },
  {
    accessorKey: "batches.batch_name",
    header: "Batch",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-left flex flex-col items-start">
          {data?.batches?.map((batch, index) => (
            <Badge
              variant="outline"
              className="text-[#39B16E] border-[#39B16E] m-1"
              key={index}
            >
              {`${batch?.batch_name}`}
            </Badge>
          ))}
        </div>
      );
    },
  },
];
type Props = {
  teacherId: string;
};

const TeacherDetail = ({ teacherId }: Props) => {
  const { data, isLoading, error } = useQuery<Payload[]>({
    queryKey: ["TeacherDetail", teacherId],
    queryFn: async () => {
      try {
        const result = await IndividualTeacherDetails(Number(teacherId));
        return result;
      } catch (error) {
        throw new Error("Failed to fetch batch data");
      }
    },
    enabled: !!teacherId,
  });
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Navbar name="Teacher Detail" />
      {!isLoading ? (
        data?.map((item) => (
          <div
            key={item.teacher.teacher_id}
            className="p-10 flex flex-col gap-10"
          >
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-xl font-bold">{`${item?.teacher.first_name} ${item.teacher.last_name}`}</p>

              <div className="flex gap-5">
                <div className="p-3">
                  <div className=" py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          {" "}
                          <Mail />
                          <p>{item.teacher.email}</p>
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
                          {" "}
                          <CalendarCheck />
                          <p>
                            {new Date(
                              item.teacher.date_of_joining
                            ).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Date of joining</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          <BookUser />
                          <p className="text-justify">{`${item.teacher.address} ${item.teacher.place} ${item.teacher.city} ${item.teacher.state}`}</p>
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
                          {" "}
                          <User />
                          <p>{item.teacher.gender}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Gender</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          {" "}
                          <GraduationCap />
                          <p>{item.teacher.qualification}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Qualification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-3 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex gap-3">
                          {" "}
                          <i className="fa-brands fa-whatsapp text-2xl font-semibold"></i>
                          <p>{item.teacher.whatsapp_number}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Whatsapp Number</p>
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
                          {" "}
                          <Calendar />
                          <p>
                            {new Date(
                              item.teacher.date_of_birth
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
                        <TooltipTrigger className="flex gap-3">
                          {" "}
                          <Phone />
                          <p>{item.teacher.alternative_number}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Alternative Phone Number</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              <div className="px-3">
                <div className="flex gap-3 py-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Captions className="" />{" "}
                        <p className="text-justify items-right justify-start">
                          {item.teacher.bio}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>BIO</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            {item && (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={item.teacher.coursesAndBatches}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-[100vh]">
          {" "}
          <Loader2 className="mr-2 h-10 w-10 animate-spin" />
        </div>
      )}
    </>
  );
};

export default TeacherDetail;
