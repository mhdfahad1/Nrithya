"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ListFilter,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
  TimerReset,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ComboboxDemo from "./combox";
import PaginationDemo from "./Pagination";

type DataType = {
  id: string;
  name: string;
  course: string;
  batch: string;
  teacher: string;
  status: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "name",
    header: "Student Name",
  },
  {
    accessorKey: "course",
    header: "Course",
  },
  {
    accessorKey: "batch",
    header: "Batch",
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-center">
          {data.status === "Active" ? (
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
    cell: () => {
      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="text-blue-500">
                <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const data: DataType[] = [
  {
    id: "1234",
    name: "Muhzin",
    course: "Mohaniyatamm",
    batch: "B2",
    teacher: "Vishnu",
    status: "Active",
  },
  {
    id: "12345",
    name: "Hashil",
    course: "Kadhakali",
    batch: "B1",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "1236",
    name: "fahad",
    course: "Kadhakali",
    batch: "B2",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "16745",
    name: "dhilsha",
    course: "break dance",
    batch: "B1",
    teacher: "Athul",
    status: "suspend",
  },
  {
    id: "1234",
    name: "Muhzin",
    course: "Mohaniyatamm",
    batch: "B2",
    teacher: "Vishnu",
    status: "Active",
  },
  {
    id: "12345",
    name: "Hashil",
    course: "Kadhakali",
    batch: "B1",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "1236",
    name: "fahad",
    course: "Kadhakali",
    batch: "B2",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "16745",
    name: "dhilsha",
    course: "break dance",
    batch: "B1",
    teacher: "Athul",
    status: "suspend",
  },
  {
    id: "1234",
    name: "Muhzin",
    course: "Mohaniyatamm",
    batch: "B2",
    teacher: "Vishnu",
    status: "Active",
  },
  {
    id: "12345",
    name: "Hashil",
    course: "Kadhakali",
    batch: "B1",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "1236",
    name: "fahad",
    course: "Kadhakali",
    batch: "B2",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "16745",
    name: "dhilsha",
    course: "break dance",
    batch: "B1",
    teacher: "Athul",
    status: "suspend",
  },
  {
    id: "1234",
    name: "Muhzin",
    course: "Mohaniyatamm",
    batch: "B2",
    teacher: "Vishnu",
    status: "Active",
  },
  {
    id: "12345",
    name: "Hashil",
    course: "Kadhakali",
    batch: "B1",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "1236",
    name: "fahad",
    course: "Kadhakali",
    batch: "B2",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "16745",
    name: "dhilsha",
    course: "break dance",
    batch: "B1",
    teacher: "Athul",
    status: "suspend",
  },
  {
    id: "1234",
    name: "Muhzin",
    course: "Mohaniyatamm",
    batch: "B2",
    teacher: "Vishnu",
    status: "Active",
  },
  {
    id: "12345",
    name: "Hashil",
    course: "Kadhakali",
    batch: "B1",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "1236",
    name: "fahad",
    course: "Kadhakali",
    batch: "B2",
    teacher: "Akshay",
    status: "Active",
  },
  {
    id: "16745",
    name: "dhilsha",
    course: "break dance",
    batch: "B1",
    teacher: "Athul",
    status: "suspend",
  },
];
const teacher = [
  {
    value: "akshay",
    label: "Akshay",
  },
  {
    value: "vishnu",
    label: "Vishnu",
  },
  {
    value: "athul",
    label: "Athul",
  },
];
const batch = [
  {
    value: "b1",
    label: "B1",
  },
  {
    value: "b2",
    label: "B2",
  },
  {
    value: "b3",
    label: "B3",
  },
];
const course = [
  {
    value: "kadhakali",
    label: "Kadhakali",
  },
  {
    value: "mohaniyatam",
    label: "Mohaniyatam",
  },
  {
    value: "bharathanatya",
    label: "Bharathanatya",
  },
  {
    value: "breakDance",
    label: "BreakDance",
  },
  {
    value: "clasical",
    label: "Classical",
  },
];
export type FrameworkType = {
  value: string;
  label: string;
};

export default function TableList() {
  const [pageNum, setPageNum] = React.useState(1);
  const [resetFilter, setResetFilter] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex justify-end gap-3 mb-2">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                />
              </div>
              <div className="flex items-center ">
                <Button size="sm" className="h-9 gap-1 " variant={"primary"}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sm:whitespace-nowrap ">Add Student</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Suspend</TabsTrigger>
              </TabsList>
              {/* <ComboboxDemo
                frameworks={course}
                name="Course"
                setSelectedValue={setSelectedValue}
                resetFilter={resetFilter}
                setResetFilter={setResetFilter}
              />
              <ComboboxDemo
                frameworks={batch}
                name="Batch"
                setSelectedValue={setSelectedValue}
                resetFilter={resetFilter}
                setResetFilter={setResetFilter}
              />
              <ComboboxDemo
                frameworks={teacher}
                name="Teacher"
                setSelectedValue={setSelectedValue}
                resetFilter={resetFilter}
                setResetFilter={setResetFilter}
              /> */}
              <Button
                size="sm"
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
                onClick={() => setResetFilter(true)}
              >
                <RotateCcw className="h-4 w-4" color="#6B7280" />
                <span style={{ color: "#6B7280" }}>Reset</span>
              </Button>
            </div>

            <TabsContent value="all">
              <Card className="p-4 mt-4 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={data} />
                </CardContent>
                <CardFooter className="flex justify-center mt-2">
                  <PaginationDemo
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                    pageCount={100}
                  />
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
