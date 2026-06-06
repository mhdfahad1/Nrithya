"use client";
import React, { useState } from "react";
import ListBatch from "../../../Admin/batch/listBatch";
import Navbar from "@/app/Components/Navbar";

const BatchListPage = () => {
  const [getRole, setRole] = useState<string>("");
  return (
    <div>
      <Navbar name="Batch" setRole={setRole} />
      <ListBatch getRole={getRole} />
    </div>
  );
};

export default BatchListPage;
