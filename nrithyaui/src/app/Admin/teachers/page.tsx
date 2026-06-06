"use client";
import Navbar from "@/app/Components/Navbar";
import TeacherList from "./TeacherList";
import { useState } from "react";

const Page = () => {
  const [role, setRole] = useState<string>("");
  return (
    <div>
      <Navbar name="Teacher" setRole={setRole} />
      <TeacherList role={role} />
    </div>
  );
};

export default Page;
