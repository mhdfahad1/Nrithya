import React from "react";
import StudentDetail from "./studentDetail";
type Props = {
  params: { studentId: string };
};
const page = ({ params }: Props) => {
  return (
    <div>
      <StudentDetail studentId={params.studentId} />
    </div>
  );
};

export default page;
