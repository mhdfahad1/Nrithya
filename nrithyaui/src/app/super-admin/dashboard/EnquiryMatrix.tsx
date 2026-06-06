import { getEnquiryMatrix } from "@/api/enquiryMatrix";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp } from "lucide-react";
import React from "react";

const EnquiryMatrix = ({ from, to }: { from: string; to: string }) => {
  // getEnquiryMatrix
  const { data: enquiryMatrixValues, isLoading } = useQuery({
    queryKey: ["enquiryMatrix", from, to],
    queryFn: async () => getEnquiryMatrix(from, to),
  });

  return (
    <>
      {isLoading ? (
        <div className="flex h-[100%] w-[100%] justify-center items-center">
          <Loader2 className="  animate-spin " />
        </div>
      ) : (
        <main className="w-[100%] h-[100%] flex flex-row items-center justify-between ">
          <section className="flex gap-y-3 flex-col">
            <h4 className="text-sm font-semibold pr-14">
              Total number of enquiries:
            </h4>
            <span className="text-3xl font-bold">
              {enquiryMatrixValues?.total_enquiry !== undefined
                ? enquiryMatrixValues?.total_enquiry
                : 0}
            </span>
          </section>
          <section className=" h-[100%] flex flex-row items-center gap-9">
            <div className="bg-[#f4c6c6] rounded-md flex gap-y-3 flex-col  shadow-lg  p-4">
              <h4 className="text-sm font-semibold pr-14"> Won Conversion:</h4>
              <span className="text-3xl font-bold">
                {" "}
                {enquiryMatrixValues?.converted_enquiry !== undefined
                  ? enquiryMatrixValues?.converted_enquiry
                  : 0}
              </span>
              <div className="flex justify-end items-center  text-[#15543c] gap-1">
                <TrendingUp className="h-4 w-4 text-[#15543c]" />

                <span className="text-xs font-bold">
                  +
                  {enquiryMatrixValues?.enquiry_conversion_percentage !==
                  undefined
                    ? enquiryMatrixValues?.enquiry_conversion_percentage.toFixed(
                        2
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="bg-[#c6f4dd] rounded-md flex gap-y-3 flex-col  shadow-lg  p-4">
              <h4 className="text-sm font-semibold pr-14"> Demo Request:</h4>
              <span className="text-3xl font-bold">
                {enquiryMatrixValues?.total_demo_requested !== undefined
                  ? enquiryMatrixValues?.total_demo_requested
                  : 0}
              </span>
              <div className="flex justify-end items-center  text-[#15543c] gap-1">
                <TrendingUp className="h-4 w-4 text-[#15543c]" />
                <span className="text-xs font-bold">
                  +
                  {enquiryMatrixValues?.demo_percentage !== undefined
                    ? enquiryMatrixValues?.demo_percentage.toFixed(2)
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="bg-[#c6cff4] rounded-md flex gap-y-3 flex-col  shadow-lg  p-4">
              <h4 className="text-sm font-semibold pr-2">
                {" "}
                Demo Won Conversion:
              </h4>
              <span className="text-3xl font-bold">
                {" "}
                {enquiryMatrixValues?.converted_demo_requested !== undefined
                  ? enquiryMatrixValues?.converted_demo_requested
                  : 0}
              </span>
              <div className="flex justify-end items-center  text-[#15543c] gap-1">
                <TrendingUp className="h-4 w-4 text-[#15543c]" />
                <span className="text-xs font-bold">
                  +
                  {enquiryMatrixValues?.demo_conversion_percentage !== undefined
                    ? enquiryMatrixValues?.demo_conversion_percentage.toFixed(2)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  );
};

export default EnquiryMatrix;
