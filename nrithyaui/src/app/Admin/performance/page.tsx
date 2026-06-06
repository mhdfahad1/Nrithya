"use client";
import React from "react";
import Navbar from "@/app/Components/Navbar";
import PerformanceList from "@/app/super-admin/reports/performance/PerformanceList";

const page = () => {
  return (
    <>
      <Navbar name="Performance" />
      <div>
        <PerformanceList />
      </div>
    </>
  );
};

export default page;
