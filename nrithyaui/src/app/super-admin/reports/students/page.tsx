"use client";
import { studentList } from "@/api/student";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  CalendarIcon,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ComboboxDemo from "../../../table/combox";
import { DataTable } from "../../../table/data-table";

import { BatchlistDropdownActivity } from "@/api/batchActivity";

import { downloadStudent } from "@/api/studentDownloadApi";
import ErrorHandling from "@/app/Components/ErrorHandling";
import Navbar from "@/app/Components/Navbar";
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
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { columns, DataType } from "./column";

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  all: string;
  batch: string;
  dateFrom: string;
  dateTo: string;
};

export type Filter = {
  search: string;
  status: string;
  batch_id: number;
  dateFrom: string;
  dateTo: string;
};

export default function TableList() {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [listStudent, setStudent] = useState<DataType[]>([]);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [deleteStudentId, setStudentDeleteId] = useState<number>();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const isDateChange = Boolean(date?.from || date?.to);
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const formattedFromDate = date?.from ? formatDate(date.from) : "";

  const formattedToDate = date?.to ? formatDate(date.to) : "";

  const [filter, setFilter] = useState<Filter>({
    search: "",
    status: "active",
    batch_id: 0,
    dateFrom: "",
    dateTo: "",
  });
  const form = useForm<FilterType>({
    defaultValues: {
      all: "active",
      batch: "",
      dateFrom: "",
      dateTo: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue, getValues } =
    form;
  const { errors, isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
    setDate({
      from: undefined,
      to: undefined,
    });
  };
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      status: data.all,
      batch_id: Number(data.batch),
      dateFrom: `${date?.from === undefined ? "" : date.from}`,
      dateTo: `${date?.to === undefined ? "" : date.to}`,
    });
  };

  const onDownloadStudent = useMutation({
    mutationFn: async () => {
      return await downloadStudent(
        filter.search,
        filter.status,
        filter.batch_id,
        filter.dateFrom,
        filter.dateTo
      );
    },
    onSuccess: (data) => {
      if (data) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "StudentsReportList.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });

  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown"],
    queryFn: async () => await BatchlistDropdownActivity(),
  });

  useEffect(() => {
    if (batchListDropdown) {
      const batches: FrameworkType[] = batchListDropdown?.map(
        (item, index) => ({
          value: `${item?.batch_id}`,
          label: item?.batch_name.trim(),
        })
      );

      setBatchItems(batches);
    }
  }, [batchListDropdown]);

  const {
    data: liststudentdata,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: [
      "studentlisting",
      filter.search,
      filter.status,
      pageNum,
      filter.batch_id,
      filter.dateFrom,
      filter.dateTo,
    ],
    queryFn: async () =>
      studentList(
        filter.search,
        filter.status,
        pageNum,
        filter.batch_id,
        filter.dateFrom,
        filter.dateTo
      ),
  });

  useEffect(() => {
    if (liststudentdata) {
      setStudent(liststudentdata.data);
    }
  }, [liststudentdata]);

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Navbar name="Students" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col mt-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative ">
            <Tabs defaultValue="all">
              <div className="flex justify-end gap-3 mb-4 mt-3">
                <div className=" relative   md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Student Name"
                    className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                    value={filter.search}
                    onChange={(e) => {
                      setPageNum(1);
                      setFilter({ ...filter, search: e.target.value });
                    }}
                  />
                </div>
                <Button
                  onClick={() => onDownloadStudent.mutate()}
                  size="sm"
                  className="h-9 gap-1 "
                  variant={"primary"}
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  <span className="sm:whitespace-nowrap ">Download</span>
                </Button>
              </div>
              <div className="flex justify-start items-center">
                <div className="flex items-center gap-3">
                  <form
                    onSubmit={handleSubmit(onFilter)}
                    className="flex gap-3"
                  >
                    {getValues("all") ? (
                      <div className="w-[200px]">
                        <select
                          id=""
                          className="w-full shadow text-black font-medium h-10  rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...register("all", {})}
                        >
                          <option value="" hidden className="">
                            Active
                          </option>
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
                            Dismiss
                          </option>
                        </select>
                      </div>
                    ) : (
                      <div className="w-[200px]">
                        <select
                          id=""
                          className="w-full shadow text-slate-400 font-medium h-10  rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...register("all", {})}
                        >
                          <option value="" hidden className="">
                            Active
                          </option>
                          <option value="active" className="text-black p-2">
                            Active
                          </option>
                          <option value="all" className="text-black">
                            All
                          </option>
                          <option value="suspended" className="text-black">
                            Suspended
                          </option>
                        </select>
                      </div>
                    )}
                    <div className="w-[200px]">
                      <ComboboxDemo
                        frameworks={batchitems}
                        name="Batch"
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                        setValue={setValue}
                        field="batch"
                      />
                    </div>

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
                                Student register date from - to
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
                    <Button
                      size="sm"
                      type="submit"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: " #75172F" }}
                      disabled={!isDirty && resetFilter && !isDateChange}
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "lightgray" }}
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4" color="#75172F" />
                      <span style={{ color: "#75172F" }}>Reset</span>
                    </Button>
                  </form>
                </div>
              </div>
              {!isUserListLoading ? (
                <TabsContent value="all">
                  <Card className="p-4 mt-2 min-w-[100%]">
                    <CardContent>
                      <DataTable columns={columns} data={listStudent} />
                      <CardFooter className="flex justify-center mt-2">
                        {liststudentdata !== undefined ? (
                          <PaginationDemo
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                            pageCount={liststudentdata?.metadata.totalcount}
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
                  <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                </div>
              )}
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
