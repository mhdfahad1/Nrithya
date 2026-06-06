"use client";

import { addTeacher } from "@/api/teacherManagement";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CoursePayloadType, CourseType } from "@/Interfaces/course";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { FrameworkType } from "../TeacherList";
import { getCourseComboBox } from "@/api/assignment";
import { TeacherAddPayloadType } from "@/Interfaces/Teacher";
import { Toaster } from "@/components/ui/toaster";

type Inputs = {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  date_of_joining: string;
  address: string;
  place: string;
  city: string;
  state: string;
  email: string;
  qualification: string;
  whatsapp_number: string;
  alternative_number: string;
  bio: string;
  courses: number[];
  coursesList: CoursePayloadType[];
};
const AddTeacher = () => {
  const { toast } = useToast();
  const router = useRouter();
  const onAddTeacher = useMutation({
    mutationFn: async (value: Inputs) => {
      const payload: TeacherAddPayloadType = {
        first_name: value?.first_name,
        last_name: value?.last_name,
        gender: value?.gender,
        date_of_birth: value?.date_of_birth,
        date_of_joining: value?.date_of_joining,
        address: value?.address,
        place: value?.place,
        city: value?.city,
        state: value?.state,
        email: value?.email,
        qualification: value?.qualification,
        whatsapp_number: value?.whatsapp_number,
        alternative_number: value?.alternative_number,
        bio: value?.bio,
        courses: value.courses.map((item) => Number(item)),
      };

      return await addTeacher(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Teacher added successfully...",
        duration: 2000,
      });
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
  // course for combobox
  const { data: courseListData } = useQuery<CourseType[]>({
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
  const {
    register,
    handleSubmit,
    setValue,

    control,
    formState: { errors, isDirty },
  } = useForm<Inputs>({
    defaultValues: {
      courses: [],
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (value) => {
    onAddTeacher.mutate(value);
  };

  const { fields, append, remove } = useFieldArray({
    name: "coursesList",
    control,
  });

  const [resetFilter, setResetFilter] = useState<boolean>(true);
  return (
    <>
      <Navbar name="Add Teacher" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" bg-white shadow-md rounded px-8 pt-6 pb-8 my-[2.2rem] ml-[2.2rem] mr-[1.5rem] flex flex-col  gap-y-3"
      >
        <Toaster />
        <div className="flex flex-row justify-between w-[100%]">
          {/* First name */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="firstName"
            >
              First Name <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex relative items-center ">
              <Input
                type="text"
                id="firstName"
                className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="First name"
                {...register("first_name", {
                  required: "First name is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "First name cannot start with a space",
                  },
                })}
              />
            </div>
            {errors?.first_name && (
              <span className="text-red-600 text-xs">
                {errors?.first_name?.message}
              </span>
            )}
          </div>
          {/* Last name */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <div className="flex relative items-center ">
              <Input
                type="text"
                id="lastName"
                className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Last name"
                {...register("last_name", {
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Last name cannot start with a space",
                  },
                })}
              />
            </div>
            {errors?.last_name && (
              <span className="text-red-600 text-xs">
                {errors?.last_name?.message}
              </span>
            )}
          </div>
          {/* Email */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <div className="flex relative items-center  ">
              <Input
                className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                placeholder="Email"
                {...register("email", {
                  // required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-red-600 text-xs ">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between w-[100%]">
          {/*  Whatsapp number */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="whatsappNumber"
            >
              Whatsapp Number<span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex relative items-center ">
              <Input
                type="text"
                id="whatsappNumber"
                className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Whatsapp number"
                {...register("whatsapp_number", {
                  required: "Whatsapp number is required",
                  minLength: {
                    value: 5,
                    message: "Whatsapp number should be at least 5 characters",
                  },
                  // maxLength: {
                  //   value: 15,
                  //   message: "Whatsapp number should not exceed 15 characters",
                  // },
                  pattern: {
                    value: /^[0-9+ ]+$/,
                    message: "Whatsapp number can only contain numbers",
                  },
                })}
              />
            </div>
            {errors?.whatsapp_number && (
              <span className="text-red-600 text-xs">
                {errors?.whatsapp_number?.message}
              </span>
            )}
          </div>
          {/* Alternative Number */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="alternativeNumber"
            >
              Alternative Number
            </label>
            <div className="flex relative items-center ">
              <Input
                type="text"
                id="alternativeNumber"
                className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder=" Alternative number"
                {...register("alternative_number", {
                  minLength: {
                    value: 5,
                    message:
                      "Alternative number should be at least 5 characters",
                  },
                  // maxLength: {
                  //   value: 15,
                  //   message:
                  //     "Alternative number should not exceed 15 characters",
                  // },
                  pattern: {
                    value: /^[0-9+ ]+$/,
                    message: "Alternative number can only contain numbers",
                  },
                })}
              />
            </div>
            {errors?.alternative_number && (
              <span className="text-red-600 text-xs">
                {errors?.alternative_number?.message}
              </span>
            )}
          </div>
          {/* qualification */}
          <div className="w-[32%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="qualification"
            >
              Qualification
            </label>
            <div className="flex relative items-center  ">
              <Input
                className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="qualification"
                placeholder="Qualification"
                {...register("qualification", {
                  // required: "Qualification is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Qualification cannot start with a space",
                  },
                })}
              />
            </div>
            {errors.qualification && (
              <span className="text-red-600 text-xs ">
                {errors.qualification.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between w-[100%]">
          <div className="flex flex-col  w-[48%] gap-y-3">
            <div className="flex flex-row justify-between w-[100%]">
              {" "}
              {/* DOB */}
              <div className="33%">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="dob"
                >
                  Date of Birth<span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex relative items-center ">
                  <Input
                    type="date"
                    id="dob"
                    className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    {...register("date_of_birth", {
                      required: "Date of birth is required",
                    })}
                  />
                </div>
                {errors?.date_of_birth && (
                  <span className="text-red-600 text-xs">
                    {errors?.date_of_birth?.message}
                  </span>
                )}
              </div>
              {/* Gender */}
              <div className="w-[33%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="gender"
                >
                  Gender <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex relative items-center ">
                  <select
                    id="gender"
                    className="w-[100%] shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    {...register("gender", {
                      required: "Gender is required",
                    })}
                  >
                    <option value="" hidden className="text-grey-400">
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors?.gender && (
                  <span className="text-red-600 text-xs">
                    {errors?.gender?.message}
                  </span>
                )}
              </div>
              {/* DOj */}
              <div className="w-[33%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="doj"
                >
                  Date of Joining<span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex relative items-center ">
                  <Input
                    type="date"
                    id="doj"
                    className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    {...register("date_of_joining", {
                      required: "Date of joining is required",
                    })}
                  />
                </div>
                {errors?.date_of_joining && (
                  <span className="text-red-600 text-xs">
                    {errors?.date_of_joining?.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-between w-[100%]">
              {/* City */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="city"
                >
                  City
                </label>
                <div className="flex relative items-center ">
                  <Input
                    type="text"
                    id="city"
                    className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder=" City"
                    {...register("city", {
                      // required: "Place is required",
                      pattern: {
                        value: /^(?!\s).*$/,
                        message: "Cannot start with a space",
                      },
                    })}
                  />
                </div>
                {errors?.city && (
                  <span className="text-red-600 text-xs">
                    {errors?.city?.message}
                  </span>
                )}
              </div>
              {/* state */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="state"
                >
                  State
                </label>
                <div className="flex relative items-center  ">
                  <Input
                    className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="place"
                    placeholder="State"
                    {...register("state", {
                      // required: "State is required",
                    })}
                  />
                </div>
                {errors.state && (
                  <span className="text-red-600 text-xs ">
                    {errors.state.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 w-[100%]">
              <label
                className="block text-[#75172F]  font-bold "
                htmlFor="course"
              >
                Course<span className="ml-1 text-red-500">*</span>
              </label>
              {/* Dynamic field for courses */}
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    id="course"
                    className="flex items-center gap-2 w-[100%] shadow appearance-none border-none rounded   text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <ComboboxDemo
                      frameworks={course}
                      name={`Course ${index + 1}`}
                      field={`courses.${index}`}
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                      setValue={setValue}
                    />

                    {index > 0 && (
                      <Button
                        className="border-[#ea4848] text-[#ea4848] hover:text-[#c34d4d] hover:bg-[#ea484822] "
                        variant={"outline"}
                        type="button"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                className=" border-[#39B16E] text-[#39B16E] hover:bg-[#39b16fcb] hover:text-[#fff] shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
                variant={"outline"}
                type="button"
                onClick={() => append({ course_name: "" })}
              >
                Add Course <Plus className="w-5" />
              </Button>
            </div>
          </div>
          {/* .................. */}
          <div className="w-[50%] gap-y-3 flex flex-col">
            <div className="flex flex-row justify-between w-[100%]">
              {/* Address */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="address"
                >
                  Address
                </label>
                <div className="flex relative items-center ">
                  <Input
                    type="text"
                    id="address"
                    className="  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder=" Address"
                    {...register("address", {
                      // required: "Place is required",
                      pattern: {
                        value: /^(?!\s).*$/,
                        message: "Cannot start with a space",
                      },
                    })}
                  />
                </div>
                {errors?.address && (
                  <span className="text-red-600 text-xs">
                    {errors?.address?.message}
                  </span>
                )}
              </div>
              {/* place */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor="place"
                >
                  Place
                </label>
                <div className="flex relative items-center  ">
                  <Input
                    className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="place"
                    placeholder="Place"
                    {...register("place", {
                      // required: "Place is required",
                      pattern: {
                        value: /^(?!\s).*$/,
                        message: "Cannot start with a space",
                      },
                    })}
                  />
                </div>
                {errors.place && (
                  <span className="text-red-600 text-xs ">
                    {errors.place.message}
                  </span>
                )}
              </div>
            </div>
            {/* ................... */}

            <label className="block text-[#75172F]  font-bold " htmlFor="bio">
              Bio
            </label>
            <div className="flex relative items-center ">
              <Textarea
                placeholder="Enter bio here...."
                id="bio"
                className="  min-h-[11.1rem]  border-[#EEF0F4]  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register("bio", {
                  // required: "Bio is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Cannot start with a space",
                  },
                })}
              />
            </div>
            {errors?.bio && (
              <span className="text-red-600 text-xs">
                {errors?.bio?.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row-reverse justify-right gap-3 ">
          <Button type="submit" variant={"primary"}>
            Add Teacher
          </Button>
          <Button
            className=" border-[#75172f] text-[#75172f] hover:text-[#75172f]"
            type="button"
            onClick={router.back}
            variant={"outline"}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddTeacher;
