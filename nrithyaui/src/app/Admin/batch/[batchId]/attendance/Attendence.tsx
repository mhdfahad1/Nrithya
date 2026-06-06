"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import LateComponent from "./LateComponent";
import Navbar from "@/app/Components/Navbar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AddAttendanceType,
  AddStudentAttendancePayload,
  AddTeacherAttendancePayload,
  CalendarDataPayload,
  StudentFirst,
  Teacher,
  TeachersFirst,
} from "@/Interfaces/batchAttendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAttendanceStudent,
  addAttendanceTeacher,
  getCalendar,
  getClassAttendance,
} from "@/api/batchAttendance";

import Link from "next/link";
import UpdateStudentAttendance from "./UpdateStudentAttendance";

type ClassAttendanceT = {
  teacher: {
    teacher_name: string;
    teacher_id: number;
    teacher_attended?: boolean;
    teacher_late_by?: string;
    teacher_reason?: string;
    T_attendance_id?: number;
  };
  is_first: boolean;
  students: [
    {
      attendance_id: number;
      student_name: string;
      student_id: number;
      contact_number: string;
      attended?: boolean;
      late_by?: string;
      reason?: string;
    }
  ];
  batch: {
    batch_id: number;
    batch_name: string;
  };
};

type AttendanceProps = {
  params: { batchId: number };
  calendar: string;
};
function Attendance({ params, calendar }: AttendanceProps) {
  const [isFirst, setIsFirst] = useState<boolean>();
  const [getClassAttendanceData, setGetClassAttendanceData] =
    useState<ClassAttendanceT>();
  const [calendarById, setCalendarById] = useState(calendar);

  useEffect(() => {
    if (calendar) {
      setCalendarById(calendar);
    } else {
      setCalendarById(new Date().toISOString().slice(0, 10));
    }
  }, [calendar]);

  const form = useForm<AddAttendanceType>({
    defaultValues: {
      batch_id: params.batchId,
      date: "",
      attendance: [
        {
          student_id: 0,
          attended: false,
          late_by: "",
          reason: "",
          student_name: "",
          contact_number: "",
          attendance_id: 0,
        },
      ],
      teacher_attended: false,
      teacher_id: 0,
      teacher_lateBy: "",
      teacher_remarks: "",
      T_attendance_id: 0,
    },
  });
  const { register, control, setValue, getValues } = form;
  const { fields } = useFieldArray({
    name: "attendance",
    control,
  });

  // add student

  const onAddStudentAttendance = useMutation({
    mutationFn: async (data: AddAttendanceType) => {
      let payload: AddStudentAttendancePayload;
      if (data !== undefined) {
        payload = {
          batch_id: data.batch_id,
          date: calendarDataById ? calendarDataById.date : "",
          start_time: calendarDataById ? calendarDataById?.start_time : "",
          end_time: calendarDataById ? calendarDataById?.end_time : "",
          attendance: data?.attendance.map((item) => ({
            student_id: item?.student_id,
            attended: item?.attended,
            late_by: item?.late_by,
            reason: item?.reason,
          })),
        };

        return await addAttendanceStudent(payload);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Attendance marked successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["StudentAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: " Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  // add teacher
  const queryClient = useQueryClient();
  const onAddTeacherAttendance = useMutation({
    mutationFn: async (data: AddAttendanceType) => {
      const payload: AddTeacherAttendancePayload = {
        attended: data.teacher_attended,
        date: calendarDataById ? calendarDataById.date : "",
        teacher_id: data.teacher_id,
        batch_id: data.batch_id,
        late_by: data.teacher_lateBy,
        reason: data.teacher_remarks,
        start_time: calendarDataById ? calendarDataById?.start_time : "",
        end_time: calendarDataById ? calendarDataById?.end_time : "",
      };

      return await addAttendanceTeacher(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Attendance marked successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: " Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  function onSubmit(data: AddAttendanceType) {
    if (isFirst) {
      onAddTeacherAttendance.mutate(data);
      onAddStudentAttendance.mutate(data);
    }
  }
  //get Calendar
  const { data: calendarDataById } = useQuery({
    queryKey: ["calendarById", calendarById],
    queryFn: async () => await getCalendar(calendarById),
    enabled: !!calendarById,
  });
  const [getCalendarData, setGetCalendarData] = useState<CalendarDataPayload>();
  useEffect(() => {
    if (calendarDataById) {
      setGetCalendarData(calendarDataById);
    }
  }, [calendarDataById]);

  // GET CLASS
  const { data: classAttendanceData, isLoading } = useQuery({
    queryKey: ["classAttendance", calendarById],
    queryFn: async () =>
      await getClassAttendance(
        `${params.batchId}`,
        getCalendarData ? getCalendarData?.date : "",
        getCalendarData ? getCalendarData?.start_time : "",
        getCalendarData ? getCalendarData?.end_time : ""
      ),
    enabled:
      !!getCalendarData &&
      getCalendarData?.date !== "" &&
      getCalendarData?.start_time !== "" &&
      getCalendarData?.end_time !== "",
  });

  useEffect(() => {
    if (classAttendanceData) {
      const attendanceData = {
        teacher: (() => {
          if (isTeacher(classAttendanceData.teacher)) {
            return {
              teacher_name: `${classAttendanceData?.batch?.teachers?.first_name} ${classAttendanceData?.batch?.teachers?.last_name}`,
              teacher_id: classAttendanceData?.batch?.teachers?.teacher_id,
              teacher_attended: classAttendanceData?.teacher?.attended,
              teacher_late_by:
                classAttendanceData?.teacher?.late_by || undefined,
              teacher_reason: classAttendanceData?.teacher?.reason || undefined,
              T_attendance_id: classAttendanceData?.teacher?.id || undefined,
            };
          } else {
            return {
              teacher_name: `${classAttendanceData?.batch?.teachers?.first_name} ${classAttendanceData?.batch?.teachers?.last_name}`,
              teacher_id: classAttendanceData?.batch?.teachers?.teacher_id,
            };
          }
        })(),
        is_first: classAttendanceData.is_first,
        batch: {
          batch_id: classAttendanceData?.batch?.batch_id,
          batch_name: classAttendanceData?.batch?.batch_name,
        },
        students: classAttendanceData?.students.map((item) => {
          if (isStudent(item)) {
            return {
              attendance_id: item.id,
              student_name: `${item.students?.first_name} ${item.students?.last_name}`,
              student_id: item.students?.student_id,
              contact_number: item?.students?.whatsapp_number,
              attended: item?.attended,
              late_by: item?.late_by,
              reason: item?.reason,
            };
          } else {
            return {
              student_name: `${item?.first_name} ${item?.last_name}`,
              student_id: item.student_id,
              contact_number: item.whatsapp_number,
            };
          }
        }),
      };
      setGetClassAttendanceData(attendanceData as ClassAttendanceT);
    }
  }, [classAttendanceData]);
  useEffect(() => {
    if (getClassAttendanceData !== undefined) {
      setIsFirst(getClassAttendanceData?.is_first);
    }
  }, [getClassAttendanceData]);

  useEffect(() => {
    if (getClassAttendanceData !== undefined) {
      if (isFirst) {
        const initialValues = getClassAttendanceData?.students.map((item) => ({
          student_name: item.student_name,
          contact_number: item?.contact_number,
          student_id: item?.student_id,
          attended: false,
          late_by: "",
          reason: "",
          attendance_id: item.attendance_id,
        }));
        setValue("attendance", initialValues);
      } else {
        const initialValues = getClassAttendanceData?.students.map((item) => ({
          student_name: item.student_name,
          contact_number: item?.contact_number,
          student_id: item?.student_id,
          attended: item.attended || false,
          late_by: "",
          reason: "",
          attendance_id: item.attendance_id,
        }));
        setValue("attendance", initialValues);
        setValue("teacher_id", getClassAttendanceData.teacher.teacher_id);
      }
    }
  }, [getClassAttendanceData, setValue, isFirst]);
  // is student function
  const isStudent = (item: Teacher | StudentFirst) => {
    return "attended" in item;
  };
  const isTeacher = (item: Teacher | TeachersFirst) => {
    return "id" in item;
  };

  return (
    <>
      <Navbar name="Attendance" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-3 p-4 sm:px-6 sm:py-0md:gap-8">
            <div className="flex justify-between  mt-5 p-4 pb-0">
              <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                  {getClassAttendanceData !== undefined ? (
                    <h3 className="text-xl font-bold text-[#75172F]">
                      {getClassAttendanceData?.batch.batch_name}
                    </h3>
                  ) : null}
                </div>
                <div>
                  <h3>
                    Date :{" "}
                    <span className="text-md font-bold ">
                      {calendarDataById?.date}
                    </span>{" "}
                  </h3>
                </div>
              </div>
              <div className="flex gap-2 items-start ">
                {getClassAttendanceData?.is_first ? (
                  <Link
                    href={`/Admin/compensation/batch/AddBatch?calendar_id=${calendar}`}
                  >
                    <Button
                      variant={"outline"}
                      className=" text-[#75172F] text-sm flex gap-2 border border-[#75172F] p-2 rounded-lg hover:bg-[#75172F] hover:text-white"
                    >
                      Compensation By Batch
                    </Button>
                  </Link>
                ) : (
                  ""
                )}
                <Link
                  href={`/Admin/compensation/student/AddCompensationStudent?calendar_id=${calendar}`}
                >
                  <Button
                    variant={"outline"}
                    className=" text-[#75172F] text-sm flex gap-2 border border-[#75172F] p-2 rounded-lg hover:bg-[#75172F] hover:text-white"
                  >
                    Compensation By Student
                  </Button>
                </Link>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="flex gap-2 ml-4 items-baseline">
                  {getClassAttendanceData !== undefined ? (
                    <h3 className="text-sm font-bold flex">
                      <UserCircle className="h-4 w-4 mr-2 " />
                      {getClassAttendanceData?.teacher?.teacher_name}
                    </h3>
                  ) : null}
                  {isFirst ? (
                    <Checkbox
                      onCheckedChange={() => {
                        setValue(
                          `teacher_attended`,
                          !getValues("teacher_attended")
                        );
                      }}
                    />
                  ) : (
                    <Checkbox
                      checked={
                        getClassAttendanceData?.teacher?.teacher_attended
                      }
                      className="mt-1"
                      onCheckedChange={() => {
                        setValue(
                          `teacher_attended`,
                          !getValues("teacher_attended")
                        );
                      }}
                    />
                  )}
                  {isFirst ? (
                    <LateComponent
                      name={`${getClassAttendanceData?.teacher?.teacher_name}`}
                      register={register}
                      viewType="teacher"
                    />
                  ) : getClassAttendanceData?.teacher.teacher_attended !==
                      undefined && getClassAttendanceData ? (
                    <UpdateStudentAttendance
                      name={`${getClassAttendanceData?.teacher?.teacher_name}`}
                      viewType="teacher"
                      id={getClassAttendanceData?.teacher?.T_attendance_id}
                      check={getClassAttendanceData?.teacher?.teacher_attended}
                      late_by={getClassAttendanceData?.teacher?.teacher_late_by}
                      reason={getClassAttendanceData?.teacher?.teacher_reason}
                    />
                  ) : null}
                </div>
                <div className="">
                  {!isLoading ? (
                    <Card className="p-4 w-full min-w-[100%]">
                      <CardContent>
                        <div className="">
                          <div
                            id="course"
                            className=" w-[100%] shadow appearance-none border-none rounded   text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <FormField
                              control={form.control}
                              name="attendance"
                              render={() => (
                                <FormItem className="border-2 ">
                                  <div className="grid grid-cols-4 ">
                                    <FormLabel className="text-sm bg-slate-400 text-white border p-2 text-center">
                                      Student Name
                                    </FormLabel>
                                    <FormLabel className="text-sm bg-slate-400 text-white border p-2 text-center">
                                      Contact no
                                    </FormLabel>
                                    <FormLabel className="text-sm bg-slate-400 text-white border p-2 text-center">
                                      Attendance
                                    </FormLabel>
                                    <FormLabel className="text-sm bg-slate-400 text-white border p-2 text-center">
                                      Action
                                    </FormLabel>
                                  </div>
                                  {getClassAttendanceData?.students?.map(
                                    (item, index) => (
                                      <div
                                        key={index}
                                        className="grid grid-cols-4 "
                                      >
                                        <FormLabel className="text-sm font-normal border p-2">
                                          {item.student_name}{" "}
                                        </FormLabel>
                                        <FormLabel className="font-sm border p-2 font-normal">
                                          {item.contact_number}
                                        </FormLabel>
                                        <FormControl className="border p-2">
                                          <div className="flex justify-center ">
                                            {!isFirst ? (
                                              <>
                                                <Checkbox
                                                  key={index}
                                                  checked={item.attended}
                                                  onCheckedChange={() =>
                                                    setValue(
                                                      `attendance.${index}.attended`,
                                                      !getValues(
                                                        `attendance.${index}.attended`
                                                      )
                                                    )
                                                  }
                                                />
                                              </>
                                            ) : (
                                              <Checkbox
                                                onCheckedChange={() =>
                                                  setValue(
                                                    `attendance.${index}.attended`,
                                                    !getValues(
                                                      `attendance.${index}.attended`
                                                    )
                                                  )
                                                }
                                              />
                                            )}
                                          </div>
                                        </FormControl>
                                        <FormLabel className="border p-2">
                                          <div className="text-center">
                                            {isFirst ? (
                                              <LateComponent
                                                name={`${item.student_name}`}
                                                register={register}
                                                index={index}
                                                viewType="student"
                                              />
                                            ) : item ? (
                                              <UpdateStudentAttendance
                                                name={item.student_name}
                                                viewType="student"
                                                id={item.attendance_id}
                                                check={
                                                  item.attended !== undefined &&
                                                  item.attended
                                                }
                                                late_by={item.late_by}
                                                reason={item.reason}
                                              />
                                            ) : null}
                                          </div>
                                        </FormLabel>
                                      </div>
                                    )
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end mt-2">
                            {isFirst ? (
                              <Button
                                type="submit"
                                variant={"primary"}
                                disabled={
                                  getClassAttendanceData &&
                                  getClassAttendanceData?.students?.length <= 0
                                }
                              >
                                Mark Attendance
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex items-center justify-center h-[100vh]">
                      <Loader2 className="  animate-spin " />
                    </div>
                  )}
                  <Toaster />
                </div>
              </form>
            </Form>
          </main>
        </div>
      </div>
    </>
  );
}

export default Attendance;
