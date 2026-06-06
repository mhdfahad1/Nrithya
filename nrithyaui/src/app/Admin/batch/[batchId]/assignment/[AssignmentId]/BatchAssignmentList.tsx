"use client";

import { DataTable } from "@/app/table/data-table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Components/Navbar";
import { useForm } from "react-hook-form";
import AddAssignment from "./AddAssignment";
import { useQuery } from "@tanstack/react-query";
import {
  listBatchAssignment,
  TeacherlistDropdown,
} from "@/api/batchAssignment";
import PaginationDemo from "@/app/table/Pagination";
import ErrorHandling from "@/app/Components/ErrorHandling";

export type DataType = {
  id: number;
  status: boolean;
  submission_date: string;
  grade: number;
  student: {
    first_name: string;
    last_name: string;
  };
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "student",
    header: "Student Name",
    cell: ({ row }) => {
      return `${row.original.student.first_name} ${row.original.student.last_name}`;
    },
  },

  {
    accessorKey: "submission_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      const date = row.original.submission_date;
      return (
        <div>
          {date === null ? (
            <div className="text-center">...</div>
          ) : (
            new Date(date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div
          className={`flex justify-center ${
            data.status ? "text-green-600" : "text-red-600"
          }`}
        >
          {data.status ? "Submitted" : "Not Submitted"}
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex justify-center">
          <AddAssignment id={data.id} listassignment={data} />
        </div>
      );
    },
  },
];

export type FilterType = {
  teacher: string;
};

export type FrameworkType = {
  value: string;
  label: string;
};
type Props = {
  AssignmentId: string;
};
function AssignmentId({ AssignmentId }: Props) {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [listassignment, setListBatch] = useState<DataType[]>([]);
  const [teacherlist, setTeacherList] = useState<FrameworkType[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const form = useForm<FilterType>({
    defaultValues: {
      teacher: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue } = form;
  const { errors, isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  const onFilter = (data: FilterType) => {
    data;
  };

  useEffect(() => {
    refetch();
  }, []);

  const { data: teacherListDropdown } = useQuery({
    queryKey: ["teacherlistdr"],
    queryFn: () => TeacherlistDropdown(),
  });

  useEffect(() => {
    if (teacherListDropdown) {
      const batches: FrameworkType[] = teacherListDropdown?.map(
        (item, index) => ({
          value: `${item?.teacher_id}`,
          label: `${item?.first_name} ${item?.last_name}`,
        })
      );

      setTeacherList(batches);
    }
  }, [teacherListDropdown]);

  const {
    data: listbatchassignment,
    isLoading: isUserListLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["batchassignment"],
    queryFn: async () => listBatchAssignment(AssignmentId),
  });

  useEffect(() => {
    if (listbatchassignment) {
      setListBatch(listbatchassignment.data);
    }
  }, [listbatchassignment]);

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Navbar name="Batch Assignment" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-6">
            <div className="flex justify-between mt-5">
              <div className="flex items-center gap-3"></div>
              <div className="flex gap-3"></div>
            </div>

            {!isUserListLoading ? (
              <Card className="p-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={listassignment} />
                  <CardFooter className="flex justify-center mt-2">
                    {listbatchassignment !== undefined ? (
                      <PaginationDemo
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                        pageCount={listbatchassignment?.metadata.totalcount}
                      />
                    ) : (
                      ""
                    )}
                  </CardFooter>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[100vh]">
                <Loader2 className="mr-2 h-10 w-10 animate-spin" />
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default AssignmentId;
