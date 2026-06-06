import { getStudentByCourse } from "@/api/StudentsByCourse";
import HorizontalBar from "@/app/Components/HorizontalBar";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type BarDataType = {
  name: string;
  value: number;
};
export interface StudentByCourseType {
  success: boolean;
  payload: StudentByCoursePayload[];
}

export interface StudentByCoursePayload {
  course_name: string;
  no_of_students: number;
}
type StudentsByCourseProps = {
  from: string;
  to: string;
};

function StudentsByCourse({ from, to }: StudentsByCourseProps) {
  const {
    data: StudentByCourseData,
    isLoading: isStudentByCourseLoading,
    error,
  } = useQuery({
    queryKey: ["studentByCourse", from, to],
    queryFn: async () => await getStudentByCourse(from, to),
    enabled: !!{ from, to },
  });
  const barData: BarDataType[] = StudentByCourseData
    ? StudentByCourseData.sort((a, b) => b.no_of_students - a.no_of_students)
        .slice(0, 7)
        .map((item) => ({
          name: item.course_name,
          value: item.no_of_students,
        }))
    : [];

  return (
    <div>
      {!isStudentByCourseLoading ? (
        <div>
          {barData.length > 0 ? (
            <HorizontalBar data={barData} nameKey="Students" />
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500 h-[380px]">
              No data.
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[380px]">
          <Loader2 className="  animate-spin " />
        </div>
      )}
    </div>
  );
}

export default StudentsByCourse;
