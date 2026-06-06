"use client";
import { dashboardEnquiryApi } from "@/api/dashboardEnquiry";
import EnquirypieChart from "@/app/Components/pieChart";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface RootObject {
  name: string;
  value: number;
}

interface Props {
  dateFrom: string;
  dateTo: string;
}

const EnquirycountChart = ({ dateFrom, dateTo }: Props) => {
  const [ChartData, setChartdata] = useState<RootObject[]>([]);

  const { data: enquirycount, isLoading } = useQuery({
    queryKey: ["dashboardEnquiry", dateFrom, dateTo],
    queryFn: () => dashboardEnquiryApi(dateFrom, dateTo),
    enabled: !!{ dateFrom, dateTo },
  });
  const data1 = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 100 },
    { name: "group q", value: 200 },
    { name: "group h", value: 300 },

    { name: "Group D", value: 400 },
    { name: "Group D", value: 500 },
    { name: "Group D", value: 600 },
    { name: "Group D", value: 700 },
    { name: "Group D", value: 800 },
  ];

  useEffect(() => {
    if (enquirycount && enquirycount?.enquiry_types.length > 0) {
      const ChartData: RootObject[] = enquirycount
        ? enquirycount?.enquiry_types
            .filter((a) => a.totalCount > 0)
            .sort((a, b) => b.totalCount - a.totalCount)
            .slice(0, 5)
            .map((item) => ({
              name: item?.enquiryTypeName,
              value: item?.totalCount,
            }))
        : [];
      setChartdata(ChartData);
      const length = enquirycount.enquiry_types.filter(
        (a) => a.totalCount > 0
      ).length;

      if (length > 5) {
        const balance = enquirycount.enquiry_types
          .filter((a) => a.totalCount > 0)
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(5, length)
          .reduce((a, b) => a + b.totalCount, 0);

        ChartData && ChartData.push({ name: "Other", value: balance });
      }
    }
  }, [enquirycount]);

 
  return (
    <div>
      {!isLoading ? (
        <EnquirypieChart data={ChartData} />
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="animate-spin " />
        </div>
      )}
    </div>
  );
};

export default EnquirycountChart;
