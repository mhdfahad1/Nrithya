"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  ArrowDownToLine,
  CalendarIcon,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DataTable } from "../../../table/data-table";

import { getBankDetails } from "@/api/bankdetails";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
import { downloadFeeCollection } from "@/api/feeDownloadapi";
import { reportFeeDetails } from "@/api/reportFeeCollection";
import ErrorHandling from "@/app/Components/ErrorHandling";
import Navbar from "@/app/Components/Navbar";
import PaginationDemo from "@/app/table/Pagination";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import ComboboxDemo from "../../../table/combox";
import { columns, DataType } from "./columns";

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  batch: string;
  status: string;
  duefrom: string;
  dueto: string;
  paidfrom: string;
  paidto: string;
  bank: string;
};

export type Filter = {
  search: string;
};

const status = [
  {
    value: "true",
    label: "Paid",
  },
  {
    value: "false",
    label: "Unpaid",
  },
];

export default function ListReportFeeCollection() {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const form = useForm<FilterType>({});
  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const { errors, isDirty } = formState;
  const [listfee, setListFee] = useState<DataType[]>([]);
  const [batch, setBatchItems] = useState<FrameworkType[]>([]);
  const [bank, setBankDetails] = useState<FrameworkType[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [showmorefilter, setShowMoreFilter] = useState(false);
  const [filteritems, setFilterItems] = useState<FilterType>({
    batch: "",
    status: "",
    duefrom: "",
    dueto: "",
    paidfrom: "",
    paidto: "",
    bank: "",
  });

  const [filter, setFilter] = useState<Filter>({
    search: "",
  });

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [date2, setDate2] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const isDateChange = Boolean(date?.from || date?.to);

  const isDate2Change = Boolean(date2?.from || date2?.to);

  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const formattedFromDate = date?.from ? formatDate(date.from) : "";

  const formattedToDate = date?.to ? formatDate(date.to) : "";

  function formatDates(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const formattedFrom = date2?.from ? formatDates(date2.from) : "";

  const formattedTo = date2?.to ? formatDates(date2.to) : "";

  const handleReset = () => {
    setResetFilter(true);
    reset();
    setDate({
      from: undefined,
      to: undefined,
    });
    setDate2({
      from: undefined,
      to: undefined,
    });
  };
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilterItems({
      ...filteritems,
      batch: data.batch,
      status: data.status,
      duefrom: formattedFromDate,
      dueto: formattedToDate,
      paidfrom: formattedFrom,
      paidto: formattedTo,
      bank: data.bank,
    });
  };

  const onDownloadFeeCollection = useMutation({
    mutationFn: async () => {
      return await downloadFeeCollection(
        filter.search,
        filteritems.batch,
        filteritems?.status,
        filteritems?.duefrom || "",
        filteritems?.dueto || "",
        filteritems?.paidfrom || "",
        filteritems?.paidto || "",
        filteritems?.bank
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
        a.download = "FeeCollectionReportList.xlsx";
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

  const { data: bankdetails } = useQuery({
    queryKey: ["bankdetails"],
    queryFn: async () => await getBankDetails(),
  });

  useEffect(() => {
    if (bankdetails) {
      const bank: FrameworkType[] = bankdetails?.map((item, index) => ({
        value: `${item?.bank_id}`,
        label: item?.bank_name.trim(),
      }));

      setBankDetails(bank);
    }
  }, [bankdetails]);

  const {
    data: listfeecollectiondata,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: [
      "feecollectionreport",
      filter.search,
      filteritems?.batch,
      filteritems?.status,
      filteritems?.duefrom,
      filteritems?.dueto,
      filteritems?.paidfrom,
      filteritems?.paidto,
      filteritems?.bank,
      pageNum,
    ],
    queryFn: async () =>
      reportFeeDetails(
        filter.search,
        filteritems.batch,
        filteritems?.status,
        filteritems?.duefrom || "",
        filteritems?.dueto || "",
        filteritems?.paidfrom || "",
        filteritems?.paidto || "",
        filteritems?.bank,
        pageNum
      ),
  });
  useEffect(() => {
    if (listfeecollectiondata) {
      setListFee(listfeecollectiondata.data);
    }
  }, [listfeecollectiondata]);

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Navbar name="Fee Collection Report" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="mt-2">
          <main className="min-w-[100%] p-3 pl-[1.5rem]">
            <Tabs defaultValue="all">
              <div className="flex flex-col gap-3 w-full px-5">
                <div className="flex justify-end gap-3 items-center w-full">
                  <div className=" relative   md:grow-0 mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
                    <Input
                      type="search"
                      placeholder="Student Name"
                      className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                      value={filter.search}
                      onChange={(e) => {
                        setPageNum(1);
                        setFilter({ search: e.target.value });
                      }}
                    />
                  </div>
                  <div className=" flex items-center">
                    <Button
                      type="button"
                      onClick={() => onDownloadFeeCollection.mutate()}
                      size="sm"
                      className="h-9 gap-1 "
                      variant={"primary"}
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                      <span className="sm:whitespace-nowrap ">Download</span>
                    </Button>
                  </div>
                </div>
                <form
                  onSubmit={handleSubmit(onFilter)}
                  className="flex items-center gap-2 "
                >
                  <div className="flex items-center justify-start gap-3 ">
                    <div className="w-28">
                      <ComboboxDemo
                        frameworks={batch}
                        name="Batch"
                        setValue={setValue}
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                        field="batch"
                      />
                    </div>
                    <div className="w-28">
                      <ComboboxDemo
                        frameworks={bank}
                        name="Account"
                        setValue={setValue}
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                        field="bank"
                      />
                    </div>

                    <ComboboxDemo
                      frameworks={status}
                      name="Status"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                      field="status"
                    />

                    <div className="">
                      <>
                        <div className={cn("grid gap-2")}>
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
                                    Due date from - to
                                  </span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                      <div className="flex gap-2 mt-1">
                        {showmorefilter ? (
                          <div className={cn("grid gap-2")}>
                            <Popover open={open2} onOpenChange={setOpen2}>
                              <PopoverTrigger asChild>
                                <Button
                                  id="date"
                                  variant={"outline"}
                                  className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date2 && "text-muted-foreground"
                                  )}
                                  onClick={() => setOpen2(true)}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                  {date2?.from ? (
                                    date2.to ? (
                                      <>
                                        {format(date2.from, "LLL dd, y")} -{" "}
                                        {format(date2.to, "LLL dd, y")}
                                      </>
                                    ) : (
                                      format(date2.from, "LLL dd, y")
                                    )
                                  ) : (
                                    <span className="text-slate-400">
                                      Paid date from - to
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
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
                                  defaultMonth={date2?.from}
                                  selected={date2}
                                  onSelect={setDate2}
                                  numberOfMonths={2}
                                />
                                <div className="flex justify-end p-3 gap-2">
                                  <Button
                                    onClick={() => setOpen2(false)}
                                    variant={"outline"}
                                    className="text-red-500 border-red-500"
                                  >
                                    close
                                  </Button>
                                  <Button
                                    onClick={() => setOpen2(false)}
                                    variant={"primary"}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      type="submit"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#6B7280", color: "white" }}
                      disabled={
                        !isDirty &&
                        resetFilter &&
                        !isDateChange &&
                        !isDate2Change
                      }
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#E5E7EB" }}
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4" color="#6B7280" />
                      <span style={{ color: "#6B7280" }}>Reset</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="text-[#75172F]"
                      onClick={() => {
                        showmorefilter
                          ? setShowMoreFilter(false)
                          : setShowMoreFilter(true);
                      }}
                    >
                      {showmorefilter ? "Less Filters" : "More Filters"}
                    </Button>
                  </div>
                </form>
              </div>

              {!isUserListLoading ? (
                <TabsContent value="all">
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable columns={columns} data={listfee} />
                      <CardFooter className="flex justify-center mt-2">
                        {listfeecollectiondata !== undefined ? (
                          <PaginationDemo
                            pageNum={pageNum}
                            setPageNum={setPageNum}
                            pageCount={
                              listfeecollectiondata?.metadata.totalcount
                            }
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
