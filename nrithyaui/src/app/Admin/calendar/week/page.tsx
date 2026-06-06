"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BatchCard from "../components/BatchCard";
import Empty from "../components/Empty";
import Navbar from "@/app/Components/Navbar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetWeekCalendar } from "@/api/calendar";
import { Payload } from "@/Interfaces/calendarWeek";
import ComboboxDemo from "@/app/table/combox";
import { RotateCcw } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { getTeacherComboBox } from "@/api/assignment";
interface CourseType {
  value: string;
  label: string;
}
type FilterType = {
  teacher: string;
};
type StartDate = {
  date: string;
};
export type PaylodCalendarType = {
  dates: { date: string }[];
};

const Page = () => {
  const [isDisable, setIsdisable] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const form = useForm<FilterType>();
  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const [teacher, setTeacher] = useState<CourseType[]>([]);
  const TeacherValue = useWatch({ control, name: "teacher" });
  const [currentWeekDates, setCurrentWeekDates] = useState<StartDate[]>([]);
  const [resetFilter, setResetFilter] = useState<boolean>(true);

  const [weeks, setWeeks] = useState<Payload[][]>();

  const onCalendarView = useMutation({
    mutationKey: ["calendarWeek", []],
    mutationFn: async () => {
      const payload: PaylodCalendarType = {
        dates: currentWeekDates.map((item) => ({
          date: item.date,
        })),
      };
      const result = await GetWeekCalendar(payload, TeacherValue);
      setWeeks(result);
    },
  });

  useEffect(() => {
    if (currentWeekDates) {
      onCalendarView.mutate();
    }
  }, [currentWeekDates, TeacherValue]);

  const getNextWeekDates = () => {
    const nextWeekStartDate = new Date(startDate);
    nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);
    setStartDate(nextWeekStartDate);
  };
  const getpreviousWeekDates = () => {
    const nextWeekStartDate = new Date(startDate);
    nextWeekStartDate.setDate(nextWeekStartDate.getDate() - 7);
    setStartDate(nextWeekStartDate);
  };

  const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const currentDate = new Date(startDate);
    const firstDayOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    ); // Adjust start date to Sunday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(formatDate(new Date(firstDayOfWeek)));
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 1);
    }
    const formattedDate = dates.map((date) => ({ date }));
    setCurrentWeekDates(formattedDate);
  }, [startDate]);
  const { data: teacherList, isLoading: isLoading3 } = useQuery({
    queryKey: ["teacher"],
    queryFn: async () => await getTeacherComboBox(),
  });
  useEffect(() => {
    if (teacherList) {
      const teacher: CourseType[] = teacherList
        ? teacherList.data.map((item) => ({
            value: String(item?.teacher_id),
            label: `${item.first_name}${
              item.last_name !== "" ? ` ${item.last_name}` : ""
            }`,
          }))
        : [];

      setTeacher(teacher);
    }
  }, [teacherList]);
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  return (
    <>
      <Navbar name="Calendar" />
      <div className="p-4">
        <div className="flex justify-between pb-5">
          <div className="flex gap-7 items-end">
            <div>
              <Button
                disabled={isDisable === -1}
                onClick={() => {
                  setIsdisable(isDisable - 1);
                  getpreviousWeekDates();
                }}
                className="rounded-3xl bg-white hover:bg-slate-400"
              >
                <i className="fa-solid fa-arrow-left text-black text-xl"></i>
              </Button>
            </div>
            <div className="flex items-center">
              <p className="pb-2 text-xl">
                {new Date(currentWeekDates[0]?.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
            <div>
              <Button
                disabled={isDisable === 1}
                onClick={() => {
                  setIsdisable(isDisable + 1);
                  getNextWeekDates();
                }}
                className="rounded-3xl bg-white hover:bg-slate-400"
              >
                <i className="fa-solid fa-arrow-right text-black text-xl"></i>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[150px]">
                <ComboboxDemo
                  field="teacher"
                  setValue={setValue}
                  frameworks={teacher}
                  name="Teacher"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
              </div>
              <Button
                size="sm"
                className="h-9 gap-1 "
                style={{ backgroundColor: "lightgray" }}
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" color="#75172F" />
                <span style={{ color: "#75172F" }}>Reset</span>
              </Button>
            </div>
          </div>
          <div className="flex gap-5 pt-5">
            <Link href={"/Admin/calendar/week"}>
              <Button className="bg-black text-white border hover:text-white">
                Week
              </Button>
            </Link>
            <Link href={"/Admin/calendar"}>
              <Button className="bg-white text-black border hover:text-white">
                Day
              </Button>
            </Link>
          </div>
        </div>

        {/* <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr] min-h-[100vh]">
          <div className="">
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[0]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[0]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[0]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[1]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[1]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[1]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[2]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[2]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[2]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[3]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[3]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[3]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[4]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[4]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[4]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[5]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[5]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[5]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[6]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[6]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[6]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} />
                  </div>
                ))}
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr] min-h-[100vh]">
          {/* <div>fg</div> */}
          <div className="">
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[0]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[0]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[0]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[1]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[1]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[1]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[2]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[2]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[2]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[3]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[3]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[3]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[4]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[4]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[4]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[5]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[5]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="border-r-2 p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[5]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className=" flex-row text-center">
              <p className=" text-[#70757A] text-base">
                {new Date(currentWeekDates[6]?.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                )}
              </p>
              <p className="text-black rounded-3xl flex justify-center text-2xl">
                {new Date(currentWeekDates[6]?.date).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="p-1 flex flex-col gap-3 min-h-[90vh]">
              {weeks &&
                weeks[6]?.map((item) => (
                  <div key={item.calendar_id}>
                    <BatchCard item={item} width={"150px"} isTiming={true} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
