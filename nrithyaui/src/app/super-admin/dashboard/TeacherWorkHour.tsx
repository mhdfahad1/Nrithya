"use client";
import { getStudentsHandledByTeacher } from "@/api/studentsHandledByTeacher";
import HorizontalBar from "@/app/Components/HorizontalBar";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
type BarDataType = {
  name: string;
  value: number;
};
export interface StudentsHandledByTeacherType {
  success: boolean;
  payload: Payload[];
}

interface Payload {
  teacher_id: number;
  first_name: string;
  last_name: string;
  revenue: number;
  students: number;
  working_hours: number;
}
type TeacherWorkHourProps = {
  from: string;
  to: string;
};

function TeacherWorkHour({ from, to }: TeacherWorkHourProps) {
  const {
    data: TeacherWorkHourData,
    isLoading: isTeacherWorkHHourLoading,
    error,
  } = useQuery({
    queryKey: ["TeacherWorkHour", from, to],
    queryFn: async () => await getStudentsHandledByTeacher(from, to),
    enabled: !!{ from, to },
  });
  const barData: BarDataType[] = TeacherWorkHourData
    ? TeacherWorkHourData.sort((a, b) => b.working_hours - a.working_hours)
        .slice(0, 7)
        .map((item) => ({
          name: `${item.first_name} ${item.last_name}`,
          value: item.working_hours,
        }))
    : [];
  return (
    <div>
      {!isTeacherWorkHHourLoading ? (
        <div>
          {barData.length > 0 ? (
            <HorizontalBar data={barData} nameKey="Hours" />
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500 h-[380px]">
              No data.
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[380px] w-[100%]">
          <Loader2 className="  animate-spin " />
        </div>
      )}
    </div>
  );
}

export default TeacherWorkHour;
