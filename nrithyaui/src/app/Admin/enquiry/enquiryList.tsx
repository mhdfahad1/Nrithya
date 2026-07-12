"use client";

import { ColumnDef } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  CalendarIcon,
  Check,
  Download,
  ListFilter,
  Loader2,
  PlusCircle,
  RotateCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import ComboboxDemo from "@/app/table/combox";
import { DataTable } from "@/app/table/data-table";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import EnquiryAction from "./EnquiryAction";
import { EnquiryTypeCombobox, getEnquiryPayload } from "@/Interfaces/Enquiry";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadEnquiryList,
  getComboboxEnquiryType,
  getEnquiry,
} from "@/api/enquiryManagement";
import PaginationDemo from "@/app/table/Pagination";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getCourseComboBox, getTeacherComboBox } from "@/api/assignment";
import { Datum } from "@/Interfaces/Teacher";
import { cn } from "@/lib/utils";
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
import { CourseType } from "@/Interfaces/course";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getUsersCombobox } from "@/api/adminManagement";
import { Toaster } from "@/components/ui/toaster";
interface RowData {
  original: getEnquiryPayload;
}
type UserDetailsPayload = {
  user_id: number;
  user_name: string;
};
const demo = [
  {
    value: "true",
    label: "Requested",
  },
  {
    value: "false",
    label: "Not Requested",
  },
];
const status = [
  {
    value: "new",
    label: "New",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "lost",
    label: "Lost",
  },
];
const followUp = [
  {
    value: "1",
    label: "First Call",
  },
  {
    value: "2",
    label: "Second Call",
  },
  {
    value: "3",
    label: "Third Call",
  },
];

