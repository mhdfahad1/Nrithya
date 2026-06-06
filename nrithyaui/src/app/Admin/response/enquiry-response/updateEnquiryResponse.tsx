import { updateEnquiryResponse } from "@/api/enquiryManagement";
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
import { updateEnquiryResponsePayload } from "@/Interfaces/Enquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const UpdateEnquiryResponse = ({
  enq_res_id,
  enquiry_response,
}: {
  enq_res_id: number;
  enquiry_response: string;
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  useEffect(() => {
    if (enquiry_response && enq_res_id) {
      setValue("enquiry_response", enquiry_response);
      setValue("enq_res_id", enq_res_id);
    }
  }, []);
  // enquiry Response updating
  const queryClient = useQueryClient();
  const onUpdateEnquiryResponse = useMutation({
    mutationFn: async (value: updateEnquiryResponsePayload) => {
      const payload: updateEnquiryResponsePayload = {
        enq_res_id: enq_res_id,
        enquiry_response: value.enquiry_response,
      };
      return await updateEnquiryResponse(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry response updated successfully...",
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
  const { register, handleSubmit, setValue, formState } =
    useForm<updateEnquiryResponsePayload>();
  const { errors } = formState;
  const onSubmit: SubmitHandler<updateEnquiryResponsePayload> = (value) => {
    onUpdateEnquiryResponse.mutate(value);
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

          <DropdownMenuItem className="text-red-500">
            <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
                  required: "Enquiry Response is required",
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
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
};

export default UpdateEnquiryResponse;
