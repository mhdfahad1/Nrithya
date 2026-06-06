import { getNumberOfStudents } from "@/api/numberOfStudents";
import Linechart from "@/app/Components/LineChart";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LineDataItem {
  month: string;
  students: number;
}

const NumberOfStudents = ({ from, to }: { from: string; to: string }) => {
  const [lineData, setLineData] = useState<LineDataItem[]>([]);

  // Number of students getting
  const { data: NoOfStudentDatas, isLoading } = useQuery({
    queryKey: ["numberOfStudents", from, to],
    queryFn: async () => getNumberOfStudents(from, to),
  });

  useEffect(() => {
    const updatedLineData: LineDataItem[] =
      NoOfStudentDatas?.flatMap((NoOfStudentData) => ({
        month: `${NoOfStudentData?.month} ${NoOfStudentData?.year}`,
        students: NoOfStudentData?.students,
      })) || [];

    setLineData(updatedLineData);
  }, [NoOfStudentDatas]);

  return (
    <>
      {isLoading ? (
        <div className="flex h-[100%] w-[100%] justify-center items-center">
          <Loader2 className=" animate-spin " />
        </div>
      ) : (
        <Linechart data={lineData} LineDataKey="students" XDataKey="month" />
      )}
    </>
  );
};

export default NumberOfStudents;
