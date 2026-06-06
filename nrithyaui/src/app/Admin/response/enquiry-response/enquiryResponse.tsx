"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../table/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getEnquiryResponse } from "@/api/enquiryManagement";
import { Toaster } from "@/components/ui/toaster";
import PaginationDemo from "@/app/table/Pagination";
import UpdateEnquiryResponse from "./updateEnquiryResponse";
import AddEnquiryResponse from "./addEnquiryResponse";

type DataType = {
  enq_res_id: number;
  enquiry_response: string;
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "enquiry_response",
    header: "Enquiry Response",
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <UpdateEnquiryResponse
          enq_res_id={data.enq_res_id}
          enquiry_response={data.enquiry_response}
        />
      );
    },
  },
];

export type FrameworkType = {
  value: string;
  label: string;
};

export default function EnquiryResponseList() {
  const [pageNum, setPageNum] = useState(1);
  const [filter, setFilter] = useState({
    Search: "",
  });
  const router = useRouter();
  // enquiry response listing
  const { data: enquiryDatas, isLoading } = useQuery({
    queryKey: ["enquiryResponses", pageNum, filter.Search],
    queryFn: async () => getEnquiryResponse(pageNum, filter.Search || ""),
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
                  placeholder="Search..."
                  className="w-full rounded-lg pl-8 md:w-[160px] lg:w-[250px]"
                  onChange={(e) => {
                    setFilter({ ...filter, Search: e.target.value });
                  }}
                />
              </div>
              <AddEnquiryResponse />
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
                    <DataTable columns={columns} data={enquiryDatas} />
                  ) : (
                    "No data to show"
                  )}
                  <CardFooter className="flex justify-center  mt-2">
                    <PaginationDemo
                      pageNum={pageNum}
                      setPageNum={setPageNum}
                      pageCount={100}
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
