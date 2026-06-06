import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BatchAssignmentAdd } from "@/Interfaces/batchAssignment";
import { addBatchAssignment } from "@/api/batchAssignment";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { DataType } from "./BatchAssignmentList";
import { SubmitHandler, useForm } from "react-hook-form";
import { Toaster } from "@/components/ui/toaster";

interface FormType {
  //   id: number;
  grade: number;
  date: string;
}

type IdProps = {
  id: number;
  listassignment: DataType;
};
const AddAssignment = ({ id, listassignment }: IdProps) => {
  const { toast } = useToast();
  const form = useForm<FormType>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });
  const { register, handleSubmit, reset, formState, setValue, getValues } =
    form;
  const { errors, isDirty } = formState;
  const router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [detail, setDetail] = useState<BatchAssignmentAdd>();
  const queryClient = useQueryClient();
  const onAddBatchAssignment = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: BatchAssignmentAdd = {
        id: id,
        grade: value.grade,
        date: value.date,
      };
      return await addBatchAssignment(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Assignment Status Updated successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      queryClient.invalidateQueries({ queryKey: ["batchassignment"] });
      setToggle(false);
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
  const onSubmit: SubmitHandler<FormType> = (value: FormType) => {
    onAddBatchAssignment.mutate(value);
  };

  useEffect(() => {
    if (listassignment) {
      // setDetail(listassignment);
      if (listassignment.submission_date) {
        setValue(
          "date",
          new Date(listassignment.submission_date).toISOString().split("T")[0]
        );
      } else {
        setValue("date", new Date().toISOString().split("T")[0]);
      }

      setValue("grade", listassignment?.grade);
    }
  }, [listassignment, setValue]);

  return (
    <div>
      <Toaster />
      <div className="text-center">
        <Dialog>
          <DialogTrigger
            className="border border-[#75172F] p-1 m-1 rounded-lg text-[#75172F] text-sm flex"
            asChild
          >
            <Button
              onClick={() => setToggle(true)}
              variant={"outline"}
              size={"sm"}
            >
              Update
            </Button>
          </DialogTrigger>
          {toggle ? (
            <DialogContent className="w-[450px]">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogHeader>
                  <DialogTitle>Set Assignment status</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 p-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Submitted Date :
                    </Label>
                    <Input
                      id="date"
                      className="col-span-3 border-2"
                      type="date"
                      {...register("date")}
                    />
                  </div>

                  <div className="grid grid-cols-[100px,1fr]">
                    <Label htmlFor="name" className="pl-8 pt-2">
                      Mark %:
                    </Label>
                    <div className="">
                      <Input
                        className="shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                        id="grade"
                        type="text"
                        placeholder="Grade"
                        {...register("grade", {
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Only numbers are allowed",
                          },
                        })}
                      />
                      <p className="text-xs text-red-700 pt-2">
                        {errors.grade?.message}
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" variant={"primary"}>
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          ) : null}
        </Dialog>
      </div>
    </div>
  );
};

export default AddAssignment;
