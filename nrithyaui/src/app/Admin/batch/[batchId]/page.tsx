"use client";
import React, { useEffect, useState } from "react";
import ListBatchDetails from "./listBatchDetails";

type Props = {
  params: { batchId: string };
};

const Page = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const dateParam = urlParams.get("calendar_id");
    if (dateParam) {
      setId(dateParam);
    }
  }, []);
  return (
    <div>
      <ListBatchDetails batchId={params.batchId} calendar_id={id} />
    </div>
  );
};

export default Page;
