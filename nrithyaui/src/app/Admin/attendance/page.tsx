import React from "react";
import AttendanceList from "./AttendanceList";
import Navbar from "@/app/Components/Navbar";

function page() {
  return (
    <div>
      <Navbar name="Attendance" />
      <AttendanceList />
    </div>
  );
}

export default page;
