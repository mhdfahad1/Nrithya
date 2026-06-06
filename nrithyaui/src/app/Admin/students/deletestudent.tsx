import { deleteStudent } from "@/api/student";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Trash2 } from "lucide-react";
import React, { useState } from "react";

export type TypeProps = {
  studentId: number;
  status: string;
};

const Deletestudent = ({ studentId, status }: TypeProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const onDeleteStudent = useMutation({
    mutationFn: async (studentId: number) => {
      return await deleteStudent(studentId);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student Suspended Successfully...",
        duration: 2000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["studentlisting"] });
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["batchstudents"] });
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

  const onSubmit = (studentId: number) => {
    onDeleteStudent.mutate(studentId);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center cursor-pointer text-sm p-2"
          onClick={() => {
            setOpen(true);
          }}
        >
          <ShieldAlert size={"15"} className="text-red-500 mr-2" />
          Suspended
        </button>
      </DialogTrigger>
      {open ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this student?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onSubmit(studentId)}
            >
              Confirm
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};

export default Deletestudent;
