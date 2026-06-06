"use client";
import { dashboardEnquiryApi } from "@/api/dashboardEnquiry";
import { DataTable } from "@/app/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon, Loader2 } from "lucide-react";

interface DataType {
  enquiryTypeName: string;
  totalCount: number;
}

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "enquiryTypeName",
    header: "Enquiry Name",
  },
  {
    accessorKey: "totalCount",
    header: "Count",
  },
];

const data: DataType[] = [
  {
    enquiryTypeName: "Vishnu",
    totalCount: 20,
  },
];

interface Props {
  dateFrom: string;
  dateTo: string;
}

const EnquiryCountList = ({ dateFrom, dateTo }: Props) => {
  const {
    data: enquirycount,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardEnquiryList", dateFrom, dateTo],
    queryFn: () => dashboardEnquiryApi(dateFrom, dateTo),
    enabled: !!{ dateFrom, dateTo },
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full ">
          <p className="text-sm text-[#75172F] flex items-center hover:underline">
            View Details <ArrowRightIcon className="h-3.5 w-3.5" />
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-[60%] max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Type of customer enquiries and count
            </DialogTitle>
          </DialogHeader>
          {!isLoading ? (
            <div>
              {enquirycount && (
                <Card className="p-4 min-w-[100%]">
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={enquirycount?.enquiry_types}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="animate-spin " />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnquiryCountList;
