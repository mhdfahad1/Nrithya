"use client";
import EnquiryList from "@/app/Admin/enquiry/enquiryList";
import Navbar from "@/app/Components/Navbar";
import React, { useState } from "react";

const EnquiryPage = () => {
  const [getRole, setRole] = useState<string>("");

  return (
    <div>
      <Navbar name="Enquiry List" setRole={setRole} />
      <EnquiryList getRole={getRole} />
    </div>
  );
};

export default EnquiryPage;
