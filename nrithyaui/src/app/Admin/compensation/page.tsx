"use client";
import React, { useEffect, useState } from "react";

import Navbar from "@/app/Components/Navbar";
import Compensation from "./Compensation";

function Page() {
  const [studentcom, setStudentCom] = useState("");
  useEffect(() => {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);
    const dateParam = urlParams.get("view");
    if (dateParam) {
      setStudentCom(dateParam);
    }
  }, []);
  return (
    <div>
      <Navbar name="Compensation" />
      <Compensation dateParam={studentcom} />
    </div>
  );
}

export default Page;
