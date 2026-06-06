import { deleteEnquiryType, updateEnquiryType } from "@/api/enquiryManagement";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { updateEnquiryTypePayload } from "@/Interfaces/Enquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const UpdateEnquiryType = ({
  enq_type_id,
  enq_type,
}: {
  enq_type_id: number;
  enq_type: string;
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  useEffect(() => {
    if (enq_type && enq_type_id) {
      setValue("enquiry_type", enq_type);
      setValue("enq_type_id", enq_type_id);
    }
  }, []);
  // enquiry type updating
  const queryClient = useQueryClient();
  const onUpdateEnquiryType = useMutation({
    mutationFn: async (value: updateEnquiryTypePayload) => {
      const payload: updateEnquiryTypePayload = {
        enq_type_id: enq_type_id,
        enquiry_type: value.enquiry_type,
      };
      return await updateEnquiryType(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry type updated successfully...",
        duration: 2000,
      });
      setShowUpdateModal(false);
      queryClient.invalidateQueries({ queryKey: ["enquiryTypes"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  // enquiry type delete
  const onEnquiryTypeDelete = useMutation({
    mutationFn: async (enquiryTypeId: number) => {
      if (enquiryTypeId !== undefined) {
        return await deleteEnquiryType(enquiryTypeId);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        description: "Enquiry type deleted successfully...",
      });
      queryClient.invalidateQueries({ queryKey: ["enquiryTypes"] });
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
  const { register, handleSubmit, setValue } =
    useForm<updateEnquiryTypePayload>();

  const onSubmit: SubmitHandler<updateEnquiryTypePayload> = (value) => {
    onUpdateEnquiryType.mutate(value);
  };
  return (
    <div className="text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="text-blue-500"
            onClick={() => setShowUpdateModal(true)}
          >
            <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => onEnquiryTypeDelete.mutate(enq_type_id)}
          >
            <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className=" w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Enquiry Type</DialogTitle>
            </DialogHeader>
            <div className="grid row-gap-4 mb-6">
              <Label htmlFor="name" className="py-3">
                Enquiry Type<span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="name"
                className="col-span-3"
                placeholder="Enquiry type"
                {...register("enquiry_type", {
                  required: "Enquiry type is required",
                })}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant={"primary"}
              >
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateEnquiryType;
