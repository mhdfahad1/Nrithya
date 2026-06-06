"use client";
import Navbar from "@/app/Components/Navbar";
import React, { useState } from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowRightIcon, CalendarIcon } from "lucide-react";
import StudentsByCourse from "./StudentsByCourse";
import StudentsHandledByTeacher from "./StudentsHandledByTeacher";
import TeacherWorkHour from "./TeacherWorkHour";
import EnquirycountChart from "./EnquirycountChart";
import StudentByCourseReport from "../reports/StudentByCourseReport";
import StudentsHandledByTeacherReport from "../reports/StudentsHandledByTeacherReport";
import TeacherWorkHourReport from "../reports/TeacherWorkHourReport";
import TeacherWiseRevenue from "./TeacherWiseRevenue";
import EnquiryMatrix from "@/app/super-admin/dashboard/EnquiryMatrix";
import RevenueGrowth from "./RevenueGrowth";
import NumberOfStudents from "./NumberOfStudents";
import NumberOfStudentDetail from "./NumberOfStudentDetail";
import RevenueGrowthDetails from "./RevenueGrowthDetails";

import TeacherWiseRevenueReport from "../reports/TeacherWiseRevenueReport";
import EnquiryCountList from "@/app/Components/EnquiryCountList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

function DashboardLayout() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -180),
    to: new Date(),
  });
  const [open, setOpen] = useState(false);
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const formattedFromDate = date?.from ? formatDate(date.from) : "";
  const formattedToDate = date?.to ? formatDate(date.to) : "";

  return (
    <>
      <Navbar name="Dashboard" />
      <div className="grid grid-cols-2 gap-5 px-12 py-5">
        <div className="col-span-2 p-3 pr-0 flex justify-self-end gap-2">
          <div className={cn("grid gap-2")}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  onClick={() => setOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Select
                  onValueChange={(value) => {
                    setOpen(false);
                    switch (value) {
                      case "1":
                        setDate({
                          from: addDays(new Date(), -30),
                          to: new Date(),
                        });
                        break;
                      case "3":
                        setDate({
                          from: addDays(new Date(), -90),
                          to: new Date(),
                        });
                        break;
                      case "6":
                        setDate({
                          from: addDays(new Date(), -182),
                          to: new Date(),
                        });
                        break;
                      case "12":
                        setDate({
                          from: addDays(new Date(), -365),
                          to: new Date(),
                        });
                        break;

                      default:
                        break;
                    }
                  }}
                >
                  <SelectTrigger className="bg-slate-500 text-white">
                    <SelectValue placeholder="Select a date range" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="3">3 month</SelectItem>
                    <SelectItem value="6">6 month</SelectItem>
                    <SelectItem value="12">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
                <div className="flex justify-end p-3 gap-2">
                  <Button
                    onClick={() => setOpen(false)}
                    variant={"outline"}
                    className="text-red-500 border-red-500"
                  >
                    close
                  </Button>
                  <Button onClick={() => setOpen(false)} variant={"primary"}>
                    Submit
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-8 col-span-2 shadow-lg ">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Enquiries</h1>
            <Link
              href={`/super-admin/reports/enquiry`}
              className="text-sm text-[#75172F] flex items-center hover:underline mb-3"
            >
              View Details <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <EnquiryMatrix from={formattedFromDate} to={formattedToDate} />
        </div>
        <div className="flex flex-col border-2 rounded-lg p-5 col-span-2  bg-white shadow-lg h-[500px]">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold mb-2">Revenue Growth</h1>
            <RevenueGrowthDetails
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>
          <RevenueGrowth from={formattedFromDate} to={formattedToDate} />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg h-[400px] gap-2">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Student Registration</h1>
            <NumberOfStudentDetail
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>
          <NumberOfStudents from={formattedFromDate} to={formattedToDate} />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg h-[400px]">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Customer Enquiries</h1>
            <EnquiryCountList
              dateFrom={formattedFromDate}
              dateTo={formattedToDate}
            />
          </div>
          <EnquirycountChart
            dateFrom={formattedFromDate}
            dateTo={formattedToDate}
          />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg gap-2">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">
              Courses by registered students
            </h1>
            <StudentByCourseReport
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>
          <StudentsByCourse from={formattedFromDate} to={formattedToDate} />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg gap-2">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Students handled by teachers </h1>
            <StudentsHandledByTeacherReport
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>

          <StudentsHandledByTeacher
            from={formattedFromDate}
            to={formattedToDate}
          />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg gap-2">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Teacher wise revenue</h1>
            <TeacherWiseRevenueReport
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>
          <TeacherWiseRevenue from={formattedFromDate} to={formattedToDate} />
        </div>
        <div className="flex flex-col border-2 bg-white rounded-lg p-5 shadow-lg gap-2">
          <div className="flex justify-between">
            <h1 className="text-sm font-bold">Teacher work hour/week</h1>
            <TeacherWorkHourReport
              from={formattedFromDate}
              to={formattedToDate}
            />
          </div>
          <TeacherWorkHour from={formattedFromDate} to={formattedToDate} />
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
