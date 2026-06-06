"use client";
import React from "react";
import EnquiryList from "./enquiryList";
import Navbar from "@/app/Components/Navbar";

const enquiryListPage = () => {
  return (
    <div>
      <Navbar name="Enquiry" />
      <EnquiryList />
    </div>
  );
};

export default enquiryListPage;
