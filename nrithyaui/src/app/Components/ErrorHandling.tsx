"use client";

import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import Link from "next/link";

const error = ({ error }: { error: Error }) => {
  return (
    <>
      <div className="flex  h-screen justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg ">
          <div className="flex items-center justify-center mb-4 ">
            <svg
              className="h-16 w-16 text-[#75172F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#75172F] text-center mb-4">
            {error.message}
          </h2>
          <p className="text-gray-700 text-center mb-6">
            Oops! There seems to be an issue with the page youre trying to
            access.{" "}
          </p>
          <div className="flex justify-center">
            {/* <Link href="/">
              <Button variant={"violetFill"}>Back to Home</Button>
            </Link> */}
            {/* <p className="text-xl text-[#75172F] font-bold flex items-center gap-2">
              Please Try again Later!
              <Frown />
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default error;
