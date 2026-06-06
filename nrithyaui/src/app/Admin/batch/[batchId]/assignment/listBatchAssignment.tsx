"use client";

import { Copy, Eye, ListTodo, Loader2, MoreHorizontal } from "lucide-react";

import { getBatchAssignment } from "@/api/assignment";
import ErrorHandling from "@/app/Components/ErrorHandling";
import Navbar from "@/app/Components/Navbar";
import { DataTable } from "@/app/table/data-table";
import PaginationDemo from "@/app/table/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddAssignment from "./AddAssignment";
import DeleteBatchAssignment from "./deleteBatchAssignment";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DataType = {
  id: number;
  submission_deadline: string;
  assignment: {
    assignment_name: string;
    url: string;
  };
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "assignment.assignment_name",
    header: "Assignment Name",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Link href={`assignment/${data.id}`}>
          <div className="cursor-pointer hover:text-blue-600 hover:underline">
            {data.assignment.assignment_name}
          </div>{" "}
        </Link>
      );
    },
  },
  {
    accessorKey: "submission_deadline",
    header: "Due Date",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          {new Date(data.submission_deadline).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </>
      );
    },
  },
  {
    accessorKey: "assignment.url",
    header: "url",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex gap-3 py-2">
          <div className="flex gap-3 items-center">
            <p>{data.assignment.url}</p>
            <Copy
              className="h-3 w-3 text-gray-500 cursor-pointer"
              onClick={() => navigator.clipboard.writeText(data.assignment.url)}
            />
          </div>
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
              <Link href={`assignment/${data.id}`}>
                <DropdownMenuItem className="text-blue-500">
                  <ListTodo size={"15"} className="text-blue-500 mr-2" />{" "}
                  Evaluate
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-red-500">
                <DeleteBatchAssignment batchId={data.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
type Props = {
  params: { batchId: string };
};
function Assignment({ params }: Props) {
  const [pageNum, setPageNum] = useState(1);

  const {
    data: batchAssignment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["batchAssignment", pageNum],
    queryFn: () => getBatchAssignment(params.batchId, pageNum),
    enabled: !!params.batchId,
  });
  useEffect(() => {
    refetch();
  }, []);

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Navbar name="Assignment Detail" />
      <div>
        <div className="flex justify-end px-10 py-6">
          {/* <AddAssignment params={params} /> */}
        </div>
        {!isLoading ? (
          <div className="px-4">
            {batchAssignment && (
              <Card className="p-4 mt-2 min-w-[100%]">
                <CardContent>
                  <DataTable columns={columns} data={batchAssignment?.data} />
                  <CardFooter className="flex justify-center mt-2">
                    {batchAssignment !== undefined ? (
                      <PaginationDemo
                        pageCount={batchAssignment?.metadata.totalcount}
                        pageNum={pageNum}
                        setPageNum={setPageNum}
                      />
                    ) : (
                      ""
                    )}
                  </CardFooter>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100vh]">
            <Loader2 className="  animate-spin " />
          </div>
        )}
      </div>
    </>
  );
}

export default Assignment;
