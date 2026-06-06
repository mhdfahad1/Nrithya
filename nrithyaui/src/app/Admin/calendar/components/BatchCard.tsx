import { Payload } from "@/Interfaces/calendar";
import { Timer } from "lucide-react";
import Link from "next/link";
import React from "react";

const BatchCard = (props: {
  width: string;
  item: Payload;
  isTiming: boolean;
}) => {
  function convertToAMPM(time24: string) {
    var hour = parseInt(time24.substring(0, 2));
    var minute = time24.substring(3, 5);
    var AMPM = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return hour + ":" + minute + AMPM;
  }
  return (
    <div
      className={
        props.item.compensated
          ? `bg-[#f7cdd8] border text-black rounded-lg p-1 shadow-lg`
          : props.item.batches.current_strength === 0
          ? `bg-blue-200 border text-black rounded-lg p-1 shadow-lg`
          : `bg-white border text-black rounded-lg p-1 shadow-lg`
      }
      style={{ width: props.width }}
    >
      <div className="flex flex-col gap-1">
        <Link
          href={`/Admin/batch/${props.item.batches.batch_id}?calendar_id=${props.item.calendar_id}`}
        >
          <div className="grid grid-cols-[1fr,32px]">
            <p
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                wordBreak: "break-all",
              }}
              className="text-[13px] pl-1 font-bold text-left cursor-pointer hover:text-blue-600 hover:underline break-word"
            >
              {props.item.batches.batch_name.slice(0, 42)}
            </p>
            <p className="bg-[#75172F] h-[23px] text-center rounded-lg text-white text-sm mb-1">
              {props.item.batches.current_strength}
            </p>
          </div>
        </Link>

        <div className="flex justify-between items-center">
          <p className="text-xs  pl-1">{`${props.item.batches.teachers.first_name} ${props.item.batches.teachers.last_name}`}</p>
          <a
            href={props.item.batches.whatsapp_link}
            target="_blank"
            className="cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-xl font-semibold text-green-600"></i>
          </a>
        </div>
        {props.isTiming && (
          <div className="flex gap-1 items-center">
            <Timer size={17} color="#75172F" />
            <p className="text-[11px]">{`${convertToAMPM(
              props.item.start_time
            )}-${convertToAMPM(props.item.end_time)}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchCard;
