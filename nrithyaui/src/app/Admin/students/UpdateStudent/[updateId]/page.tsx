"use client";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import Navbar from "@/app/Components/Navbar";
import { FrameworkType } from "../../studentList";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { getStudentById, UpdateStudent } from "@/api/student";
import { AddPayloadType, UpdatePayloadType } from "@/Interfaces/Student";
import { BatchlistDropdownActivity } from "@/api/batchActivity";
import { Payload } from "@/Interfaces/studentUpadateDetail";
import { Item } from "@radix-ui/react-dropdown-menu";
import { log } from "console";

interface FormType {
  student_id: number;
  first_name: string;
  reg_no: string;
  last_name: string;
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
    batch_id: number | string;
    joining_date: string;
    batch_name: string;
    status: string;
  }[];
  level?:string;

}

type Props = {
  params: { updateId: string };
};

const Page = ({ params }: Props) => {
  const [combobox, setComboBoxName] = useState({
    batch: [""],
  });
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [student, setStudent] = useState<AddPayloadType>();

  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormType>({
    defaultValues: {
      batches: [{ batch_id: 0, joining_date: "", batch_name: "" }],
      date_of_birth: "",
    },
  });
  const { register, control, handleSubmit, setValue, formState, watch } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    name: "batches",
    control,
  });
  const watchBatches = watch("batches");
  useEffect(() => {
    setComboBoxName({
      batch: watchBatches.map((batch) => batch.batch_name || ""),
    });
  }, [watchBatches]);

  const { data, refetch } = useQuery<Payload>({
    queryKey: ["studentdetails", params.updateId],
    queryFn: async () => getStudentById(params.updateId),
  });
  useEffect(() => {
    refetch();
  }, []);

  function filterBatchesWithEmptyValues(payload: FormType): boolean {
    for (const batch of payload.batches) {
      if (!batch.batch_id || !batch.joining_date || !batch.status) {
        return false;
      }
    }
    return true;
  }

  const onUpdateStudent = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: UpdatePayloadType = {
        student_id: Number(params.updateId),
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        place: value.place,
        status: value.status,
        city: value.city,
        alternative_number: value.alternative_number,
        whatsapp_number: value.whatsapp_number,
        date_of_birth: value.date_of_birth,
        address: value.address,
        gender: value.gender,
        state: value.state,
        batches: value.batches.map((item) => ({
          batch_id: Number(item.batch_id),
          joining_date: item.joining_date,
          batch_name: item.batch_name,
          status: item.status,
        })),
        level:value.level,
      };

      return await UpdateStudent(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student Updated Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 2000);

      queryClient.invalidateQueries({ queryKey: ["studentlisting"] });
      queryClient.invalidateQueries({ queryKey: ["studentdetailpage"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: " Something went wrong.",
          description: error?.response?.data?.errorMessage,
          duration: 1000,
        });
      }
    },
  });
  const onSubmit = (value: FormType) => {
    const isValid = filterBatchesWithEmptyValues(value);
    if (isValid) {
      onUpdateStudent.mutate(value);
    } else {
      toast({
        variant: "destructive",
        description: "Batch Details are required for all Batches",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (data) {
      setStudent(data);
      const initialdata = data.batches.map((items) => ({
        batch_id: items.batch_id,
        joining_date: items.joining_date,
        batch_name: items.batch_name,
        status: items.batch_status,
      }));
      setValue("first_name", data.first_name);
      setValue("last_name", data.last_name);
      setValue("gender", data.gender);
      setValue("place", data.place);
      setValue("state", data.state);
      setValue("city", data.city);
      setValue("alternative_number", data.alternative_number);
      setValue("address", data.address),
        setValue(
          "date_of_birth",
          new Date(data.date_of_birth).toISOString().split("T")[0]
        ),
        // setValue("date_of_birth", data.date_of_birth),
        setValue("email", data.email);
      setValue("status", data.status);
      setValue("whatsapp_number", data.whatsapp_number);
      setValue("batches", initialdata);
      setComboBoxName({
        batch: initialdata.map((items) => {
          return items.batch_name;
        }),
      });
      setValue("level",data.level)

    }
  }, [data, setValue]);

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

  const {
    data: listindividual,
    isLoading: isUserListLoading,
    error,
  } = useQuery({
    queryKey: ["studentlisting"],
    queryFn: async () => getStudentById(params.updateId),
  });

  useEffect(() => {
    if (listindividual) {
      setStudent(listindividual);
    }
  }, [listindividual]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

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
                id="city"
                type="text"
                placeholder="First Name"
                {...register("first_name", {
                  pattern: {
                    value: /^[a-zA-Z ]*$/,
                    message: "Invalid Name",
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
                  required: "Name is required",
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
                    message: "Invalid email format",
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

                    // maxLength: {
                    //   value: 15,
                    //   message:
                    //     "Max length of the field should be 15 characters",
                    // },
                    minLength: {
                      value: 5,
                      message: "Min length of the field should be 5 characters",
                    },
                    required: "Contact number is required",
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
                {...register("date_of_birth", { required: "DOB is required" })}
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
                className="shadow appearance-none border rounded w-full h-[40px] text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline pl-4"
                id="gender"
                {...register("gender", {})}
              >
                <option value="" hidden className="">
                  Select a value
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
                {...register("address")}
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
                  id="place"
                  type="text"
                  placeholder=" Day 1"
                  {...register("place", {
                    pattern: {
                      value: /^[a-zA-Z ]/,
                      message: "Invalid  ",
                    },

                    maxLength: {
                      value: 50,
                      message:
                        "Max length of the field should be 50 characters",
                    },
                    minLength: {
                      value: 2,
                      message: "Min length of the field should be 2 characters",
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
                placeholder=" Day 2"
                {...register("city", {
                  pattern: {
                    value: /^[a-zA-Z ]/,
                    message: "Invalid ",
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
                id="state"
                type="text"
                placeholder=" Previous exams details"
                {...register("state", {
                  pattern: {
                    value: /^[a-zA-Z ]/,
                    message: "invalid ",
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
              {errors.state && (
                <p className="text-red-500 text-xs pl-3 pt-4">
                  {errors.state.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-[1fr,100px]">
            <div className="grid grid-cols-3">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Date of Joining<span className="text-red-500 ml-1">*</span>
              </label>
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Batch<span className="text-red-500 ml-1">*</span>
              </label>
              <label htmlFor="" className="block text-[#75172F]  font-bold ">
                Status<span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            <div></div>
          </div>

          {/*  */}
          <div className="grid grid-cols-[1fr,20px]">
            <div className="flex flex-col">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr,80px] gap-5 "
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input
                          type="date"
                          {...register(`batches.${index}.joining_date`, {})}
                          className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                          defaultValue={field.joining_date}
                        />
                        {errors.batches && (
                          <p className="text-red-500 text-xs pl-3 pt-4">
                            {errors.batches.message}
                          </p>
                        )}
                      </div>
                      <div className="pb-2">
                        <ComboboxDemo
                          frameworks={batchitems}
                          name={combobox.batch[index]}
                          setValue={setValue}
                          field={`batches.${index}.batch_id`}
                          resetFilter={resetFilter}
                          setResetFilter={setResetFilter}
                          isUpdate={true}
                        />
                      </div>
                      <div>
                        <select
                          id="status"
                          className=" shadow text-gray-700 font-medium h-10 w-full rounded-md border border-input bg-background px-3  text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...register(`batches.${index}.status`)}
                        >
                          <option
                            value="ongoing"
                            selected={
                              field.status ===
                              data?.batches[index]?.batch_status
                            }
                          >
                            Ongoing
                          </option>
                          <option
                            value="suspended"
                            selected={
                              field.status ===
                              data?.batches[index]?.batch_status
                            }
                          >
                            Suspended
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="pb-2 ">
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
            <button
              type="button"
              className="w-10 h-10 items-center rounded-lg bg-[#174992] text-white p-2 ml-1"
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
          </div>
          <CardFooter className="flex justify-end gap-3 pt-5">
            <Link href="/Admin/students">
              {" "}
              <Button
                variant="outline"
                className="border-[#75172F] text-[#75172F]"
              >
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant={"primary"}>
              Update
            </Button>
          </CardFooter>
        </form>
      </div>
    </>
  );
};

export default Page;
