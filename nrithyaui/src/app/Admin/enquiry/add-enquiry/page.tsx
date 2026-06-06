"use client";

import { getUsersCombobox } from "@/api/adminManagement";
import { getCourseComboBox } from "@/api/assignment";
import { addEnquiry, getComboboxEnquiryType } from "@/api/enquiryManagement";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { CourseType } from "@/Interfaces/course";
import { addEnquiryPayload, EnquiryTypeCombobox } from "@/Interfaces/Enquiry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { FrameworkType } from "../enquiryList";
type UserDetailsPayload = {
  user_id: number;
  user_name: string;
};
const AddEnquiry = () => {
  const [demoRequest, setDemoRequest] = useState(false);

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<addEnquiryPayload>({
    defaultValues: {},
  });
  // Enquiry add
  const { toast } = useToast();
  const router = useRouter();
  const onAddEnquiry = useMutation({
    mutationFn: async (value: addEnquiryPayload) => {
      const payload: addEnquiryPayload = {
        name: value?.name,
        contact_number: value?.contact_number,
        course: value?.course,
        assignee: value?.assignee,
        enquiry_type:
          value?.enquiryType !== undefined ? value?.enquiryType : NaN,
        status: value?.status,
        remarks: value?.remarks,
        enquiry_date: value?.enquiry_date,
        demo_request: demoRequest as boolean,
      };

      return await addEnquiry(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry added successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
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

  // Enquiry Type for combobox
  const { data: enquiryTypeDatas } = useQuery({
    queryKey: ["enquiryTypes"],
    queryFn: async () => getComboboxEnquiryType(),
  });

  const [getEnquiryTypeData, setGetEnquiryTypeData] = useState<
    EnquiryTypeCombobox[]
  >([]);

  useEffect(() => {
    if (enquiryTypeDatas !== undefined) {
      setGetEnquiryTypeData(enquiryTypeDatas);
    }
  }, [enquiryTypeDatas]);
  const enquiryType: FrameworkType[] = getEnquiryTypeData?.map((item) => ({
    value: `${item?.enq_type_id}`,
    label: item?.enq_type.trim(),
  }));
  // Assignee for combobox
  const { data: userListData } = useQuery({
    queryKey: ["assignee"],
    queryFn: async () => await getUsersCombobox(),
  });
  const [getUserData, setGetUserData] = useState<UserDetailsPayload[]>([]);
  useEffect(() => {
    if (userListData) {
      setGetUserData(userListData.data);
    }
  }, [userListData]);

  const assignee: FrameworkType[] = getUserData.map((item) => ({
    value: `${item?.user_id}`,
    label: `${item?.user_name?.trim()}`,
  }));

  const [resetFilter, setResetFilter] = useState<boolean>(true);
  const onSubmit: SubmitHandler<addEnquiryPayload> = (value) => {
    onAddEnquiry.mutate(value);
  };

  return (
    <>
      <Navbar name="Add Enquiry" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" bg-white shadow-md rounded px-8 pt-6 pb-8 my-[2.2rem] ml-[2.2rem] mr-[1.5rem] flex flex-col  gap-y-3"
      >
        <Toaster />
        <div className="flex flex-row justify-between w-[100%]">
          {/* student name */}
          <div className="w-[48%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="studentName"
            >
              Name<span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
              <Input
                type="text"
                id="studentName"
                className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Name"
                {...register("name", {
                  required: "Name is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Name cannot start with a space",
                  },
                })}
              />
            </div>
            {errors?.name && (
              <span className="text-red-600 text-xs">
                {errors?.name?.message}
              </span>
            )}
          </div>
          {/* contactNumber */}
          <div className="w-[33%]">
            <label
              className=" block text-[#75172F]  font-bold mb-2"
              htmlFor="contactNumber"
            >
              Contact Number<span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
              <Input
                className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="contactNumber"
                placeholder="Contact Number"
                {...register("contact_number", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9+ ]+$/,
                    message:
                      "Invalid contact number. Only numbers are allowed.",
                  },
                  minLength: {
                    value: 5,
                    message: "Contact number should be at least 5 characters",
                  },
                })}
              />
            </div>
            {errors.contact_number && (
              <span className="text-red-600 text-xs ">
                {errors.contact_number.message}
              </span>
            )}
          </div>
          {/* enquiry Date */}
          <div className="w-[15%]">
            <label
              className=" block text-[#75172F]  font-bold mb-2"
              htmlFor="enquiryDate"
            >
              Enquiry Date<span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
              <Input
                type="date"
                className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="enquiryDate"
                placeholder="Enquiry Date"
                {...register("enquiry_date", {
                  required: "Enquiry Date is required",
                })}
              />
            </div>
            {errors?.enquiry_date && (
              <span className="text-red-600 text-xs ">
                {errors?.enquiry_date?.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between w-[100%]">
          <div className="flex flex-col  w-[48%] gap-y-3">
            <div className="flex flex-row justify-between w-[100%]">
              {" "}
              {/* Enquiry type */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor=" enquiryType "
                >
                  Enquiry Type
                </label>
                <div className="flex relative items-center    shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
                  <ComboboxDemo
                    frameworks={enquiryType}
                    name="Enquiry Type"
                    setValue={setValue}
                    field="enquiryType"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
              </div>
              {/* Enquiry course */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor=" enquiryCourse"
                >
                  Course
                </label>
                <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <ComboboxDemo
                    frameworks={course}
                    name="Course"
                    setValue={setValue}
                    field="course"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between gap-3 w-[100%]">
              {/* Assignee */}
              <div className="w-[48%] ">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor=" assignee"
                >
                  Assignee
                </label>
                <div className="flex relative items-center    shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <ComboboxDemo
                    frameworks={assignee}
                    name="Assignee"
                    setValue={setValue}
                    field="assignee"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
              </div>
              {/* Enquiry Status */}
              <div className="w-[48%]">
                <label
                  className="block text-[#75172F]  font-bold mb-2"
                  htmlFor=" enquiryStatus"
                >
                  Status
                </label>
                <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
                  <select
                    id="enquiryStatus"
                    className="w-[100%] shadow appearance-none border rounded bg-white py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    {...register("status")}
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Remarks */}
          <div className="w-[50%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="remarks"
            >
              Remarks
            </label>
            <div className="flex relative items-center   shadow appearance-none border rounded-md w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <Textarea
                placeholder="Enter remarks here...."
                id="remarks"
                className="  min-h-[7.7rem] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register("remarks", {
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Remark cannot start with a space",
                  },
                })}
              />
            </div>
            {errors.remarks && (
              <span className="text-red-600 text-xs ">
                {errors?.remarks?.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="demo">Demo Requested?</Label>
          <div className="flex relative items-center   shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
            <Checkbox
              checked={demoRequest as boolean}
              onCheckedChange={(value) => setDemoRequest(value as boolean)}
            />{" "}
          </div>
        </div>
        <div className="flex flex-row-reverse justify-right gap-3 ">
          <Button type="submit" variant={"primary"}>
            Add Enquiry
          </Button>
          <Button
            onClick={() => router.back()}
            className=" border-[#75172f] text-[#75172f] hover:text-[#75172f] hover:bg-[#75172f1e]"
            type="button"
            variant={"outline"}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddEnquiry;
