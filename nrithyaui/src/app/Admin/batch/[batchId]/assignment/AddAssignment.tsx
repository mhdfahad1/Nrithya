"use client";
import { AddBatchAssignment, getAllAssignments } from "@/api/assignment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Datum } from "@/Interfaces/AddAssignment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export type AddAssignmentPayload = {
  assignment_id: number;
  batch_id: number;
  deadline: string;
};

type FormType = {
  assignmentId: string;
  date: string;
};

type Props = {
  params: { batchId: string };
};
export const AddAssignment = ({ params }: Props) => {
  const QueryClient = useQueryClient();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { register, handleSubmit, formState, control, setValue, reset } =
    useForm<FormType>();
  const { errors } = formState;

  const OnSubmit = (data: FormType) => {
    onAddAssignment.mutate(data);
  };

  const { data: assignments } = useQuery<Datum[]>({
    queryKey: ["assignments"],
    queryFn: () => getAllAssignments(),
  });

  const onAddAssignment = useMutation({
    mutationFn: async (value: FormType) => {
      const assignmentId = assignments?.find(
        (item) => item.assignment_name === value.assignmentId
      );
      const Payload: AddAssignmentPayload = {
        assignment_id: Number(assignmentId?.assignment_id),
        batch_id: Number(params.batchId),
        deadline: value.date,
      };
      return await AddBatchAssignment(Payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Assignment added successfully...",
        duration: 2000,
      });
      setShowUpdateModal(false);
      reset();
      QueryClient.invalidateQueries({ queryKey: ["batchAssignment"] });
      QueryClient.invalidateQueries({ queryKey: ["performance"] });
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

  return (
    <div className="ml-auto mt-3">
      <Toaster />

      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogTrigger asChild>
          <Button onClick={() => setShowUpdateModal(true)} variant={"primary"}>
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>Add assignment</span>
          </Button>
        </DialogTrigger>
        {showUpdateModal ? (
          <DialogContent className="w-[450px]">
            <form onSubmit={handleSubmit(OnSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Assignment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 p-4">
                <div className="flex  gap-4">
                  <Label htmlFor="name" className="text-right mt-3">
                    Assignment:<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="w-full">
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                      id=""
                      {...register("assignmentId", {
                        required: "select an assignment",
                      })}
                    >
                      <option value="" hidden>
                        Select a Assignment
                      </option>
                      {assignments?.map((item) => (
                        <option
                          key={item.assignment_id}
                          value={item.assignment_name}
                        >
                          {item.assignment_name}
                        </option>
                      ))}{" "}
                    </select>
                    {errors.assignmentId?.message ? (
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors.assignmentId?.message}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex  gap-4">
                  <Label htmlFor="date" className="text-right w-32 mt-2">
                    Due Date:<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      {...register("date", { required: "select a due date" })}
                      className="col-span-3 border-2"
                      type="date"
                    />
                    {errors.assignmentId?.message ? (
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors.date?.message}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" variant="primary">
                  Add
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
};

export default AddAssignment;
