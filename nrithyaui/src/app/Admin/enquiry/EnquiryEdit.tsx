import { editEnquiry } from "@/api/enquiryManagement";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  editEnquiryPayload,
  editEnquiryValue,
  getEnquiryPayload,
} from "@/Interfaces/Enquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

const EnquiryEdit = ({
  setShowEditModal,
  data,
}: {
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: getEnquiryPayload;
}) => {
  const { toast } = useToast();
  // enquiry edit
  const queryClient = useQueryClient();
  useEffect(() => {
    if (data?.name && data?.contact_number) {
      editSetValue("name", data?.name);
      editSetValue("contact_number", data?.contact_number);
    }
  }, []);
  const onEditEnquiry = useMutation({
    mutationFn: async (value: editEnquiryValue) => {
      const payload: editEnquiryPayload = {
        enq_id: data?.enq_id,
        name: value?.name,
        contact_number: value?.contact_number,
      };
      return await editEnquiry(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Enquiry edited successfully...",
        duration: 2000,
      });
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
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
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    setValue: editSetValue,
    formState: { errors },
  } = useForm<editEnquiryValue>({
    defaultValues: {},
  });
  const onEdit: SubmitHandler<editEnquiryValue> = (editData) => {
    onEditEnquiry.mutate(editData);
  };
  return (
    <form onSubmit={editHandleSubmit(onEdit)}>
      <DialogContent className=" w-[500px]">
        <DialogHeader>
          <DialogTitle>Enquiry Edit</DialogTitle>
        </DialogHeader>
        <div className="grid row-gap-3 ">
          <Label htmlFor="name" className="pb-3">
            Name<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="name"
            className="col-span-3"
            placeholder="Name"
            {...editRegister("name", {
              required: "Name is required",
              pattern: {
                value: /^(?!\s).*$/,
                message: "Name cannot start with a space",
              },
            })}
          />
        </div>
        {errors?.name && (
          <span className="text-red-600 text-xs">{errors?.name?.message}</span>
        )}
        <div className="grid row-gap-3 ">
          <Label htmlFor="name" className="pb-3">
            Contact Number<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="contact_number"
            className="col-span-3"
            placeholder="Contact number"
            {...editRegister("contact_number", {
              required: "Contact number is required",
              pattern: {
                value: /^[0-9+ ]+$/,
                message: "Invalid contact number. Only numbers are allowed.",
              },
              minLength: {
                value: 5,
                message: "Contact number should be at least 5 characters",
              },
            })}
          />
        </div>
        {errors?.contact_number && (
          <span className="text-red-600 text-xs">
            {errors?.contact_number?.message}
          </span>
        )}
        <DialogFooter>
          <Button
            type="submit"
            onClick={editHandleSubmit(onEdit)}
            variant={"primary"}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
};

export default EnquiryEdit;
