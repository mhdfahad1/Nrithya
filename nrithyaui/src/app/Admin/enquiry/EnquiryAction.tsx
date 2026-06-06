"use client";

import {
  DeleteEnquiry,
  getComboboxEnquiryType,
  updateEnquiry,
} from "@/api/enquiryManagement";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  EnquiryTypeCombobox,
  getEnquiryPayload,
  updateEnquiryPayload,
  updateEnquiryValue,
} from "@/Interfaces/Enquiry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, NotebookPen, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { FrameworkType } from "./enquiryList";
import { getCourseComboBox } from "@/api/assignment";
import { CourseType } from "@/Interfaces/course";
import EnquiryEdit from "./EnquiryEdit";
import { getUsersCombobox } from "@/api/adminManagement";
import { Input } from "@/components/ui/input";
type UserDetailsPayload = {
  user_id: number;
  user_name: string;
};
const EnquiryAction = ({ data }: { data: getEnquiryPayload }) => {
  const [demoRequest, setDemoRequest] = useState(data?.demo_requested || false);
  const [followUp, setFollowUp] = useState(0);
  const [comboboxName, setComboboxName] = useState({
    enquiry_type: "",
    course: "",
    assignee: "",
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // enquiry update
  useEffect(() => {
    if (data) {
      setValue("remarks", data?.remarks);
      setValue("status", data?.enq_status);
      setValue("follow_up", data?.follow_up);

      setComboboxName({
        assignee: `${(data.assignee?.user_name || "").trim()}
        `,
        course: `${data?.courses?.course_name.trim()}`,
        enquiry_type: `${data?.enquiryType?.enq_type.trim()}`,
      });
    }
  }, []);
  const onUpdateEnquiry = useMutation({
    mutationFn: async (value: updateEnquiryValue) => {
      const payload: updateEnquiryPayload = {
        enq_id: data?.enq_id,
        assignee: value?.assignee,
        course: value?.course,
        demo_request: demoRequest as boolean,
        enquiry_type: value?.enquiry_type,
        follow_up_no: followUp,
        remarks: value?.remarks,
        status: value?.status,
        follow_up_date: value?.follow_up,
      };

      return await updateEnquiry(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry updated successfully...",
        duration: 2000,
      });
      setShowUpdateModal(false);
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
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<updateEnquiryValue>({
    defaultValues: {
      assignee: data?.assignee?.user_id,
      course: data?.courses?.course_id,
    },
  });

  const onUpdate: SubmitHandler<updateEnquiryValue> = (updateData) => {
    onUpdateEnquiry.mutate(updateData);
  };
  // delete enquiry
  const onDeleteEnquiry = useMutation({
    mutationFn: async (enq_id: number) => {
      if (enq_id !== undefined) {
        return await DeleteEnquiry(enq_id);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        description: "Enquiry deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      setShowDeleteModal(false);
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

  // course for combobox
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
  const courseId = useWatch({ control, name: "course" });
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

  return (
    <>
      <div className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="text-green-500"
              onClick={() => setShowUpdateModal(true)}
            >
              <NotebookPen size={"15"} className="text-green-500 mr-2" /> Update
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-blue-500"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Enquiry update modal */}
      <div className="flex items-center ">
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent>
            <form
              onSubmit={handleSubmit(onUpdate)}
              className="flex gap-y-5 flex-col"
            >
              <DialogHeader>
                <DialogTitle>Enquiry Update</DialogTitle>
              </DialogHeader>
              <section className="flex flex-row justify-between">
                <div className="grid row-gap-3 w-[49%]">
                  <Label htmlFor="name" className="pb-3">
                    Enquiry Type
                  </Label>
                  <div className="flex relative items-center    shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <ComboboxDemo
                      frameworks={enquiryType}
                      name={
                        comboboxName?.enquiry_type !== "undefined"
                          ? comboboxName?.enquiry_type
                          : "Enquiry Type"
                      }
                      setValue={setValue}
                      field="enquiry_type"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                </div>
                <div className="grid row-gap-3 w-[49%]">
                  <Label htmlFor="course" className="pb-3">
                    Course
                  </Label>
                  <div className="flex relative items-center overflow-x-hidden  shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <ComboboxDemo
                      frameworks={course}
                      name={
                        comboboxName?.course !== "undefined"
                          ? comboboxName?.course
                          : "Course"
                      }
                      setValue={setValue}
                      field="course"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                </div>
              </section>
              <section className="flex flex-row justify-between">
                <div className="grid row-gap-3 w-[49%]">
                  <Label htmlFor="assignee" className="pb-3">
                    Assignee
                  </Label>
                  <div className="flex relative items-center    shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <ComboboxDemo
                      key={data?.assignee?.user_id}
                      frameworks={assignee}
                      name={
                        comboboxName?.assignee &&
                        comboboxName.assignee.trim() !== ""
                          ? comboboxName.assignee
                          : "Assignee"
                      }
                      setValue={setValue}
                      field="assignee"
                      resetFilter={resetFilter}
                      setResetFilter={setResetFilter}
                    />
                  </div>
                </div>

                <div className="grid row-gap-3 w-[49%]">
                  <Label htmlFor="status" className="pb-3">
                    Status
                  </Label>
                  <div className="flex relative items-center   shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
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
              </section>
              <div className="flex gap-2 items-center">
                <Label htmlFor="demo">Demo Requested?</Label>
                <div className="flex relative items-center   shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
                  <Checkbox
                    checked={demoRequest as boolean}
                    onCheckedChange={(value) =>
                      setDemoRequest(value as boolean)
                    }
                  />{" "}
                </div>
              </div>
              <div className="grid row-gap-3 w-[49%]">
                <Label htmlFor="status" className="pb-3">
                  Next Follow Up Date
                </Label>
                <Input
                  className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
                  id="state"
                  type="date"
                  min={data?.last_call}
                  placeholder="Next Follow Up Date"
                  {...register("follow_up")}
                />
              </div>
              <div className="grid row-gap-3 ">
                <Label htmlFor="remarks" className="pb-3">
                  Remarks
                </Label>
                <div className="flex relative items-center   shadow appearance-none border rounded-md h-fit  text-gray-700 leading-tight focus:outline-none focus:shadow-outline ">
                  <Textarea
                    id="remarks"
                    className="col-span-3 shadow"
                    placeholder="Remarks..."
                    {...register("remarks", {
                      pattern: {
                        value: /^(?!\s).*$/,
                        message: "Remark cannot start with a space",
                      },
                    })}
                  />
                </div>
                {errors.remarks && (
                  <span className="text-red-600 text-xs mt-1 ">
                    {errors?.remarks?.message}
                  </span>
                )}
              </div>
              <DialogFooter>
                {data.third_follow_up === false && (
                  <Button
                    type="submit"
                    onClick={() => {
                      handleSubmit(onUpdate);
                      setFollowUp(4);
                    }}
                    variant={"outline"}
                    className="hover:bg-[#39B16E] hover:text-white text-[#39B16E] border-[#39B16E]"
                  >
                    Update
                  </Button>
                )}
                {data?.first_follow_up === false ? (
                  <Button
                    type="submit"
                    onClick={() => {
                      handleSubmit(onUpdate);
                      setFollowUp(1);
                    }}
                    variant={"primary"}
                  >
                    First Call
                  </Button>
                ) : data?.second_follow_up === false ? (
                  <Button
                    type="submit"
                    onClick={() => {
                      handleSubmit(onUpdate);
                      setFollowUp(2);
                    }}
                    variant={"primary"}
                  >
                    Second Call
                  </Button>
                ) : data?.third_follow_up === false ? (
                  <Button
                    type="submit"
                    onClick={() => {
                      handleSubmit(onUpdate);
                      setFollowUp(3);
                    }}
                    variant={"primary"}
                  >
                    Third Call
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={() => {
                      handleSubmit(onUpdate);
                      setFollowUp(4);
                    }}
                    variant={"primary"}
                  >
                    Update
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Enquiry edit modal */}
      <div className="flex items-center ">
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <EnquiryEdit setShowEditModal={setShowEditModal} data={data} />
        </Dialog>
      </div>
      {/* Enquiry delete modal */}
      <div className="flex items-center">
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <div className="mt-3">
              Are you certain you want to delete this Enquiry?
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant={"outline"}
                className="border-gray-700"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={"destructive"}
                onClick={() => onDeleteEnquiry.mutate(data?.enq_id)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EnquiryAction;
