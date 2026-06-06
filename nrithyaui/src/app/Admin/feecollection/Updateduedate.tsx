import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { PayloadRootObject } from "@/Interfaces/duedate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { updateDuedate } from "@/api/duedate";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

type DataType = {
  payment_id: number;
  payment_method: null;
  date: string;
  due_date: string;
  remarks: null;
  status: boolean;
  amount: number;
  transaction_id: null | string;
  batches: {
    batch_name: string;
  };
  students: {
    reg_no: string;
    first_name: string;
    last_name: string;
    student_id: number;
    whatsapp_number: string;
  };
  paid_date: string;
};

type Props = {
  row: DataType;
};

const Updateduedate = ({ row }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue } = useForm<PayloadRootObject>({
    defaultValues: {
      due_date: new Date(row.due_date).toISOString().split("T")[0],
    },
  });

  const onUpdateStudent = useMutation({
    mutationFn: async (data: PayloadRootObject) => {
      return await updateDuedate(row.payment_id, data);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Due date updated successfully",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["feecollections"] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.errorMessage || "An error occurred",
        duration: 3000,
      });
    },
  });

  const onSubmit = (data: PayloadRootObject) => {
    onUpdateStudent.mutate(data);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
            <Pencil size={"13"} className="text-blue-500 mr-2" />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Due Date</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              className="col-span-3"
              id="due_date"
              type="date"
              placeholder="Enter Due Date"
              {...register("due_date", {
                required: "Due Date is required",
              })}
            />
            <div className="flex justify-end">
              <Button type="submit" className="mt-4 " variant={"primary"}>
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Updateduedate;
