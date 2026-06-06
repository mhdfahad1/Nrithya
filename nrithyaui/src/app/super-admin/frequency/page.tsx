"use client";
import { frequencyGet, frequencyPatch } from "@/api/frequency";
import Navbar from "@/app/Components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import ErrorHandling from "@/app/Components/ErrorHandling";
import { Toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";

export type DataTypeFormType = {
  fee_notification: string;
};
export type DataType = {
  enquiry_1: number;
  enquiry_2: number;
  enquiry_3: number;
  fee_notification: number;
};

const Page = () => {
  const { toast } = useToast();
  const QueryClient = useQueryClient();

  const { register, handleSubmit, formState, control, setValue, reset } =
    useForm<DataType>();
  const { errors, isLoading, isSubmitting } = formState;

  const [update, setupdate] = useState(false);

  const { data: frequencyget, error } = useQuery({
    queryKey: ["frequency"],
    queryFn: () => frequencyGet(),
  });
  const updateFrequency = useMutation({
    mutationFn: async (value: DataType) => {
      const payload: DataType = {
        enquiry_1: value.enquiry_1,
        enquiry_2: value.enquiry_2,
        enquiry_3: value.enquiry_3,
        fee_notification: value.fee_notification,
      };
      return await frequencyPatch(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "frequency updated succesfully...",
        duration: 2000,
      });
      setupdate(false);
      QueryClient.invalidateQueries({ queryKey: ["frequency"] });
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

  const onSubmit = (data: DataType) => {
    updateFrequency.mutate(data);
  };

  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }

  return (
    <>
      <Toaster />

      <Navbar name="Frequency Follow Up" />
      <div className="p-10 h-[100vh]">
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          {frequencyget?.map((item, index) => (
            <div
              key={index}
              className="flex gap-28 p-10 shadow bg-white rounded-lg"
            >
              {update ? (
                <>
                  <div className="flex-col gap-10">
                    <p className="text-xl font-bold mb-6 text-[#75172F]">
                      Enquiry Follow up
                    </p>
                    <div className="flex gap-4 items-center">
                      <p className="text-base font-bold">Enquiry 1:</p>
                      <div>
                        <div className="flex justify-center items-center gap-2">
                          <Input
                            className="w-[70px]"
                            {...register("enquiry_1", {
                              required: {
                                value: true,
                                message: "Enquiry1 Required",
                              },
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Only numbers are allowed",
                              },
                            })}
                          />
                          <p className="text-sm">Days</p>
                        </div>
                        <p className="text-xs text-red-700 pt-1 pl-1">
                          {errors.enquiry_1?.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <p className="text-base  font-bold">Enquiry 2:</p>
                      <div>
                        <div className="flex justify-center items-center gap-2">
                          <Input
                            className="w-[70px]"
                            {...register("enquiry_2", {
                              required: {
                                value: true,
                                message: "Enquiry2 Required",
                              },
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Only numbers are allowed",
                              },
                            })}
                          />
                          <p className="text-sm">Days</p>
                        </div>

                        <p className="text-xs text-red-700 pt-1 pl-1">
                          {errors.enquiry_2?.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <p className="text-base  font-bold">Enquiry 3:</p>
                      <div>
                        <div className="flex justify-center items-center gap-2">
                          <Input
                            className="w-[70px]"
                            {...register("enquiry_3", {
                              required: {
                                value: true,
                                message: "Enquiry3 Required",
                              },
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Only numbers are allowed",
                              },
                            })}
                          />
                          <p className="text-sm">Days</p>
                        </div>

                        <p className="text-xs text-red-700 pt-1 pl-1">
                          {errors.enquiry_3?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-6  text-[#75172F]">
                      Fee Follow up
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-base font-bold">Frequency:</p>
                      <div>
                        <div className="flex justify-center items-center gap-2">
                          <Input
                            className="w-[70px]"
                            {...register("fee_notification", {
                              required: {
                                value: true,
                                message: "frequency required",
                              },
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Only numbers are allowed",
                              },
                            })}
                          />
                          <p className="text-sm">Days</p>
                        </div>

                        {/* <Label>Days</Label> */}
                        <p className="text-xs text-red-700 pt-1 pl-1">
                          {errors.fee_notification?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-24">
                  <div className="flex-col gap-10">
                    <p className="text-xl font-bold mb-6 text-[#75172F]">
                      Enquiry Follow up
                    </p>

                    <div className="flex gap-5 mb-2">
                      <p className="text-base font-bold">Enquiry 1:</p>
                      <p className="text-base">{item.enquiry_1} Days</p>
                    </div>

                    <div className="flex gap-5 mb-2">
                      <p className="text-base font-bold">Enquiry 2:</p>
                      <p className="text-base">{item.enquiry_2} Days</p>
                    </div>

                    <div className="flex gap-5 mb-2">
                      <p className="text-base font-bold">Enquiry 3:</p>
                      <p className="text-base">{item.enquiry_3} Days</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex-col gap-5">
                      <p className="text-xl font-bold mb-6 text-[#75172F]">
                        Fee Follow up
                      </p>

                      <div className="flex gap-5">
                        <p className="text-base font-bold">Frequency:</p>
                        <p className="text-base">
                          {item.fee_notification} Days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {update ? (
                ""
              ) : (
                <Button
                  onClick={() => {
                    setupdate(true);
                    setValue("enquiry_1", item.enquiry_1);
                    setValue("enquiry_2", item.enquiry_2);
                    setValue("enquiry_3", item.enquiry_3);
                    setValue("fee_notification", item.fee_notification);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          ))}
          {update ? (
            <div className="flex gap-5 justify-end p-3">
              <Button onClick={() => setupdate(false)} variant={"outline"}>
                Cancel
              </Button>
              <Button type="submit" variant={"violetFill"}>
                Update
              </Button>
            </div>
          ) : (
            ""
          )}
        </form>
      </div>
    </>
  );
};

export default Page;
