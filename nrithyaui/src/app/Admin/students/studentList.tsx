"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../table/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import ComboboxDemo from "../../table/combox";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteStudent, DownloadStudent, studentList } from "@/api/student";
import { BatchDropdownList } from "@/api/batchCompensation";
import PaginationDemo from "@/app/table/Pagination";
import { useToast } from "@/components/ui/use-toast";
import Deletestudent from "./deletestudent";
import { Batches } from "@/Interfaces/Student";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
import Activestudent from "./activeStudent";
import { Toaster } from "@/components/ui/toaster";
import ErrorHandling from "@/app/Components/ErrorHandling";
import DismissStudent from "./dismissStudent";
type DataType = {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  alternative_number: string;
  whatsapp_number: string;
  status: string;
  batches: Batches[];
};

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  all: string;
  batch: string;
};

export type Filter = {
  search: string;
  status: string;
  batch_id: number;
};

export default function TableList() {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [listStudent, setStudent] = useState<DataType[]>([]);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [deleteStudentId, setStudentDeleteId] = useState<number>();

  const columns: ColumnDef<DataType>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => {
        return <div>{(pageNum - 1) * 25 + (row.index + 1)}</div>;
      },
    },
    {
      accessorKey: "reg_no",
      header: "Reg No",
    },
    {
      accessorKey: "first_name",
      header: "Student Name",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <Link
            href={`/Admin/students/${data.student_id}`}
            className="cursor-pointer hover:text-blue-600 hover:underline "
          >
            {`${row.original.first_name} ${row.original.last_name}`}
          </Link>
        );
      },
    },
    {
      accessorKey: "whatsapp_number",
      header: "Whatsapp No",
    },
    {
      accessorKey: "batch",
      header: "Batch Detail",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-left flex flex-col items-start">
            {data?.batches?.map((courseBatch, index) => (
              <Badge
                variant="outline"
                className={
                  courseBatch.batch_status === "ongoing"
                    ? `text-[#75172F] border-[#75172F] m-1  ${
                        courseBatch.status === "expired"
                          ? "bg-red-100 text-[12px]"
                          : ""
                      } `
                    : "text-[red] border-[#75172F] m-1 text-[12px]"
                }
                key={index}
              >
                <p className="flex gap-2 items-center text-[12px]">
                  <i className="fa-solid fa-users"></i>{" "}
                  {courseBatch?.batch_name} &nbsp;&nbsp;
                </p>
                <div
                  // variant="outline"
                  className="text-[#39B16E] m-1"
                  key={index}
                >
                  <p className="flex gap-1 items-center text-[12px]">
                    <i className="fa-solid fa-book"></i>
                    {courseBatch?.courses?.course_name}
                  </p>
                </div>
                <div
                  className="text-[#75172F] flex gap-2 items-center"
                  key={index}
                >
                  <i className="fa-solid fa-chalkboard-user text-[12px]"></i>
                  {`${courseBatch?.teachers.first_name} ${courseBatch?.teachers.last_name}`}
                </div>
              </Badge>
            ))}
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Student Status",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="text-center">
            {data.status === "active" ? (
              <Badge
                variant="outline"
                className="text-green-500 border-green-500"
              >
                {data.status}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-500 border-red-500">
                {data.status}
              </Badge>
            )}
          </div>
        );
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
                <Link href={`/Admin/students/${data.student_id}`}>
                  <DropdownMenuItem className="text-yellow-600">
                    <Eye size={"15"} className="text-yellow-600 mr-2" /> View
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="text-blue-500">
                  {data.status === "dismissed" ? (
                    ""
                  ) : (
                    <Link
                      href={`/Admin/students/UpdateStudent/${data.student_id}`}
                    >
                      <div className="flex items-center">
                        <Pencil size={"15"} className="text-blue-500 mr-2" />{" "}
                        Edit
                      </div>
                    </Link>
                  )}
                </DropdownMenuItem>

                {data.status === "suspended" ? (
                  <DropdownMenuItem className="text-green-500">
                    <Activestudent
                      studentId={data.student_id}
                      status={data.status}
                    />
                  </DropdownMenuItem>
                ) : (
                  <div className="text-red-500">
                    <Deletestudent
                      studentId={data.student_id}
                      status={data.status}
                    />
                  </div>
                )}
                <div className="text-blue-500">
                  <DismissStudent studentId={data.student_id} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const [filter, setFilter] = useState<Filter>({
    search: "",
    status: "active",
    batch_id: 0,
  });
  const form = useForm<FilterType>({
    defaultValues: {
      all: "active",
      batch: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue, getValues } =
    form;
  const { errors, isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({ ...filter, status: data.all, batch_id: Number(data.batch) });
  };

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
    ],
    queryFn: async () =>
      studentList(filter.search, filter.status, pageNum, filter.batch_id),
  });

  const onDownloadStudent = useMutation({
    mutationFn: async () => {
      return await DownloadStudent(
        filter.search,
        filter.status,
        filter.batch_id
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
        a.download = "Studentlist.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col  sm:py-4 mt-4">
        <Toaster />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-3">
                <form onSubmit={handleSubmit(onFilter)} className="flex gap-3">
                  {getValues("all") ? (
                    <div className="w-[100px]">
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
                    <div className="w-[220px]">
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
                        <option value="dismissed" className="text-black">
                          Dismiss
                        </option>
                      </select>
                    </div>
                  )}
                  <div className="w-[150px]">
                    <ComboboxDemo
                      frameworks={batchitems}
                      name="Batch"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                      field="batch"
                    />
                  </div>

                  <Button
                    size="sm"
                    type="submit"
                    className="h-9 gap-1 "
                    style={{ backgroundColor: "#6B7280", color: "white" }}
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
              <div className="flex justify-end gap-1 items-center pl-1">
                <div className=" relative   md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
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
                <div className="flex items-center ">
                  <Link
                    href="students/AddStudents"
                    className="sm:whitespace-nowrap "
                  >
                    <Button
                      variant={"primary"}
                      size="sm"
                      className="h-9 gap-1 "
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Student
                    </Button>
                  </Link>
                </div>
                <Button
                  size="sm"
                  variant={"outline"}
                  className="h-9 gap-1 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                  onClick={() => {
                    onDownloadStudent.mutate();
                  }}
                >
                  <span className="sm:whitespace-nowrap ">Download</span>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {!isUserListLoading ? (
              <TabsContent value="all">
                <Card className="p-4 mt-4 min-w-[100%]">
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
  );
}
