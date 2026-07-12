"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ListFilter,
  Loader2,
  PlusCircle,
  RotateCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import ComboboxDemo from "@/app/table/combox";
import { DataTable } from "@/app/table/data-table";
import Link from "next/link";
import { getUsers } from "@/api/adminManagement";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Toaster } from "@/components/ui/toaster";
import UserAction from "./UserAction";
import PaginationDemo from "@/app/table/Pagination";
import ErrorHandling from "@/app/Components/ErrorHandling";

type DataType = {
  user_id: number;
  user_name: string;
  status: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "user_name",
    header: "Username",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-center">
          {data.status === "active" ? (
            <div className="text-[#39B16E]">Active</div>
          ) : (
            <div className="text-red-600">Inactive</div>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserAction row={row} />,
  },
];

const Status = [
  {
    value: "",
    label: "All",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};
type FilterType = {
  userStatus: string;
};

export default function ListUser() {
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState({
    Search: "",
    userStatus: "",
  });
  const form = useForm<FilterType>({
    defaultValues: {
      userStatus: "",
    },
  });
  const { handleSubmit, reset, formState, setValue, watch } = form;
  const { isDirty } = formState;
  // listing
  const {
    data: userDatas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", filter.Search, pageNum, watch("userStatus")],
    queryFn: async () =>
      await getUsers(filter.Search, pageNum, watch("userStatus")),
  });

  const [resetFilter, setResetFilter] = useState<boolean>(true);
  // const handleReset = () => {
  //   setResetFilter(true);
  //   reset();
  // };
  // const onFilter = (data: FilterType) => {
  //   setPageNum(1);
  //   setFilter({ ...filter, userStatus: data.userStatus });
  // };
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen w-full flex-col py-[1.4rem] pl-[1rem]">
      <Toaster />
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex  gap-3 justify-between flex-row-reverse">
            <div className="flex justify-end gap-3 mb-2">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Username"
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  onChange={(e) => {
                    setPageNum(1);
                    setFilter({ ...filter, Search: e.target.value });
                  }}
                />
              </div>
              <div className="flex items-center ">
                <Link href={"/super-admin/user/add-user"}>
                  <Button size="sm" className="h-9 gap-1 " variant={"primary"}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sm:whitespace-nowrap ">Add User</span>
                  </Button>
                </Link>
              </div>
            </div>
            <form>
              <div className="flex items-center gap-3">
                <div className="w-[250px]">
                  <ComboboxDemo
                    frameworks={Status}
                    name="status"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                    setValue={setValue}
                    field="userStatus"
                  />
                </div>

                {/* <Button
                  size="sm"
                  type="submit"
                  className="h-9 gap-1 "
                  style={{ backgroundColor: "#6B7280", color: "white" }}
                  disabled={!isDirty && resetFilter}
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
                </Button> */}
              </div>
            </form>
          </div>

          <Card className="p-4 min-w-[100%]">
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  {" "}
                  <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                </div>
              ) : userDatas !== undefined ? (
                <DataTable columns={columns} data={userDatas?.payload?.data} />
              ) : (
                "No data to show"
              )}
              <CardFooter className="flex justify-center  mt-2">
                <PaginationDemo
                  pageNum={pageNum}
                  setPageNum={setPageNum}
                  pageCount={userDatas?.payload?.metadata?.totalcount}
                />
              </CardFooter>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
