"use client";
import { deleteBatchApi } from "@/api/batch";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
interface TypeProps {
  batchId: number;
}

const DeleteBatch = ({ batchId }: TypeProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onDeletebatch = useMutation({
    mutationFn: async (batchId: number) => {
      return await deleteBatchApi(batchId);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Batch deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
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
  const Onsubmit = (batchId: number) => {
    onDeletebatch.mutate(batchId);
  };
  return (
    <div onClick={() => Onsubmit(batchId)} className="flex items-center">
      <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
    </div>
  );
};

export default DeleteBatch;
