"use client";
import {
  batchPayload,
  CoursePayloadType,
  TeacherPayloadType,
} from "@/Interfaces/batch";
import { AddBatch, CourseList, TeacherByCourse } from "@/api/batch";
import Navbar from "@/app/Components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import ComboboxDemo from "../../../table/combox";

export interface CourseType {
  value: string;
  label: string;
}

[];
export interface FormType {
  batch_name: string;
  whatsapp_link: string;
  course: string;
  teacher: string;
  batch_started: string;
  fee: string;
  day_of_week: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
  status: string;
  max_strength: string;
}
const Page = () => {
  const QueryClient = useQueryClient();
  const router = useRouter();
  const [course, setcourse] = useState<CourseType[]>([]);
  const [teacher, setTeacher] = useState<CourseType[]>([]);

  const [selectedValue, setSelectedValue] = React.useState("");

  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState,
    control,
    setValue,
    reset,
    getValues,
  } = useForm<FormType>({
    defaultValues: {
      day_of_week: [{ day: "", end_time: "", start_time: "" }],
      teacher: "",
      batch_started: "",
    },
  });
  const courseValue = useWatch({ control, name: "course" });

  const { append, remove, fields } = useFieldArray({
    name: "day_of_week",
    control,
  });
  const { errors, isLoading, isSubmitting } = formState;
  const onSubmit = (data: FormType) => {
    onAddBatch.mutate(data);
  };

  const { data: courseList, isLoading: isLoading1 } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => await CourseList(),
  });
  useEffect(() => {
    if (courseList) {
      const course: CourseType[] = courseList
        ? courseList.map((item: CoursePayloadType) => ({
            value: String(item?.course_id),
            label: item?.course_name.trim(),
          }))
        : [];

      setcourse(course);
    }
  }, [courseList]);

  const { data: teacherList, isLoading: isLoading2 } = useQuery({
    queryKey: ["teacher", courseValue],
    queryFn: async () => await TeacherByCourse(Number(courseValue)),
    enabled: !!courseValue,
  });

  useEffect(() => {
    if (teacherList) {
      const teacher: CourseType[] = teacherList
        ? teacherList.map((item: TeacherPayloadType) => ({
            value: String(item?.teacher_id),
            label: `${item.first_name.trim()}${
              item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
            }`,
          }))
        : [];

      setTeacher(teacher);
    }
  }, [teacherList]);

  const onAddBatch = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: batchPayload = {
        batch_name: value.batch_name,
        batch_started: value.batch_started,
        course_id: Number(value.course),
        teacher_id: Number(value.teacher),
        max_strength: value.max_strength,
        whatsapp_link: value.whatsapp_link,
        fee: value.fee,
        day_of_week: value.day_of_week.map((item) => ({
          day: item.day,
          start_time: item.start_time,
          end_time: item.end_time,
        })),
      };
      return await AddBatch(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch added successfully...",
        duration: 2000,
      });
      QueryClient.invalidateQueries({ queryKey: ["batches"] });
      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  return (
    <>
      <Navbar name="Batch" />
      <Toaster />
      <div className="p-7">
        <div className="p-7 bg-white shadow">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[1fr,1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Batch Name<span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow text-gray-700 font-medium"
                  {...register("batch_name", {
                    pattern: {
                      value: /^[a-zA-Z0-9 ]/,
                      message: "Invalid batch name",
                    },
                    required: {
                      value: true,
                      message: "Batch Name is required",
                    },
                    minLength: {
                      value: 2,
                      message: "Min length of the field should be 2 characters",
                    },
                  })}
                  placeholder="Batch Name"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.batch_name?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Course<span className="text-red-500 ml-1">*</span>
                </label>
                <ComboboxDemo
                  setValue={setValue}
                  field="course"
                  frameworks={course}
                  name="Course"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Teacher Name<span className="text-red-500 ml-1">*</span>
                </label>
                <ComboboxDemo
                  field="teacher"
                  setValue={setValue}
                  frameworks={teacher}
                  name="Teacher"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.teacher?.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr,1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Start Date<span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow"
                  {...register("batch_started", {
                    required: {
                      value: true,
                      message: "Start date is required",
                    },
                  })}
                  type="date"
                  placeholder="Start Date"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.batch_started?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Capacity<span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow"
                  {...register("max_strength", {
                    required: {
                      value: true,
                      message: "Capacity required",
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers are allowed",
                    },
                  })}
                  placeholder="Capacity"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.max_strength?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-black  font-bold mb-2"
                >
                  Whatsapp Link
                </label>

                <Input
                  className="shadow text-gray-700 font-medium"
                  {...register("whatsapp_link", {
                    pattern: {
                      value: /^(?!\s).*$/,
                      message: "Name cannot start with a space",
                    },
                  })}
                  placeholder="Whatsapp Link"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.whatsapp_link?.message}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[1fr,1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Fees<span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow"
                  {...register("fee", {
                    required: {
                      value: true,
                      message: "fees is required",
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Invalid fees",
                    },
                  })}
                  placeholder="Fees"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.fee?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Status<span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id=""
                  className=" shadow text-gray-700 font-medium h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("status", {
                    required: {
                      value: true,
                      message: "Status is required",
                    },
                  })}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="expired">Expired</option>
                </select>
                <p className="text-xs text-red-700 pt-1 pl-1"></p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr,1fr,1fr]">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Day of week
              </label>
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Start time
              </label>
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                End time
              </label>
            </div>

            <div className="grid grid-cols-[1fr,20px]">
              <div className="flex flex-col">
                {fields.map((field, index) => {
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr,1fr,1fr] gap-5 "
                    >
                      <select
                        id=""
                        className="pb-2 shadow text-gray-700 font-medium h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        // required
                        {...register(`day_of_week.${index}.day`, {
                          // required: {
                          //   value: true,
                          //   message: "day is required",
                          // },
                        })}
                      >
                        <option value="" hidden>
                          Select a day
                        </option>
                        <option value="sunday">SUN</option>
                        <option value="monday">MON</option>
                        <option value="tuesday">TUE</option>
                        <option value="wednesday">WED</option>
                        <option value="thursday">THU</option>{" "}
                        <option value="friday">FRI</option>
                        <option value="saturday">SAT</option>
                      </select>
                      <div className="pb-2">
                        <Input
                          className="shadow"
                          {...register(`day_of_week.${index}.start_time`, {
                            // required: {
                            //   value: true,
                            //   message: "start time is required",
                            // },
                          })}
                          type="time"
                          placeholder="Start time"
                        />
                        <p className="text-xs text-red-700 pt-1 pl-1"></p>
                      </div>
                      <div className="pb-2 flex">
                        <Input
                          className="shadow"
                          {...register(`day_of_week.${index}.end_time`, {
                            // required: {
                            //   value: true,
                            //   message: "end time is required",
                            // },
                          })}
                          type="time"
                          placeholder="End time"
                        />
                        <p className="text-xs text-red-700 pt-1 pl-1"></p>
                        {index > 0 && (
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
                className="w-10 h-10 items-center rounded-lg bg-[#174992] text-white p-2"
                onClick={() =>
                  append({ day: "", end_time: "", start_time: "" })
                }
              >
                <Plus className="w-6 h-6 " />
              </button>
            </div>
            <div className="flex justify-end gap-5 pt-10">
              <Link href={"/Admin/batch"}>
                <Button
                  type="button"
                  variant={"outline"}
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
      </div>
    </>
  );
};
export default Page;
