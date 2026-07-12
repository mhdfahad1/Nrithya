"use client";

import { DataTable } from "@/app/table/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarIcon,
  Download,
  Eye,
  ListFilter,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
} from "lucide-react";

import { BatchesList, CourseList, downloadBatchesList } from "@/api/batch";
import ErrorHandling from "@/app/Components/ErrorHandling";
import PaginationDemo from "@/app/table/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import {
  BatchPayload,
  BatchTimingType,
  CoursePayloadType,
} from "@/Interfaces/batch";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import ComboboxDemo from "../../table/combox";
import { CourseType } from "./Add-batch/page";
import DeleteBatch from "./deleteBatch";

import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getTeacherComboBox } from "@/api/assignment";
interface RowData {
  original: DataType;
}
type DataType = {
  batch_id: number;
  batch_name: string;
  courses: {
    course_name: string;
    course_id: number;
  };
  teachers: {
    teacher_id: number;
    first_name: string;
    last_name: string;
  };
  batch_started: string;
  max_strength: number;
  whatsapp_link: string;
  fee: number;
  batch_timings: BatchTimingType[];
};

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  course: string;
  teacher: string;
  from: string;
  to: string;
};
type ListBatchProps = {
  getRole?: string;
};
export default function TableList({ getRole }: ListBatchProps) {
  const [pageNum, setPageNum] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [course, setCourse] = useState<CourseType[]>([]);

  const [filterBatch, setFilterBatch] = useState({
    course: "",
    teacher: "",
    from: "",
    to: "",
  });

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const isDateChange = Boolean(date?.from || date?.to);

  const [listBatch, setListBatch] = useState<DataType[]>([]);

  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const form = useForm<FilterType>({
    defaultValues: {
      course: "",
    },
  });

  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const { errors, isDirty } = formState;
  const [teacher, setTeacher] = useState<CourseType[]>([]);
  const courseValue = useWatch({ control, name: "course" });

  const handleReset = () => {
    setResetFilter(true);
    reset();
    setDate({
      from: undefined,
      to: undefined,
    });
  };

  const {
    data: data1,
    isLoading,
    refetch,
    error,
  } = useQuery<BatchPayload>({
    queryKey: ["batches", searchKey, pageNum, filterBatch],
    queryFn: async () => {
      const result = await BatchesList(
        searchKey || "",
        pageNum,
        filterBatch.course,
        filterBatch.teacher,
        filterBatch.from,
        filterBatch.to
      );
      setListBatch(result);
      return result;
    },
  });
  // download batchlist
  const onDownloadBatchlist = useMutation({
    mutationFn: async () => {
      return await downloadBatchesList(
        searchKey || "",
        filterBatch.course,
        filterBatch.teacher,
        filterBatch.from,
        filterBatch.to
      );
    },
    onSuccess: (data) => {
      if (data !== undefined) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "batchlist.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });
  const { data: coureList, isLoading: isLoading2 } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => CourseList(),
  });
  useEffect(() => {
    if (coureList) {
      const course: CourseType[] = coureList
        ? coureList.map((item: CoursePayloadType) => ({
            value: String(item?.course_id),
            label: item?.course_name.trim(),
          }))
        : [];
      setCourse(course);
    }
  }, [coureList]);

  const OnFilter = (data: FilterType) => {
    setPageNum(1);
    setFilterBatch({
      ...filterBatch,
      course: data.course,
      from: `${date?.from === undefined ? "" : date.from}`,
      to: `${date?.to === undefined ? "" : date.to}`,
      teacher: data.teacher,
    });
  };
  const { data: teacherList, isLoading: isLoading3 } = useQuery({
    queryKey: ["teacher", courseValue],
    queryFn: async () => await getTeacherComboBox(courseValue),
  });

  useEffect(() => {
    if (data1?.data) {
      setListBatch(data1.data);
    }
  }, [data1]);

  useEffect(() => {
    if (teacherList) {
      const teacher: CourseType[] = teacherList
        ? teacherList.data.map((item) => ({
            value: String(item?.teacher_id),
            label: `${item.first_name}${
              item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
            }`,
          }))
        : [];

      setTeacher(teacher);
    }
  }, [teacherList]);

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
  function convertToAMPM(time24: string) {
    var hour = parseInt(time24.substring(0, 2));
    var minute = time24.substring(3, 5);
    var AMPM = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12; // Handle midnight (00:00) as 12 AM
    return hour + ":" + minute + AMPM;
  }
  const columns: ColumnDef<DataType>[] = [
    {
      accessorKey: "batch_name",
      header: "Batch Name",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <>
            {getRole === "superadmin" ? (
              <div key={data?.batch_id} className="text-left">
                {data?.batch_name}
              </div>
            ) : (
              <Link href={`/Admin/batch/${data.batch_id}`}>
                <div
                  key={data.batch_id}
                  className="text-left cursor-pointer hover:text-blue-600 hover:underline"
                >
                  {data.batch_name}
                </div>
              </Link>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "courses.course_name",
      header: "Course",
    },
    {
      accessorKey: "teachers.first_name",
      header: "Teacher",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <>
            {getRole === "superadmin" ? (
              <div>{`${row.original.teachers.first_name} ${row.original.teachers.last_name}`}</div>
            ) : (
              <Link
                href={`/Admin/teachers/${data.teachers.teacher_id}`}
                className="cursor-pointer hover:text-blue-600 hover:underline"
              >
                <div>{`${row.original.teachers.first_name} ${row.original.teachers.last_name}`}</div>
              </Link>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "day_of_week.start_time",
      header: "Time",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-left flex flex-col items-start ">
            {data?.batch_timings?.map((Batchtime, index) => (
              <Badge
                variant="outline"
                className="text-[#75172F] border-[#75172F] m-1 text-[10px]"
                key={index}
              >
                {Batchtime?.day.slice(0, 3).toUpperCase()}
                <Badge
                  variant="outline"
                  className="text-[#39B16E] border-[#39B16E] m-1 text-[9px] ml-2"
                  key={index}
                >
                  {`${convertToAMPM(Batchtime?.start_time)}-${convertToAMPM(
                    Batchtime?.end_time
                  )}`}
                </Badge>
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "max_strength",
      header: "Capacity",
    },
    {
      accessorKey: "current_strength",
      header: "Strength",
    },

    ...(getRole !== "superadmin"
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: RowData }) => {
              const data = row.original;

              return (
                <div className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <Link href={`/Admin/batch/${data.batch_id}`}>
                        <DropdownMenuItem className="text-yellow-600">
                          <Eye size={"15"} className="text-yellow-600 mr-2" />{" "}
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/Admin/batch/update-batch/${data.batch_id}`}>
                        <DropdownMenuItem className="text-blue-500">
                          <Pencil size={"15"} className="text-blue-500 mr-2" />{" "}
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-red-500 ">
                        <DeleteBatch batchId={data.batch_id} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Toaster />

      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 relative ">
            <Tabs defaultValue="all">
              <div
                className={
                  getRole === "superadmin"
                    ? "flex flex-col-reverse gap-2   pt-3"
                    : "flex flex-col-reverse gap-2   pt-3"
                }
              >
                <div
                  className={
                    getRole === "superadmin"
                      ? "flex justify-start gap-3 items-center"
                      : "flex justify-start gap-3 items-center"
                  }
                >
                  <form
                    className="flex gap-3"
                    onSubmit={handleSubmit(OnFilter)}
                  >
                    <div className="flex gap-2 w-[400px]">
                      <ComboboxDemo
                        frameworks={course}
                        name="Course"
                        setValue={setValue}
                        field="course"
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                      />
                      <ComboboxDemo
                        field="teacher"
                        setValue={setValue}
                        frameworks={teacher}
                        name="Teacher"
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                      />
                    </div>

                    <>
                      <div className={cn("grid gap-2")}>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "w-[250px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                              onClick={() => setOpen(true)}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                              {date?.from ? (
                                date.to ? (
                                  <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(date.from, "LLL dd, y")
                                )
                              ) : (
                                <span className="text-slate-400">
                                  Batch start date from - to
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Select
                              onValueChange={(value) => {
                                setOpen(false);
                                switch (value) {
                                  case "1":
                                    setDate({
                                      from: addDays(new Date(), -30),
                                      to: new Date(),
                                    });
                                    break;
                                  case "3":
                                    setDate({
                                      from: addDays(new Date(), -90),
                                      to: new Date(),
                                    });
                                    break;
                                  case "6":
                                    setDate({
                                      from: addDays(new Date(), -182),
                                      to: new Date(),
                                    });
                                    break;
                                  case "12":
                                    setDate({
                                      from: addDays(new Date(), -365),
                                      to: new Date(),
                                    });
                                    break;

                                  default:
                                    break;
                                }
                              }}
                            >
                              <SelectTrigger className="bg-slate-900 text-white">
                                <SelectValue placeholder="Select a date range" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                <SelectItem value="1">1 month</SelectItem>
                                <SelectItem value="3">3 month</SelectItem>
                                <SelectItem value="6">6 month</SelectItem>
                                <SelectItem value="12">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                            <div className="flex justify-end p-3 gap-2">
                              <Button
                                onClick={() => setOpen(false)}
                                variant={"outline"}
                                className="text-red-500 border-red-500"
                              >
                                close
                              </Button>
                              <Button
                                onClick={() => setOpen(false)}
                                variant={"primary"}
                              >
                                Submit
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>

                    <Button
                      size="sm"
                      type="submit"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#6B7280", color: "white" }}
                      disabled={!isDirty && resetFilter && !isDateChange}
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4" color="#6B7280" />
                      <span style={{ color: "#6B7280" }}>Reset</span>
                    </Button>
                  </form>
                </div>
                <div className="flex justify-end gap-2 items-center">
                  <div className="relative md:grow-0">
                    <Input
                      value={searchKey}
                      onChange={(e) => {
                        setPageNum(1);
                        setSearchKey(e.target.value);
                      }}
                      type="search"
                      placeholder="Batch Name"
                      className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                    />

                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {getRole === "superadmin" ? (
                    <div className="flex items-center ">
                      <Button
                        variant={"primary"}
                        size="sm"
                        className="h-9  "
                        onClick={() => {
                          onDownloadBatchlist.mutate();
                        }}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />

                        <span className="sm:whitespace-nowrap ">Download</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center ">
                        <Link href={"/Admin/batch/Add-batch"}>
                          <Button
                            variant={"primary"}
                            size="sm"
                            className="h-9 gap-1 "
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sm:whitespace-nowrap ">
                              Add Batch
                            </span>
                          </Button>
                        </Link>
                      </div>
                      <Button
                        size="sm"
                        variant={"outline"}
                        className="h-9 gap-1 border-[#39B16E] text-[#39B16E] hover:bg-[#39B16E] hover:text-white"
                        onClick={() => {
                          onDownloadBatchlist.mutate();
                        }}
                      >
                        <span className="sm:whitespace-nowrap ">Download</span>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {!isLoading ? (
                <TabsContent value="all">
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable columns={columns} data={listBatch} />
                      <CardFooter className="flex justify-center mt-2">
                        {data1 !== undefined ? (
                          <PaginationDemo
                            pageCount={data1?.metadata.totalcount}
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                          />
                        ) : (
                          ""
                        )}
                      </CardFooter>
                    </CardContent>
                  </Card>
                </TabsContent>
              ) : (
                <div className="flex items-center justify-center h-[100vh]">
                  <Loader2 className="  animate-spin " />
                </div>
              )}
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
