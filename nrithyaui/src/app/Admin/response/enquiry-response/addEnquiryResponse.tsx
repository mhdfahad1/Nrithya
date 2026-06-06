import { addEnquiryResponse } from "@/api/enquiryManagement";
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
import { addEnquiryResponsePayload } from "@/Interfaces/Enquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const AddEnquiryResponse = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // enquiry response adding
  const queryClient = useQueryClient();
  const onAddEnquiryType = useMutation({
    mutationFn: async (value: addEnquiryResponsePayload) => {
      const payload: addEnquiryResponsePayload = {
        enquiry_response: value.enquiry_response,
      };
      return await addEnquiryResponse(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry response added successfully...",
        duration: 2000,
      });
      setShowUpdateModal(false);
      queryClient.invalidateQueries({ queryKey: ["enquiryResponses"] });
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
  const { register, handleSubmit, formState } =
    useForm<addEnquiryResponsePayload>();
  const { errors } = formState;
  const onSubmit: SubmitHandler<addEnquiryResponsePayload> = (value) => {
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
          Add Enquiry Response
        </Button>
      </div>
      <div className="flex items-center ">
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent className=" w-[500px]">
              <DialogHeader>
                <DialogTitle>Enquiry Response</DialogTitle>
              </DialogHeader>
              <div className="grid row-gap-3 ">
                <Label htmlFor="name" className="py-3">
                  Enquiry Response
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  placeholder="First name"
                  {...register("enquiry_response", {
                    required: "Enquiry response is required",
                  })}
                />
                {errors?.enquiry_response && (
                  <span className="text-red-600 text-xs">
                    {errors?.enquiry_response?.message}
                  </span>
                )}
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
            </DialogContent>
          </form>
        </Dialog>
      </div>
    </div>
  );
};

export default AddEnquiryResponse;
