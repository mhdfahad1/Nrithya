"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../table/data-table";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { CourseType } from "@/Interfaces/course";
import { useQuery } from "@tanstack/react-query";
import { getCourse } from "@/api/course";
import { Toaster } from "@/components/ui/toaster";
import UpdateCourse from "./updateCourse";
import AddCourse from "./addCourse";
import PaginationDemo from "@/app/table/Pagination";
import ErrorHandling from "@/app/Components/ErrorHandling";

type DataType = {
  course_name: string;
  course_id: number;
};
export type FrameworkType = {
  value: string;
  label: string;
};
type FilterType = {
  search: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "course_name",
    header: "Course Name",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <UpdateCourse
          course_name={data.course_name}
          course_id={data.course_id}
        />
      );
    },
  },
];

export default function TableList() {
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState<FilterType>({
    search: "",
  });
  const {
    data: courseListData,
    isLoading: isCourseListLoading,
    error,
  } = useQuery({
    queryKey: ["course", filter.search, pageNum],
    queryFn: async () => await getCourse(filter.search || "", pageNum),
  });

  const [getData, setGetData] = useState<CourseType[]>([]);
  useEffect(() => {
    if (courseListData) {
      setGetData(courseListData.data);
    }
  }, [courseListData]);
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 mt-2">
        <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-0  ">
          <div className="flex justify-end gap-3 ">
            <div className=" relative   md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                onChange={(e) => {
                  setFilter({
                    search: e.target.value,
                  });
                  setPageNum(1);
                }}
                type="search"
                placeholder="Course name"
                className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
              />
            </div>
            <div className="flex items-center ">
              <AddCourse />
            </div>
          </div>
          <div>
            {isCourseListLoading ? (
              <div className="flex justify-center">
                <Loader2 className="  animate-spin " />
              </div>
            ) : (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={getData} />
                  <CardFooter className="flex justify-center mt-2">
                    {courseListData !== undefined ? (
                      <PaginationDemo
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                        pageCount={courseListData?.metadata.totalcount}
                      />
                    ) : null}
                  </CardFooter>
                </CardContent>
              </Card>
            )}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  );
}
