"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../../table/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getEnquiryType } from "@/api/enquiryManagement";
import { Toaster } from "@/components/ui/toaster";
import PaginationDemo from "@/app/table/Pagination";
import AddEnquirytype from "./addEnquirytype";
import UpdateEnquiryType from "./updateEnquiryType";

type DataType = {
  enq_type_id: number;
  enq_type: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "enq_type",
    header: "Enquiry Types",
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <UpdateEnquiryType
          enq_type_id={data.enq_type_id}
          enq_type={data.enq_type}
        />
      );
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};

export default function EnquirytypeList() {
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState({
    Search: "",
  });
  const router = useRouter();
  // enquiry type listing
  const { data: enquiryDatas, isLoading } = useQuery({
    queryKey: ["enquiryTypes", pageNum, filter.Search],
    queryFn: async () => getEnquiryType(pageNum, filter.Search || ""),
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Toaster />
      <div className="flex flex-col sm:gap-4 sm:py-4 mt-8">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
          <Tabs defaultValue="all">
            <div className="flex justify-end gap-3 mb-4">
              <div className=" relative   md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Enquiry type"
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  onChange={(e) => {
                    setPageNum(1);
                    setFilter({ ...filter, Search: e.target.value });
                  }}
                />
              </div>
              <AddEnquirytype />
            </div>
            <div className="flex items-center gap-3"></div>

            <TabsContent value="all">
              <Card className="p-4 mt-4 min-w-[100%]">
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      {" "}
                      <Loader2 className="mr-2 h-10 w-10 animate-spin" />
                    </div>
                  ) : enquiryDatas !== undefined ? (
                    <DataTable columns={columns} data={enquiryDatas.data} />
                  ) : (
                    "No data to show"
                  )}
                  <CardFooter className="flex justify-center  mt-2">
                    <PaginationDemo
                      pageNum={pageNum}
                      setPageNum={setPageNum}
                      pageCount={
                        enquiryDatas?.metadata !== undefined
                          ? enquiryDatas?.metadata?.total_count
                          : 200
                      }
                    />
                  </CardFooter>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
