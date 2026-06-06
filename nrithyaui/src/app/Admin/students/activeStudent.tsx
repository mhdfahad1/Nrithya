import { activeStudent, deleteStudent } from "@/api/student";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import React from "react";
import { TypeProps } from "./deletestudent";
import { ActiveType } from "@/Interfaces/Student";

const Activestudent = ({ studentId, status }: TypeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const onActiveStudent = useMutation({
    mutationFn: async () => {
      const payload: ActiveType = {
        batch_timings: [],
        student_id: studentId,
      };
      return await activeStudent(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Student Active Successfully...",
        duration: 2000,
      });
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

  return (
    <button
      className="flex items-center"
      onClick={() => {
        onActiveStudent.mutate();
      }}
    >
      <ShieldCheck size={15} className="text-green-500 mr-2" /> Active
    </button>
  );
};

export default Activestudent;
