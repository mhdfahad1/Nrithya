"use client";
import { deleteBatchApi } from "@/api/batch";
import { deletcompensationBatch } from "@/api/batchCompensation";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
interface TypeProps {
  compensation_id: number;
}

const DeleteBatchCompenstion = ({ compensation_id }: TypeProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onDeletebatch = useMutation({
    mutationFn: async (compensation_id: number) => {
      return await deletcompensationBatch(compensation_id);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch compensation deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["batch"] });
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
  const Onsubmit = (compensation_id: number) => {
    onDeletebatch.mutate(compensation_id);
  };
  return (
    <div
      onClick={() => Onsubmit(compensation_id)}
      className="flex items-center"
    >
      <Toaster />
      <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
    </div>
  );
};

export default DeleteBatchCompenstion;
