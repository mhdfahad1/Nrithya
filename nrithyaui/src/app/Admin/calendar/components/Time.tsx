import React from "react";

const Time = (props:{time:string}) => {
  return (
    <p className="text-[11px] text-[#70757a] w-[50px] font-bold text-sm flex justify-end pr-1">
      {props.time}
    </p>
  );
};

export default Time;
