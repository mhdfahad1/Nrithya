"use client";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FrameworkType } from "../../../Compensation";
import { ButtonLoading } from "@/components/ui/loading-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditBatchCompensation } from "@/Interfaces/BatchCompensation";
import {
  EditcompensationBatch,
  IndividalcompensationBatch,
} from "@/api/batchCompensation";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
type FormValues = {
  start_time: string;
  old_date: string;
  new_date: string;
  end_time: string;
};
type Props = {
  params: { batchId: string };
};

const Page = ({ params }: Props) => {
  const form = useForm<FormValues>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, formState, setValue } = form;
  const { errors, isLoading, isSubmitting } = formState;
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [resetFilter, setResetFilter] = useState<boolean>(false);

  const onSubmit = (data: FormValues) => {
    onEditBatchCompensation.mutate(data);
  };

  const { data: individualBatchDetail, refetch } = useQuery({
    queryKey: ["batchCompensation", params.batchId],
    queryFn: () => IndividalcompensationBatch(Number(params.batchId)),
  });
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (individualBatchDetail) {
      setValue("start_time", individualBatchDetail.start_time);
      setValue("old_date", individualBatchDetail.old_date);
      setValue("new_date", individualBatchDetail.new_date);
      setValue("end_time", individualBatchDetail.end_time);
    }
  }, [individualBatchDetail]);

  const onEditBatchCompensation = useMutation({
    mutationFn: async (value: FormValues) => {
      const payload: EditBatchCompensation = {
        compensation_id: Number(params.batchId),
        new_date: value.new_date,
        start_time: value.start_time,
        old_date: value.old_date,
        end_time: value.end_time,
      };
      return await EditcompensationBatch(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch Compensation Updated Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 2000);

      queryClient.invalidateQueries({ queryKey: ["batch"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: " Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  return (
    <>
      <Navbar name="Update Batch" />
      <div className="p-10 ">
        <form
          className="shadow-md rounded  px-7 pt-6 pb-8  bg-white"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid grid-cols-[1fr,1fr] pt-7 gap-6">
            <div className="bg-[#fff4f4] p-4 rounded-xl">
              <label className="block text-[#75172F] font-bold  ">
                Original Batch
              </label>
              <div className="grid grid-cols-[1fr] pt-4 gap-3">
                <div className="mb-6">
                  <label className="block text-[#75172F]  font-bold mb-2">
                    Date<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    className="shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter your olddate"
                    type="date"
                    {...register("old_date", {
                      required: "Date is required",
                    })}
                  />
                  {errors.old_date && (
                    <p className="text-red-500 text-xs pl-3 pt-4">
                      {errors.old_date.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#dcffdc] p-4 rounded-xl">
              <label className="block text-[#75172F] font-bold  ">
                Revised Batch
              </label>
              <div className="grid grid-cols-[1fr,1fr,1fr] pt-4 gap-3">
                <div className="mb-6">
                  <label className="block text-[#75172F]  font-bold mb-2">
                    Date<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    className="shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter your newdate"
                    type="date"
                    {...register("new_date", {
                      required: "Date is required",
                    })}
                  />
                  {errors.new_date && (
                    <p className="text-red-500 text-xs pl-3 pt-4">
                      {errors.new_date.message}
                    </p>
                  )}
                </div>

                <div className="mr-4 ">
                  <label className="block text-[#75172F]  font-bold mb-2">
                    Start Time<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="time"
                    type="time"
                    placeholder="Enter your newtime"
                    {...register("start_time", {
                      required: "Time is required",
                    })}
                  />
                  {errors.start_time && (
                    <p className="text-red-500 text-xs pl-3 pt-4">
                      {errors.start_time.message}
                    </p>
                  )}
                </div>
                <div className="mr-4 ">
                  <label className="block text-[#75172F]  font-bold mb-2">
                    End Time<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="time"
                    type="time"
                    placeholder="Enter your newtime"
                    {...register("end_time", {
                      required: "Time is required",
                    })}
                  />
                  {errors.end_time && (
                    <p className="text-red-500 text-xs pl-3 pt-4">
                      {errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Link href="/Admin/compensation">
              <Button
                variant="outline"
                className="border-[#75172F] text-[#75172F]"
              >
                Cancel
              </Button>
            </Link>

            {isLoading || isSubmitting ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" variant={"primary"}>
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Page;
