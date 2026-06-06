"use client";
import React, { useEffect, useState } from "react";
import Attendance from "./Attendence";
type Props = {
  params: { batchId: number };
};
const Page = ({ params }: Props) => {
  const [calendar, setCalendar] = useState("");
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const dateParam = urlParams.get("calendar_id");
    if (dateParam) {
      setCalendar(dateParam);
    }
  }, []);

  return (
    <div>
      <Attendance params={params} calendar={calendar} />
    </div>
  );
};

export default Page;
