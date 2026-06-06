"use client";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addStudent } from "@/api/student";
import { Plus, Trash2 } from "lucide-react";
import Navbar from "@/app/Components/Navbar";
import { FrameworkType } from "../studentList";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { ButtonLoading } from "@/components/ui/loading-button";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
import { AddPayloadType } from "@/Interfaces/Student";
import { Value } from "@radix-ui/react-select";

interface FormType {
  first_name: string;
  last_name: string;
  student_id: number;
  status: string;
  gender: string;
  date_of_birth: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  batches: {
    batch_id: number;
    joining_date: string;
    batch_name: string;
    status: string;
    // fee?:string;
  }[];
  level?:string;
}
const Page = () => {
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<AddPayloadType>({
    defaultValues: {
      // batches: [{ batch_id: 0, joining_date: "" }],
    },
  });
  const { register, control, handleSubmit, setValue, formState } = form;
  const { errors, isLoading, isSubmitting } = formState;
  const { fields, append, remove } = useFieldArray({
    name: "batches",
    control,
  });

  const onAddStudent = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: AddPayloadType = {
        first_name: value.first_name,
        student_id: value.student_id,
        last_name: value.last_name,
        status: value.status,
        email: value.email,
        place: value.place,
        city: value.city,
        alternative_number: value.alternative_number,
        whatsapp_number: value.whatsapp_number,
        date_of_birth: value.date_of_birth,
        address: value.address,
        gender: value.gender,
        state: value.state,
        batches: value.batches.map((item) => ({
          batch_id: item.batch_id,
          joining_date: item.joining_date,
          batch_name: item.batch_name,
          status: item.status,
        })),
        level:value.level
      };
      return await addStudent(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student Added Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 2000);

      queryClient.invalidateQueries({ queryKey: ["studentlisting"] });
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

  function filterBatchesWithEmptyValues(payload: AddPayloadType): boolean {
    for (const batch of payload.batches) {
      if (!batch.batch_id || !batch.joining_date) {
        return false;
      }
    }
    return true;
  }

  const onSubmit = (value: AddPayloadType) => {
    const isValid = filterBatchesWithEmptyValues(value);
    if (isValid) {
      onAddStudent.mutate(value);
    } else {
      toast({
        variant: "destructive",
        description: "Batch and Joining Date are required",
        duration: 2000,
      });
    }
  };

  //list batch list in dropdown
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

  return (
    <>
      <Navbar name="Student" />
      <Toaster />
      <div className="p-10 ">
        <form
          className="shadow-md rounded  px-7 pt-6 pb-8  bg-white"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid grid-cols-[1fr,1fr,1fr,1fr] gap-4 mb-4">
            <div className="">
              <label className="block text-[#75172F]  font-bold mb-2">
                First Name<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstname"
                type="text"
                placeholder="First Name"
                {...register("first_name", {
                  pattern: {
                    value: /^[a-zA-Z ]*$/,
                    message: "Invalid Name",
                  },
                  required: {
                    value: true,
                    message: "Name is required",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max length of the field should be 50 characters",
                  },
                  minLength: {
                    value: 2,
                    message:
                      "Minimum length of the field should be 2 characters",
                  },
                })}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="">
              <label className="block text-[#75172F]  font-bold mb-2">
                Last Name
              </label>
              <Input
                className="shadow appearance-none border  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Last Name"
                {...register("last_name", {
                  pattern: {
                    value: /^[a-zA-Z ]*$/,
                    message: "Invalid Name",
                  },

                  maxLength: {
                    value: 50,
                    message: "Max length of the field should be 50 characters",
                  },
                })}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-[#75172F] font-bold mb-2 ">
                Email
              </label>
              <Input
                className="shadow appearance-none border rounded   text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Email Address"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Please enter valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-[#75172F] font-bold mb-2 ">
                Level
              </label>
              <select
                className="shadow appearance-none border rounded w-full h-[40px] bg-white text-gray-800 leading-tight focus:outline-none focus:shadow-outline pl-4"
                id="gender"
                {...register("level", {
                  // required: {
                  //   value: true,
                  //   message: "Gender is required",
                  // },
                })}
              >
                <option value="" hidden className="text-red-400">
                  Level
                </option>
                <option value="Adya">Adya</option>
                <option value="Madya">Madya</option>
                <option value="Purna">Purna</option>
                <option value="Beginner">Beginner</option>
                <option value="Midlevel">Midlevel</option>
                <option value="Advanced">Advanced</option>

              </select>
             
            </div>
          </div>

          <div className="grid grid-cols-[1fr,1fr,1fr,1fr] gap-4">
            <div className=" mb-4">
              <div className=" ">
                <label className="block text-[#75172F]  font-bold mb-2">
                  Whatsapp No<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  className="shadow appearance-none border rounded   text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="whatsappno"
                  type="text"
                  placeholder="Whatsapp No"
                  {...register("whatsapp_number", {
                    pattern: {
                      value: /^[0-9+ ]+$/,
                      message: "Only numbers and the '+' symbol are allowed",
                    },
                    required: {
                      value: true,
                      message: "Number is required",
                    },
                    // maxLength: {
                    //   value: 15,
                    //   message:
                    //     "Max length of the field should be 15 characters",
                    // },
                    minLength: {
                      value: 5,
                      message: "Min length of the field should be 5 characters",
                    },
                  })}
                />
                {errors.whatsapp_number && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.whatsapp_number.message}
                  </p>
                )}
              </div>
            </div>
            <div className="">
              <label className="block text-[#75172F]  font-bold mb-2">
                Alternative Number
              </label>
              <Input
                className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Alternative Number"
                {...register("alternative_number", {
                  pattern: {
                    value: /^[0-9+ ]+$/,
                    message: "Only numbers and the '+' symbol are allowed",
                  },
                  // maxLength: {
                  //   value: 15,
                  //   message: "Max length of the field should be 15 characters",
                  // },
                  minLength: {
                    value: 5,
                    message: "Min length of the field should be 5 characters",
                  },
                })}
              />
              {errors.alternative_number && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.alternative_number.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-[#75172F]  font-bold mb-2">
                Date of Birth<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="state"
                type="date"
                placeholder="Date Of Birth"
                max={new Date().toISOString().split("T")[0]}
                {...register("date_of_birth", {
                  required: {
                    value: true,
                    message: "Date Of Birth is required",
                  },
                })}
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.date_of_birth.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-[#75172F]  font-bold mb-2">
                Gender<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className="shadow appearance-none border rounded w-full h-[40px] bg-white text-gray-800 leading-tight focus:outline-none focus:shadow-outline pl-4"
                id="gender"
                {...register("gender", {
                  required: {
                    value: true,
                    message: "Gender is required",
                  },
                })}
              >
                <option value="" hidden className="text-red-400">
                  Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <p className="text-red-500 text-xs pl-3 pt-4">
                {errors?.gender?.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr,1fr,1fr,1fr] gap-4 ">
            <div className="mb-6">
              <label className="block text-[#75172F]  font-bold mb-2">
                Address
              </label>
              <Input
                className="shadow appearance-none border rounded   text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Address"
                {...register("address", {
                  maxLength: {
                    value: 50,
                    message:
                      "Maximum length of the field should be 50 characters",
                  },
                  minLength: {
                    value: 2,
                    message:
                      "Minimum length of the field should be 2 characters",
                  },
                })}
              />
              {errors.address && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className=" mb-4">
              <div className="mr-4 ">
                <label className="block text-[#75172F]  font-bold mb-2">
                  Day 1
                </label>
                <Input
                  className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="city"
                  type="text"
                  placeholder="  Day 1"
                  {...register("place", {
                    pattern: {
                      value: /^[a-zA-Z ]/,
                      message: "Invalid",
                    },

                    maxLength: {
                      value: 50,
                      message:
                        "Maximum length of the field should be 50 characters",
                    },
                    minLength: {
                      value: 2,
                      message:
                        "Minimum length of the field should be 2 characters",
                    },
                  })}
                />
                {errors.place && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.place.message}
                  </p>
                )}
              </div>
            </div>
            <div className="">
              <label className="block text-[#75172F]  font-bold mb-2">
                Day 2
              </label>
              <Input
                className="shadow appearance-none border  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="   Day 2"
                {...register("city", {
                  pattern: {
                    value: /^[a-zA-Z ]/,
                    message: "Invalid ",
                  },

                  maxLength: {
                    value: 50,
                    message:
                      "Maximum length of the field should be 50 characters",
                  },
                  minLength: {
                    value: 2,
                    message:
                      "Minimum length of the field should be 2 characters",
                  },
                })}
              />
              {errors.city && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="">
              <label className="block text-[#75172F]  font-bold mb-2">
                Previous exams details
              </label>
              <Input
                className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="city"
                type="text"
                placeholder="  Previous exams details"
                {...register("state", {
                  pattern: {
                    value: /^[a-zA-Z ]/,
                    message: "invalid ",
                  },

                  maxLength: {
                    value: 50,
                    message:
                      "Maximum length of the field should be 50 characters",
                  },
                  minLength: {
                    value: 2,
                    message:
                      "Minimum length of the field should be 2 characters",
                  },
                })}
              />
              {errors.state && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.state.message}
                </p>
              )}
            </div>
          </div>

          {fields.length > 0 ? (
            <div className="grid grid-cols-[1fr,1fr]">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Date of Joining<span className="text-red-500 ml-1">*</span>
              </label>
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2 -mx-4"
              >
                Batch<span className="text-red-500 ml-1">*</span>
              </label>
            </div>
          ) : (
            ""
          )}
          <div className="grid grid-cols-[1fr,20px]">
            <div className="flex flex-col gap-8">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr,1fr,30px] gap-5 "
                  >
                    <Input
                      type="date"
                      {...register(`batches.${index}.joining_date`)}
                      className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                    />
                    {errors.batches && (
                      <p className="text-red-500 text-xs pl-3 pt-4">
                        {errors.batches.message}
                      </p>
                    )}
                    <div className="grid grid-cols-[1fr,30px] gap-2 text-gray-700">
                      <ComboboxDemo
                        frameworks={batchitems}
                        name={`Batch ${index + 1}`}
                        setValue={setValue}
                        field={`batches.${index}.batch_id`}
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                      />

                      {index >= 0 && (
                        <Button
                          className="bg-white text-red-600 border shadow w-16 hover:bg-red-600 hover:text-white "
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-p-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {fields.length > 0 ? (
              <button
                type="button"
                className="w-10 h-10 items-center rounded-lg bg-[#39B16E] text-white p-2"
                onClick={() =>
                  append({
                    batch_id: 0,
                    joining_date: "",
                    batch_name: "",
                    status: "",
                  })
                }
              >
                <Plus className="w-6 h-6 " />
              </button>
            ) : (
              ""
            )}
          </div>
          {fields.length === 0 ? (
            <div>
              <Button
                type="button"
                variant={"outline"}
                className="border-[#39B16E] text-[#39B16E] hover:bg-[#39b16fcb] hover:text-[#fff] shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
                onClick={() =>
                  append({
                    batch_id: 0,
                    joining_date: "",
                    batch_name: "",
                    status: "",
                  })
                }
              >
                <Plus className="w-6 h-6 " />
                Add Batch
              </Button>
            </div>
          ) : (
            ""
          )}


          <CardFooter className="flex justify-end gap-3 pt-5">
            <Link href="/Admin/students">
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
          </CardFooter>
        </form>
      </div>
    </>
  );
};

export default Page;
