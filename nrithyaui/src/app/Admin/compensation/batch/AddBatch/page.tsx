"use client";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { BatchlistDropdownActivity } from "@/api/batchActivity";
import { getCalendar } from "@/api/batchAttendance";
import { addBatchCompensation } from "@/api/batchCompensation";
import { ButtonLoading } from "@/components/ui/loading-button";
import { AddBatchCompensation } from "@/Interfaces/BatchCompensation";
import { useRouter } from "next/navigation";
import { FrameworkType } from "../../Compensation";

type FormValues = {
  batch_id: number;
  start_time: string;
  old_date: string;
  new_date: string;
  end_time: string;
};

const Page = () => {
  const [update, setUpdate] = useState({
    batch: "",
  });
  const [calendar, setCalendar] = useState("");
  const form = useForm<FormValues>();
  const { register, control, handleSubmit, formState, setValue } = form;
  const { errors, isLoading, isSubmitting } = formState;
  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  //Add Batch Compensation
  const onAddBatchCompensation = useMutation({
    mutationFn: async (value: FormValues) => {
      const payload: AddBatchCompensation = {
        batch_id: value.batch_id,
        new_date: value.new_date,
        start_time: value.start_time,
        old_date: value.old_date,
        end_time: value.end_time,
      };
      return await addBatchCompensation(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch Compensation Added Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.push("/Admin/compensation");
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
  const onSubmit: SubmitHandler<FormValues> = (value: FormValues) => {
    onAddBatchCompensation.mutate(value);
  };

  //List of Batches in dropdown
  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown"],
    queryFn: async () => await BatchlistDropdownActivity(),
  });
  const { data: calendarDataById } = useQuery({
    queryKey: ["calendarById", calendar],
    queryFn: async () => await getCalendar(calendar),
    enabled: !!calendar,
  });
  useEffect(() => {
    if (calendarDataById) {
      setValue("batch_id", calendarDataById.batches.batch_id);
      setValue("old_date", calendarDataById.date);
      setUpdate({ ...update, batch: calendarDataById.batches.batch_name });
    }
  }, [calendarDataById]);

  useEffect(() => {
    if (batchListDropdown) {
      const batches: FrameworkType[] = batchListDropdown?.map(
        (item, index) => ({
          value: `${item?.batch_id}`,
          label: item?.batch_name.trim(),
        })
      );

      setBatchItems(batches);
    }
  }, [batchListDropdown]);
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const dateParam = urlParams.get("calendar_id");
    if (dateParam) {
      setCalendar(dateParam);
    }
  }, []);

  return (
    <>
      <Navbar name="Compensation Batch" />
      <Toaster />
      <div className="p-10 ">
        <form
          className="shadow-md rounded  px-7 pt-6 pb-8  bg-white"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="">
            <label className=" block text-[#75172F]  font-bold mb-2">
              Batch<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="text-gray-700">
              <ComboboxDemo
                frameworks={batchitems}
                name={update.batch ? update.batch : "Batch"}
                setValue={setValue}
                field="batch_id"
                resetFilter={resetFilter}
                setResetFilter={setResetFilter}
              />
            </div>
            {errors.batch_id && (
              <p className="text-red-500 text-xs pl-3 pt-4">
                {errors.batch_id.message}
              </p>
            )}
          </div>

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

          <CardFooter className="flex justify-end gap-3 pt-5">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-[#75172F] text-[#75172F]"
            >
              Cancel
            </Button>

            {isLoading || isSubmitting ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" variant={"primary"}>
                Submit
              </Button>
            )}
          </CardFooter>
        </form>
      </div>
    </>
  );
};

export default Page;
