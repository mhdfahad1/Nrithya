"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UpdateAttendance,
  UpdateAttendancePayload,
} from "@/Interfaces/batchAttendance";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAttendanceStudent,
  updateAttendanceTeacher,
} from "@/api/batchAttendance";
import { useToast } from "@/components/ui/use-toast";
type LateProps = {
  name: string;
  viewType: "teacher" | "student";
  id: number | undefined;
  check: boolean;
  late_by: string | undefined;
  reason: string | undefined;
};

function UpdateStudentAttendance({
  name,
  id,
  viewType,
  check,
  late_by,
  reason,
}: LateProps) {
  const [open, setOpen] = useState(false);
  const [checkChange, setCheckChange] = useState<boolean>();

  const form = useForm({
    defaultValues: {
      id: id,
      attended: check,
      late_by: late_by,
      reason: reason,
    },
  });

  useEffect(() => {
    setValue("id", id);
    setValue("attended", check);
    setValue("late_by", late_by);
    setValue("reason", reason);
  }, [check, id, late_by, reason, check]);
  const { toast } = useToast();
  const { register, setValue, handleSubmit } = form;

  const onUpdate = (data: UpdateAttendance) => {
    {
      if (viewType === "student") {
        onUpdateStudentAttendance.mutate(data);
      } else if (viewType === "teacher") {
        onUpdateTeacherAttendance.mutate(data);
      }
    }
  };

  const queryClient = useQueryClient();
  const onUpdateTeacherAttendance = useMutation({
    mutationFn: async (data: UpdateAttendance) => {
      let payload: UpdateAttendancePayload | undefined;
      if (data.id !== undefined) {
        payload = {
          id: data.id,
          attended: checkChange,
          late_by: data.late_by,
          reason: data.reason,
        };
      } else {
        throw new Error("ID is undefined");
      }

      if (payload !== undefined) {
        return await updateAttendanceTeacher(payload);
      } else {
        throw new Error("Payload is undefined");
      }
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Teacher attendance updated successfully...",
        duration: 2000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["teacherAttendance"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  // update student

  const onUpdateStudentAttendance = useMutation({
    mutationFn: async (data: UpdateAttendance) => {
      let payload: UpdateAttendancePayload | undefined;

      if (data.id !== undefined) {
        payload = {
          id: data.id,
          attended: checkChange,
          late_by: data.late_by,
          reason: data.reason,
        };
      } else {
        throw new Error("ID is undefined");
      }

      if (payload !== undefined) {
        return await updateAttendanceStudent(payload);
      } else {
        throw new Error("Payload is undefined");
      }
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "attendance updated successfully...",
        duration: 2000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["StudentAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className=" ">
          <Pencil className="h-4 w-4 text-blue-500" />
        </DialogTrigger>
        <DialogContent className="w-[450px]">
          <form onSubmit={handleSubmit(onUpdate)}>
            {/* <DialogHeader>{id}</DialogHeader> */}

            <div>
              <div className="grid gap-4 p-4">
                <div className="flex gap-2">
                  <h3>{name}</h3>

                  <Checkbox
                    className="mt-1"
                    defaultChecked={check}
                    onCheckedChange={(value) => {
                      setCheckChange(value as boolean);
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="late" className="text-right">
                    Late by :
                  </Label>

                  <Input
                    id="late"
                    className="col-span-3 border-2"
                    type="text"
                    {...register("late_by")}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remarks" className="text-right">
                    Remarks :
                  </Label>
                  <Input
                    id="remarks"
                    className="col-span-3 border-2"
                    type="text"
                    {...register("reason")}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UpdateStudentAttendance;
