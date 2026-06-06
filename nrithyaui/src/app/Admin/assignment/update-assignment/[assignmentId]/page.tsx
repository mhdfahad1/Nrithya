"use client";

import React from "react";
import {
  addAssignment,
  getAssignmentById,
  getCourseComboBox,
  getTeacherComboBox,
  getTeacherComboBoxByCourse,
  updateAssignment,
} from "@/api/assignment";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CourseType } from "@/Interfaces/course";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import {
  AddAssignmentType,
  AssignmentType,
  GetAssignmentByIdPayload,
  TeacherComboboxType,
} from "@/Interfaces/assignment";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { Datum } from "@/Interfaces/Teacher";
import { FrameworkType } from "../../listAssignment";
import { PlusCircle, Trash2 } from "lucide-react";
import { BatchlistDropdownActivity } from "@/api/batchActivity";

export interface FormType {
  assignment_id: number;
  assignment_name: string;
  assignment_desc: string;
  teacher_id: string;
  course_id: string;
  url: string;
  batches: {
    batch_id: number;
    submission_deadline: string;
    batch_name: string;
  }[];
}

type Props = {
  params: { assignmentId: string };
};
function UpdateAssignment({ params }: Props) {
  const [comboboxName, setComboboxName] = useState({
    course_name: "",
    teacher_name: "",
    batch: [""],
  });
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const { register, handleSubmit, setValue, formState, control, watch } =
    useForm<FormType>({
      defaultValues: {
        batches: [{ batch_id: 0, submission_deadline: "", batch_name: "" }],
      },
    });

  const { fields, append, remove } = useFieldArray({
    name: "batches",
    control,
  });

  const { errors } = formState;

  // Watch for course and teacher changes
  const courseValue = useWatch({ control, name: "course_id" });
  const teacherValue = useWatch({ control, name: "teacher_id" });

  // Get course data
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

  // Get assignment by id
  const { data: AssignmentByIdList } = useQuery({
    queryKey: ["assignmentById", params.assignmentId],
    queryFn: async () => await getAssignmentById(params.assignmentId),
    enabled: !!params.assignmentId,
  });
  const [getAssignmentByIdData, setGetAssignmentByIdData] =
    useState<GetAssignmentByIdPayload>();
  useEffect(() => {
    if (AssignmentByIdList) {
      setGetAssignmentByIdData(AssignmentByIdList);
    }
  }, [AssignmentByIdList]);

  // Set initial state
  useEffect(() => {
    if (getAssignmentByIdData) {
      const initialdata = getAssignmentByIdData?.batches.map((items) => ({
        batch_id: items.batch.batch_id,
        submission_deadline: items.submission_deadline,
        batch_name: items.batch.batch_name,
      }));

      setValue("assignment_id", getAssignmentByIdData.assignment_id);
      setValue("assignment_name", getAssignmentByIdData.assignment_name);
      setValue("assignment_desc", getAssignmentByIdData.assignment_desc);
      setValue("url", getAssignmentByIdData.url);
      setValue("course_id", `${getAssignmentByIdData.courses.course_id}`);
      setValue("teacher_id", `${getAssignmentByIdData.teachers.teacher_id}`);
      setValue("batches", initialdata);

      setComboboxName({
        course_name: getAssignmentByIdData.courses.course_name,
        teacher_name: `${getAssignmentByIdData.teachers.first_name} ${getAssignmentByIdData.teachers.last_name}`,
        batch: initialdata.map((items) => items.batch_name),
      });
    }
  }, [getAssignmentByIdData, setValue]);

  // Get teachers for selected course
  const { data: teacherListData } = useQuery({
    queryKey: [
      "teacher",
      courseValue,
      getAssignmentByIdData?.courses.course_id,
    ],
    queryFn: async () =>
      await getTeacherComboBoxByCourse(
        courseValue || `${getAssignmentByIdData?.courses.course_id}`
      ),
    enabled: !!(courseValue || getAssignmentByIdData?.courses.course_id),
  });

  // Effect to handle course change and update teacher name
  useEffect(() => {
    if (courseValue && teacherListData) {
      const teacherExists = teacherListData.data.some(
        (teacher) => teacher.teacher_id.toString() === teacherValue
      );

      if (!teacherExists && teacherValue) {
        setValue("teacher_id", "");
        setComboboxName((prev) => ({
          ...prev,
          teacher_name: "",
        }));
      }
    }
  }, [courseValue, teacherListData, teacherValue, setValue, toast]);

  // Update teacher name when selected
  useEffect(() => {
    if (teacherValue && teacherListData) {
      const selectedTeacher = teacherListData.data.find(
        (teacher) => teacher.teacher_id.toString() === teacherValue
      );
      if (selectedTeacher) {
        setComboboxName((prev) => ({
          ...prev,
          teacher_name: `${selectedTeacher.first_name} ${selectedTeacher.last_name}`,
        }));
      }
    }
  }, [teacherValue, teacherListData]);

  const [getTeacherData, setGetTeacherData] = useState<Datum[]>([]);
  useEffect(() => {
    if (teacherListData) {
      setGetTeacherData(teacherListData.data);
    }
  }, [teacherListData]);

  const teacher: FrameworkType[] = getTeacherData.map((item) => ({
    value: `${item.teacher_id}`,
    label: `${item.first_name}${
      item.last_name !== "" ? ` ${item.last_name.trim()}` : ""
    }`,
  }));

  // Update assignment
  const onSubmit = (data: FormType) => {
    onUpdateAssignment.mutate(data);
  };

  const queryClient = useQueryClient();
  const onUpdateAssignment = useMutation({
    mutationKey: ["assignmentUpdate", params.assignmentId],
    mutationFn: async (data: FormType) => {
      const payload: FormType = {
        assignment_id: data.assignment_id,
        assignment_name: data.assignment_name,
        assignment_desc: data.assignment_desc,
        url: data.url,
        course_id: data.course_id,
        teacher_id: data.teacher_id,
        batches: data.batches.map((item) => ({
          batch_id: item.batch_id,
          submission_deadline: item.submission_deadline,
          batch_name: item.batch_name,
        })),
      };
      return await updateAssignment(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Assignment updated successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["assignment"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentById"] });
      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  // List batch dropdown
  const { data: batchListDropdown } = useQuery({
    queryKey: [
      "batcheslistdropdown",
      courseValue,
      getAssignmentByIdData?.courses.course_id,
    ],
    queryFn: async () =>
      await BatchlistDropdownActivity(
        courseValue || `${getAssignmentByIdData?.courses.course_id}`
      ),
  });

  useEffect(() => {
    if (batchListDropdown) {
      const batches: FrameworkType[] = batchListDropdown?.map((item) => ({
        value: `${item?.batch_id}`,
        label: item?.batch_name.trim(),
      }));
      setBatchItems(batches);
    }
  }, [batchListDropdown]);

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
                  Assignment name <span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  className="shadow  text-gray-700 font-medium"
                  {...register("assignment_name", {
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
                  Course <span className="text-red-500 ml-1">*</span> <br />
                </label>

                <ComboboxDemo
                  frameworks={course}
                  name={comboboxName.course_name}
                  setValue={setValue}
                  field="course_id"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  isUpdate={true}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.course_id?.message}
                </p>
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Teacher Name <span className="text-red-500 ml-1">*</span>
                  <br />
                </label>

                <ComboboxDemo
                  frameworks={teacher}
                  name={comboboxName.teacher_name}
                  setValue={setValue}
                  field="teacher_id"
                  resetFilter={resetFilter}
                  setResetFilter={setResetFilter}
                  isUpdate={true}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.teacher_id?.message}
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
                Assignment URL <span className="text-red-500 ml-1">*</span>
              </label>

              <Input
                className="shadow  text-gray-700 font-medium"
                {...register("url", {
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
                    batch_name: "",
                  })
                }
              >
                <PlusCircle className="w-5 h-5 " />
              </Button>
            </div>
            {fields.length > 0 ? (
              <div className="border-2 p-2 rounded-lg mb-5">
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
                            name={
                              comboboxName.batch[index]
                                ? comboboxName.batch[index]
                                : "Select batch"
                            }
                            setValue={setValue}
                            field={`batches.${index}.batch_id`}
                            resetFilter={resetFilter}
                            setResetFilter={setResetFilter}
                            isUpdate
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

            <div className="flex justify-end gap-5">
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
                Update
              </Button>
            </div>
          </form>
          <Toaster />
        </div>
      </div>
    </>
  );
}

export default UpdateAssignment;
