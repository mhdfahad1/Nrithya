"use client";
import StudentList from "./studentList";
import Navbar from "@/app/Components/Navbar";

const Page = () => {
  return (
    <div>
      <Navbar name="Student" />
      <StudentList />
    </div>
  );
};

export default Page;
