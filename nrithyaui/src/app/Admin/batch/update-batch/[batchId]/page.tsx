"use client";
import {
  BatchListPayloadType,
  batchUpdatePayload,
  TeacherPayloadType,
} from "@/Interfaces/batch";
import { BatchDetail, TeacherByCourse, UpdateByBatch } from "@/api/batch";
import ErrorHandling from "@/app/Components/ErrorHandling";
import Navbar from "@/app/Components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonLoading } from "@/components/ui/loading-button";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ComboboxDemo from "../../../../table/combox";

export interface CourseType {
  value: string;
  label: string;
}

[];
interface FormType {
  batch_name: string;
  whatsapp_link: string;
  batch_started: string;
  fee: string;
  teacher: number;
  dayOfweek: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
  status: string;
  max_strength: string;
}

type Props = {
  params: { batchId: string };
};

const Page = ({ params }: Props) => {
  const [update, setUpate] = useState({
    teacher: "",
  });

  const QueryClient = useQueryClient();
  const [listBatchDetail, setBatchdetail] = useState<BatchListPayloadType>();

  const router = useRouter();

  const [selectedValue, setSelectedValue] = React.useState("");

  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const { data, error, refetch } = useQuery<BatchListPayloadType>({
    queryKey: ["batchDetail", params.batchId],
    queryFn: async () => BatchDetail(params.batchId),
    enabled: !!params.batchId,
  });

  const { register, handleSubmit, formState, control, setValue, reset } =
    useForm<FormType>({
      defaultValues: {
        dayOfweek: [
          {
            day: "",
            start_time: "",
            end_time: "",
          },
        ],
      },
    });

  const { append, remove, fields } = useFieldArray({
    name: "dayOfweek",
    control,
  });

  const { errors, isLoading, isSubmitting } = formState;
  const onSubmit = (data: FormType) => {
    UpdateBatch.mutate(data);
  };
  const UpdateBatch = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: batchUpdatePayload = {
        batch_id: Number(params.batchId),
        batch_name: value.batch_name,
        batch_started: value.batch_started,
        teacher_id: value.teacher,
        fee: value.fee,
        // status: value.status,
        whatsapp_link: value.whatsapp_link,
        max_strength: value.max_strength,
        batch_timings: value.dayOfweek.map((item) => ({
          day: item.day,
          start_time: item.start_time,
          end_time: item.end_time,
        })),
      };
      return await UpdateByBatch(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch Updated successfully...",
        duration: 2000,
      });
      reset();
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

  useEffect(() => {
    if (data) {
      setBatchdetail(data);
      const initialvalues = data?.batch_timings?.map((item) => ({
        day: item.day,
        start_time: item.start_time,
        end_time: item.end_time,
      }));
      setValue("batch_name", data.batch_name);
      setValue("batch_started", data.batch_started);
      setValue("fee", data.fee);
      setValue("max_strength", data.max_strength);
      setValue("status", data.status);
      setValue("teacher", data.teachers.teacher_id);
      setValue("whatsapp_link", data.whatsapp_link);
      setValue("dayOfweek", initialvalues);
      setUpate({
        teacher: `${data.teachers.first_name} ${data.teachers.last_name}`,
      });
    }
  }, [data, setValue]);

  const { data: data2, isLoading: isLoading2 } = useQuery<TeacherPayloadType[]>(
    {
      queryKey: ["teacher", listBatchDetail?.courses.course_id],
      queryFn: async () => {
        if (listBatchDetail?.courses.course_id !== undefined) {
          return await TeacherByCourse(listBatchDetail?.courses.course_id);
        } else {
          return [];
        }
      },
      enabled: !!listBatchDetail?.courses?.course_id,
    }
  );

  const [teacher, setTeacher] = useState<CourseType[]>([]);
  useEffect(() => {
    if (data2) {
      const teacher: CourseType[] = data2
        ? data2?.map((item: TeacherPayloadType) => ({
            value: String(item?.teacher_id),
            label: `${item.first_name.trim()}${
              item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
            }`,
          }))
        : [];
      setTeacher(teacher);
    }
  }, [data2]);

  useEffect(() => {
    refetch();
  }, []);
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
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
                  className="block text-[#75172F]  font-bold mb-2"
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
                    minLength: {
                      value: 2,
                      message: "Min length of the field should be 2 characters",
                    },
                    required: {
                      value: true,
                      message: "Batch Name is required",
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
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Teacher Name<span className="text-red-500 ml-1">*</span>
                </label>
                <ComboboxDemo
                  field="teacher"
                  setValue={setValue}
                  frameworks={teacher}
                  name={update.teacher}
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
                <p className="text-xs text-red-700 pt-1 pl-1"></p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
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
            </div>

            <div className="grid grid-cols-[1fr,1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Capacity<span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow"
                  {...register("max_strength", {
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only numbers max_strengthare allowed",
                    },
                    required: {
                      value: true,
                      message: "Capacity is required",
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
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Whatsapp Link
                </label>

                <Input
                  className="shadow text-gray-700 font-medium"
                  {...register("whatsapp_link", {})}
                  placeholder="Whatsapp Link"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.whatsapp_link?.message}
                </p>
              </div>
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
                    pattern: {
                      value: /^[0-9]/,
                      message: "Invalid fees",
                    },
                    required: {
                      value: true,
                      message: "Fees is required",
                    },
                  })}
                  placeholder="Fees"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.fee?.message}
                </p>
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
                        defaultValue={field.day}
                        id=""
                        className="pb-2 shadow text-gray-700 font-medium h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        {...register(`dayOfweek.${index}.day`, {
                          required: {
                            value: true,
                            message: "day is required",
                          },
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
                          {...register(`dayOfweek.${index}.start_time`, {})}
                          defaultValue={field.start_time}
                          type="time"
                          placeholder="Start time"
                        />
                        <p className="text-xs text-red-700 pt-1 pl-1"></p>
                      </div>
                      <div className="pb-2 flex">
                        <Input
                          className="shadow"
                          {...register(`dayOfweek.${index}.end_time`, {})}
                          defaultValue={field.end_time}
                          type="time"
                          placeholder="End time"
                        />
                        <p className="text-xs text-red-700 pt-1 pl-1"></p>
                        {index >= 0 && (
                          <Button
                            className="bg-white text-red-600 border shadow w-16 hover:bg-red-600 hover:text-white mr-1"
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
                  onClick={() => reset()}
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
                  Update
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
