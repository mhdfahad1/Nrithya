"use client";
const error = ({ error }: { error: Error }) => {
  return (
    <div className="text-[#75172f] flex items-center justify-center">
      {error.message}
    </div>
  );
};

export default error;
