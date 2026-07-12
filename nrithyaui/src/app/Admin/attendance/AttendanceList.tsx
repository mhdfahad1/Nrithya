"use client";

import {
  GetBatchCombobox,
  getStudentAttendance,
  getTeacherAttendance,
} from "@/api/attendance";
import ErrorHandling from "@/app/Components/ErrorHandling";
import ComboboxDemo from "@/app/table/combox";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BatchCombobox,
  GetStudentAttendanceType,
  GetTeacherAttendanceType,
} from "@/Interfaces/attendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarIcon,
  Check,
  Download,
  Filter,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { StudentAttendanceDownload, teacherAttendanceDownload } from "@/api/attendanceReport";

export type FilterType = {
  from: string;
  to: string;
  percentage: string;
  batch: string;
  status: string;
};
type Filter = {
  from: string;
  to: string;
  batch_id: string;
  name: string;
  status: string;
};

export const columnsTeacher: ColumnDef<GetTeacherAttendanceType>[] = [
  {
    accessorKey: "teachers",
    header: "Teacher Name",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="p-1">
          {data.teachers.first_name} {data.teachers.last_name}
        </div>
      );
    },
  },
  {
    accessorKey: "alternative_number",
    header: "Phone Number",
    cell: ({ row }) => {
      const data = row.original;
      return <div>{data.teachers.alternative_number}</div>;
    },
  },
  {
    accessorKey: "batch_name",
    header: "Batch",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div>
          {data.status === "expired" ? (
            <div className="text-red-500">{data.batch_name}</div>
          ) : (
            <div>{data.batch_name}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "total_class",
    header: "Total Class",
  },
  {
    accessorKey: "attended",
    header: "Attended Class",
  },
  {
    accessorKey: "percentage",
    header: "Percentage%",
  },
  {
    id: "last5",
    header: "Last 5",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex gap-1">
          {data.attendance.map((item, index) => {
            if (item.attended) {
              return (
                <div key={index}>
                  <Check className="h-4 w-4 bg-green-500 p-1 rounded-2xl text-white" />
                </div>
              );
            } else if (item.attended === false) {
              return (
                <div key={index}>
                  <X className="h-4 w-4 bg-red-500 p-1 rounded-2xl text-white" />
                </div>
              );
            }
          })}
        </div>
      );
    },
  },
];
export const columnsStudent: ColumnDef<GetStudentAttendanceType>[] = [
  {
    accessorKey: "teachers",
    header: "Student Name",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="p-1">
          {data.students.first_name} {data.students.last_name}
        </div>
      );
    },
  },
  {
    accessorKey: "whatsapp_number",
    header: "Contact Number",
    cell: ({ row }) => {
      const data = row.original;
      return <div>{data.students.whatsapp_number}</div>;
    },
  },
  {
    accessorKey: "batches",
    header: "Batch",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div>
          {data.batches.status === "expired" ? (
            <div className="text-red-500">{data.batches.batch_name}</div>
          ) : (
            <div>{data.batches.batch_name}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "total_class",
    header: "Total Class",
  },
  {
    accessorKey: "attended",
    header: "Attended Class",
  },
  {
    accessorKey: "percentage",
    header: "Percentage%",
  },
  {
    id: "last5",
    header: "Last 5",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex gap-1">
          {data.attendance.map((item, index) => {
            if (item.attended) {
              return (
                <div key={index}>
                  <Check className="h-4 w-4 bg-green-500 p-1 rounded-2xl text-white" />
                </div>
              );
            } else if (item.attended === false) {
              return (
                <div key={index}>
                  <X className="h-4 w-4 bg-red-500 p-1 rounded-2xl text-white" />
                </div>
              );
            }
          })}
        </div>
      );
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};

function AttendanceList() {
  const [filter, setFilter] = useState<Filter>({
    from: "",
    to: "",
    batch_id: "",
    name: "",
    status: "active",
  });
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState(1);
  const form = useForm<FilterType>({
    defaultValues: {
      from: "",
      to: "",
      percentage: "",
      batch: "",
      status: "active",
    },
  });
  const { register, handleSubmit, reset, formState, setValue, watch } = form;
  const { errors, isDirty } = formState;
  
  // Watch the status field for changes
  const statusValue = watch("status");
  
  useEffect(() => {
    // Set initial status in the form
    setValue("status", "active");
  }, [setValue]);

  const handleReset = () => {
    setResetFilter(true);
    reset({
      from: "",
      to: "",
      percentage: "",
      batch: "",
      status: "active",
    });

    setFilter({ 
      ...filter, 
      from: "", 
      to: "", 
      batch_id: "", 
      name: "",
      status: "active" 
    });

    setDate({
      from: undefined,
      to: undefined,
    });
    
    // Reset to page 1
    setPageNum(1);
  };
  
  const onFilter = (data: FilterType) => {
    console.log("data", data);
    
    setFilter({
      ...filter,
      from: `${date?.from === undefined ? "" : date.from}`,
      to: `${date?.to === undefined ? "" : date.to}`,
      batch_id: data.batch,
      status: data.status
    });
    setPageNum(1);
  };
  
  // Handle status change separately to trigger API calls
  const handleStatusChange = (status: string) => {
    setValue("status", status);
    setFilter({
      ...filter,
      status: status
    });
    setPageNum(1);
  };
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const isDateChange = Boolean(date?.from || date?.to);

  // batch combobox
  const { data: BatchComboboxData } = useQuery<BatchCombobox[]>({
    queryKey: ["batch"],
    queryFn: async () => await GetBatchCombobox(),
  });
  const [getBatchData, setGetBatchData] = useState<BatchCombobox[]>([]);
  useEffect(() => {
    if (BatchComboboxData) {
      setGetBatchData(BatchComboboxData);
    }
  }, [BatchComboboxData]);
  const batch: FrameworkType[] = getBatchData.map((item) => ({
    value: `${item.batch_id}`,
    label: item.batch_name.trim(),
  }));

  // teacher streak
  const {
    data: TeacherAttendanceListData,
    isLoading: TeacherAttendanceListLoading,
    error: TeacherListError,
  } = useQuery({
    queryKey: [
      "teacherAttendance",
      filter.from,
      filter.to,
      filter.name,
      filter.batch_id,
      pageNum,
    ],
    queryFn: async () =>
      await getTeacherAttendance(
        filter.from,
        filter.to,
        filter.name,
        filter.batch_id,
        pageNum
      ),
  });
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

  const [getTeacherData, setGetTeacherData] = useState<
    GetTeacherAttendanceType[]
  >([]);
  useEffect(() => {
    if (TeacherAttendanceListData) {
      setGetTeacherData(TeacherAttendanceListData.data);
    }
  }, [TeacherAttendanceListData]);

  // student
  const queryClient = useQueryClient();
  const {
    data: StudentAttendanceListData,
    isLoading: StudentAttendanceListLoading,
    error: StudentListError,
  } = useQuery({
    queryKey: [
      "StudentAttendance",
      filter.from,
      filter.to,
      filter.name,
      filter.batch_id,
      filter.status, // Include status in the dependency array to trigger API calls
      pageNum,
    ],
    queryFn: async () =>
      await getStudentAttendance(
        filter.from,
        filter.to,
        filter.name,
        filter.batch_id,
        pageNum,
        filter.status
      ),
  });

  const [getStudentData, setGetStudentData] = useState<
    GetStudentAttendanceType[]
  >([]);
  useEffect(() => {
    if (StudentAttendanceListData) {
      setGetStudentData(StudentAttendanceListData.data);
    }
  }, [StudentAttendanceListData]);
  
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

  // Check if there are actual changes to enable the filter button
  const hasFilterChanges = () => {
    if (!resetFilter) return true;
    if (isDateChange) return true;
    if (filter.batch_id) return true;
    if (filter.name) return true;
    if (statusValue && statusValue !== "active") return true;
    return isDirty;
  };

  return (
    <div>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <main className="grid flex-1 items-start gap-4 p-4 relative">
            <Tabs defaultValue="student">
              <div className="flex justify-between items-center">
                <TabsList className="border-2">
                  <TabsTrigger value="student" className="bg-slate-200">
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="bg-slate-200">
                    Teacher
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center justify-center gap-3">
                  <TabsContent value="student" className="flex gap-2 items-center">
                    <div className="relative md:grow-0">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={filter.name}
                        onChange={(e) => {
                          setFilter({
                            ...filter,
                            name: e.target.value,
                          });
                          setPageNum(1);
                        }}
                        type="search"
                        placeholder="Student name"
                        className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[220px]"
                      />
                    </div>
                    <Button
                      variant={"primary"}
                      size="sm"
                      className="h-9 gap-1"
                      onClick={() => {
                        onstudentAttendanceDownload.mutate();
                      }}
                    >
                      <span className="sm:whitespace-nowrap">Download</span>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TabsContent>
                  <TabsContent value="teacher" className="flex gap-2 items-center">
                    <div className="relative md:grow-0">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={filter.name}
                        onChange={(e) => {
                          setFilter({
                            ...filter,
                            name: e.target.value,
                          });
                          setPageNum(1);
                        }}
                        type="search"
                        placeholder="Teacher name"
                        className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[220px]"
                      />
                    </div>
                    <Button
                      variant={"primary"}
                      size="sm"
                      className="h-9 gap-1"
                      onClick={() => {
                        onteacherAttendanceDownload.mutate();
                      }}
                    >
                      <span className="sm:whitespace-nowrap">Download</span>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TabsContent>
                </div>
              </div>
              
              <div>
                <form
                  className="flex items-center gap-3 mt-2"
                  onSubmit={handleSubmit(onFilter)}
                >
                  <div className={cn("grid gap-2")}>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[260px] justify-start text-left font-normal",
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
                              Pick a Date range
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
                                  from: addDays(new Date(), -60),
                                  to: new Date(),
                                });
                                break;
                              case "6":
                                setDate({
                                  from: addDays(new Date(), -90),
                                  to: new Date(),
                                });
                                break;
                              case "12":
                                setDate({
                                  from: addDays(new Date(), -182),
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
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">2 Month</SelectItem>
                            <SelectItem value="6">3 Month</SelectItem>
                            <SelectItem value="12">6 Month</SelectItem>
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

                  <div className="w-[100px]">
                    <select
                      id="status"
                      className="w-full shadow text-black font-medium h-10 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={statusValue || "active"}
                      onChange={(e) => handleStatusChange(e.target.value)} // Use direct handler for status changes
                    >
                      <option value="active" className="text-black">
                        Active
                      </option>
                      <option value="all" className="text-black">
                        All
                      </option>
                      <option value="suspended" className="text-black">
                        Suspended
                      </option>
                      <option value="dismissed" className="text-black">
                      Dismissed
                      </option>
                    </select>
                  </div>

                  <div className="w-[200px]">
                    <ComboboxDemo
                      frameworks={batch}
                      name="Batch"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                      field="batch"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 gap-1"
                    style={{ backgroundColor: "#6B7280", color: "white" }}
                    disabled={!hasFilterChanges()}
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-1"
                    style={{ backgroundColor: "#E5E7EB" }}
                    onClick={handleReset}
                    type="reset"
                  >
                    <RotateCcw className="h-4 w-4" color="#6B7280" />
                    <span style={{ color: "#6B7280" }}>Reset</span>
                  </Button>
                </form>
              </div>
              
              <TabsContent value="student">
                {StudentAttendanceListLoading ? (
                  <div className="flex justify-center mt-60">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable
                        columns={columnsStudent}
                        data={getStudentData}
                      />
                      <CardFooter className="flex justify-center mt-2">
                        {StudentAttendanceListData !== undefined &&
                        StudentAttendanceListData !== null ? (
                          <PaginationDemo
                            pageCount={
                              StudentAttendanceListData?.metadata.totalcount
                            }
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                          />
                        ) : null}
                      </CardFooter>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="teacher">
                {TeacherAttendanceListLoading ? (
                  <div className="flex justify-center mt-60">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable
                        columns={columnsTeacher}
                        data={getTeacherData}
                      />
                      <CardFooter className="flex justify-center mt-2">
                        {TeacherAttendanceListData !== undefined ? (
                          <PaginationDemo
                            pageCount={
                              TeacherAttendanceListData?.metadata.totalcount
                            }
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                          />
                        ) : null}
                      </CardFooter>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;