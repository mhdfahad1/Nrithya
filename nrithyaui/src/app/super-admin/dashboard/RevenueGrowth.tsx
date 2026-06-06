import { getRevenueGrowth } from "@/api/revenueGrowth";
import Linechart from "@/app/Components/LineChart";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LineDataItem {
  month: string;
  revenue: number;
}

const RevenueGrowth = ({ from, to }: { from: string; to: string }) => {
  const [lineData, setLineData] = useState<LineDataItem[]>([]);

  // Revenue Growth getting
  const { data: RevenueGrowthValues, isLoading } = useQuery({
    queryKey: ["revenueGrowth", from, to],
    queryFn: async () => getRevenueGrowth(from, to),
  });

  useEffect(() => {
    const updatedLineData: LineDataItem[] =
      RevenueGrowthValues?.flatMap((RevenueGrowthValue) => ({
        month: `${RevenueGrowthValue?.month} ${RevenueGrowthValue?.year}`,
        revenue: RevenueGrowthValue?.revenue,
      })) || [];

    setLineData(updatedLineData);
  }, [RevenueGrowthValues]);

  return (
    <>
      {isLoading ? (
        <div className="flex h-[100%] w-[100%] justify-center items-center">
          <Loader2 className=" animate-spin " />
        </div>
      ) : (
        <Linechart data={lineData} LineDataKey="revenue" XDataKey="month" />
      )}
    </>
  );
};

export default RevenueGrowth;
