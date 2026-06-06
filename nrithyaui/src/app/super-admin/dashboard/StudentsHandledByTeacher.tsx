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
  payload: StudentsHandledByTeacherPayload[];
}

export interface StudentsHandledByTeacherPayload {
  teacher_id: number;
  first_name: string;
  last_name: string;
  revenue: number;
  students: number;
  working_hours: number;
}
type StudentsHandledByTeacherProps = {
  from: string;
  to: string;
};
function StudentsHandledByTeacher({ from, to }: StudentsHandledByTeacherProps) {
  const {
    data: StudentsHandledByTeacherData,
    isLoading: isStudentsHandledByTeacherLoading,
    error,
  } = useQuery({
    queryKey: ["studentsHandledByTeacher", from, to],
    queryFn: async () => await getStudentsHandledByTeacher(from, to),
    enabled: !!{ from, to },
  });

  const barData: BarDataType[] = StudentsHandledByTeacherData
    ? StudentsHandledByTeacherData.sort((a, b) => b.students - a.students)
        .slice(0, 7)
        .map((item) => ({
          name: `${item.first_name} ${item.last_name}`,
          value: item.students,
        }))
    : [];
  return (
    <div>
      {!isStudentsHandledByTeacherLoading ? (
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

export default StudentsHandledByTeacher;
