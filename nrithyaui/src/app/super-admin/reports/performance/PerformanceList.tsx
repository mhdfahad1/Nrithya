"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownToLine,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";

import { downloadPerformance, PerformanceListApi } from "@/api/Performance";
import ErrorHandling from "@/app/Components/ErrorHandling";
import ComboboxDemo from "@/app/table/combox";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface DataType {
  first_name: string;
  last_name: string;
  gender: string;
  total: number;
  attended: number;
  leaves: number;
  attendace_percent: number;
  assignments: number;
  trueassignments: number;
  assignment_percent: number;
  performance: number;
}
export type FilterType = {
  percentage: string;
  assignment: string;
  attendance: string;
};
export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "first_name",
    header: "Student Name",
    cell: ({ row }) => {
      return `${row.original.first_name} ${row.original.last_name}`;
    },
  },
  {
    accessorKey: "attendace_percent",
    header: "Attendance (%)",
  },
  {
    accessorKey: "assignment_percent",
    header: "Assignment (%)",
  },
  {
    accessorKey: "performance",
    header: "Performance (%)",
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => {
      const grade =
        row.original.performance > 80
          ? "A"
          : row.original.performance > 60
          ? "B"
          : "C";
      let className = "";
      if (grade === "A")
        className = " text-green-500 font-bold text-lg text-center";
      else if (grade === "B")
        className = "text-[#F0C30D] text-center font-bold text-lg";
      else className = " text-red-600 text-center font-bold text-lg";

      return <div className={className}>{grade}</div>;
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};

export default function PerformanceList() {
  const form = useForm<FilterType>();

  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const { errors, isDirty } = formState;

  const [filter, setFilter] = useState({
    searchKey: "",
    percent: "",
    assignment: "",
    attendance: "",
  });
  const [resetFilter, setResetFilter] = useState<boolean>(true);

  const [pageNum, setPageNum] = React.useState(1);

  const {
    data: listPerformance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["performance", pageNum, filter],
    queryFn: () => {
      const result = PerformanceListApi(
        filter.searchKey || "",
        pageNum,
        filter.percent,
        filter.assignment,
        filter.attendance
      );
      return result;
    },
  });
  useEffect(() => {
    refetch();
  }, []);
  const onDownloadPerformance = useMutation({
    mutationFn: async () => {
      return await downloadPerformance(
        filter.searchKey || "",
        filter.percent,
        filter.assignment,
        filter.attendance
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
        a.download = "studentPerformnce.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
  const Percentage = [
    {
      value: "80",
      label: "80%",
    },
    {
      value: "60",
      label: "60%",
    },
    {
      value: "40",
      label: "40%",
    },
    {
      value: "20",
      label: "20%",
    },
  ];
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  const OnFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({
      ...filter,
      assignment: data.assignment,
      attendance: data.attendance,
      percent: data.percentage,
    });
  };
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative ">
          <Tabs defaultValue="all">
            <div className="flex justify-between pt-3">
              <form action="" onSubmit={handleSubmit(OnFilter)}>
                <div className="flex items-center gap-2">
                  <div className="w-[120px]">
                    <ComboboxDemo
                      field="percentage"
                      setValue={setValue}
                      frameworks={Percentage}
                      name="Performance"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                  <div className="w-[120px]">
                    <ComboboxDemo
                      field="assignment"
                      setValue={setValue}
                      frameworks={Percentage}
                      name="Assignment"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                  <div className="w-[120px]">
                    <ComboboxDemo
                      field="attendance"
                      setValue={setValue}
                      frameworks={Percentage}
                      name="Attendance"
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
                </div>
              </form>
              <div className="flex justify-end gap-3 mb-2">
                <div className=" relative   md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    onChange={(e) => {
                      setPageNum(1);
                      setFilter({ ...filter, searchKey: e.target.value });
                    }}
                    type="search"
                    placeholder="Student Name"
                    className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  />
                </div>
                <div className="flex items-center ">
                  <Button
                    onClick={() => onDownloadPerformance.mutate()}
                    size="sm"
                    className="h-9 gap-1 "
                    variant={"primary"}
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    <span className="sm:whitespace-nowrap ">Download</span>
                  </Button>
                </div>
              </div>
            </div>

            {!isLoading ? (
              <TabsContent value="all">
                {listPerformance && (
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      <DataTable
                        columns={columns}
                        data={listPerformance?.data}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-center mt-2">
                      <PaginationDemo
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                        pageCount={listPerformance?.metadata.totalcount}
                      />
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
            ) : (
              <div className="flex items-center justify-center h-[100vh]">
                <Loader2 className="  animate-spin " />
              </div>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
