import Navbar from "@/app/Components/Navbar";
import React from "react";
import AttendanceReportList from "./AttendanceList";

const Page = () => {
  return (
    <div>
      <Navbar name="Attendance" />
      <AttendanceReportList />
    </div>
  );
};

export default Page;
