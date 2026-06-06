"use client";
import {
  addAssignment,
  getCourseComboBox,
  getTeacherComboBox,
  getTeacherComboBoxByCourse,
} from "@/api/assignment";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CourseType } from "@/Interfaces/course";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { FrameworkType } from "../listAssignment";
import {
  AddAssignmentType,
  AssignmentType,
  TeacherComboboxType,
} from "@/Interfaces/assignment";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { Datum } from "@/Interfaces/Teacher";
import { Plus, PlusCircle, Trash2 } from "lucide-react";
import { BatchlistDropdownActivity } from "@/api/batchActivity";

interface FormType {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  teacher_name: string;
  course_name: string;
  url: string;
  batches: {
    batch_id: number;
    submission_deadline: string;
  }[];
}

const Page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const { register, handleSubmit, setValue, formState, control } =
    useForm<FormType>({});
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    name: "batches",
    control,
  });

  const courseValue = useWatch({ control, name: "course_name" });

  //get course
  const { data: courseListData } = useQuery({
    queryKey: ["course"],
    queryFn: async () => await getCourseComboBox(),
  });
  const [getCourseData, setGetCourseData] = useState<CourseType[]>([]);
  useEffect(() => {
    if (courseListData) {
      setGetCourseData(courseListData);
    }
  }, [courseListData]);
  const course: FrameworkType[] = getCourseData.map((item) => ({
    value: `${item.course_id}`,
    label: item.course_name.trim(),
  }));

  //get teacher

  const { data: teacherListData } = useQuery({
    queryKey: ["teacher", courseValue],
    queryFn: async () => await getTeacherComboBoxByCourse(courseValue),
    enabled: !!courseValue,
  });
  const [getTeacherData, setGetTeacherData] = useState<Datum[]>([]);
  useEffect(() => {
    if (teacherListData) {
      setGetTeacherData(teacherListData.data);
    }
  }, [teacherListData]);

  const teacher: FrameworkType[] = getTeacherData.map((item) => ({
    value: `${item.teacher_id}`,
    label: `${item.first_name.trim()}${
      item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
    }`,
  }));

  // list batch dropdown
  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown", courseValue],
    queryFn: async () => await BatchlistDropdownActivity(courseValue),
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

  // Add assignment

  const onSubmit = (data: FormType) => {
    onAddAssignment.mutate(data);
  };

  const queryClient = useQueryClient();
  const onAddAssignment = useMutation({
    mutationFn: async (data: FormType) => {
      const payload: AddAssignmentType = {
        assignment_name: data.assignment_name,
        assignment_desc: data.assignment_desc,
        url: data.url,
        course_id: parseInt(data.course_name),
        teacher_id: parseInt(data.teacher_name),
        batches: data.batches.map((item) => ({
          batch_id: item.batch_id,
          submission_deadline: item.submission_deadline,
        })),
      };

      return await addAssignment(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Assignment added successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.push("/Admin/assignment");
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ["assignment"] });
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
      <Navbar name="Assignment" />
      <div className="p-7">
        <div className="p-7 bg-white shadow">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[1fr,1fr,1fr] gap-5">
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Assignment Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow  text-gray-700 font-medium"
                  {...register("assignment_name", {
                    pattern: {
                      value: /^(?!\s).*$/,
                      message: "Name cannot start with a space",
                    },
                    required: {
                      value: true,
                      message: "Assignment Name is required",
                    },
                    minLength: {
                      value: 2,
                      message: "Min length of the field should be 2 characters",
                    },
                  })}
                  placeholder="Assignment Name"
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.assignment_name?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Course <span className="text-red-500 ml-1">*</span>
                  <br />
                </label>

                <ComboboxDemo
                  frameworks={course}
                  name="Course"
                  setValue={setValue}
                  field="course_name"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.course_name?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Teacher Name <span className="text-red-500 ml-1">*</span>{" "}
                  <br />
                </label>

                <ComboboxDemo
                  frameworks={teacher}
                  name="Teacher"
                  setValue={setValue}
                  field="teacher_name"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.teacher_name?.message}
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Description <span className="text-red-500 ml-1">*</span>
              </label>

              <Textarea
                className=" font-medium shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your description"
                {...register("assignment_desc", {
                  required: "description is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Name cannot start with a space",
                  },
                })}
              />
              <p className="text-xs text-red-700 pt-1 pl-1">
                {errors.assignment_desc?.message}
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor=""
                className="block text-[#75172F]  font-bold mb-2"
              >
                Assignment URL
                <span className="text-red-500 ml-1">*</span>
              </label>

              <Input
                className="shadow  text-gray-700 font-medium"
                {...register("url", {
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Name cannot start with a space",
                  },
                  required: {
                    value: true,
                    message: "url is required",
                  },
                })}
                placeholder="url"
              />
              <p className="text-xs text-red-700 pt-1 pl-1">
                {errors.url?.message}
              </p>
            </div>
            <div className="flex items-center mb-2 gap-2">
              <span className="text-[#75172F]  font-bold ">Add Batch</span>
              <Button
                type="button"
                variant="outline"
                className="  bg-white text-green-600 border shadow  hover:bg-green-600 hover:text-white"
                onClick={() =>
                  append({
                    batch_id: 0,
                    submission_deadline: "",
                  })
                }
              >
                <PlusCircle className="w-5 h-5 " />
              </Button>
            </div>
            {fields.length > 0 ? (
              <div className="border-2 p-2 rounded-lg bg-muted/40">
                <div className="grid grid-cols-[1fr,1fr,20px]  ">
                  <label
                    htmlFor=""
                    className="block text-[#75172F]  font-bold mb-2 text-sm"
                  >
                    Batch<span className="text-red-500 ml-1">*</span>
                  </label>
                  <label
                    htmlFor=""
                    className="block text-[#75172F]  font-bold mb-2 ml-[-15px] text-sm"
                  >
                    Due Date<span className="text-red-500 ml-1">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-[1fr,20px] mb-5">
                  <div className="flex flex-col gap-8">
                    {fields.map((field, index) => {
                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-[1fr,1fr,20px] gap-5 "
                        >
                          <ComboboxDemo
                            frameworks={batchitems}
                            name={`Batch ${index + 1}`}
                            setValue={setValue}
                            field={`batches.${index}.batch_id`}
                            resetFilter={resetFilter}
                            setResetFilter={setResetFilter}
                          />

                          <div className="grid grid-cols-[1fr,30px] gap-2 text-gray-700">
                            <Input
                              type="date"
                              {...register(
                                `batches.${index}.submission_deadline`
                              )}
                              className="shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                            />
                            {errors.batches && (
                              <p className="text-red-500 text-xs pl-3 pt-4">
                                {errors.batches.message}
                              </p>
                            )}

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
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="flex justify-end gap-5 mt-3">
              <Link href={"/Admin/assignment"}>
                <Button
                  type="button"
                  variant={"outline"}
                  className="border-[#75172F] text-[#75172F]"
                >
                  Cancel
                </Button>
              </Link>

              <Button type="submit" variant={"primary"}>
                Submit
              </Button>
            </div>
          </form>
          <Toaster />
        </div>
      </div>
    </>
  );
};

export default Page;
