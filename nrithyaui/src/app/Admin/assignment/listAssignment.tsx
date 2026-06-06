"use client";

import { DataTable } from "@/app/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  ListFilter,
  Loader2,
  PlusCircle,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  getAssignment,
  getCourseComboBox,
  getTeacherComboBox,
} from "@/api/assignment";
import ErrorHandling from "@/app/Components/ErrorHandling";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { AssignmentGetPayloadType } from "@/Interfaces/assignment";
import { CourseType } from "@/Interfaces/course";
import { Datum } from "@/Interfaces/Teacher";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import ComboboxDemo from "@/app/table/combox";
import AssignmentAction from "./AssignmentAction";

type DataType = {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  course_name: string;
  teacher_name: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "assignment_name",
    header: "Assignment Name",
  },
  {
    accessorKey: "assignment_desc",
    header: "Description",
  },
  {
    accessorKey: "course_name",
    header: "Course",
  },
  {
    accessorKey: "teacher_name",
    header: "Teacher",
  },
  {
    accessorKey: "url",
    header: "Url",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return <AssignmentAction assignment_id={data.assignment_id} />;
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  course: string;
  teacher: string;
};

export default function TableList() {
  const form = useForm<FilterType>({
    defaultValues: {
      course: "",
      teacher: "",
    },
  });
  const { handleSubmit, reset, formState, setValue, control } = form;
  const { isDirty } = formState;

  const courseValue = useWatch({ control, name: "course" });
  //get course
  const { data: courseListData } = useQuery({
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

  //get teacher
  const { data: teacherListData } = useQuery({
    queryKey: ["teacher", courseValue],
    queryFn: async () => await getTeacherComboBox(courseValue),
  });
  const [getTeacherData, setGetTeacherData] = useState<Datum[]>([]);
  useEffect(() => {
    if (teacherListData) {
      setGetTeacherData(teacherListData.data);
    }
  }, [teacherListData]);

  const teacher: FrameworkType[] = getTeacherData.map((item) => ({
    value: `${item.teacher_id}`,
    label: `${item.first_name.trim()}${
      item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
    }`,
  }));
  // filter
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState({
    searchKey: "",
    course_id: "",
    teacher_id: "",
  });
  const [resetFilter, setResetFilter] = useState<boolean>(true);

  const handleReset = () => {
    setResetFilter(true);
    reset();
    setFilter({ ...filter, searchKey: "" });
  };
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      course_id: data.course,
      teacher_id: data.teacher,
    });
  };

  // get
  const {
    data: assignmentListData,
    isLoading: isAssignmentListLoading,
    error,
  } = useQuery({
    queryKey: [
      "assignment",
      filter.searchKey,
      pageNum,
      filter.course_id,
      filter.teacher_id,
    ],
    queryFn: async () =>
      await getAssignment(
        filter.searchKey || "",
        pageNum,
        filter.course_id,
        filter.teacher_id
      ),
  });

  const tableData: DataType[] = assignmentListData
    ? assignmentListData.data.map((item: AssignmentGetPayloadType) => ({
        assignment_id: item.assignment_id,
        assignment_name: item.assignment_name,
        assignment_desc: item.assignment_desc,
        url: item.url,
        teacher_name: `${item.teachers.first_name} ${item.teachers.last_name}`,
        course_name: item.courses.course_name,
      }))
    : [];

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1 items-start gap-4 p-4  relative ">
          <div className="flex justify-between pt-3">
            <div className="flex gap-3 ">
              <form className="flex gap-3" onSubmit={handleSubmit(onFilter)}>
                <div className="w-[220px]">
                  <ComboboxDemo
                    frameworks={course}
                    name="Course"
                    setValue={setValue}
                    field="course"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                <div className="w-[220px]">
                  <ComboboxDemo
                    frameworks={teacher}
                    name="Teacher"
                    field="teacher"
                    setValue={setValue}
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                <Button
                  size="sm"
                  type="submit"
                  className="h-9 gap-1 "
                  style={{ backgroundColor: " #75172F" }}
                  disabled={!isDirty && resetFilter}
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
            <div className="flex justify-end gap-3 mb-2">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={filter.searchKey}
                  onChange={(e) => {
                    setPageNum(1);

                    setFilter({
                      ...filter,
                      searchKey: e.target.value,
                    });
                  }}
                  type="search"
                  placeholder="Assignment Name"
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                />
              </div>
              <div className="flex items-center ">
                <Link href={"/Admin/assignment/Add-assignment"}>
                  <Button variant={"primary"} size="sm" className="h-9 gap-1 ">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sm:whitespace-nowrap ">
                      Add Assignment
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div>
            {isAssignmentListLoading ? (
              <div className="flex justify-center">
                <Loader2 className="  animate-spin " />
              </div>
            ) : (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={tableData} />
                  <CardFooter className="mt-2 flex justify-center">
                    {assignmentListData !== undefined ? (
                      <PaginationDemo
                        pageCount={assignmentListData?.metadata.totalcount}
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                      />
                    ) : null}
                  </CardFooter>
                </CardContent>
              </Card>
            )}
          </div>
          <Toaster />
        </main>
      </div>
    </div>
  );
}
