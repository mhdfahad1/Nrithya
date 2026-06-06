"use client";
import React from "react";
import PerformanceList from "./PerformanceList";
import Navbar from "@/app/Components/Navbar";

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
