import { Badge } from "@/components/ui/badge";
import { Batches } from "@/Interfaces/Student";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export type DataType = {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  alternative_number: string;
  whatsapp_number: string;
  status: string;
  registration_date: string;

  batches: Batches[];
};

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "reg_no",
    header: "Reg No",
  },
  {
    accessorKey: "first_name",
    header: "Student Name",
    cell: ({ row }) => {
      return `${row.original.first_name} ${row.original.last_name}`;
    },
  },
  {
    accessorKey: "whatsapp_number",
    header: "Whatsapp No",
  },
  {
    accessorKey: "alternative_number",
    header: "Alternative No",
  },
  {
    accessorKey: "registration_date",
    header: "Registration Date",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-left flex flex-col items-start gap-5">
          <p className="">
            {new Date(data?.registration_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "batch",
    header: "Batch Detail",
    cell: ({ row }) => {
      const data = row.original;
      return (
        // <div className="text-left flex flex-col items-start">
        //   {data?.batches?.map((courseBatch, index) => (
        //     <Badge
        //       variant="outline"
        //       className="text-[#75172F] border-[#75172F] m-1"
        //       key={index}
        //     >
        //       <p className="flex justify-center items-center gap-2">
        //         <i className="fa-solid fa-users"></i> {courseBatch?.batch_name}
        //         &nbsp;
        //       </p>
        //       <div className="text-[#39B16E]  m-1" key={index}>
        //         <p className="flex gap-2 items-center">
        //           <i className="fa-solid fa-book"></i>
        //           {courseBatch?.courses?.course_name}
        //         </p>
        //       </div>
        //       <div
        //         className="text-[#75172F] flex gap-2 items-center"
        //         key={index}
        //       >
        //         <i className="fa-solid fa-chalkboard-user"></i>
        //         {`${courseBatch?.teachers.first_name} ${courseBatch?.teachers.last_name}`}
        //       </div>
        //     </Badge>
        //   ))}
        // </div>

        <div className="text-left flex flex-col items-start">
          {data?.batches?.map((courseBatch, index) => (
            <Badge
              variant="outline"
              className={
                courseBatch.batch_status === "ongoing"
                  ? `text-[#75172F] border-[#75172F] m-1  ${
                      courseBatch.status === "expired"
                        ? "bg-red-100 text-[12px]"
                        : ""
                    } `
                  : "text-[red] border-[#75172F] m-1 text-[12px]"
              }
              key={index}
            >
              <p className="flex gap-2 items-center text-[12px]">
                <i className="fa-solid fa-users"></i> {courseBatch?.batch_name}
              </p>
              <div
                // variant="outline"
                className="text-[#39B16E] m-1"
                key={index}
              >
                <p className="flex gap-2 items-center text-[12px]">
                  <i className="fa-solid fa-book"></i>
                  {courseBatch?.courses?.course_name}
                </p>
              </div>
              <div
                className="text-[#75172F] flex gap-2 items-center"
                key={index}
              >
                <i className="fa-solid fa-chalkboard-user text-[12px]"></i>
                {`${courseBatch?.teachers.first_name} ${courseBatch?.teachers.last_name}`}
              </div>
            </Badge>
          ))}
        </div>

        // <div className="text-left flex flex-col items-start">
        //   {data?.batches?.map((courseBatch, index) => (
        //     <Badge
        //       variant="outline"
        //       className={
        //         courseBatch.batch_status === "ongoing"
        //           ? `text-[#75172F] border-[#75172F] m-1  ${
        //               courseBatch.status === "expired" ? "bg-red-100" : ""
        //             } `
        //           : "text-[red] border-[#75172F] m-1"
        //       }
        //       key={index}
        //     >
        //       <p className="flex gap-2 items-center text-[12px]">
        //         <i className="fa-solid fa-users"></i> {courseBatch?.batch_name}{" "}
        //         &nbsp;&nbsp;
        //       </p>
        //       <div
        //         // variant="outline"
        //         className="text-[#39B16E] m-1"
        //         key={index}
        //       >
        //         <p className="flex gap-1 items-center text-[12px]">
        //           <i className="fa-solid fa-book"></i>
        //           {courseBatch?.courses?.course_name}
        //         </p>
        //       </div>
        //       <div
        //         className="text-[#75172F] flex gap-2 items-center"
        //         key={index}
        //       >
        //         <i className="fa-solid fa-chalkboard-user"></i>
        //         {`${courseBatch?.teachers.first_name} ${courseBatch?.teachers.last_name}`}
        //       </div>
        //     </Badge>
        //   ))}
        // </div>
      );
    },
  },

  {
    accessorKey: "batches.joining_date",
    header: "Batch Started",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-left flex flex-col items-start gap-5">
          {data?.batches?.map((courseBatch, index) => (
            <p className="" key={index}>
              {new Date(courseBatch?.batch_started).toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
          ))}
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="text-center">
          {data.status === "active" ? (
            <Badge
              variant="outline"
              className="text-green-500 border-green-500"
            >
              {data.status}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-500 border-red-500">
              {data.status}
            </Badge>
          )}
        </div>
      );
    },
  },
];
