"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../table/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ArrowDownToLine, Loader2, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import UpdateFeeCollection from "./updateFeeCollection";
import ComboboxDemo from "../../table/combox";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorHandling from "@/app/Components/ErrorHandling";
import { downloadFee, getFeeCollection } from "@/api/feeCollection";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
import PaginationDemo from "@/app/table/Pagination";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Updateduedate from "./Updateduedate";

type DataType = {
  payment_id: number;
  payment_method: null;
  date: string;
  due_date: string;
  remarks: null;
  status: boolean;
  amount: number;
  transaction_id: null | string;
  batches: {
    batch_name: string;
  };
  students: {
    reg_no: string;
    first_name: string;
    last_name: string;
    student_id: number;
    whatsapp_number: string;
  };
  paid_date: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "students.reg_no",
    header: "Reg No",
  },
  {
    accessorKey: "students",
    header: "Student Name",
    cell: ({ row }) => {
      return `${row.original.students.first_name} ${row.original.students.last_name}`;
    },
  },
  {
    accessorKey: "students.whatsapp_number",
    header: "Contact Number",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex gap-3">
              <div
                onClick={() =>
                  navigator.clipboard.writeText(data.students.whatsapp_number)
                }
                className="cursor-pointer hover:"
              >
                {data.students.whatsapp_number}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-gray-500">Click to copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  {
    accessorKey: "batches.batch_name",
    header: "Batch",
  },
  {
    accessorKey: "amount",
    header: "Fees",
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = new Date(row.original.due_date);
      return (
        <div className="flex gap-3 items-center">
          <div>
            {date.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <Updateduedate row={row.original} />
        </div>
      );
    },
  },

  {
    accessorKey: "paid",
    header: "Collect Fees",

    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="text-center">
          {data.status ? (
            <button className="bg-green-500 text-white text-[12px] rounded-md py-1 px-4 ">
              paid
            </button>
          ) : (
            <UpdateFeeCollection
              student_id={data.students.student_id}
              first_name={data.students.first_name}
              last_name={data.students.last_name}
              payment_id={data.payment_id}
            />
          )}
        </div>
      );
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};

export type FilterType = {
  batch: string;
};

export type Filter = {
  search: string;
};

export default function TableList() {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState(1);
  const form = useForm<FilterType>({
    defaultValues: {
      batch: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const { errors, isDirty } = formState;

  const batchValue = useWatch({ control, name: "batch" });

  const [listfee, setListFee] = useState<DataType[]>([]);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [filter, setFilter] = useState<Filter>({
    search: "",
  });
  const [batchid, setBatchId] = useState(0);
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };

  useEffect(() => {
    if (batchValue) {
      setPageNum(1);
      setBatchId(Number(batchValue));
    }
  }, [batchValue]);

  const onDownloadFeeCollection = useMutation({
    mutationFn: async () => {
      return await downloadFee(filter.search, batchid);
    },
    onSuccess: (data) => {
      if (data) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "FeeCollectionList.xlsx";
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
    data: listfeecollectiondata,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["feecollections", batchid, filter.search, pageNum],
    queryFn: async () => getFeeCollection(batchid, filter.search, pageNum),
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
      <Toaster />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 mt-2">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative ">
            <Tabs defaultValue="all">
              <div className="flex justify-between mt-3">
                <form>
                  <div className="flex items-center justify-start gap-3 ">
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

                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "#E5E7EB" }}
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4" color="#6B7280" />
                      <span style={{ color: "#6B7280" }}>Reset</span>
                    </Button>
                  </div>
                </form>
                <div className="flex justify-end gap-3 mb-4">
                  <div className=" relative   md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                </div>
              )}
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
