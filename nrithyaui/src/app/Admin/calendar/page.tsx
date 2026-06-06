"use client";
import { GetWeekCalendar, GetWeekCalendarDownload } from "@/api/calendar";
import Navbar from "@/app/Components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Payload } from "@/Interfaces/calendar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BatchCard from "./components/BatchCard";
import Empty from "./components/Empty";
import Time from "./components/Time";
import { PaylodCalendarType } from "./week/page";
import ComboboxDemo from "@/app/table/combox";
import { getTeacherComboBox } from "@/api/assignment";
import { useForm, useWatch } from "react-hook-form";

interface CourseType {
  value: string;
  label: string;
}
type FilterType = {
  teacher: string;
};
const Page = () => {
  const [resetFilter, setResetFilter] = useState<boolean>(true);

  const [date, setDate] = useState("");
  const [next, setnext] = useState(0);
  const form = useForm<FilterType>();
  const { register, handleSubmit, reset, formState, setValue, control } = form;
  const [teacher, setTeacher] = useState<CourseType[]>([]);
  const TeacherValue = useWatch({ control, name: "teacher" });

  const [data, setData] = useState<Payload[][]>();
  function getCurrentDate() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + next);

    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-based
    const day = ("0" + currentDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  const onCalendarDayView = useMutation({
    mutationKey: ["calendarWeek"],
    mutationFn: async () => {
      const payload: PaylodCalendarType = {
        dates: [{ date: date }],
      };
      const result = await GetWeekCalendar(payload, TeacherValue);
      setData(result);
    },
  });

  new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  useEffect(() => {
    setDate(getCurrentDate);
  }, [date, next]);

  useEffect(() => {
    if (date) {
      onCalendarDayView.mutate();
    }
  }, [date, TeacherValue]);

  const onDownloadCalendar = useMutation({
    mutationFn: async () => {
      const payload: PaylodCalendarType = {
        dates: [{ date: date }],
      };
      return await GetWeekCalendarDownload(payload, TeacherValue);
    },
    onSuccess: (data) => {
      if (data) {
        const newBlob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ScheduledClasses.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {},
  });

  const { data: teacherList, isLoading: isLoading3 } = useQuery({
    queryKey: ["teacher"],
    queryFn: async () => await getTeacherComboBox(),
  });
  useEffect(() => {
    if (teacherList) {
      const teacher: CourseType[] = teacherList
        ? teacherList.data.map((item) => ({
            value: String(item?.teacher_id),
            label: `${item.first_name.trim()}${
              item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
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
        <div className="flex justify-between  pb-10">
          <div className="flex gap-7 items-end">
            <div>
              <Button
                disabled={next === -14}
                onClick={() => setnext(next - 1)}
                className="rounded-3xl bg-white hover:bg-slate-200"
              >
                <i className="fa-solid fa-arrow-left text-black text-xl"></i>
              </Button>
            </div>
            <div className="flex items-center">
              <p className="pb-2 text-xl">
                {new Date(date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  weekday: "short",
                })}
              </p>
            </div>
            <div>
              <Button
                disabled={next === 14}
                onClick={() => setnext(next + 1)}
                className="rounded-3xl bg-white hover:bg-slate-200"
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
          <div className="flex gap-28 pt-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    onClick={() => {
                      onDownloadCalendar.mutate();
                    }}
                    className=" p-3 rounded-md flex items-center h-9 gap-1 bg-white outline-[#39B16E] border text-sm font-medium text-[#39B16E] hover:bg-[#39B16E] hover:text-white"
                  >
                    <span className="sm:whitespace-nowrap ">Download</span>
                    <Download className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scheduled classes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex gap-5 ">
              <Link href={"/Admin/calendar/week"}>
                <Button className="bg-white text-black border hover:text-white">
                  Week
                </Button>
              </Link>
              <Link href={"/Admin/calendar"}>
                <Button className="bg-black text-white border hover:text-white">
                  Day
                </Button>{" "}
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[60px,1fr]">
          <div className="flex flex-col gap-[60px] border-r-2">
            <Time time="6AM" />
            <Time time="7AM" />
            <Time time="8AM" />
            <Time time="9AM" />
            <Time time="10AM" />
            <Time time="11AM" />
            <Time time="12PM" />
            <Time time="1PM" />
            <Time time="2PM" />
            <Time time="3PM" />
            <Time time="4PM" />
            <Time time="5PM" />
            <Time time="6PM" />
            <Time time="7PM" />
            <Time time="8PM" />
            <Time time="9PM" />
            <Time time="10PM" />
            <Time time="11PM" />
            <Time time="12AM" />
            <Time time="1AM" />
            <Time time="2AM" />
            <Time time="3AM" />
            <Time time="4AM" />
            <Time time="5AM" />
          </div>
          <div className="pt-2 flex flex-col overflow-x-scroll">
            <div className=" min-w-[100%] h-[80px] ">
              {/* <hr /> */}
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 6
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 6
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          item={item}
                          width={"220px"}
                          isTiming={false}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className="h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit ">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 7
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 7
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 8
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 8
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px] ">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 9
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 9
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 10
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 10
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 11
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 11
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 12
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 12
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 13
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 13
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 14
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 14
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 15
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 15
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 16
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 16
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 17
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 17
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 18
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 18
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 19
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 19
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 20
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 20
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 21
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 21
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 22
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 22
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 23
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 23
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 24
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 24
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 1
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 1
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 2
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 2
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 3
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 3
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 4
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 4
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className=" min-w-[100%] h-[80px]">
              <div className="p-1 flex gap-x-2 border-t-2 min-w-[100%] w-fit">
                {data &&
                data[0]?.filter(
                  (item) => Number(item.start_time.split(":")[0]) === 5
                ).length === 0 ? (
                  <Empty />
                ) : (
                  data &&
                  data[0]
                    ?.filter(
                      (item) => Number(item.start_time.split(":")[0]) === 5
                    )
                    .map((item) => (
                      <div key={item.calendar_id}>
                        <BatchCard
                          isTiming={false}
                          item={item}
                          width={"220px"}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
