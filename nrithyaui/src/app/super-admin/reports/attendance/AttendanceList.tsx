"use client";

import {
  getStudentAttendanceRport,
  getTeacherAttendanceRport,
  StudentAttendanceDownload,
  teacherAttendanceDownload,
} from "@/api/attendanceReport";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  CalendarIcon,
  Filter,
  ListFilter,
  Loader2,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import StudentTable from "./components/studentTable";
import TeacherTable from "./components/teacherTable";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

export type FilterType = {
  from: string;
  to: string;
};
type Filter = {
  from: string;
  to: string;
};

export type FrameworkType = {
  value: string;
  label: string;
};

function AttendanceReportList() {
  const [filter, setFilter] = useState<Filter>({
    from: "",
    to: "",
  });
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState(1);
  const form = useForm<FilterType>({
    defaultValues: {
      from: "",
      to: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue } = form;
  const { errors, isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
    setFilter({
      ...filter,
      from: "",
      to: "",
    });
    setDate({ from: undefined, to: undefined });
  };

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const formattedFromDate = date?.from ? formatDate(date.from) : "";

  const formattedToDate = date?.to ? formatDate(date.to) : "";

  useEffect(() => {
    if (formattedFromDate && formattedToDate) {
      setFilter({ ...filter, from: formattedFromDate, to: formattedToDate });
    }
  }, [formattedFromDate, formattedToDate]);

  const [open, setOpen] = useState(false);

  // Usage example
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      from: data.from,
      to: data.to,
    });
  };

  // teacher streak
  const {
    data: TeacherAttendanceListData,
    isLoading: TeacherAttendanceListLoading,
    error: TeacherListError,
  } = useQuery({
    queryKey: ["teacherAttendanceReport", filter.from, filter.to, pageNum],
    queryFn: async () =>
      await getTeacherAttendanceRport(filter.from, filter.to, pageNum),
    // enabled: !!{ startDate, endDate },
  });

  // student
  const {
    data: StudentAttendanceListData,
    isLoading: StudentAttendanceListLoading,
    error: StudentListError,
  } = useQuery({
    queryKey: ["StudentAttendanceReport", filter.from, filter.to, pageNum],
    queryFn: async () =>
      await getStudentAttendanceRport(filter.from, filter.to, pageNum),
    // enabled: !!{ startDate, endDate },
  });

  const onstudentAttendanceDownload = useMutation({
    mutationFn: async () => {
      return await StudentAttendanceDownload(filter.from, filter.to);
    },
    onSuccess: (data) => {
      if (data) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "StudentAttendanceReport.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });
  // useEffect(() => {
  //   const { startDate, endDate } = getCurrentMonthDates();
  // }, []);
  const onteacherAttendanceDownload = useMutation({
    mutationFn: async () => {
      return await teacherAttendanceDownload(filter.from, filter.to);
    },
    onSuccess: (data) => {
      if (data) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "TeacherAttendanceReport.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });

  if (TeacherListError) {
    return (
      <div>
        <ErrorHandling error={TeacherListError} />
      </div>
    );
  }
  if (StudentListError) {
    return (
      <div>
        <ErrorHandling error={StudentListError} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-h-screen w-full flex-col bg-muted/40        ">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative ">
            <Tabs defaultValue="student">
              <div className="flex justify-between items-center gap-3 mt-3">
                <div>
                  <form
                    className="flex items-center gap-4"
                    onSubmit={handleSubmit(onFilter)}
                  >
                    <TabsList className="border-2">
                      <TabsTrigger value="student" className="bg-slate-200">
                        Student
                      </TabsTrigger>
                      <TabsTrigger value="teacher" className="bg-slate-200">
                        Teacher
                      </TabsTrigger>
                    </TabsList>

                    <div className={cn(" gap-2 flex items-center")}>
                      <Label>Date:</Label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-[300px] justify-start text-left font-normal",
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
                                Pick a date range
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
                            <SelectTrigger className="bg-slate-500 text-white">
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

                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#E5E7EB" }}
                      onClick={handleReset}
                      type="reset"
                    >
                      <RotateCcw className="h-4 w-4" color="#6B7280" />
                      <span style={{ color: "#6B7280" }}>Reset</span>
                    </Button>
                  </form>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div>
                    <TabsContent value="student">
                      <Button
                        onClick={() => onstudentAttendanceDownload.mutate()}
                        size="sm"
                        className="h-9 mb-2"
                        variant={"primary"}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        <span className="sm:whitespace-nowrap ml-1">
                          Download
                        </span>
                      </Button>
                    </TabsContent>
                    <TabsContent value="teacher">
                      <Button
                        onClick={() => onteacherAttendanceDownload.mutate()}
                        size="sm"
                        className="h-9 mb-2"
                        variant={"primary"}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        <span className="sm:whitespace-nowrap ">Download</span>
                      </Button>
                    </TabsContent>
                  </div>
                </div>
              </div>
              <TabsContent value="student">
                {StudentAttendanceListLoading ? (
                  <div className="flex justify-center mt-5 h-[100vh]">
                    <Loader2 className="  animate-spin " />
                  </div>
                ) : (
                  StudentAttendanceListData && (
                    <StudentTable
                      StudentAttendanceListData={StudentAttendanceListData}
                      from={filter.from}
                      to={filter.to}
                      pageNum={pageNum}
                      setPageNum={setPageNum}
                    />
                  )
                )}
              </TabsContent>
              <TabsContent value="teacher">
                {TeacherAttendanceListLoading ? (
                  <div className="flex justify-center mt-5 h-[100vh]">
                    <Loader2 className="  animate-spin " />
                  </div>
                ) : (
                  TeacherAttendanceListData && (
                    <TeacherTable
                      TeacherAttendanceListData={TeacherAttendanceListData}
                      from={filter.from}
                      to={filter.to}
                      pageNum={pageNum}
                      setPageNum={setPageNum}
                    />
                  )
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReportList;
