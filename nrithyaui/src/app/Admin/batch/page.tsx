import React from "react";
import ListBatch from "./listBatch";
import Navbar from "@/app/Components/Navbar";
const page = () => {
  return (
    <div>
      <Navbar name="Batch" />
      <ListBatch />
    </div>
  );
};

export default page;
