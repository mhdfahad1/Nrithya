import { addEnquiryType } from "@/api/enquiryManagement";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { addEnquiryTypePayload } from "@/Interfaces/Enquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const AddEnquirytype = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // enquiry type adding
  const queryClient = useQueryClient();
  const onAddEnquiryType = useMutation({
    mutationFn: async (value: addEnquiryTypePayload) => {
      const payload: addEnquiryTypePayload = {
        enquiry_type: value.enquiry_type,
      };
      return await addEnquiryType(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry type added successfully...",
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
  const { register, handleSubmit } = useForm<addEnquiryTypePayload>();

  const onSubmit: SubmitHandler<addEnquiryTypePayload> = (value) => {
    onAddEnquiryType.mutate(value);
  };
  return (
    <div>
      <div className="flex items-center ">
        <Button
          variant={"primary"}
          size="sm"
          onClick={() => setShowUpdateModal(true)}
          className="h-9 gap-1 "
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Enquiry Type
        </Button>
      </div>
      <div className="flex items-center ">
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent className=" w-[500px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Enquiry Type</DialogTitle>
              </DialogHeader>
              <div className="grid row-gap-4 mb-6 ">
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
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddEnquirytype;
