"use client";
import { getBatchCompensation } from "@/api/batchCompensation";
import { getStudentCompensation } from "@/api/studentCompensation";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  Download,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import Deletestudent from "./student/deleteStudent";
import { Label } from "@/components/ui/label";
import DeleteBatchCompenstion from "./batch/deleteCompensationBatch";

export type FrameworkType = {
  value: string;
  label: string;
};

type FilterType = {
  search: string;
};

type DataTypeStudent = {
  id: number;
  old_date: string;
  new_date: string;
  own_batches: {
    batch_name: string;
  };
  new_batches: {
    batch_name: string;
  };
  student: {
    reg_no: string;
    first_name: string;
    last_name: string;
    student_id: number;
  };
};

export type DataTypeBatch = {
  id: number;
  batches: {
    batch_name: string;
    batch_id: number;
  };
  old_date: string;
  start_time: string;
  new_date: string;
  end_time: string;
};

export const columnsStudent: ColumnDef<DataTypeStudent>[] = [
  {
    accessorKey: `student.reg_no`,
    header: "Reg No",
  },
  {
    accessorKey: `student.first_name`,
    header: " Student",
    cell: ({ row }) => {
      return `${row.original.student.first_name} ${row.original.student.last_name}`;
    },
  },
  {
    accessorKey: "old_date",
    header: "Original Class",
    cell: ({ row }) => {
      const date = new Date(row.original.old_date);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },

  {
    accessorKey: "new_date",
    header: "Revised Class",
    cell: ({ row }) => {
      const date = new Date(row.original.new_date);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },

  {
    accessorKey: "own_batches.batch_name",
    header: "Current Batch",
  },
  {
    accessorKey: "new_batches.batch_name",
    header: "New Batch",
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
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
              <Link
                href={`/Admin/compensation/student/UpdateStudent/${data.id}`}
              >
                <DropdownMenuItem className="text-blue-500">
                  <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-red-500">
                <Deletestudent studentId={data.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

function convertToAMPM(time24: string) {
  var hour = parseInt(time24?.substring(0, 2));
  var minute = time24?.substring(3, 5);
  var AMPM = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12; // Handle midnight (00:00) as 12 AM
  return hour + ":" + minute + AMPM;
}
// Example usage
var time24 = "11:00:00";
var timeAMPM = convertToAMPM(time24);

export const columnsBatch: ColumnDef<DataTypeBatch>[] = [
  {
    accessorKey: "batches.batch_name",
    header: "Batch",
  },
  {
    accessorKey: "old_date",
    header: "Original Date",
    cell: ({ row }) => {
      const date = new Date(row.original.old_date);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },

  {
    accessorKey: "new_date",
    header: "Revised Date",
    cell: ({ row }) => {
      const date = new Date(row.original.new_date);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "end_time",
    header: "Revised Time",
    cell: ({ row }) => {
      return `${convertToAMPM(row.original.start_time)} - ${convertToAMPM(
        row.original.end_time
      )}`;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
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
              {/* <Link href={`/Admin/batch/${data.batch_id}`}>
                <DropdownMenuItem className="text-yellow-600">
                  <Eye size={"15"} className="text-yellow-600 mr-2" /> View
                </DropdownMenuItem>
              </Link> */}
              <Link href={`/Admin/compensation/batch/update-batch/${data.id}`}>
                <DropdownMenuItem className="text-blue-500">
                  <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-red-500 ">
                <DeleteBatchCompenstion compensation_id={data.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

type props = {
  dateParam: string;
};

const Compensation = ({ dateParam }: props) => {
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

  const [open, setOpen] = useState(false);
  const [viewtype, setViewType] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [listBatch, setBatch] = useState<DataTypeBatch[]>([]);
  const [listStudent, setStudent] = useState<DataTypeStudent[]>([]);
  const [filter, setFilter] = useState<FilterType>({
    search: "",
  });
  const handleReset = () => {
    setDate({ from: undefined, to: undefined });
  };

  //batch compensation
  const {
    data: listbatchdata,
    isLoading: isBatchLoading,
    error: batcherror,
  } = useQuery({
    queryKey: [
      "batch",
      filter.search,
      pageNum,
      formattedFromDate,
      formattedToDate,
    ],
    queryFn: async () =>
      getBatchCompensation(
        filter.search || "",
        pageNum,
        formattedFromDate,
        formattedToDate
      ),
  });

  useEffect(() => {
    if (listbatchdata) {
      setBatch(listbatchdata.data);
    }
  }, [listbatchdata]);

  const {
    data: liststudentdata,
    isLoading: isStudentLoading,
    error: studenterror,
  } = useQuery({
    queryKey: [
      "student",
      filter.search,
      pageNum,
      formattedFromDate,
      formattedToDate,
    ],
    queryFn: async () =>
      getStudentCompensation(
        filter.search || "",
        pageNum,
        formattedFromDate,
        formattedToDate
      ),
  });

  useEffect(() => {
    if (liststudentdata) {
      setStudent(liststudentdata.data);
    }
  }, [liststudentdata]);

  useEffect(() => {
    if (dateParam && dateParam === "student") {
      setViewType(true);
    } else {
      setViewType(false);
    }
  }, [dateParam]);

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

  return (
    <div>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* <Navbar name="Compensation Batch" /> */}
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <Toaster />
          <main className="grid flex-1 items-start gap-4 p-4  sm:px-6 sm:py-0 md:gap-8 relative">
            <Tabs value={viewtype ? "student" : "batch"}>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 mt-1">
                  <TabsList className="border-2">
                    <TabsTrigger
                      className="bg-slate-200"
                      onClick={() => setViewType(false)}
                      value="batch"
                    >
                      Batch
                    </TabsTrigger>

                    <TabsTrigger
                      onClick={() => setViewType(true)}
                      value="student"
                      className="bg-slate-200"
                    >
                      Student
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
                            <span className="text-slate-400">Revised date</span>
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
                </div>

                <div className="  relative flex justify-center items-center gap-2 ">
                  <TabsContent value="student">
                    <Search className="absolute left-2.5 top-2.5 mt-1 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Student Name"
                      value={filter.search}
                      onChange={(e) => {
                        setPageNum(1);
                        setFilter({ search: e.target.value });
                      }}
                      className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                    />
                  </TabsContent>
                  <TabsContent value="batch">
                    <Search className="absolute left-2.5 top-2.5 mt-1 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Batch Name"
                      value={filter.search}
                      onChange={(e) => {
                        setPageNum(1);
                        setFilter({ search: e.target.value });
                      }}
                      className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                    />
                  </TabsContent>

                  <TabsContent value="batch">
                    <div className="flex gap-2">
                      <Link href={"/Admin/compensation/batch/AddBatch"}>
                        <Button
                          size="sm"
                          className="h-9 gap-1"
                          variant={"primary"}
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sm:whitespace-nowrap ">
                            Add Batch
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                  <TabsContent value="student">
                    <div className="flex gap-2">
                      <Link
                        href={
                          "/Admin/compensation/student/AddCompensationStudent"
                        }
                      >
                        <Button
                          size="sm"
                          className="h-9 gap-1"
                          variant={"primary"}
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sm:whitespace-nowrap ">
                            Add Student
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </div>
              </div>

              <TabsContent value="batch">
                {isBatchLoading ? (
                  <div className="flex justify-center  mt-60">
                    <Loader2 className="  animate-spin " />
                  </div>
                ) : (
                  <Card className="p-4 mt-4 min-w-[100%] ">
                    <CardContent>
                      <DataTable columns={columnsBatch} data={listBatch} />
                      <CardFooter className="flex justify-center mt-2">
                        {listbatchdata !== undefined &&
                        listbatchdata !== null ? (
                          <PaginationDemo
                            pageCount={listbatchdata?.metadata.totalcount}
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                          />
                        ) : null}
                      </CardFooter>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="student">
                {isStudentLoading ? (
                  <div className="flex justify-center mt-60">
                    <Loader2 className="  animate-spin " />
                  </div>
                ) : (
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable columns={columnsStudent} data={listStudent} />
                      <CardFooter className="flex justify-center mt-2">
                        {liststudentdata !== undefined ? (
                          <PaginationDemo
                            pageCount={liststudentdata?.metadata.totalcount}
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
};
export default Compensation;
