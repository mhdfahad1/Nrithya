"use client";
import { AcrivityRootObject } from "@/Interfaces/batchActivity";
import {
  addBatchActivity,
  BatchlistDropdownActivity,
} from "@/api/batchActivity";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FrameworkType } from "../taskList";

interface FormType {
  date: string;
  batch_id: number;
  task: string;
}
const Page = () => {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, formState, control } =
    useForm<FormType>({});
  const route = useRouter();

  const { errors } = formState;

  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown"],
    queryFn: async () => await BatchlistDropdownActivity(),
  });

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

  const onAddBatchActivity = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: AcrivityRootObject = {
        batch_id: value.batch_id,
        date: value.date,
        task: value.task,
      };
      return await addBatchActivity(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Task Added Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 2000);

      queryClient.invalidateQueries({ queryKey: ["batchactivity"] });
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
  const onSubmit = (value: FormType) => {
    onAddBatchActivity.mutate(value);
  };

  return (
    <>
      <Toaster />
      <Navbar name="Add Topic Covered" />
      <div className="p-7">
        <div className="p-7 bg-white shadow">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Date<span className="ml-1 text-red-500">*</span>
                </label>

                <Input
                  type="date"
                  className="shadow  text-gray-700 font-medium"
                  {...register("date", {
                    required: {
                      value: true,
                      message: "Select a date",
                    },
                  })}
                  placeholder="Assignment Name"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.date?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Batch <br />
                </label>
                <div className="text-gray-700">
                  <ComboboxDemo
                    frameworks={batchitems}
                    name="Batch"
                    setValue={setValue}
                    field="batch_id"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.batch_id?.message}
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Topic<span className="ml-1 text-red-500">*</span>
              </label>

              <Textarea
                className=" font-medium shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your topic"
                {...register("task", {
                  required: "Topic is required",
                })}
              />
              <p className="text-xs text-red-700 pt-1 pl-1">
                {errors.task?.message}
              </p>
            </div>

            <div className="flex justify-end gap-5">
              <Button
                type="button"
                variant={"outline"}
                className="border-[#75172F] text-[#75172F]"
                onClick={route.back}
              >
                Cancel
              </Button>
              <Button type="submit" variant={"primary"}>
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