export type FrameworkType = {
  value: string;
  label: string;
  key?: number;
};
export type FilterType = {
  enquiryType: string;
  demo: string;
  status: string;
  from: string;
  to: string;
  course: string;
  assignee: string;
  last_call: string;
  enquiry_date: string;
  follow_up: string;
};
type EnquiryListProps = {
  getRole?: string;
};
export default function EnquiryList({ getRole }: EnquiryListProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState({
    Search: "",
    enquiryId: "",
    enquiryStatus: "",
    demoRequested: "",
    from: "",
    to: "",
    course: "",
    assignee: "",
    last_call: "",
    enquiry_date: "",
    follow_up: "",
  });
  const form = useForm<FilterType>({
    defaultValues: {},
  });
  const { handleSubmit, reset, formState, setValue, register, control } = form;
  const { errors, isDirty, isValid } = formState;
  const isDateChanged = Boolean(date?.from || date?.to);
  const handleReset = () => {
    setResetFilter(true);
    reset();
    setDate({
      from: undefined,
      to: undefined,
    });
  };
  // course combobox
  const { data: courseListData } = useQuery<CourseType[]>({
    queryKey: ["course"],
    queryFn: async () => await getCourseComboBox(),
  });
  const [getCourseData, setGetCourseData] = useState<CourseType[]>([]);
  useEffect(() => {
    if (courseListData) {
      setGetCourseData(courseListData);
    }
  }, [courseListData]);
  const course: FrameworkType[] = getCourseData.map((item) => ({
    value: `${item.course_id}`,
    label: item.course_name.trim(),
  }));

  const courseId = useWatch({ control, name: "course" });
  const router = useRouter();
  // Assignee for combobox
  const { data: userListData } = useQuery({
    queryKey: ["assignee"],
    queryFn: async () => await getUsersCombobox(),
  });
  const [getUserData, setGetUserData] = useState<UserDetailsPayload[]>([]);

  useEffect(() => {
    if (userListData) {
      setGetUserData(userListData?.data);
    }
  }, [userListData]);

  const assignee: FrameworkType[] = getUserData?.map((item) => ({
    value: `${item?.user_id}`,
    label: `${item?.user_name?.trim()}`,
  }));

  // enquiry listing
  const { data: enquiryData, isLoading } = useQuery({
    queryKey: [
      "enquiries",
      pageNum,
      filter?.Search,
      filter?.enquiryId,
      filter?.enquiryStatus,
      filter?.demoRequested,
      filter?.from,
      filter?.to,
      filter?.course,
      filter?.assignee,
      filter?.last_call,
      filter?.enquiry_date,
      filter?.follow_up,
    ],
    queryFn: async () =>
      getEnquiry(
        pageNum,
        filter?.Search || "",
        filter?.enquiryId || "",
        filter?.enquiryStatus || "",
        filter?.demoRequested || "",
        filter?.from || "",
        filter?.to || "",
        filter?.course || "",
        filter?.assignee || "",
        filter?.last_call || "",
        filter?.enquiry_date || "",
        filter?.follow_up || ""
      ),
  });

  // Enquiry Type for combobox
  const { data: enquiryTypeDatas, error } = useQuery({
    queryKey: ["enquiryTypes"],
    queryFn: async () => getComboboxEnquiryType(),
  });

  const [getEnquiryTypeData, setGetEnquiryTypeData] = useState<
    EnquiryTypeCombobox[]
  >([]);

  useEffect(() => {
    if (enquiryTypeDatas !== undefined) {
      setGetEnquiryTypeData(enquiryTypeDatas);
    }
  }, [enquiryTypeDatas]);
  const enquiryType: FrameworkType[] = getEnquiryTypeData?.map((item) => ({
    value: `${item?.enq_type_id}`,
    label: item?.enq_type,
  }));

  // download enquirylist
  const onDownloadEnquiryList = useMutation({
    mutationFn: async () => {
      return await downloadEnquiryList(
        filter.Search || "",
        filter.enquiryId || "",
        filter.enquiryStatus || "",
        filter.demoRequested || "",
        filter.from || "",
        filter.to || "",
        filter.course || "",
        filter.assignee || "",
        filter.enquiry_date || "",
        filter.follow_up || "",
        filter.last_call || ""
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
        a.download = "enquirylist.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {
      throw error;
    },
  });

  const onFilter = (filterData: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      enquiryId: filterData.enquiryType,
      demoRequested: filterData.demo,
      enquiryStatus: filterData.status,
      from: `${date?.from === undefined ? "" : date?.from}`,
      to: `${date?.to === undefined ? "" : date?.to}`,
      course: filterData?.course,
      assignee: filterData.assignee,
      enquiry_date: filterData.enquiry_date,
      follow_up: filterData.follow_up,
      last_call: filterData.last_call,
    });
  };
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  const columns: ColumnDef<getEnquiryPayload>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => {
        return <div>{(pageNum - 1) * 100 + (row.index + 1)}</div>;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "contact_number",
      header: "Contact Number",
    },
    {
      accessorKey: "enquiryType",
      header: "Enquiry Type",
      cell: ({ row }) => {
        const data = row.original;
        return <div>{data?.enquiryType?.enq_type}</div>;
      },
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <>
            <div>{data?.assignee?.user_name}</div>
          </>
        );
      },
    },
    {
      accessorKey: "courses",
      header: "Course",
      cell: ({ row }) => {
        const data = row?.original;
        return <div>{data?.courses?.course_name}</div>;
      },
    },
    {
      accessorKey: "demo_requested",
      header: "Demo",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <div>
            {data?.demo_requested ? (
              <div className="text-green-500 flex justify-center">
                Requested
              </div>
            ) : (
              <div className="text-red-500 flex justify-center">---</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "enq_date",
      header: "Enquiry Date",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <div>
            {new Date(data?.enq_date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </div>
        );
      },
    },

    {
      accessorKey: "last_call",
      header: "Last Call Date",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <div>
            {new Date(data?.last_call).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "follow_up",
      header: "Next Call Date",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <>
            {data?.third_follow_up ? (
              <div>Completed</div>
            ) : (
              <div>
                {new Date(data?.follow_up).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "followUp",
      header: "Follow Up",
      cell: ({ row }) => {
        const data = row?.original;
        const call =
          data?.first_follow_up &&
          data?.second_follow_up === false &&
          data?.third_follow_up === false
            ? 1
            : data?.first_follow_up &&
              data?.second_follow_up &&
              data?.third_follow_up === false
            ? 2
            : data?.first_follow_up &&
              data?.second_follow_up &&
              data?.third_follow_up &&
              3;
        return (
          <div className="text-green-500 font-bold text-lg text-center">
            {call}
          </div>
        );

        {
          /* {data?.first_follow_up ? (
              // <Checkbox
              //   checked={data?.first_follow_up}
              //   className="pointer-events-none border-none"
              // />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex gap-3 cursor-default">
                    <Check color="#39B16E" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>First Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              ""
            )}
            {data?.second_follow_up ? (
              // <Checkbox
              //   checked={data?.second_follow_up}
              //   className="pointer-events-none border-none"
              // />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex gap-3 cursor-default">
                    <Check color="#39B16E" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Second Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              ""
            )}
            {data?.third_follow_up ? (
              // <Checkbox
              //   checked={data?.third_follow_up}
              //   className="pointer-events-none border-none"
              // />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex gap-3 cursor-default">
                    <Check color="#39B16E" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Third Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              ""
            )} */
        }
      },
    },
    {
      accessorKey: "enq_status",
      header: "Status",
      cell: ({ row }) => {
        const data = row?.original;
        return (
          <div>
            {data?.enq_status === "won" ? (
              <div>Won</div>
            ) : data?.enq_status === "lost" ? (
              <div>Lost</div>
            ) : data?.enq_status === "new" ? (
              <div> New</div>
            ) : data?.enq_status === "pending" ? (
              <div> Pending</div>
            ) : (
              <div> </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    ...(getRole !== "superadmin"
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: RowData }) => {
              const data = row.original;
              return <EnquiryAction data={data} />;
            },
          },
        ]
      : []),
  ];
  return (
    <div className="flex min-h-screen  flex-col bg-muted/40  py-[0.9rem] pl-[0.6rem] w-full  ">
      <Toaster />
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1  gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative">
          <div
            className={
              getRole === "superadmin"
                ? "flex flex-col-reverse  gap-3  w-full"
                : "flex flex-col-reverse  gap-3  w-full"
              // : "flex  items-center gap-3 justify-between  w-[100%]"
            }
          >
            <form
              className="flex flex-wrap items-center gap-3"
              onSubmit={handleSubmit(onFilter)}
            >
              {/* First priority filters */}
              <div className="col-span-2 p-2 pr-0 flex justify-self-end gap-2">
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
                            Next call date from - to
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
                                from: addDays(new Date(), -7),
                                to: new Date(),
                              });
                              break;
                            case "3":
                              setDate({
                                from: addDays(new Date(), -14),
                                to: new Date(),
                              });
                              break;
                            case "6":
                              setDate({
                                from: addDays(new Date(), -30),
                                to: new Date(),
                              });
                              break;
                            case "12":
                              setDate({
                                from: addDays(new Date(), -60),
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
                          <SelectItem value="1">1 Week</SelectItem>
                          <SelectItem value="3">2 Week</SelectItem>
                          <SelectItem value="6">1 Month</SelectItem>
                          <SelectItem value="12">2 Month</SelectItem>
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
              </div>
              <div className="w-[170px]">
                <ComboboxDemo
                  frameworks={course}
                  name={`Course`}
                  field={`course`}
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  setValue={setValue}
                />
              </div>
              <div className="w-[170px]">
                <ComboboxDemo
                  frameworks={assignee}
                  name="Assignee"
                  setValue={setValue}
                  field="assignee"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
              </div>
              <div className="w-[170px]">
                <ComboboxDemo
                  frameworks={demo}
                  name="Demo"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  setValue={setValue}
                  field="demo"
                />
              </div>
              <div className="w-[140px]">
                <ComboboxDemo
                  frameworks={status}
                  name="Status"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  setValue={setValue}
                  field="status"
                />
              </div>

              {/* Second priority filters */}
              {showMoreFilters && (
                <>
                  <div className="w-[160px]">
                    <ComboboxDemo
                      frameworks={followUp}
                      name="Follow Up"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                      field="follow_up"
                    />
                  </div>
                  <div className="w-[170px]">
                    <ComboboxDemo
                      frameworks={enquiryType}
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                      field="enquiryType"
                      name="Enquiry Type"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="enquiryDate">Enquiry Date: </Label>
                    <div>
                      <Input
                        id="enquiryDate"
                        type="date"
                        {...register("enquiry_date")}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="lastCall">Last Call Date: </Label>
                    <div>
                      <Input
                        id="lastCall"
                        type="date"
                        {...register("last_call")}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Filter and Reset buttons */}
              <Button
                size="sm"
                type="submit"
                className="h-9 gap-1 bg-[#6B7280] hover:bg-[#6B7280] active:bg-[#4B5563]"
                disabled={!isDirty && !isDateChanged && resetFilter && isValid}
                onSubmit={handleSubmit(onFilter)}
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
              {/* Button to toggle visibility of second-priority filters */}
              <Button
                size="sm"
                variant="link"
                className="text-[#75172F] w-fit"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
              >
                {showMoreFilters ? "Less Filters" : "More Filters"}
              </Button>
            </form>
            <div className="flex justify-end gap-3 items-center">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Name"
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  onChange={(e) => {
                    setPageNum(1);
                    setFilter({ ...filter, Search: e.target.value });
                  }}
                />
              </div>
              {getRole === "superadmin" ? (
                <div className="flex items-center ">
                  <Button
                    variant={"primary"}
                    size="sm"
                    className="h-9 gap-1 "
                    onClick={() => {
                      onDownloadEnquiryList.mutate();
                    }}
                  >
                    <span className="sm:whitespace-nowrap ">Download</span>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href={"/Admin/enquiry/add-enquiry"}>
                    <Button
                      variant={"primary"}
                      size="sm"
                      className="h-9 gap-1 "
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sm:whitespace-nowrap ">Add Enquiry</span>
                    </Button>
                  </Link>
                  <Button
                    variant={"primary"}
                    size="sm"
                    className="h-9 gap-1 "
                    onClick={() => {
                      onDownloadEnquiryList.mutate();
                    }}
                  >
                    <span className="sm:whitespace-nowrap ">Download</span>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              {getRole === "admin" ? (
                <Button
                  size="sm"
                  variant={"outline"}
                  className="h-9 gap-1 border-[#39B16E] text-[#39B16E] hover:bg-[#39B16E] hover:text-white"
                  onClick={() => {
                    onDownloadEnquiryList.mutate();
                  }}
                >
                  <span className="sm:whitespace-nowrap ">Download</span>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              ) : (
                ""
              )}
            </div>
          </div>

          <Card className="p-4 min-w-[100%] ">
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  {" "}
                  <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                </div>
              ) : enquiryData !== undefined ? (
                <DataTable columns={columns} data={enquiryData?.data} />
              ) : (
                "No data to show"
              )}
              <CardFooter className="flex justify-center  mt-2">
                {enquiryData?.metadata?.total_count !== undefined ? (
                  <PaginationDemo
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                    pageCount={enquiryData?.metadata?.total_count}
                    isEnquiry={true}
                  />
                ) : (
                  <PaginationDemo
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                    pageCount={100}
                    isEnquiry={true}
                  />
                )}
              </CardFooter>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
