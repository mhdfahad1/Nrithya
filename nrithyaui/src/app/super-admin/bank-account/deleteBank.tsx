"use client";
import { DeleteBankAccountApi } from "@/api/bankAccount";
import { deleteBatchApi } from "@/api/batch";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
interface TypeProps {
  bank_id: number;
}

const DeleteBankAccount = ({ bank_id }: TypeProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onDeletebankAccount = useMutation({
    mutationFn: async (bank_id: number) => {
      return await DeleteBankAccountApi(bank_id);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Bank Account deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["bankaccount"] });
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
  const Onsubmit = (bank_id: number) => {
    onDeletebankAccount.mutate(bank_id);
  };
  return (
    <div onClick={() => Onsubmit(bank_id)} className="flex items-center">
      <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
    </div>
  );
};

export default DeleteBankAccount;
