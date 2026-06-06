"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  ArrowDownToLine,
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
import { Badge } from "@/components/ui/badge";
import ComboboxDemo from "@/app/table/combox";
import Link from "next/link";
interface batchesType {
  batch_id: number;
  batch_name: string;
  fee: number;
  max_strength: number;
  current_strength: number;
  whatsapp_link: string;
  status: string;
  batch_started: string;
}
interface courseBatchestype {
  course_id: number;
  course_name: string;
  is_active: boolean;
  batches: batchesType[];
}
import { useForm, useWatch } from "react-hook-form";
import { getTeachers } from "@/api/teacherManagement";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "@/app/table/data-table";
import { CourseType } from "@/Interfaces/course";
import { getCourseComboBox } from "@/api/assignment";
import PaginationDemo from "@/app/table/Pagination";
import TeacherAction from "./TeacherAction";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { downloadTeacher } from "@/api/teacherDownloadApi";
import { BatchlistDropdownActivity } from "@/api/batchActivity";

type RowData = {
  original: TeacherDataType;
};

export type TeacherDataType = {
  teacher_id: number;
  teacherName?: string;
  coursesAndBatches: courseBatchestype[];
  whatsapp_number: string;
  noOfBatches?: number;
  first_name: string;
  last_name: string;
};

export type FrameworkType = {
  value: string;
  label: string;
};
type FilterType = {
  course: string;
  batch: string;
};
type Props = {
  role?: string;
};
export default function TeacherList({ role }: Props) {
  const [pageNum, setPageNum] = useState(1);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [filter, setFilter] = useState({
    Search: "",
    courseId: "",
    batchId: "",
  });

  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const {
    data: teachersDatas,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "teachers",
      filter.Search,
      pageNum,
      filter.courseId,
      filter.batchId,
    ],
    queryFn: async () =>
      await getTeachers(
        filter.Search || "",
        pageNum,
        filter.courseId || "",
        filter.batchId || ""
      ),
  });

  const onDownloadTeacher = useMutation({
    mutationFn: async () => {
      return await downloadTeacher(
        filter.Search || "",

        filter.courseId || "",
        filter.batchId || ""
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
        a.download = "TeachersReportList.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {
      throw error;
    },
  });

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
  const form = useForm<FilterType>({
    defaultValues: {
      batch: "",
    },
  });
  const { handleSubmit, reset, formState, control, setValue } = form;

  const courseId = useWatch({ control, name: "course" });

  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown", courseId],
    queryFn: async () => await BatchlistDropdownActivity(courseId),
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

  const { isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  const onFilter = (filterData: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      courseId: filterData?.course,
      batchId: filterData?.batch,
    });
  };
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  const columns: ColumnDef<TeacherDataType>[] = [
    {
      accessorKey: "teacherName",
      header: "Teacher Name",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <>
            {role === "superadmin" ? (
              <div key={data.teacher_id} className="text-left">
                {data.first_name} {data.last_name}
              </div>
            ) : (
              <Link href={`/Admin/teachers/${data.teacher_id}`}>
                <div
                  key={data.teacher_id}
                  className="text-left cursor-pointer hover:text-blue-600 hover:underline"
                >
                  {data.first_name} {data.last_name}
                </div>
              </Link>
            )}
          </>
        );
      },
    },

    {
      accessorKey: "coursesAndBatches",
      header: "Courses and Batches",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-left w-fit max-w-fit flex flex-row flex-wrap ">
            {data?.coursesAndBatches?.map((courseBatch, index) => (
              <div
                key={index}
                className="text-[#75172F] border-[#75172F] border rounded-lg items-center  m-1 p-1 w-fit  flex flex-row flex-wrap"
              >
                {courseBatch?.course_name}
                {courseBatch?.batches?.map((batch, index) => (
                  <Badge
                    variant={"outline"}
                    key={index}
                    className="text-[#39B16E] flex border rounded-lg items-center text-[10px] justify-center border-[#39B16E] m-1 p-2 max-w-[35rem] "
                  >
                    <Link
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      href={`/Admin/batch/${batch.batch_id}`}
                    >
                      {batch.batch_name}
                    </Link>
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "whatsapp_number",
      header: "Whatsapp Number",
    },
    {
      accessorKey: "noOfBatches",
      header: "Number of Batches",
      cell: ({ row }) => {
        const data = row.original;
        let totalBatches = 0;
        for (const course of data.coursesAndBatches) {
          totalBatches += course.batches.length;
        }
        return <div>{totalBatches}</div>;
      },
    },
    ...(role !== "superadmin"
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: RowData }) => {
              const data = row.original;
              return (
                <div className="text-center">
                  <TeacherAction data={data} />
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen  flex-col bg-muted/40  py-[0.9rem] pl-[0.6rem] w-full ">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1   p-4 sm:px-6 sm:py-0 md:gap-8 gap-8 relative">
          <div className="flex md:justify-between pt-3 w-full  justify-end gap-3  flex-col-reverse md:flex-row  ">
            <form
              onSubmit={handleSubmit(onFilter)}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="w-[190px]">
                <ComboboxDemo
                  frameworks={course}
                  name={`Course`}
                  field={`course`}
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  setValue={setValue}
                />
              </div>
              <div className="w-[190px]">
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
                type="submit"
                size="sm"
                className="h-9 gap-1 bg-[#75172F] hover:bg-[#75172F] active:bg-[#98354e]"
                disabled={!isDirty && resetFilter}
                onSubmit={handleSubmit(onFilter)}
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

            <div className="flex justify-end gap-3 items-center">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  onChange={(e) => {
                    setPageNum(1);
                    setFilter({ ...filter, Search: e.target.value });
                  }}
                  type="search"
                  placeholder="Teacher name"
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[200px]"
                />
              </div>
              <div className="flex items-center ">
                {role === "admin" ? (
                  <Link href={"/Admin/teachers/add-teacher"}>
                    {" "}
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      variant={"primary"}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sm:whitespace-nowrap ">Add Teacher</span>
                    </Button>
                  </Link>
                ) : role === "superadmin" ? (
                  <Button
                    onClick={() => onDownloadTeacher.mutate()}
                    size="sm"
                    className="h-9 gap-1 "
                    variant={"primary"}
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    <span className="sm:whitespace-nowrap ">Download</span>
                  </Button>
                ) : (
                  ""
                )}
              </div>
              {role === "admin" ? (
                <Button
                  size="sm"
                  variant={"outline"}
                  className="h-9 gap-1 border-[#39B16E] text-[#39B16E] hover:bg-[#39B16E] hover:text-white"
                  onClick={() => {
                    onDownloadTeacher.mutate();
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
              ) : teachersDatas !== undefined ? (
                <DataTable
                  columns={columns}
                  data={teachersDatas?.payload?.data}
                />
              ) : (
                <div>No data available</div>
              )}
              <CardFooter className="flex justify-center  mt-2">
                <PaginationDemo
                  pageNum={pageNum}
                  setPageNum={setPageNum}
                  pageCount={
                    teachersDatas?.payload?.metadata?.total_count !== undefined
                      ? teachersDatas?.payload?.metadata?.total_count
                      : 400
                  }
                />
              </CardFooter>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
