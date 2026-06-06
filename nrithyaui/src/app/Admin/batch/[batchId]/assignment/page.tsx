import React from "react";
import ListBatchAssignment from "./listBatchAssignment";
type Props = {
  params: { batchId: string };
};

const Page = ({ params }: Props) => {
  return (
    <div>
      <ListBatchAssignment params={params} />
    </div>
  );
};

export default Page;
