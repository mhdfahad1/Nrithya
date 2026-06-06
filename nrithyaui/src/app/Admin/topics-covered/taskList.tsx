"use client";
import {
  BatchActivityList,
  BatchlistDropdownActivity,
  deleteBatchActivity,
} from "@/api/batchActivity";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ErrorHandling from "@/app/Components/ErrorHandling";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  ListFilter,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export type FrameworkType = {
  value: string;
  label: string;
};
export type FilterType = {
  batch: number;
  date: string;
};
export type Filter = {
  batch_id: number;
  date: string;
};

type DataType = {
  activity_id: number;
  date: string;
  batch: {
    batch_id: number;
    batch_name: string;
  };
  task: string;
};

function TaskList() {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [listBatch, setListBatch] = useState<DataType[]>([]);
  const [filter, setFilter] = useState<Filter>({
    batch_id: 0,
    date: "",
  });

  const form = useForm<FilterType>({
    defaultValues: {
      batch: 0,
      date: "",
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState, setValue } = form;
  const { errors, isDirty } = formState;
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  const onFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({ ...filter, batch_id: data.batch, date: data.date });
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

  //listbatchactivity

  const {
    data: listbatchactivity,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["batchactivity", filter.batch_id, filter.date, pageNum],
    queryFn: async () =>
      BatchActivityList(filter.batch_id, filter.date, pageNum),
  });

  useEffect(() => {
    if (listbatchactivity) {
      setListBatch(listbatchactivity.data);
    }
  }, [listbatchactivity]);
  // batch Activity delete
  const onBatchActivityDelete = useMutation({
    mutationFn: async (activityId: number) => {
      if (activityId !== undefined) {
        return await deleteBatchActivity(activityId);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        description: "Topic deleted successfully...",
      });
      queryClient.invalidateQueries({ queryKey: ["batchactivity"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
  const columns: ColumnDef<DataType>[] = [
    {
      accessorKey: "batch.batch_name",
      header: "Batch Name",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "task",
      header: "Topics",
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
                  href={`/Admin/topics-covered/update-topics/${data.activity_id}`}
                >
                  <DropdownMenuItem className="text-blue-500">
                    <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() =>
                    onBatchActivityDelete.mutate(data?.activity_id)
                  }
                >
                  <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Toaster />
      <Navbar name="Topics Covered" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0  relative ">
            <div className="flex justify-between pt-3">
              <div className="flex gap-3 ">
                <form className="flex gap-3" onSubmit={handleSubmit(onFilter)}>
                  <div className="w-[220px]">
                    <ComboboxDemo
                      frameworks={batchitems}
                      name="Batch"
                      setValue={setValue}
                      field="batch"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                  <div className="w-[220px]">
                    <Input type="date" {...register("date", {})} />
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
              <div className="flex justify-end gap-3 ">
                {/* <div className=" relative   md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  />
                </div> */}
                <div className="flex items-center ">
                  <Link href={"topics-covered/add-topics"}>
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      variant={"primary"}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sm:whitespace-nowrap ">Add Topic</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {!isUserListLoading ? (
              <Card className="p-4 mt-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={listBatch} />
                </CardContent>

                <CardFooter className="flex justify-center mt-2">
                  {listbatchactivity !== undefined ? (
                    <PaginationDemo
                      pageNum={pageNum}
                      setPageNum={setPageNum}
                      pageCount={listbatchactivity?.metadata?.total_count}
                    />
                  ) : (
                    ""
                  )}
                </CardFooter>
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

export default TaskList;
