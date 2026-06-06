import { teacherWiseRevenueReportApi } from "@/api/teacherWiseRevenueReport";
import HorizontalBar from "@/app/Components/HorizontalBar";
import {
  Payload,
  TeacherRevenueResponse,
} from "@/Interfaces/teacherWiseRevenue";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface RootObject {
  name: string;
  value: number;
}
type TeacherWiseRevenueProps = {
  from: string;
  to: string;
};
const TeacherWiseRevenue = ({ from, to }: TeacherWiseRevenueProps) => {
  const [listfee, setListFee] = useState<Payload[]>([]);
  const [batchitems, setBatchItems] = useState<RootObject[]>([]);

  const {
    data: reportteacherrevenue,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["revenuereportteacher", from, to],
    queryFn: async () => teacherWiseRevenueReportApi(from, to),
  });

  useEffect(() => {
    if (reportteacherrevenue) {
      setListFee(reportteacherrevenue);
    }
  }, [reportteacherrevenue]);

  useEffect(() => {
    if (reportteacherrevenue) {
      const batches: RootObject[] = reportteacherrevenue
        ?.sort((a, b) => b.revenue - a.revenue)
        .slice(0, 7)
        ?.map((item, index) => ({
          value: item?.revenue,
          name: `${item?.first_name} ${item?.last_name}`,
        }));
      setBatchItems(batches);
    }
  }, [reportteacherrevenue]);

  return (
    <div>
      {!isUserListLoading ? (
        <div>
          {batchitems.length > 0 ? (
            <HorizontalBar data={batchitems} nameKey="Revenue" />
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500 h-[380px]">
              No data.
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[380px]">
          <Loader2 className="animate-spin " />
        </div>
      )}
    </div>
  );
};

export default TeacherWiseRevenue;
