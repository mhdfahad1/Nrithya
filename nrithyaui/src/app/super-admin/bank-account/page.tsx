"use client";
import Navbar from "@/app/Components/Navbar";
import React from "react";
import AccountList from "./AccountList";

const page = () => {
  return (
    <>
      <Navbar name="Bank Account" />

      <AccountList />
    </>
  );
};

export default page;
