import React from "react";
import AssignmentId from "./BatchAssignmentList";
type Props = {
  params: { AssignmentId: string };
};
const page = ({ params }: Props) => {
  return (
    <div>
      <AssignmentId AssignmentId={params.AssignmentId} />
    </div>
  );
};

export default page;
