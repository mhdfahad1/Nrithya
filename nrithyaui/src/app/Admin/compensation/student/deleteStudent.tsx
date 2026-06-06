import { deleteCompensationStudent } from "@/api/studentCompensation";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import React from "react";

export type TypeProps = {
  studentId: number;
};

const Deletestudent = ({ studentId }: TypeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const onDeleteStudent = useMutation({
    mutationFn: async (studentId: number) => {
      return await deleteCompensationStudent(studentId);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student Deleted Successfully...",
        duration: 2000,
      });
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

  const onSubmit = (studentId: number) => {
    onDeleteStudent.mutate(studentId);
  };
  return (
    <>
      <button
        className="flex items-center"
        onClick={() => {
          onSubmit(studentId);
        }}
      >
        <Trash2 size={"15"} className="text-red-500 mr-2" />
        Delete
      </button>
    </>
  );
};

export default Deletestudent;
