"use client";
import { getStudentById, UpdateStudent } from "@/api/studentCompensation";
import Navbar from "@/app/Components/Navbar";
import ComboboxDemo from "@/app/table/combox";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { ButtonLoading } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { studentDropDownList } from "@/api/student";
import {
  Datum,
  UpdateCompensationStudent,
} from "@/Interfaces/StudentCompensation";
import { BatchlistDropdownActivity } from "@/api/batchActivity";

type FormValues = {
  student_id: number;
  old_date: string;
  new_date: string;
  old_batch: number;
  new_batch: number;
  id: number;
  student: {
    first_name: string;
    last_name: string;
  };
};

type Props = {
  params: { studentId: string };
};

export interface FrameworkType {
  value: string;
  label: string;
}

const Page = ({ params }: Props) => {
  const form = useForm<FormValues>();
  const { register, control, handleSubmit, setValue, formState } = form;
  const { errors, isLoading, isSubmitting } = formState;
  const [batchitems, setBatchItems] = useState<FrameworkType[]>([]);
  const [studentslists, setStudentsList] = useState<FrameworkType[]>([]);
  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const [student, setStudent] = useState<Datum>();
  const batchId = useWatch({ control, name: "old_batch" });

  const [combobox, setComboBoxName] = useState({
    student: "",
    oldbatch: "",
    newbatch: "",
  });
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: studentdropdown } = useQuery({
    queryKey: ["studentdropdownlist", batchId],
    queryFn: async () => await studentDropDownList(batchId),
    enabled: !!batchId,
  });

  useEffect(() => {
    if (studentdropdown) {
      const batches: FrameworkType[] = studentdropdown.map((items) => ({
        value: `${items.student_id}`,
        label: `${items.first_name.trim()}${
          items.last_name !== "" ? ` ${items.last_name.trim()}` : ""
        }`,
      }));

      setStudentsList(batches);
    }
  }, [studentdropdown]);

  const { data } = useQuery<Datum>({
    queryKey: ["studentdetailscompensation", params.studentId],
    queryFn: async () => getStudentById(params.studentId),
  });

  //update student compensation
  const onAddBatchCompensation = useMutation({
    mutationFn: async (value: FormValues) => {
      const payload: UpdateCompensationStudent = {
        id: Number(params.studentId),
        old_date: value.old_date,
        new_date: value.new_date,
        old_batch_id: value.old_batch,
        new_batch_id: value.new_batch,
        student_id: value.student_id,
      };
      return await UpdateStudent(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Compensation Student Updated Successfully...",
        duration: 2000,
      });
      setTimeout(() => {
        router.push("/Admin/compensation?view=student");
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ["student"] });
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
  const onSubmit: SubmitHandler<FormValues> = (value: FormValues) => {
    onAddBatchCompensation.mutate(value);
  };

  //List batch dropdown
  const { data: batchListDropdown } = useQuery({
    queryKey: ["batcheslistdropdown"],
    queryFn: async () => await BatchlistDropdownActivity(),
  });

  useEffect(() => {
    if (batchListDropdown) {
      const batches: FrameworkType[] = batchListDropdown?.map(
        (item, index) => ({
          value: `${item?.batch_id}`,
          label: item?.batch_name,
        })
      );

      setBatchItems(batches);
    }
  }, [batchListDropdown]);

  useEffect(() => {
    if (data) {
      setStudent(data);
      setValue("id", data.id);
      setValue("old_date", data.old_date);
      setValue("new_date", data.new_date);
      setValue("old_batch", data.own_batches.batch_id);
      setValue("new_batch", data.new_batches.batch_id);
      setValue("student_id", data.student.student_id);
      setComboBoxName({
        student: `${data.student.first_name} ${data.student.last_name}`,
        oldbatch: data.own_batches.batch_name,
        newbatch: data.new_batches.batch_name,
      });
    }
  }, [data, setValue]);

  return (
    <>
      <Navbar name="Compensation Student" />
      <Toaster />
      <div className="p-10 ">
        <form
          className="shadow-md rounded  px-7 pt-6 pb-8  bg-white"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="bg-[#fdefef] p-4 rounded-xl mb-5">
            <label className="block text-[#75172F] font-bold mb-2 pt-5">
              Original Class
            </label>
            <div className="grid grid-cols-[1fr,1fr,1fr] gap-14 pt-2">
              <div className="mb-6">
                <label className="block text-[#75172F]  font-bold mb-2">
                  Date<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  className="shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter your olddate"
                  type="date"
                  {...register("old_date", {
                    required: "Date is required",
                  })}
                />
                {errors.old_date && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.old_date.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Batch<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="text-gray-700">
                  <ComboboxDemo
                    frameworks={batchitems}
                    name={combobox.oldbatch}
                    setValue={setValue}
                    field="old_batch"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                {errors.old_batch && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.old_batch.message}
                  </p>
                )}
              </div>
              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Student<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="text-gray-700">
                  <ComboboxDemo
                    frameworks={studentslists}
                    name={combobox.student}
                    setValue={setValue}
                    field="student_id"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                {errors.student_id && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.student_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#dcffdc] p-4 rounded-xl ">
            <label className="block text-[#75172F] font-bold mb-2 ">
              Revised Class
            </label>
            <div className="grid grid-cols-[1fr,1fr] gap-14 pt-2">
              <div className="mb-6">
                <label className="block text-[#75172F]  font-bold mb-2">
                  Date<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  className="shadow appearance-none border rounded w-full  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter your newdate"
                  type="date"
                  {...register("new_date", {
                    required: "Date is required",
                  })}
                />
                {errors.new_date && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.new_date.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor=""
                  className="block text-[#75172F]  font-bold mb-2"
                >
                  Batch<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="text-gray-700">
                  <ComboboxDemo
                    frameworks={batchitems}
                    name={combobox.newbatch}
                    setValue={setValue}
                    field="new_batch"
                    resetFilter={resetFilter}
                    setResetFilter={setResetFilter}
                  />
                </div>
                {errors.new_batch && (
                  <p className="text-red-500 text-xs pl-3 pt-4">
                    {errors.new_batch.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <CardFooter className="flex justify-end gap-3 pt-5">
            <Link href="/Admin/compensation">
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
                Update
              </Button>
            )}
          </CardFooter>
        </form>
      </div>
    </>
  );
};

export default Page;
