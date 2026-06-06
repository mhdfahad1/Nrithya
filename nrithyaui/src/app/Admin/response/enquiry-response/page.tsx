import React from "react";
import EnquiryResponseList from "./enquiryResponse";
import Navbar from "@/app/Components/Navbar";

const page = () => {
  return (
    <div>
      <Navbar name="EnquiryResponse" />
      <EnquiryResponseList />
    </div>
  );
};

export default page;
