import { dismissStudent } from "@/api/student";
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
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export type TypeProps = {
  studentId: number;
};

const DismissStudent = ({ studentId }: TypeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const onDismissStudent = useMutation({
    mutationFn: async (studentId: number) => {
      return await dismissStudent(studentId);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student dismiss successfully.",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["studentlisting"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["batchstudents"] });

      setOpen(false); // Close the dialog on success
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: error?.response?.data?.errorMessage,
      });
    },
  });

  const onSubmit = () => {
    onDismissStudent.mutate(studentId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center text-red-500 cursor-pointer text-xs p-2">
          <Trash2 size={15} className="text-red-500 mr-2" />
          <span className="text-sm">Dismiss</span>
        </button>
      </DialogTrigger>
      {open ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dismiss Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to dismiss this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="destructive" onClick={onSubmit}>
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

export default DismissStudent;
